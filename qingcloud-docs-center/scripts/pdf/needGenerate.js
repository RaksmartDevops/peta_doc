const fs = require('fs');
const { isEqual, omit, transform, isObject, isEmpty } = require('lodash');
const { md5 } = require('../utils');
const { PDF_FILES_DIR, PDF_CONTENT_DIR, PDF_COMPONENTS_DIR, STATIC_DIR } = require('./constants');

function isDeepEqual(object = {}, base = {}) {
  function changes(object, base) {
    return transform(object, function (result, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return isEmpty(changes(object, base));
}

function getHashJSON({ hashJSON, includes }) {
  if (!includes) {
    return null;
  }
  const json = {};
  for (let i = 0; i < includes.length; i++) {
    const v = includes[i];
    json[v] = hashJSON[v];
    if (!hashJSON[v]) {
      return null;
    }
  }
  return json;
}

function checkIncludes({ targetPath, currentHashJSON, lastHashJSON }) {
  const target = targetPath.replace(/\.(pdf|docx)$/, '.json');
  if (!currentHashJSON || !lastHashJSON) {
    return false;
  }
  if (
    !fs.existsSync(
      targetPath.replace(PDF_CONTENT_DIR, `${PDF_FILES_DIR}/${targetPath.replace(/.*?\.([a-zA-Z\d]+$)/i, '$1')}`),
    )
  ) {
    return false;
  }

  if (!isDeepEqual(currentHashJSON[target], lastHashJSON[target])) {
    return false;
  }
  const currentHash = getHashJSON({ hashJSON: currentHashJSON, includes: currentHashJSON[target]?.includes });
  const lastHash = getHashJSON({ hashJSON: lastHashJSON, includes: lastHashJSON[target]?.includes });
  if (currentHash && lastHash && isDeepEqual(currentHash, lastHash)) {
    return true;
  }
  return false;
}

function needGenerate({ adocPath, targetPath, adocConfig }) {
  const currentHash = fs.existsSync(`${PDF_CONTENT_DIR}/@@hash@@.json`)
    ? fs.readFileSync(`${PDF_CONTENT_DIR}/@@hash@@.json`)
    : null;

  if (!currentHash) {
    return true;
  }

  const includes = [];
  function includesFiles(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const includesResult = data.match(/include::(.*)?\[/gi);
    const values = includesResult ? includesResult.map((v) => v.replace('include::', '').replace(/\[$/, '')) : [];
    if (values.filter((v) => !includes.includes(v)).length) {
      includes.push(...values.filter((v) => !includes.includes(v)));
      includesResult.forEach(() => includesFiles(filePath));
    }
  }

  includesFiles(adocPath);
  const customHash = {};
  includes
    .filter((v) => v.startsWith(PDF_COMPONENTS_DIR))
    .forEach((v) => {
      customHash[v] = { hash: md5(v), images: {}, includes: [] };
    });

  const styles = adocConfig.stylesheet
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  styles.forEach((v) => {
    customHash[v] = { hash: md5(v), images: {}, includes: [] };
  });

  const images = {};
  Object.values(adocConfig)
    .filter((v) => v.startsWith(`${STATIC_DIR}/images/`))
    .forEach((v) => {
      if (!fs.existsSync(v)) {
        logger.error(`IMAGE_ERROR: ${v}`);
        return;
      }

      images[v] = fs.statSync(v).mtime.toLocaleString();
    });
  customHash.images = images;

  const omitGeneratedConfig = adocConfig.pdf_generatedConfig ? adocConfig.pdf_generatedConfig.split('|') : [];
  customHash.config = omit(adocConfig, ['pdf_timeout', 'pdf_generatedConfig', ...omitGeneratedConfig]);

  const lastHash = fs.existsSync(`${PDF_FILES_DIR}/@@hash@@.json`)
    ? fs.readFileSync(`${PDF_FILES_DIR}/@@hash@@.json`)
    : null;
  const lastHashJSON = lastHash ? JSON.parse(lastHash) : null;

  const currentHashJSON = JSON.parse(currentHash);
  currentHashJSON.customHash = customHash;

  const target = targetPath.replace(/\.(pdf|docx)$/, '.json');
  const targetIncludes = includes.filter((v) => !v.startsWith(PDF_COMPONENTS_DIR));
  currentHashJSON[target] = {
    customHash,
    includes: targetIncludes,
  };

  fs.writeFileSync(`${PDF_CONTENT_DIR}/@@hash@@.json`, JSON.stringify(currentHashJSON, null, 2));

  const check = checkIncludes({ targetPath, currentHashJSON, lastHashJSON });
  if (check) {
    return false;
  }

  return true;
}

module.exports = needGenerate;
