const fs = require('fs');
const shell = require('shelljs');
const logger = require('../logger');
const { PDF_FILES_DIR, PDF_STATIC_DIR, PDF_CONTENT_DIR, WORD_STATIC_DIR } = require('./constants');

function rsyncPdfFiles(type) {
  if (!fs.existsSync(PDF_FILES_DIR)) {
    shell.exec(`mkdir -p ${PDF_FILES_DIR}`);
  }

  if (fs.existsSync(`${PDF_CONTENT_DIR}/@@hash@@.json`)) {
    shell.exec(`mv "${PDF_CONTENT_DIR}/@@hash@@.json" "${PDF_FILES_DIR}"`);
  }

  if (type === 'pdf' || !type) {
    shell.exec(`rm -fr ${PDF_FILES_DIR}/pdf`);
    const pdfResult = shell.exec(`rsync -a --delete --exclude=".*" "${PDF_STATIC_DIR}" "${PDF_FILES_DIR}"`);
    if (pdfResult.code === 0) {
      logger.success(`Rsync ${PDF_STATIC_DIR} Success!`);
    } else {
      logger.error(`Rsync ${PDF_STATIC_DIR} Fail!`);
    }
  }

  if (type === 'docx' || !type) {
    shell.exec(`rm -fr ${PDF_FILES_DIR}/docx`);
    const wordResult = shell.exec(`rsync -a --delete --exclude=".*" "${WORD_STATIC_DIR}" "${PDF_FILES_DIR}"`);
    if (wordResult.code === 0) {
      logger.success(`Rsync ${WORD_STATIC_DIR} Success!`);
    } else {
      logger.error(`Rsync ${WORD_STATIC_DIR} Fail!`);
    }
  }
}

module.exports = rsyncPdfFiles;
