const vscode = require('vscode');
const util = require('./util');
module.exports = function (context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.nstree.getCurrentPath',
      (uri) => {
        if (!uri) {
          uri = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.document.uri
            : null;
        }
        if (!uri) {
          vscode.window.setStatusBarMessage('当前没有打开的文件！', 5000);
          return;
        }
        let filepath = util.getCurrentPath(uri.path);
        vscode.env.clipboard.writeText(filepath);
        // vscode.window.showInformationMessage(``);
        vscode.window.setStatusBarMessage(
          `当前路径为：${filepath} (已复制到剪贴板)`,
          7000
        );
      }
    )
  );
};
