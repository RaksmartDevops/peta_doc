const shell = require('shelljs');
const path = require('path');
const logger = require('../logger');
const { ORIGIN_CONTENT_COMPONENTS_DIRS, ORIGIN_CONTENT_DIR, PDF_CONTENT_DIR } = require('./constants');

// 同步 content 目下的 _ 开头的文件夹和 @project 文件夹到 pdf/content 下
function rsyncPdfContent() {
  ORIGIN_CONTENT_COMPONENTS_DIRS.forEach((v) => {
    const command = `rsync -a --exclude=".*" --delete "${v}" "${path.join(PDF_CONTENT_DIR, '..')}"`;
    // console.log('run command:', command);
    shell.exec(command);
  });

  const command = `rsync -a --exclude=".*" --delete "${ORIGIN_CONTENT_DIR}" "${path.join(PDF_CONTENT_DIR, '..')}"`;
  // console.log('run command:', command);
  const rsyncContentResult = shell.exec(command);

  console.log();
  if (rsyncContentResult.code === 0) {
    logger.success(`Rsync ${ORIGIN_CONTENT_DIR} Success!`);
  } else {
    shell.exit(1);
  }
}

module.exports = rsyncPdfContent;
