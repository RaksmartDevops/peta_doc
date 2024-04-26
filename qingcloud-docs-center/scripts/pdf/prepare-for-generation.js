const fs = require('fs');
const rsyncPdfLibs = require('./rsyncPdfLibs');
const rsyncPdfContent = require('./rsyncPdfContent');
const parseAdocs = require('./parseAdocs');
const getAllAdocFiles = require('./getAllAdocFiles');
const logger = require('../logger');
const { PDF_CONTENT_DIR, PDF_COMPONENTS_DIR } = require('./constants');
const dealAsciidoctorBug = require('../dealAsciidoctorBug');
const { getTargetAdocPath } = require('./utils');

function generateByList(list) {
  const generationConfigs = [];

  list.forEach((pdfList) => {
    if (!pdfList.length || !pdfList[0]?.title) {
      return;
    }

    const { filePath, title, parentTitle, depth, meta } = pdfList[0];
    const generatePath = filePath.replace(/\/[^\/]+\.adoc$/i, `/generate_${title}_adoc.adoc`);
    const targetAdoc = getTargetAdocPath({ filePath, title });
    const isSearchPage = meta.isSearchPage;
    let fileContent = `
include::${PDF_COMPONENTS_DIR}/cover.adoc[]\n\n
include::${PDF_COMPONENTS_DIR}/preface.adoc[]\n\n
<<<\n\n
include::${PDF_COMPONENTS_DIR}/toc.adoc[]\n\n`;

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
                `include::${PDF_COMPONENTS_DIR}/preface.adoc[]\n\n`,
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

    generationConfigs.push({
      adocPath: generatePath,
      targetAdoc,
      pdfTitle,
    });

    // generateFile({
    //   adocPath: generatePath,
    //   targetAdoc,
    //   pdfTitle,
    //   type: 'pdf',
    // });
    // pdfPaths.push(targetAdoc.replace(/\.adoc$/i, '.pdf'));

    // const targetHtml = targetAdoc.replace(/\.adoc$/i, '.html');
    // if (fs.existsSync(targetHtml)) {
    //   // 文件都生成完了，还 handle 个啥？
    //   handleHTML(targetHtml);
    // }
  });

  return generationConfigs;
}

/**
 *
 * @param  fileType pdf or docx
 * @returns
 */
module.exports = function(fileType) {
  dealAsciidoctorBug();
  // 同步 pdf/libs 到 pdf/node_modules
  rsyncPdfLibs();

  // 同步 content 目下的 _ 开头的文件夹和 @project 文件夹到 pdf/content 下
  // todo 其实不用同步也能合并的吧？
  rsyncPdfContent();
  // 获取所有 Adoc 文件信息
  const list = getAllAdocFiles();
  // 解析 adoc 文档，替换文档内容
  parseAdocs(PDF_CONTENT_DIR, fileType);

  logger.info('Start generate adoc...');
  // 根据 pdf 信息，生成最终生成 pdf 的 generate_adoc.adoc, 然后根据这个文件生成最终 pdf

  return generateByList(list);
}
