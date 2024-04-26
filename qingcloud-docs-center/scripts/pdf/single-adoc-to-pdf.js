const fs = require('fs');
const rsyncPdfLibs = require('./rsyncPdfLibs');
const generateFile = require('./generateFile');
const handleHTML = require('./handleHTML');
const logger = require('../logger');
const { getCommandParams } = require('../utils');
const dealAsciidoctorBug = require('../dealAsciidoctorBug');
const { getTargetAdocPath } = require('./utils');

dealAsciidoctorBug();

const params = getCommandParams();
const isWord = params.type === 'word';

// 同步 pdf/libs 到 pdf/node_modules
rsyncPdfLibs();

// 此文件可以暂时不优化，因为 filePath 需要是完整的绝对路径
// 不要说对文档的同事，就是对程序员也是非常不用好的
// 我猜这个脚本也很少有人使用
// 我在 changelog 中将其标记为废弃

const filePath = process.argv.filter((v) => v !== '--' && !/^--.+$/.test(v))[3];
if (!fs.existsSync(filePath) || !filePath.endsWith('.adoc')) {
  logger.error(`${filePath} is not exists! Please check it!`);
  process.exit(1);
}

const targetAdoc = filePath.replace(/(.*)generate_(.+)_adoc\.adoc$/, '$1$2.adoc');
const realAdoc = targetAdoc === filePath ? targetAdoc.replace('.adoc', '_.adoc') : targetAdoc;
const pdfTitle =
  params.title ||
  realAdoc
    .split('/')
    .filter(Boolean)
    .slice(-1)[0]
    .replace(/\.adoc$/, '');
const fileInfo = {};
Object.keys(params).forEach((key) => {
  if (key !== 'title' && key !== 'type' && params[key] !== true) {
    fileInfo[key] = params[key];
  }
});
const realTargetAdoc = getTargetAdocPath({ filePath, title: pdfTitle });
generateFile({
  adocPath: filePath,
  targetAdoc: realTargetAdoc,
  pdfTitle,
  type: isWord ? 'docx' : 'pdf',
});
handleHTML(realTargetAdoc.replace(/\.adoc$/i, '.html'));
