// vscode webview 网页和普通网页的唯一区别：多了一个acquireVsCodeApi方法
const vscode = window.acquireVsCodeApi
  ? window.acquireVsCodeApi()
  : {
      postMessage() {},
    };
let rx = {
  handles: {},
  on(name, handle, always = true) {
    if (!this.handles[name]) {
      this.handles[name] = [];
    }
    this.handles[name].push([handle, always]);
  },
  emit(name, ...data) {
    let handles = this.handles[name];
    if (!handles || handles.length == 0) {
      return;
    }
    handles.forEach((fn) => {
      fn[0].apply(null, data);
      if (!fn[1]) {
        this.remove(name, fn[0], fn[1]);
      }
    });
  },
  once(name, handle) {
    this.on(name, handle, false);
  },
  remove(name, handle, always = true) {
    if (!name) {
      return;
    }
    let handles = this.handles[name];
    if (!handle) {
      if (/^(bind|ex)$/.test(name)) {
        Object.keys(this.handles).forEach((v) => {
          if (new RegExp(`^${name}:`).test(v)) {
            delete this.handles[v];
          }
        });
      } else {
        delete this.handles[name];
      }
    } else {
      this.handles[name] = handles.filter(
        (fn) => !(handle === fn[0] && always === fn[1])
      );
    }
  },
};
Quasar.lang.set(Quasar.lang.zhHans);
new Vue({
  el: '#q-app',
  data: function () {
    return {
      darkMode: true,
      accordion: false,
      inVscode: !!window.acquireVsCodeApi,
      showFileIcon: true,
      expandAll: true,
      global: {},
      nstree: {
        name: '',
        tree: [],
      },
      qtree: [],
      treeNeedUpdate: false,
      editing: false,
      search: '',
      form: {
        path: '',
        name: '',
        body: '',
        index: 0,
        bold: false,
      },
      showDemo: false,
      demoImg: '',
      demoImgServer:
        'https://static.zuhaowan.com/static/zhwfe/static/nostar/nstree/',
      demoImgs: {
        openFile: 'openFile',
        copyPath: 'copyPath',
        exportMd: 'exportMd',
      },
    };
  },
  async mounted() {
    this.loaded = true;
    this.global = await callVscode('init');
    if (!this.inVscode) {
      try {
        let jsonPath = getRequest('json');
        if (jsonPath) {
          let json = await axios.get(jsonPath);
          if (json.status === 200 && json.data) {
            this.global = {
              currentPath: '',
              nstreePath: 'D:\\vscode-plugins\\vscode-nstree\\.nstree.json',
              nstreeJson: json.data,
            };
          } else {
            throw 503;
          }
        } else {
          throw 404;
        }
      } catch (error) {
        this.global = {
          currentPath: '',
          nstreePath: 'D:\\vscode-plugins\\vscode-nstree\\.nstree.json',
          nstreeJson: {
            name: 'nstree',
            tree: [
              {
                name: 'src',
                body: '插件源代码',
                index: 0,
                bold: false,
                path: 'src',
                children: [
                  {
                    name: 'editProjectDoc.js',
                    body: '编辑目录结构相关的方法',
                    index: 9,
                    bold: false,
                    path: 'src/editProjectDoc.js',
                    children: [],
                  },
                  {
                    name: 'extension.js',
                    body: '插件的js入口文件',
                    index: 9,
                    bold: false,
                    path: 'src/extension.js',
                    children: [],
                  },
                  {
                    name: 'getCurrentPath.js',
                    body: '获取当前文件路径的方法',
                    index: 9,
                    bold: false,
                    path: 'src/getCurrentPath.js',
                    children: [],
                  },
                  {
                    name: 'util.js',
                    body: '工具方法',
                    index: 9,
                    bold: false,
                    path: 'src/util.js',
                    children: [],
                  },
                ],
              },
              {
                name: 'docs',
                body: '编辑目录结构的页面，也是web功能展示页面',
                index: 1,
                bold: false,
                path: 'docs',
                children: [
                  {
                    name: 'demo',
                    body: '本地已删除的无效路径',
                    index: 0,
                    bold: false,
                    path: 'docs/demo',
                    children: [
                      {
                        name: 'demo.html',
                        body: '本地已删除的无效路径',
                        index: 9,
                        bold: false,
                        path: 'docs/demo/demo.html',
                        children: [],
                      },
                    ],
                  },
                  {
                    name: 'unless.js',
                    body: '本地已删除的无效路径',
                    index: 1,
                    bold: false,
                    path: 'docs/unless.js',
                    children: [],
                  },
                  {
                    name: 'edit-doc.js',
                    body: '',
                    index: 9,
                    bold: false,
                    path: 'docs/edit-doc.js',
                    children: [],
                  },
                  {
                    name: 'index.html',
                    body: '',
                    index: 9,
                    bold: false,
                    path: 'docs/index.html',
                    children: [],
                  },
                ],
              },
              {
                name: 'images',
                body: '图片资源，主要是插件图标',
                index: 2,
                bold: false,
                path: 'images',
                children: [],
              },
              {
                name: 'package.json',
                body: 'vscode插件的入口文件',
                index: 2,
                bold: false,
                path: 'package.json',
                children: [],
              },
              {
                name: 'nstree.json',
                body: '使用本插件自动生成的目录结构文件。',
                index: 3,
                bold: false,
                path: 'nstree.json',
                children: [],
              },
              {
                name: '.vscode',
                body: '插件开发时一些配置',
                index: 9,
                bold: false,
                path: '.vscode',
                children: [],
              },
              {
                name: 'CHANGELOG.md',
                body: 'vscode插件更新日志',
                index: 9,
                bold: false,
                path: 'CHANGELOG.md',
                children: [],
              },
              {
                name: 'README.md',
                body: '插件说明',
                index: 9,
                bold: false,
                path: 'README.md',
                children: [],
              },
            ],
          },
        };
      }
    }

    this.nstree = this.global.nstreeJson;
    let currentPath = this.global.currentPath;
    let currentPathData = await this.setTree(currentPath);
    if (currentPath) {
      this.$nextTick((v) => {
        this.expandPath(currentPath);
        if (this.global.currentPath && currentPathData) {
          this.editNode(currentPathData);
        }
      });
    } else {
      this.expandPath('/');
    }
    this.initImportJson();
    //path = 'app/components/AutoExPwd/index.js';
  },
  methods: {
    async setTree(path, data = {}) {
      return new Promise((resolve) => {
        let tree = this.nstree.tree;
        let pathArray = path ? path.split('/') : [];
        let prev = tree;
        let currentPathData = {};
        pathArray.forEach((v, i) => {
          let curDataIndex = prev.findIndex((vv) => vv.name === v);
          let curData = {};
          if (curDataIndex === -1) {
            if (data !== 'del') {
              curData = {
                name: v,
                body: '',
                index: 9,
                bold: false,
                path: pathArray.slice(0, i + 1).join('/'),
                children: [],
                ...data,
              };
              prev.push(curData);
              if (i === pathArray.length - 1) {
                currentPathData = curData;
              }
            }
          } else {
            curData = prev[curDataIndex];
            if (data === 'del' && curData.path === path) {
              prev.splice(curDataIndex, 1);
            } else {
              if (i === pathArray.length - 1) {
                Object.keys(data).forEach((v) => {
                  curData[v] = data[v];
                });
                currentPathData = curData;
              }
            }
          }
          prev.sort((a, b) => {
            if (a.index === b.index) {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            } else {
              return a.index - b.index;
            }
          });
          prev = curData.children || [];
        });
        this.treeNeedUpdate = false;
        this.nstree.tree = tree;
        this.setQtree();
        this.save();
        this.$nextTick(() => {
          this.treeNeedUpdate = true;
          resolve(currentPathData);
        });
      });
    },
    setQtree() {
      let nstree = this.nstree;
      this.qtree = [
        {
          name: nstree.name || '/',
          path: '/',
          children: nstree.tree,
        },
      ];
    },
    filterQtree(node, filter) {
      filter = filter.toLowerCase();
      return (
        (node.path && node.path.toLowerCase().indexOf(filter) > -1) ||
        (node.body && node.body.toLowerCase().indexOf(filter) > -1)
      );
    },
    async editNodeConfirm() {
      await this.setTree(this.form.path, this.form);
      this.notify(`编辑 ${this.form.path} 成功！`);
      this.$nextTick((v) => {
        this.expandPath(this.form.path);
        this.editing = false;
        console.log(JSON.parse(JSON.stringify(this.nstree.tree)));
      });
    },
    async delNode(node) {
      this.$q
        .dialog({
          title: 'Confirm',
          dark: this.darkMode,
          message: `是否从注释文档中确认删除 ${node.path} 及以下所有子孙节点？`,
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.setTree(node.path, 'del');
        });
    },
    async openNode(node) {
      let success = await callVscode({
        cmd: 'openFileInVscode',
        path: node.path,
      });
      if (!this.inVscode) {
        this.demoImg = this.demoImgs.openFile;
        this.showDemo = true;
      }
    },
    editNode(node) {
      this.form = {
        ...node,
      };
      delete this.form.children;
      this.editing = true;
    },
    async editName() {
      this.setQtree();
      this.save();
    },
    copyNode(node, tip) {
      if (!this.inVscode) {
        this.demoImg = this.demoImgs.copyPath;
        this.showDemo = true;
      }
      Quasar.copyToClipboard(node.path).then(() => {
        this.notify(`复制 ${node.path} 成功！`);
      });
    },
    expandPath(path) {
      let pathArray = path === '/' ? [] : path.split('/');
      pathArray.forEach((v, i) => {
        this.$refs.qtree.setExpanded(pathArray.slice(0, i + 1).join('/'), true);
      });
      this.$refs.qtree.setExpanded('/', true);
    },
    changeExpandAll() {
      if (this.expandAll) {
        this.$refs.qtree.expandAll();
      } else {
        this.$refs.qtree.collapseAll();
      }
    },
    async save() {
      let res = await callVscode({
        cmd: 'save',
        treeJson: JSON.stringify(this.nstree, null, 2),
      });
    },
    async getUnlessPath() {
      let res = await callVscode({
        cmd: 'getUnlessPath',
        tree: this.nstree.tree,
      });
      if (res.success && res.data && res.data.length > 0) {
        this.$q
          .dialog({
            title: 'Confirm',
            dark: this.darkMode,
            message: `发现${res.data.length}个无效路径，分别是${res.data.join(
              '、'
            )}，是否立即清除？`,
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            res.data.forEach((v) => {
              this.setTree(v, 'del');
            });
          });
      } else {
        this.notify(`没有需要清除的无效路径！`);
      }
    },
    exportMd() {
      let md = this.json2md(this.qtree);
      Quasar.copyToClipboard(md).then(() => {
        this.notify(`复制markdown格式到剪贴板成功！`);
      });
    },
    exportJson() {
      Quasar.exportFile('nstree.json', JSON.stringify(this.nstree, null, 2));
    },
    importJson() {
      this.$refs.file.click();
    },
    initImportJson() {
      if (this.inVscode) {
        return;
      }
      this.$refs.file.addEventListener('change', (e) => {
        let file = e.target.files[0];
        this.$refs.file.value = '';
        if (!/\.json$/i.test(file.name)) {
          this.notify('请选择json文件！', 'error');
          return;
        }
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = (e) => {
          this.fotmatImportJson(e.target.result);
        };
      });
    },
    fotmatImportJson(json) {
      try {
        let treeJson = JSON.parse(json);
        if (treeJson.name && treeJson.tree) {
          this.nstree = treeJson;
          this.setQtree();
        } else {
          this.notify('请选择正确的nstree格式文件！', 'error');
        }
      } catch (error) {
        this.notify('请选择正确的nstree格式文件！', 'error');
      }
    },
    getFileType(name) {
      let icon = '';
      switch (true) {
        case /^\.gitignore$/.test(name):
        case /^\.git$/.test(name):
          icon = 'logo-github';
          break;
        case /^\.npmignore$/.test(name):
          icon = 'logo-npm';
          break;
        case /\.md$/i.test(name):
          icon = 'logo-markdown';
          break;
        case /\.(js)$/i.test(name):
          icon = 'logo-javascript';
          break;
        case /\.(jsx)$/i.test(name):
          icon = 'logo-react';
          break;
        case /\.(css|less|scss|sass|stylus)$/i.test(name):
          icon = 'logo-css3';
          break;
        case /\.(htm|html|ejs)$/i.test(name):
          icon = 'logo-html5';
          break;
        case /\.(vue)$/i.test(name):
          icon = 'logo-vue';
          break;
      }

      return icon ? 'ion-' + icon : '';
    },
    notify(message, type = 'success') {
      this.$q.notify({
        message,
        icon:
          type === 'success'
            ? 'ion-checkmark-circle-outline'
            : 'ion-close-circle',
      });
    },
    json2md(json, tab = 8) {
      const treeArr = treePath(json[0]);
      const nums = Math.max(...treeArr.map((v) => v.mdpath.length));
      const tree = treeArr
        .map(
          (v) =>
            v.mdpath +
            ' '.repeat(nums - v.mdpath.length + 4) +
            (v.source.body ? `# ${v.source.body}` : '') +
            '\n'
        )
        .join('');
      return tree;
      function treePath(dir) {
        const treeArr = [
          {
            name: dir.name,
            mdpath: dir.name,
            source: dir,
          },
        ];
        const render = function (v, isLast, deep) {
          const line = deep.map((el) => `${el ? '│' : ' '}  `).join('');
          const text = `${line}${isLast ? '└─' : '├─'} ${v.name}`;
          return {
            name: v.name,
            mdpath: text,
            source: v,
          };
        };

        const tree = function (target, deep = []) {
          const child = target.children;
          const direct = [];
          const file = [];
          child.forEach(function (v) {
            if (v.children && v.children.length > 0) {
              direct.push(v);
            } else {
              file.push(v);
            }
          });
          direct.forEach(function (v, i) {
            const dir = v;
            const isLast = i === direct.length - 1 && file.length === 0;
            treeArr.push(render(v, isLast, deep));
            tree(dir, [...deep, !isLast]);
          });
          file.forEach(function (v, i) {
            const isLast = i === file.length - 1;
            treeArr.push(render(v, isLast, deep));
          });
        };

        tree(dir);
        return treeArr;
      }
    },
  },
});
/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 */
function callVscode(data) {
  return new Promise((resolve, reject) => {
    if (typeof data === 'string') {
      data = { cmd: data };
    }
    data._id = Date.now() + '' + ~~(Math.random() * 100000);
    if (!window.acquireVsCodeApi) {
      resolve(
        {
          getUnlessPath: {
            success: true,
            data: ['docs/demo', 'docs/demo/demo.html', 'docs/unless.js'],
          },
        }[data.cmd] || { success: true }
      );
      return;
    }
    vscode.postMessage(data);
    rx.once(data._id, (res) => {
      resolve(res);
    });
  });
}
function getRequest(name) {
  var url = window.location.search,
    theRequest = {};
  if (url.indexOf('?') != -1) {
    var str = url.substr(1),
      strs = str.split('&');
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
    }
  }
  if (name !== undefined) {
    return theRequest[name];
  }
  return theRequest;
}
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.cmd) {
    case 'vscodeCallback':
      rx.emit(message._id, message.data);
      break;
    default:
      break;
  }
});
