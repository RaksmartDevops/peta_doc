const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const { isEmpty, uniq } = require('lodash');
const shell = require('shelljs');
const { mergeDeep } = require('./utils');

function getKeyValue(obj, keyString) {
  const keys = keyString.split('.');
  return keys.reduce((previousValue, currentValue) => previousValue && previousValue[currentValue], obj);
}

function generateObject(keyString, value) {
  const keys = keyString.split('.');
  keys.reverse();
  const lastObj = keys.reduce((previousValue, currentValue) => {
    const obj = {};
    obj[currentValue] = previousValue;
    return obj;
  }, value);
  return lastObj;
}

const dealExternalFiles = function (namespace) {
  const configPath = path.join(process.cwd(), `config/@${namespace}/`);
  const customConfig = fs.existsSync(path.join(configPath, 'custom.yaml'))
    ? fs.readFileSync(path.join(configPath, 'custom.yaml'), 'utf8')
    : undefined;
  const CONFIG = mergeDeep(
    YAML.parse(fs.readFileSync(path.join(configPath, `config.yaml`), 'utf8')) || {},
    customConfig ? YAML.parse(customConfig) || {} : {},
  );

  if (CONFIG.externalStyles && CONFIG.externalStyles.trim().split(',').length && !isEmpty(CONFIG.externalStylesMap)) {
    let themeData = {};
    CONFIG.externalStyles
      .trim()
      .split(',')
      .forEach((file) => {
        const filePath = path.join(configPath, file.trim());
        if (fs.existsSync(filePath)) {
          const themeContent = fs.readFileSync(filePath, 'utf8');
          if (filePath.endsWith('.json')) {
            themeData = mergeDeep(themeData, JSON.parse(themeContent));
          }
          if (filePath.endsWith('.yaml')) {
            themeData = mergeDeep(themeData, YAML.parse(themeContent) || {});
          }
        }
      });
    const originVariablesPath = path.join(configPath, `_variables.scss`);
    const originVariablesContent = fs.readFileSync(originVariablesPath, 'utf8');
    let newVariablesContent = '';
    Object.entries(CONFIG.externalStylesMap).forEach(([key, value]) => {
      newVariablesContent += themeData[value] && themeData[value].trim() ? `${key}: ${themeData[value].trim()};\n` : '';
    });
    const variablesContent = newVariablesContent
      ? `/* external scss start */\n${newVariablesContent}/* external scss end */\n${originVariablesContent.replace(
          /\/\* external scss start \*\/[\s\S]*?\/\* external scss end \*\/\n/gim,
          '',
        )}`
      : originVariablesContent;
    if (variablesContent !== originVariablesContent) {
      fs.writeFileSync(originVariablesPath, variablesContent);
    }
  }

  if (
    CONFIG.externalConfigs &&
    CONFIG.externalConfigs.trim().split(',').length &&
    !isEmpty(CONFIG.externalConfigsMap)
  ) {
    let externalData = {};
    CONFIG.externalConfigs
      .trim()
      .split(',')
      .forEach((file) => {
        const filePath = path.join(configPath, file.trim());
        if (fs.existsSync(filePath)) {
          const externalFileContent = fs.readFileSync(filePath, 'utf8');
          if (filePath.endsWith('.json')) {
            externalData = mergeDeep(externalData, JSON.parse(externalFileContent));
          }
          if (filePath.endsWith('.yaml')) {
            externalData = mergeDeep(externalData, YAML.parse(externalFileContent) || {});
          }
        }
      });
    let externalContent = {};
    const rootExternalConfigsKeys = [];
    Object.entries(CONFIG.externalConfigsMap).forEach(([key, value]) => {
      const paramsValue = getKeyValue(externalData, value);
      rootExternalConfigsKeys.push(key.split('.')[0]);
      const paramObject = generateObject(key.trim(), paramsValue);
      externalContent = mergeDeep(externalContent, paramObject);
    });
    if (uniq(rootExternalConfigsKeys).length) {
      const originConfig = {};
      uniq(rootExternalConfigsKeys).forEach((v) => {
        if (CONFIG[v]) {
          originConfig[v] = CONFIG[v];
        }
      });
      externalContent = mergeDeep(originConfig, externalContent);
    }
    const originExternalContentPath = path.join(configPath, `external.yaml`);
    const originExternalContent =
      fs.existsSync(originExternalContentPath) && fs.readFileSync(originExternalContentPath, 'utf8');
    const newExternalContent = YAML.stringify(externalContent);
    if (!isEmpty(externalContent) && newExternalContent !== originExternalContent) {
      fs.writeFileSync(originExternalContentPath, newExternalContent);
    } else if (!isEmpty(externalContent) && newExternalContent === originExternalContent) {
      // pass
    } else {
      shell.rm(originExternalContentPath);
    }
  }
};

module.exports = dealExternalFiles;
