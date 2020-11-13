const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const util = require('./util');

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
  const resourcePath = util.getExtensionFileAbsolutePath(context, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，
  html = html.replace(
    /(<link.+?href="\.|<script.+?src="\.|<img.+?src="\.)(.+?)"/g,
    (m, $1, $2) => {
      return (
        $1.replace(/\.$/, '') +
        vscode.Uri.file(path.resolve(dirPath, '.' + $2))
          .with({ scheme: 'vscode-resource' })
          .toString() +
        '"'
      );
    }
  );
  return html;
}
/**
 * 执行回调函数
 * @param {*} panel
 * @param {*} message
 * @param {*} resp
 */
function invokeCallback(panel, message, resp) {
  console.log('回调消息：', resp);
  // 错误码在400-600之间的，默认弹出错误提示
  if (
    typeof resp == 'object' &&
    resp.code &&
    resp.code >= 400 &&
    resp.code < 600
  ) {
    util.showError(resp.message || '发生未知错误！');
  }
  panel.webview.postMessage({
    cmd: 'vscodeCallback',
    _id: message._id,
    data: resp,
  });
}

// 存储插件所有打开的webview
const webviews = {};

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler = {
  // 弹出提示
  alert(global, message) {
    util.showInfo(message.info);
  },
  // 显示错误提示
  error(global, message) {
    util.showError(message.info);
  },
  // 初始化
  init(global, message) {
    invokeCallback(global.panel, message, {
      currentPath: global.currentPath,
      nstreePath: global.nstreePath,
      nstreeJson: global.nstreeJson,
    });
  },
  // 保存
  save(global, message) {
    try {
      fs.writeFileSync(global.nstreePath, message.treeJson, 'utf-8');
      invokeCallback(global.panel, message, {
        success: true,
      });
    } catch (error) {
      invokeCallback(global.panel, message, {
        success: false,
      });
    }
  },
  openFileInVscode(global, message) {
    let filepath = path.join(`${global.projectPath}/${message.path}`);
    if (fs.existsSync(filepath)) {
      let stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        this.openFileInFinder(global, message);
      } else {
        util.openFileInVscode(filepath);
        invokeCallback(global.panel, message, { success: true });
      }
    } else {
      invokeCallback(global.panel, message, {
        success: false,
        msg: '文件(夹)不存在！',
      });
    }
  },
  openFileInFinder(global, message) {
    util.openFileInFinder(`${global.projectPath}/${message.path}`);
    // 这里的回调其实是假的，并没有真正判断是否成功
    invokeCallback(global.panel, message, { success: true });
  },
  getUnlessPath(global, message) {
    let paths = [];
    const getPaths = (tree) => {
      return tree.forEach((v) => {
        paths.push(v.path);
        if (v.children && v.children.length > 0) {
          getPaths(v.children);
        }
      });
    };
    getPaths(message.tree);
    invokeCallback(global.panel, message, {
      success: true,
      data: paths.filter(
        (v) => !fs.existsSync(path.join(global.projectPath, v))
      ),
    });
  },
  openUrlInBrowser(global, message) {
    util.openUrlInBrowser(message.url);
    invokeCallback(global.panel, message, { success: true });
  },
};

module.exports = function (context) {
  // 注册命令，可以给命令配置快捷键或者右键菜单
  // 回调函数参数uri：当通过资源管理器右键执行命令时会自动把所选资源URI带过来，当通过编辑器中菜单执行命令时，会将当前打开的文档URI传过来
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.nstree.editProjectDoc',
      async function (uri) {
        if (!uri) {
          uri = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.document.uri
            : null;
        }
        if (!uri) {
          vscode.window.setStatusBarMessage('当前没有打开的文件！', 5000);
          return;
        }
        let findByFileName = util.config.findByFileName;
        let formatFilePath = util.formatFilePath(uri);
        let projectPath;
        let hasNstreeJsonInUri = util.hasFileNameInDir(
          formatFilePath,
          util.nstreeFilename
        );
        if (hasNstreeJsonInUri) {
          projectPath = formatFilePath;
        } else {
          projectPath = util.getProjectPath(uri);
        }

        if (!projectPath) {
          vscode.window.showInformationMessage(
            `没有向上找到包含${findByFileName.join('/')}文件的文件夹！`,
            {
              modal: true,
            }
          );
          return;
        }
        let nstreeJson = {
          name: '',
          tree: [],
        };
        let hasNstreeJson = false;
        let nstreePath = path.join(projectPath, util.nstreeFilename);
        if (fs.existsSync(nstreePath)) {
          hasNstreeJson = true;
          try {
            nstreeJson = JSON.parse(fs.readFileSync(nstreePath, 'utf-8'));
          } catch (error) {
            vscode.window.showInformationMessage(
              `${nstreePath}文件损坏，请删除后重新操作！`,
              {
                modal: true,
              }
            );
            return;
          }
        } else {
          try {
            nstreeJson.name = JSON.parse(
              fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8')
            ).name;
          } catch (error) {}
        }
        let currentPath = hasNstreeJsonInUri ? '' : util.getCurrentPath(uri);
        let viewType = `edit-project-doc`;
        if (webviews[viewType]) {
          webviews[viewType].dispose();
          delete webviews[viewType];
        }
        let panel = vscode.window.createWebviewPanel(
          viewType, // viewType
          `编辑${nstreeJson.name || '当前'}项目的目录结构`, // 视图标题
          vscode.ViewColumn.One, // 显示在编辑器的哪个部位
          {
            enableScripts: true, // 启用JS，默认禁用
            retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
          }
        );
        webviews[viewType] = panel;
        let global = {
          currentPath,
          projectPath,
          nstreePath,
          nstreeJson,
          panel,
        };
        panel.webview.html = getWebViewContent(context, 'docs/index.html');
        panel.webview.onDidReceiveMessage(
          (message) => {
            if (messageHandler[message.cmd]) {
              messageHandler[message.cmd](global, message);
            } else {
              util.showError(`未找到名为 ${message.cmd} 回调方法!`);
            }
          },
          undefined,
          context.subscriptions
        );
      }
    )
  );
};
