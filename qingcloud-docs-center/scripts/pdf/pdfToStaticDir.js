const shell = require('shelljs');
const { PDF_CONTENT_DIR, STATIC_DIR } = require('./constants');

/**
 * copy 生成的 pdf/word 到 static/{pdf|word} 下
 */
function pdfToStaticDir(pdfPaths, type) {
  shell.exec(`rm -rf ${STATIC_DIR}/${type}`);
  pdfPaths.forEach((pdfPath) => {
    const target = pdfPath.replace(PDF_CONTENT_DIR, `${STATIC_DIR}/${type}`).replace(/\/[^\/]+\.(pdf|docx)$/i, '');
    shell.mkdir('-p', target);
    shell.cp(pdfPath, target);
  });
}

module.exports = pdfToStaticDir;
