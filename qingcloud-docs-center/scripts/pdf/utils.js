const fs = require('fs');
const path = require('path');
const { isString, omit } = require('lodash');
const { getPdfMeta, getFullYearMonthDate } = require('../utils');
const { PDF_CONTENT_DIR, ORIGIN_CONTENT_DIR, STATIC_DIR, PDF_CSS, CONFIG } = require('./constants');

function getInfo(filePath) {
  const currentMetaFilePath = path.resolve(filePath).replace(PDF_CONTENT_DIR, ORIGIN_CONTENT_DIR);
  const dirname = path.join(currentMetaFilePath, '..');
  if (fs.existsSync(dirname)) {
    function getInfoMeta(dirname) {
      if (!ORIGIN_CONTENT_DIR.startsWith(dirname)) {
        const meta = getPdfMeta(path.join(dirname, `_index.adoc`));
        if (meta) {
          return meta;
        }
        return getInfoMeta(path.join(dirname, '..'));
      }
    }
    return getInfoMeta(dirname);
  }
  return {};
}

function getAdocConfig({ filePath = '', pdfTitle = '', fileInfo = {} }) {
  const absolutePath = path.resolve(filePath);
  const infoConfig = getInfo(absolutePath);
  const generatedConfig = {
    pdf_releaseDate: getFullYearMonthDate(),
  };
  const adocConfig = {
    imagesdir: STATIC_DIR,
    stylesheet: PDF_CSS,
    pdf_Title: pdfTitle,
    ...generatedConfig,
  };

  const fileConfig = {
    ...omit(CONFIG.params.pdf, ['pdf_include', 'pdf_exclude', 'pdf_only']),
    ...omit(CONFIG.markup.asciidocExt.attributes || {}, ['toc', 'toclevels']),
    ...infoConfig,
    ...fileInfo,
  };

  Object.entries(fileConfig).forEach(([key, val]) => {
    if (isString(val) && val.startsWith('/images/')) {
      adocConfig[key] = path.join(STATIC_DIR, val);
    } else if (val !== 'null' && val !== 'undefined' && val !== null && val !== undefined) {
      adocConfig[key] = String(val);
    }
  });

  const pdf_generatedConfig = Object.keys(generatedConfig).filter((v) => !fileConfig[v]);
  if (pdf_generatedConfig.length) {
    adocConfig.pdf_generatedConfig = pdf_generatedConfig.join('|');
  }
  return adocConfig;
}

function getTargetAdocPath({ filePath, title }) {
  return filePath.replace(/\/[^\/]+\.adoc$/i, `/${title}.adoc`);
}

function getFileConfig({ meta, data, filePath }) {
  const fileInfo = {};
  const pdfTitle = meta.title || meta.Title;
  const config = data.match(/\n\:[^:]+\:.*/gi);
  if (config) {
    config.forEach((v) => {
      const result = v.replace('\n:', '').split(':');
      const key = result[0];
      const value = result.slice(1).join(':').replace(/ +/, '') || '';
      fileInfo[key] = value;
    });
  }
  return getAdocConfig({
    filePath,
    pdfTitle,
    fileInfo,
  });
}

module.exports = {
  getAdocConfig,
  getFileConfig,
  getTargetAdocPath,
};
