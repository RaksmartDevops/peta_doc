const shell = require('shelljs');
const path = require('path');
const logger = require('../logger');
const { PDF_LIBS_DIR, PROJECT_DIR } = require('./constants');

function rsyncPdfLibs() {
  const result = shell.exec(`rsync -av --exclude=".*" "${PDF_LIBS_DIR}" "${path.join(PROJECT_DIR, 'node_modules')}"`);
  console.log();
  if (result.code === 0) {
    logger.success(`Rsync ${PDF_LIBS_DIR} Success!`);
  } else {
    shell.exit(1);
  }
}

module.exports = rsyncPdfLibs;
