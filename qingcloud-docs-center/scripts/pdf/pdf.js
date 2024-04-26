const fs = require('fs');
const rsyncPdfLibs = require('./rsyncPdfLibs');
const rsyncPdfContent = require('./rsyncPdfContent');
const parseAdocs = require('./parseAdocs');
const getAllAdocFiles = require('./getAllAdocFiles');
// const generatePdf = require('./generatePdf');
const generateFile = require('./generateFile');
// const generateHtmlWord = require('./generateHtmlWord');
const handleHTML = require('./handleHTML');
const pdfToStaticDir = require('./pdfToStaticDir');
const rsyncPdfFiles = require('./rsyncPdfFiles');
const logger = require('../logger');
const { PDF_CONTENT_DIR, PDF_COMPONENTS_DIR, namespace } = require('./constants');
const { getCommandParams } = require('../utils');
const dealAsciidoctorBug = require('../dealAsciidoctorBug');
const { getTargetAdocPath } = require('./utils');

dealAsciidoctorBug();

const params = getCommandParams();
const isWord = params.type === 'word';
const start = Date.now();

// 同步 pdf/libs 到 pdf/node_modules
rsyncPdfLibs();

function someWork1() {
  const filePath = process.argv.filter((v) => v !== '--' && !/^--.+$/.test(v))[3];
  if (fs.existsSync(filePath) && filePath.endsWith('.adoc')) {
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
  } else {
    logger.error(`${filePath} is not exists! Please check it!`);
    process.exit(1);
  }
}

function someWork2() {
  // 同步 content 目下的 _ 开头的文件夹和 @project 文件夹到 pdf/content 下
  rsyncPdfContent();
  // 获取所有 Adoc 文件信息
  const list = getAllAdocFiles();
  // 解析 adoc 文档，替换文档内容
  parseAdocs(PDF_CONTENT_DIR, isWord ? 'docx' : 'pdf');

  if (params.type || params.onlyAdoc) {
    logger.info(`Start generate ${params.onlyAdoc ? 'adoc' : params.type}...`);
    // 根据 pdf 信息，生成最终生成 pdf 的 generate_adoc.adoc, 然后根据这个文件生成最终 pdf

    const pdfPaths = [];
    const wordPaths = [];
    list.forEach(callGenerateFile(wordPaths, pdfPaths));

    logger.success(`Generate ${params.onlyAdoc ? 'adoc' : params.type} success!`);
    if (pdfPaths.length || wordPaths.length) {
      logger.info(`Rsync ${params.type}...`);
      if (pdfPaths.length) {
        pdfToStaticDir(pdfPaths, 'pdf');
        rsyncPdfFiles('pdf');
      }
      if (wordPaths.length) {
        pdfToStaticDir(wordPaths, 'docx');
        rsyncPdfFiles('docx');
      }
    }

    console.log(
      `生成 ${params.onlyAdoc ? 'adoc' : params.type} 共耗时: ${
        Math.round(((Date.now() - start) / 60 / 1000) * 100) / 100
      } 分钟`,
    );
  }

  if (params.checkError && global.LOGGER_ERRORS.length) {
    logger.warn(`项目 ${namespace} 报错，无法通过测试！`);
    process.exit(1);
  } else if (params.checkError) {
    logger.success(`项目 ${namespace} 通过测试！`);
  }
}

if (params.file) {
  someWork1();
} else {
  someWork2();
}

function callGenerateFile(wordPaths, pdfPaths) {
  return (pdfList) => {
    if (!pdfList.length || !pdfList[0]?.title) {
      return;
    }

    const { filePath, title, parentTitle, depth, meta } = pdfList[0];
    const generatePath = filePath.replace(/\/[^\/]+\.adoc$/i, `/generate_${title}_adoc.adoc`);
    const targetAdoc = getTargetAdocPath({ filePath, title });
    const isSearchPage = meta.isSearchPage;
    let fileContent = '';
    fileContent += `include::${`${PDF_COMPONENTS_DIR}/cover.adoc`}[]\n\n`;
    fileContent += `include::${`${PDF_COMPONENTS_DIR}/preface.adoc`}[]\n\n`;
    fileContent += `<<<\n\n`;
    fileContent += `include::${`${PDF_COMPONENTS_DIR}/toc.adoc`}[]\n\n`;

    const baseDepth = isSearchPage ? depth + 1 : depth;
    let pdfTitle = title;
    if (pdfList.length === 1) {
      fileContent += fs.readFileSync(filePath, 'utf8').replace(`\n= ${title.trim()}\n`, '');
    } else {
      pdfTitle = parentTitle ? `${parentTitle} - ${title}` : title;
      let isFirstContentPage = true;
      pdfList.filter(Boolean).forEach((v, index) => {
        if (index === 0) {
          const checkContent = fs
            .readFileSync(v.filePath, 'utf8')
            .replace(`\n= ${title.trim()}\n`, '')
            .replace(/\[\#fil-.*?\]/gim, '')
            .replace(/\n/g, '');
          if (checkContent.length) {
            if (v.filePath.endsWith('/_index.adoc')) {
              const writeContent =
                fs
                  .readFileSync(v.filePath, 'utf8')
                  .replace(/\[\#fil-.*?\]\n= .*?\n/i, '[.preface.reset_page_num]\n--\n[.preface_title]\n前言\n')
                  .replace(/\[\#fil-.*?\]\n(=+ )(.*?\n)/gim, '[discrete]\n=== $2') + '\n--';
              fs.writeFileSync(v.filePath, writeContent);
              fileContent = fileContent.replace(
                `include::${`${PDF_COMPONENTS_DIR}/preface.adoc`}[]\n\n`,
                `include::${v.filePath}[]\n\n`,
              );
            }
          }
        }

        if (v.depth - baseDepth === 1) {
          if (!isFirstContentPage) {
            fileContent += `\n<<<\n\n`;
          }
          fileContent += `include::${v.filePath}[leveloffset=1]\n\n`;
          isFirstContentPage = false;
        }

        if (v.depth - baseDepth > 1) {
          fileContent += `include::${v.filePath}[leveloffset=${v.depth - baseDepth}]\n\n`;
        }
      });
    }

    fs.writeFileSync(generatePath, fileContent);
    if (params.onlyAdoc) {
      return;
    }

    if (isWord) {
      generateFile({
        adocPath: generatePath,
        targetAdoc,
        pdfTitle,
        type: 'docx',
      });
      wordPaths.push(targetAdoc.replace(/\.adoc$/i, '.docx'));
    } else {
      generateFile({
        adocPath: generatePath,
        targetAdoc,
        pdfTitle,
        type: 'pdf',
      });
      pdfPaths.push(targetAdoc.replace(/\.adoc$/i, '.pdf'));
    }

    const targetHtml = targetAdoc.replace(/\.adoc$/i, '.html');
    if (fs.existsSync(targetHtml)) {
      handleHTML(targetHtml);
    }
  };
}
