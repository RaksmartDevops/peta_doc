const logger = require('./logger');
const fs = require('fs');
const path = require('path');

function checkNamespace(_namespace) {
  const namespace = _namespace || process.argv.filter((v) => v !== '--' && !/^--.+$/.test(v))[2];
  if (!namespace) {
    logger.error('未输入项目名，请重新运行命令!');
    process.exit(1);
  }

  if (namespace && fs.existsSync(path.join(process.cwd(), `config/@${namespace}`))) {
    const PROJECT_DIR = path.join(process.cwd(), `config/@${namespace}`);
    const checkList = ['_variables.scss', 'config.yaml'];
    const files = fs.readdirSync(PROJECT_DIR);
    const notExists = [];
    checkList.forEach((v) => {
      if (!files.includes(v)) {
        notExists.push(v);
      }
    });
    if (notExists.length) {
      logger.error(`项目 config/@${namespace} 缺少 ${notExists.join(',')} 文件！`);
      process.exit(1);
    } else {
      logger.success(`项目名 @${namespace} 自检通过！`);
      return namespace;
    }
  } else {
    logger.error(`项目名 ${_namespace} 错误，请重新运行命令！`);
    process.exit(1);
  }
}

module.exports = checkNamespace;
