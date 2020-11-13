const vscode = require('vscode');

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function (context) {
  console.log('插件已初始化！');
  require('./getCurrentPath')(context);
  require('./editProjectDoc')(context);
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
  console.log('插件已被释放！');
};
