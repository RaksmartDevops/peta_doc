const generateFile = require('./generateFile');
const pdfToStaticDir = require('./pdfToStaticDir');
const rsyncPdfFiles = require('./rsyncPdfFiles');
const logger = require('../logger');
const prepareForGeneration = require('./prepare-for-generation');

const start = Date.now();

const generationConfigs = prepareForGeneration('docx')

var pdfPaths = [];
for (const configs of generationConfigs)  {
  generateFile({ ...configs, type: 'docx' })
  pdfPaths.push(configs.targetAdoc.replace(/\.adoc$/i, '.docx'));
}

logger.success('Generate adoc success!');
if (pdfPaths.length) {
  logger.info(`Rsync docx...`);
  pdfToStaticDir(pdfPaths, 'docx');
  rsyncPdfFiles('docx');
}

console.log(`生成 adoc 共耗时: ${Math.round(((Date.now() - start) / 60 / 1000) * 100) / 100} 分钟`);
