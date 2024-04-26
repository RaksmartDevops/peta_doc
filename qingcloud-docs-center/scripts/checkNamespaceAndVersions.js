const fs = require('fs');
const path = require('path');

const checkNamespace = require('./checkNamespace');
const logger = require('./logger');
const namespace = checkNamespace();

function checkNamespaceAndVersions() {
  const argvs = process.argv.filter((v) => v !== '--' && !/^--.+$/.test(v)).slice(3);
  const versions = [];
  const errors = [];
  if (argvs.length) {
    argvs.forEach((argv) => {
      const versionDirection = path.join(process.cwd(), `content/@${namespace}/${argv}`);
      if (fs.existsSync(versionDirection) && fs.statSync(versionDirection).isDirectory()) {
        versions.push(argv);
      } else {
        errors.push(argv);
      }
    });
  }
  if (errors.length) {
    logger.error(`${errors.map((v) => `content/@${namespace}/${v}`).join(' ')} 目录不存在！请检查参数！`);
    process.exit(1);
  }
  return {
    versions: versions.length ? versions : null,
    namespace,
  };
}

module.exports = checkNamespaceAndVersions;
