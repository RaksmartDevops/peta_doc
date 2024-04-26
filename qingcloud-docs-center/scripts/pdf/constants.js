const fs = require('fs');
const path = require('path');
const { isArray } = require('lodash');
const { getConfig, getCommandParams } = require('../utils');
const checkNamespaceAndVersions = require('../checkNamespaceAndVersions');
const checkNamespace = require('../checkNamespace');
const dealExternalFiles = require('../dealExternalFiles');
const commandParams = getCommandParams();
let namespace, versions;
if (commandParams.file) {
  namespace = checkNamespace();
} else {
  const namespaceVersions = checkNamespaceAndVersions();
  namespace = namespaceVersions.namespace;
  versions = namespaceVersions.versions;
}

const PROJECT_DIR = process.cwd();
const STATIC_DIR = path.join(PROJECT_DIR, 'static');
const ORIGIN_CONTENT_DIR = path.join(PROJECT_DIR, `content/@${namespace}`);
const ORIGIN_CONTENT_COMPONENTS_DIRS = fs
  .readdirSync(path.join(ORIGIN_CONTENT_DIR, '..'))
  .map((v) => {
    const filePath = path.join(ORIGIN_CONTENT_DIR, '..', v);
    if (fs.statSync(filePath).isDirectory() && !v.startsWith('@')) {
      return filePath;
    }
    return null;
  })
  .filter(Boolean);

const CONFIG_DIR = path.join(PROJECT_DIR, `config/@${namespace}`);

const PDF_DIR = path.join(PROJECT_DIR, 'pdf');
/**
 * 值为 pdf/content/@${namespace}
 *
 * 是将 `content/@namespace` 下的文件全部复制了过去
 */
const PDF_CONTENT_DIR = path.join(PROJECT_DIR, `pdf/content/@${namespace}`);

const PDF_CUSTOM_CSS = path.join(PROJECT_DIR, 'pdf/css/custom.css');
const PDF_CSS = [PDF_CUSTOM_CSS].filter(Boolean).join(',');

const PDF_COMPONENTS_DIR = path.join(PROJECT_DIR, 'pdf/components');
const PDF_LIBS_DIR = path.join(PDF_DIR, 'libs/asciidoctor-pdf');
const PDF_FILES_DIR = path.join(PROJECT_DIR, `pdf/files/@${namespace}`);
const PDF_STATIC_DIR = path.join(PROJECT_DIR, 'static/pdf');
const WORD_STATIC_DIR = path.join(PROJECT_DIR, 'static/docx');

dealExternalFiles(namespace);

const CONFIG = getConfig(namespace);

const PDF_CONTENT_EXCLUDE_DIR = (CONFIG.params.pdf.pdf_exclude || []).map((v) => path.join(PDF_CONTENT_DIR, v));
const PDF_CONTENT_INCLUDE_DIR = (CONFIG.params.pdf.pdf_include || []).map((v) =>
  path.join(PDF_CONTENT_DIR, isArray(v) && v.length ? v[0] : v),
);
const PDF_CONTENT_ONLY_DIR = (CONFIG.params.pdf.pdf_only || []).map((v) =>
  path.join(PDF_CONTENT_DIR, isArray(v) && v.length ? v[0] : v),
);
const PDF_CONTENT_VERSIONS_DIR = versions ? versions.map((v) => path.join(PDF_CONTENT_DIR, v)) : null;

module.exports = {
  PROJECT_DIR,
  STATIC_DIR,
  ORIGIN_CONTENT_DIR,
  ORIGIN_CONTENT_COMPONENTS_DIRS,
  PDF_DIR,
  PDF_CONTENT_DIR,
  PDF_CSS,
  PDF_COMPONENTS_DIR,
  CONFIG_DIR,
  CONFIG,
  PDF_LIBS_DIR,
  PDF_CONTENT_EXCLUDE_DIR,
  PDF_CONTENT_INCLUDE_DIR,
  PDF_CONTENT_ONLY_DIR,
  PDF_CONTENT_VERSIONS_DIR,
  PDF_FILES_DIR,
  PDF_STATIC_DIR,
  WORD_STATIC_DIR,
  namespace,
  versions,
};
