const shell = require('shelljs');
const { PDF_FILES_DIR, PDF_CONTENT_DIR } = require('./constants');
const logger = require('../logger');
const needGenerate = require('./needGenerate');
const { getCommandParams } = require('../utils');
const { getAdocConfig } = require('./utils');

const envParams = [
  'PUPPETEER_DEFAULT_TIMEOUT',
  'PUPPETEER_NAVIGATION_TIMEOUT',
  'PUPPETEER_RENDERING_TIMEOUT',
  'PUPPETEER_PRINT_TIMEOUT',
];

const TIMEOUT_WARNING = 5 * 60 * 1000;

function getCommandFirstPart(adocConfig) {
  const TIMEOUT = adocConfig.pdf_timeout ? +adocConfig.pdf_timeout * 60 * 1000 : 3 * 60 * 1000;

  const timeoutEnvs = envParams.map((p) => `export ${p}=${TIMEOUT}`);

  const args = Object.entries(adocConfig).map(([key, val]) => `-a ${key}="${val}"`).join(' ');

  const command = `asciidoctor-web-pdf ${args}`

  return [...timeoutEnvs, command].join(' && ');
}

function generatePDF(adocConfig, adocPath, targetPath) {
  logger.info(`Start generate ${targetPath}...`);
  let command = getCommandFirstPart(adocConfig);

  command += ` -a file_output_type="pdf" "${adocPath}" -o "${targetPath}"`;
  if (getCommandParams().preview) {
    command += ` --preview`;
  }

  return shell.exec(command);
}

function generateWord(adocConfig, adocPath, targetAdoc) {
  const targetPath = targetAdoc.replace(/\.adoc$/i, '.docx')
  logger.info(`Start generate ${targetPath}...`);
  let command = getCommandFirstPart(adocConfig);
  command += ` "${adocPath}"  -a file_output_type="docx" --only-html`;
  shell.exec(command);

  const _htmlPath = adocPath.replace(/\.adoc$/i, '.html');
  const htmlPath = targetAdoc.replace(/\.adoc$/i, '.html');
  shell.mv(_htmlPath, htmlPath);
  command = `node "${process.cwd()}/pdf/docx/html2docx.js" "${htmlPath}" "${targetPath}" -- --toclevels=${
    adocConfig.toclevels || 3
  }`;

  return shell.exec(command);
}

function generateFile({ adocPath, targetAdoc, pdfTitle, type = 'pdf', fileInfo = {} }) {
  const targetPath = type === 'pdf' ? targetAdoc.replace(/\.adoc$/i, '.pdf') : targetAdoc.replace(/\.adoc$/i, '.docx');
  const adocConfig = getAdocConfig({ filePath: adocPath, pdfTitle, fileInfo });
  // 因为已经生成过了所以不用再执行吗？
  // needGenerate 的逻辑还需要再确认一下
  if (!needGenerate({ adocPath, targetPath, adocConfig })) {
    logger.info(`Skip ${targetPath}`);
    shell.cp(
      targetPath.replace(PDF_CONTENT_DIR, `${PDF_FILES_DIR}/${targetPath.replace(/.*?\.([a-zA-Z\d]+$)/i, '$1')}`),
      targetPath,
    );
    return;
  }

  let command = getCommandFirstPart(adocConfig);

  const start = Date.now();
  const result = type === 'pdf' ? generatePDF(adocConfig, adocPath, targetPath) : generateWord(adocConfig, adocPath, targetAdoc)

  const stop = Date.now();

  if (stop - start > TIMEOUT_WARNING) {
    logger.warn(`${targetPath} 执行时间过长: ${Math.round(((stop - start) / 60 / 1000) * 100) / 100} 分钟!`);
  }

  if (result.stderr && result.stderr.includes('Error: TimeoutError')) {
    logger.error(`FAIL_COMMAND: ${command}`);
    logger.error(`TimeoutError! Generate ${targetPath} fail!`);
  } else if (result.code === 0) {
    logger.success(`Generate ${targetPath} success!`);
  } else {
    logger.error(`FAIL_COMMAND: ${command}`);
    logger.error(`Generate ${targetPath} fail!`);
  }
}

module.exports = generateFile;
