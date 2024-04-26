const lunr = require('lunr');
const lodash = require('lodash');
const shell = require('shelljs');
const logger = require('../logger');
const utils = require('../utils');
const crypto = require('crypto');
require('../../static/js/search/lunr.stemmer.support.min.js')(lunr);
// require('../../static/js/search/lunr.zh.js')(lunr);
const fs = require('fs');
const path = require('path');

function search(namespace, isEmbed) {
  logger.info(`clean last search index`);

  const staticSearchDir = path.join(process.cwd(), 'static/js/search');
  const destination = isEmbed ? `${namespace.toLowerCase()}_embed` : namespace.toLowerCase();
  const publicSearchDir = path.join(process.cwd(), `public/${destination}/js/search`);
  const publicJsDir = path.join(process.cwd(), `public/${destination}/js`);
  // remove lunr.json
  [staticSearchDir, publicSearchDir].forEach((dir) => {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return;
    }

    fs.readdirSync(dir).forEach((file) => {
      const currentPath = path.join(dir, file);
      if (fs.statSync(currentPath).isDirectory()) {
        const lunrPath = path.join(currentPath, 'lunr.json');
        if (fs.existsSync(lunrPath)) {
          shell.exec(`rm -fr ${currentPath}`);
        }
      } else if (file === 'lunr.json') {
        shell.exec(`rm ${currentPath}`);
      }
    });
  });

  logger.info(`generating ${namespace} search Index...`);
  const contentDir = path.join(process.cwd(), `content/@${namespace}`);
  const dirList = fs
    .readdirSync(contentDir)
    .filter((file) => fs.statSync(path.join(contentDir, file)).isDirectory() && !file.startsWith('_'));
  const dirListMap = {};
  dirList.forEach((key) => {
    dirListMap[key] = {
      keyMap: {},
      queryMap: {},
    };
  });

  const dataDir = path.join(process.cwd(), `public/${destination}/index.json`);
  if (!fs.existsSync(dataDir)) {
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataDir, 'utf8'));
  if (data?.length) {
    const searchIndex = lunr(function () {
      // this.use(lunr.zh);
      this.ref('href');
      this.field('title', { boost: 3 });
      this.field('content');
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        if (item.content) {
          this.add(item);
        }

        const key = Object.keys(dirListMap).find((dir) => item.href.startsWith(`/${dir}`));
        if (key) {
          if (lodash.isArray(item.isSection)) {
            dirListMap[key].keyMap[item.href] = {
              type: '产品',
            };
            utils.getStudySections(item.isSection).forEach((v) => {
              const studySectionItemTitle = v.title;
              const studySectionItemURL = v.url.endsWith('/') ? v.url.replace(/\/+$/i, '.adoc') : `${v.url}.adoc`;
              const studySectionItemPath = path.join(process.cwd(), `content/@${namespace}${studySectionItemURL}`);
              const studySectionItemMeta = utils.getMeta(studySectionItemPath);
              if (
                studySectionItemMeta?.title &&
                studySectionItemTitle &&
                studySectionItemMeta.title.trim().toUpperCase() !== studySectionItemTitle.trim().toUpperCase() &&
                studySectionItemMeta.title.trim().toUpperCase().replace(/ /gi, '') !==
                  studySectionItemTitle.trim().toUpperCase().replace(/ /gi, '')
              ) {
                const studySectionItemHref = studySectionItemPath
                  .replace(path.join(process.cwd(), `content/@${namespace}`), '')
                  .replace(/\.adoc$/, '/');
                dirListMap[key].keyMap[studySectionItemHref] = {
                  ...(dirListMap[key].keyMap[studySectionItemHref] || {}),
                  studyTitle: studySectionItemTitle,
                };
              }
            });
          }
          dirListMap[key].keyMap[item.href] = {
            ...(dirListMap[key].keyMap[item.href] || {}),
            ...item,
            content: item.content.replace(/\n/gim, ''),
          };
        }
      }
    });

    Object.entries(searchIndex.invertedIndex).forEach(([key, { title = {}, content = {} }]) => {
      const result = lodash.uniq([...Object.keys(title), ...Object.keys(content)]);
      if (key.trim() && result.length) {
        Object.keys(dirListMap).forEach((dir) => {
          const value = result.filter((v) => v.startsWith(`/${dir}`)).filter(Boolean);
          if (value.length) {
            dirListMap[dir].queryMap[key.trim().toUpperCase()] = value;
          }
        });
      }
    });
  }

  const hashArray = [];
  Object.entries(dirListMap).forEach(([key, value]) => {
    const staticDir = path.join(staticSearchDir, key);
    const publicDir = path.join(publicSearchDir, key);
    const searchData = JSON.stringify(value);
    shell.exec(`mkdir -p ${staticDir}`);
    fs.writeFileSync(`${staticDir}/lunr.json`, searchData);
    shell.exec(`mkdir -p ${publicDir}`);
    fs.writeFileSync(`${publicDir}/lunr.json`, searchData);
    logger.info(`search/${key}/lunr.json is written!`);
    const hash = crypto.createHash('md5').update(searchData).digest('hex');
    hashArray.push(hash);
  });

  const hash = crypto.createHash('md5').update(hashArray.join('-')).digest('hex');
  if (fs.existsSync(publicJsDir) && fs.statSync(publicJsDir).isDirectory()) {
    fs.readdirSync(publicJsDir).forEach((file) => {
      if (/^search\.[a-zA-Z\d]+\.js$/i.test(file)) {
        const searchFilePath = path.join(publicJsDir, file);
        const content = fs.readFileSync(searchFilePath, 'utf8');
        const resultContent = content.replace(/["']\/lunr\.json(\?[a-zA-Z\d]+)?["']/, `"\/lunr.json?${hash}"`);
        fs.writeFileSync(searchFilePath, resultContent);
      }
    });
  }
}

module.exports = search;
