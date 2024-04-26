const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const logger = require('../logger');
const { getMeta } = require('../utils');

const { isString, omit } = require('lodash');
const rsyncPdfLibs = require('./rsyncPdfLibs');
const rsyncPdfContent = require('./rsyncPdfContent');
const handleHTML = require('./handleHTML');
const parseAdocs = require('./parseAdocs');
const dealAsciidoctorBug = require('../dealAsciidoctorBug');
const { PDF_CONTENT_DIR, STATIC_DIR, PDF_CSS, CONFIG, ORIGIN_CONTENT_DIR } = require('./constants');

const pdfPath = (process.argv[3] || '').trim();
const checkPath = path.join(ORIGIN_CONTENT_DIR, pdfPath);
const pdfContentPath = path.join(PDF_CONTENT_DIR, pdfPath);
if (!fs.existsSync(checkPath)) {
  logger.error(`${checkPath} not found!`);
  process.exit(1);
}
const start = Date.now();

dealAsciidoctorBug();
rsyncPdfLibs();
rsyncPdfContent();
parseAdocs(PDF_CONTENT_DIR);

function checkPdf(dir) {
  logger.info(`Checking ${dir}`);
  fs.readdirSync(dir).forEach((filename) => {
    const fileDir = path.join(dir, filename);
    const fileStat = fs.statSync(fileDir);
    if (fileStat.isDirectory()) {
      checkPdf(fileDir);
    }
    const meta = getMeta(fileDir);
    const isDraft = meta && (meta.draft || meta.not_show);
    if (fileStat.isFile() && /\.adoc$/i.test(filename) && !isDraft) {
      const pdfConfig = {
        imagesdir: STATIC_DIR,
        stylesheet: PDF_CSS,
        pdf_Title: filename,
      };
      Object.entries({
        ...omit(CONFIG.params.pdf, ['pdf_include', 'pdf_exclude']),
        ...omit(CONFIG.markup.asciidocExt.attributes || {}, ['toc', 'toclevels']),
      }).forEach(([key, val]) => {
        if (isString(val) && val.startsWith('/images/')) {
          pdfConfig[key] = path.join(STATIC_DIR, val);
        } else {
          pdfConfig[key] = String(val);
        }
      });
      const envParams = ['PUPPETEER_DEFAULT_TIMEOUT', 'PUPPETEER_NAVIGATION_TIMEOUT', 'PUPPETEER_RENDERING_TIMEOUT'];
      const TIMEOUT = 5 * 60 * 1000;
      let command = '';
      envParams.forEach((v) => {
        command += `export ${v}=${TIMEOUT} && `;
      });

      command += './node_modules/.bin/asciidoctor-web-pdf';
      Object.entries(pdfConfig).forEach(([key, val]) => {
        command += ` -a ${key}="${val}"`;
      });
      const pdfPath = fileDir.replace(/\.adoc$/, '.pdf');
      const htmlPath = fileDir.replace(/\.adoc$/, '.html');
      command += ` "${fileDir}" -o "${pdfPath}"`;
      shell.exec(command);
      if (!fs.existsSync(pdfPath)) {
        handleHTML(htmlPath);
      } else {
        shell.exec(`rm "${pdfPath}"`);
        shell.exec(`rm "${htmlPath}"`);
      }
    }
  });
}

checkPdf(pdfContentPath);
const stop = Date.now();
console.log(`检测 PDF 共耗时: ${Math.round(((stop - start) / 60 / 1000) * 100) / 100} 分钟`);
