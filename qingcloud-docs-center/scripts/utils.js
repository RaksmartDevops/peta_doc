const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const YAML = require('yaml');
const fm = require('front-matter');
const shell = require('shelljs');
const { isArray, uniq, compact, flatten, isEmpty } = require('lodash');

function getMeta(directory) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isFile()) {
    return null;
  }

  const fileContent = fs.readFileSync(directory, 'utf8').replace(/\r/gi, '\n');
  const content = fm(fileContent);
  try {
    const result = content.attributes;
    if (result && result.pdf_releaseDate) {
      result.pdf_releaseDate = getFullYearMonthDate(result.pdf_releaseDate);
    }
    if (result && (result.draft === true || result.draft === 'true')) {
      result.draft = true;
    } else {
      result.draft = false;
    }
    if (result && (result.not_show === true || result.not_show === 'true')) {
      result.not_show = true;
    } else {
      result.not_show = false;
    }
    return result;
  } catch (error) {
    console.error(error.message);
    console.error(`YAML parse error directory: ${directory}`);
  }
}

function getContentBody(directory) {
  if (fs.existsSync(directory) && fs.statSync(directory).isFile()) {
    const fileContent = fs.readFileSync(directory, 'utf8').replace(/\r/gi, '\n');
    const content = fm(fileContent);
    const result = content.body;
    if (result) {
      return result;
    }
  }
  return '';
}

function getPdfMeta(filePath) {
  const meta = getMeta(filePath) || {};
  const result = {};
  Object.keys(meta).forEach((key) => {
    if (key.startsWith('pdf_')) {
      result[key] = meta[key];
    }
  });
  if (isEmpty(result)) {
    return null;
  }
  return result;
}

function getStudySections(section) {
  const list = [];
  function loopSection(directory) {
    if (isArray(directory)) {
      directory.forEach((v) => loopSection(v));
    } else if (directory.title && directory.url) {
      list.push({ title: directory.title.trim(), url: directory.url.trim() });
    } else if (isArray(directory.children)) {
      loopSection(directory.children);
    }
  }
  loopSection(section);
  return list;
}

function getImageDirectories(namespace) {
  const imageTopLevelFolders = new Set();
  function getFileImageDirs(filePath) {
    const meta = getMeta(filePath);
    if (!meta || meta.draft) {
      return;
    }

    const data = fs.readFileSync(filePath, 'utf8').replace(/\r/gi, '\n');
    const matches = data.match(/images\/(.*?\/)+.*?\.(png|jpg|gif|jpeg|webp)/gim);
    if (matches && matches.length) {
      return matches.map((v) => v.replace(/images\/(.*?)\/.*/i, '$1').toLowerCase());
    }
  }

  function parseContent(rootDir) {
    fs.readdirSync(rootDir).forEach(function (fileName) {
      const fileDir = path.join(rootDir, fileName);
      const fileStat = fs.statSync(fileDir);
      if (fileStat.isDirectory()) {
        parseContent(fileDir);
      }
      if (fileStat.isFile() && /\.adoc$/i.test(fileDir)) {
        const folderNames = getFileImageDirs(fileDir);
        if (folderNames) {
          folderNames.forEach((folder) => imageTopLevelFolders.add(folder));
        }
      }
    });
  }

  parseContent(path.join(process.cwd(), `content/@${namespace}`));

  return Array.from(imageTopLevelFolders);
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function getConfig(namespace) {
  const CONFIG_DIR = path.join(process.cwd(), `config/@${namespace}`);
  const defaultConfig = fs.readFileSync(path.join(CONFIG_DIR, '../default.yaml'), 'utf8');
  const projectConfig = fs.readFileSync(path.join(CONFIG_DIR, 'config.yaml'), 'utf8');
  const externalConfig = fs.existsSync(path.join(CONFIG_DIR, 'external.yaml'))
    ? fs.readFileSync(path.join(CONFIG_DIR, 'external.yaml'), 'utf8')
    : null;
  const customConfig = fs.existsSync(path.join(CONFIG_DIR, 'custom.yaml'))
    ? fs.readFileSync(path.join(CONFIG_DIR, 'custom.yaml'), 'utf8')
    : null;
  const CONFIG = mergeDeep(
    YAML.parse(defaultConfig),
    YAML.parse(projectConfig),
    customConfig ? YAML.parse(customConfig) || {} : {},
    externalConfig ? YAML.parse(externalConfig) || {} : {},
  );
  return CONFIG;
}

function getCommandParams(params = process.argv) {
  const result = {};
  if (params.length) {
    const resultArray = params.filter((v) => /^--.+/.test(v));
    if (resultArray.length) {
      resultArray.forEach((v) => {
        const arr = v.split('=');
        const key = arr[0].replace('--', '');
        const value = arr.slice(1).join('');
        result[key] = value === '' ? true : value;
      });
      return result;
    }
  }
  return result;
}

function getCurrentVersion(namespace) {
  const config = getConfig(namespace);
  const name = config.params.logoLink;
  const names = fs
    .readdirSync(path.join(process.cwd(), `content/@${namespace}`))
    .filter((v) => !v.startsWith('.') && !v.startsWith('_'))
    .map((v) => `\/${v}\/`);
  let prefix = '';
  if (names.length === 1) {
    prefix = names[0];
  } else if (names.includes(name)) {
    prefix = name;
  }
  return prefix.replace(/^\/+/, '').replace(/\/+$/, '');
}

function getContentDirectories(namespace) {
  const result = [];
  const contentRoot = path.join(process.cwd(), `content/@${namespace}`);
  fs.readdirSync(contentRoot).forEach((v) => {
    if (!v.startsWith('.') && !v.startsWith('_') && fs.lstatSync(path.join(contentRoot, v)).isDirectory()) {
      result.push(v);
    }
  });
  return result;
}

function getAllProjects() {
  return fs
    .readdirSync(path.join(process.cwd(), 'config'))
    .filter((v) => v.startsWith('@'))
    .map((v) => v.replace('@', '').trim());
}

function getStagedProjects() {
  const allProjects = getAllProjects();
  const { stdout } = shell.exec('git diff --name-only --cached', { silent: true });
  if (stdout) {
    return compact(
      uniq(
        flatten(
          stdout.split('\n').map((v) => {
            if (v && v.startsWith('content/@')) {
              return v.replace(/^content\/@([^\/]+).*/i, '$1');
            }
            if (v && v.startsWith('static/images/')) {
              const project = v.replace(/^static\/images\/([^\/]+).*/i, '$1');
              if (project === 'cloud_service') {
                return ['enterprise', 'pubCloud', 'xcloud'].filter((p) => allProjects.includes(p));
              }
              return allProjects.find((v) => project.startsWith(v));
            }
            return null;
          }),
        ),
      ),
    );
  }
  return [];
}

function sortKeysInObject(obj = {}) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function getFullYearMonthDate(date = new Date()) {
  const _date = typeof date === 'string' ? new Date(date) : date;

  return `${_date.getFullYear()}-${_date.getMonth() + 1 > 9 ? _date.getMonth() + 1 : `0${_date.getMonth() + 1}`}-${
    _date.getDate() > 9 ? _date.getDate() : `0${_date.getDate()}`
  }`;
}

module.exports = {
  getMeta,
  getContentBody,
  getPdfMeta,
  getStudySections,
  getImageDirectories,
  getConfig,
  getCommandParams,
  getCurrentVersion,
  getContentDirectories,
  getStagedProjects,
  getAllProjects,
  sortKeysInObject,
  md5,
  getFullYearMonthDate,
  mergeDeep,
};
