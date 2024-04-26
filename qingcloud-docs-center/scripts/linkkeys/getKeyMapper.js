const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const checkNamespace = require('../checkNamespace');
const { getConfig, getCommandParams, sortKeysInObject } = require('../utils');
const logger = require('../logger');
const keys = require('../data/keys');

const namespace = checkNamespace();
const { params, linkkeyUnchecked = [] } = getConfig(namespace);
const originKeys = Object.keys(keys);
const name = params.logoLink;

const _namespace = process.argv.filter((v) => v !== '--' && !/^--.+$/.test(v))[2];
const dataDir = path.join(process.cwd(), `public/${_namespace.toLowerCase()}/index.json`);

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

if (!prefix) {
  logger.error(`Please run "npm run linkkey:result ${namespace} /<version>/"!`);
  process.exit(1);
}

logger.info(`Checking @${namespace}${prefix} ...`);
const _params = getCommandParams(process.argv.slice(3));
// 参数 --build=false
if (_params.build !== 'false') {
  shell.exec(`npm run build ${namespace}`);
}

if (!fs.existsSync(dataDir)) {
  logger.error('Data is not exist!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataDir, 'utf8'));
const notInDataKeys = [];

if (!data || !data.length) {
  return;
}

const idReg = /\[\[(.*?)\]\]/g;
const result = {};
data.forEach((v) => {
  if (v.linkkey) {
    const uri = v.href || v.firstChild?.href;
    if (!uri) {
      logger.error(`${v.linkkey} not has uri`);
    }
    if (uri.startsWith(prefix)) {
      v.linkkey.split(',').forEach((item) => {
        const linkkey = item.replace(idReg, '');
        const ids = item.match(idReg);
        var id = ids && ids.length ? `#${ids[0].replace(idReg, '$1')}` : '';
        var url = `${uri}${id}`;
        if (result[linkkey]) {
          logger.error(`"${linkkey}" - ${url} is Duplicate!`);
        }
        if (originKeys.includes(linkkey)) {
          result[linkkey] = url;
        } else {
          logger.warn(`"${linkkey}" - ${url} not in the origin file!`);
          result[linkkey] = url;
          notInDataKeys.push(linkkey);
        }
      });
    }
  }
});

const resultKeys = Object.keys(result);
if (resultKeys.length) {
  const used = [];
  let unused = {};
  const unchecked = [];
  originKeys.forEach((key) => {
    if (resultKeys.includes(key)) {
      used.push(key);
    } else if (linkkeyUnchecked.includes(key)) {
      unchecked.push(key);
    } else if (/^https?:\/\//i.test(keys[key])) {
      used.push(key);
      result[key] = keys[key];
    } else {
      unused = {
        ...unused,
        [key]: keys[key],
      };
    }
  });
  const resultUsedUnused = {
    [`@${namespace}`]: {
      [prefix.replace(/^\/+/, '').replace(/\/+$/, '')]: {
        used: used.sort(),
        unused: sortKeysInObject(unused),
        unchecked: unchecked.sort(),
        notInData: notInDataKeys.sort(),
        deprecated: {
          used: linkkeyUnchecked.filter((v) => used.includes(v)).sort(),
          unused: linkkeyUnchecked.filter((v) => !originKeys.includes(v)).sort(),
        },
      },
    },
  };
  fs.writeFileSync(path.join(__dirname, 'keyUriMapper.json'), JSON.stringify(sortKeysInObject(result), null, 2));
  fs.writeFileSync(path.join(__dirname, 'resultUsedUnused.json'), JSON.stringify(resultUsedUnused, null, 2));
  logger.success('keyUriMapper.json resultUsedUnused.json success!');
} else {
  shell.rm(path.join(__dirname, 'keyUriMapper.json'));
  shell.rm(path.join(__dirname, 'resultUsedUnused.json'));
}
