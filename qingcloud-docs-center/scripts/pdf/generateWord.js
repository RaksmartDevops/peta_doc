const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const { isString, omit } = require('lodash');
const { STATIC_DIR, PDF_CSS, CONFIG } = require('./constants');
const logger = require('../logger');

function generateWord(adocPath, xmlPath, wordPath, pdfTitle, pdfDocInfo = {}) {
  const pdfConfig = {
    imagesdir: STATIC_DIR,
    stylesheet: PDF_CSS,
    pdf_Title: pdfTitle,
  };
  Object.entries({
    ...omit(CONFIG.params.pdf, ['pdf_include', 'pdf_exclude']),
    ...omit(CONFIG.markup.asciidocExt.attributes || {}, ['toc', 'toclevels']),
    ...omit(pdfDocInfo, ['fileDir']),
  }).forEach(([key, val]) => {
    if (isString(val) && val.startsWith('/images/')) {
      pdfConfig[key] = path.join(STATIC_DIR, val);
    } else {
      pdfConfig[key] = String(val);
    }
  });

  let command = 'asciidoctor';
  command += ` --require @asciidoctor/docbook-converter --backend docbook`;
  command += ` -a imagesdir=${STATIC_DIR}`;
  command += ` -a stylesheet=${PDF_CSS}`;
  Object.entries(pdfConfig).forEach(([key, val]) => {
    command += ` -a ${key}="${val}"`;
  });
  command += ` "${adocPath}" -o "${xmlPath}"`;
  shell.exec(command);

  const XMLdata = fs.readFileSync(xmlPath, 'utf-8');
  const xmlContent = XMLdata.replace(/<info>.*?<\/info>\n/s, '')
    .replace(/<simpara role="top_left">.*?<\/simpara>\n/s, '')
    .replace(/<simpara role="bottom_left">.*?<\/simpara>\n/s, '')
    .replace(/<simpara role="bottom_center">.*?<\/simpara>\n/s, '');

  fs.writeFileSync(xmlPath, xmlContent);

  command = `pandoc --from docbook --to docx -s "${xmlPath}" -o "${wordPath}" --reference-doc="${process.cwd()}/pdf/docx/my-custom-styles.docx" --highlight-style "${process.cwd()}/pdf/docx/my-custom-code.theme" --lua-filter "${process.cwd()}/pdf/docx/pandoc-filter.lua"`;
  const result = shell.exec(command);
  if (result.code === 0) {
    logger.success(`generate ${wordPath} success`);
  } else {
    logger.error(`generate ${wordPath} fail`);
  }
}

module.exports = generateWord;
