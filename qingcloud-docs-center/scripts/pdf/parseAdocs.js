const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const { PROJECT_DIR, PDF_CONTENT_DIR, PDF_DIR, STATIC_DIR, namespace } = require('./constants');
const { compact, isArray, flatten, uniq, some, every } = require('lodash');
const { getMeta, getContentBody, md5 } = require('../utils');
const { getFileConfig } = require('./utils');

const logger = require('../logger');

const linkMapper = {};
const draftFiles = [];
const fileHashMapper = {};

function getRealPathWithCaseSync(filePath) {
  const relativePath = filePath.replace(PROJECT_DIR, '');
  const realPathWithCaseSync = relativePath.split('/').reduce((previousValue, currentValue) => {
    const newFilePath = path.join(previousValue, currentValue);
    if (fs.existsSync(newFilePath)) {
      return newFilePath;
    }
    if (fs.existsSync(previousValue) && fs.statSync(previousValue).isDirectory()) {
      const realItem = fs
        .readdirSync(previousValue)
        .find((fileName) => fileName.toLowerCase() === currentValue.toLowerCase());
      if (realItem) {
        return path.join(previousValue, realItem);
      }
    }
    return newFilePath;
  }, PROJECT_DIR);
  return realPathWithCaseSync;
}

function getRealFilePath(filePath) {
  const realFilePath = `${filePath.replace(/\/+$/, '')}.adoc`.replace(new RegExp('^' + PROJECT_DIR, 'i'), PROJECT_DIR);
  if (fs.existsSync(realFilePath) && fs.statSync(realFilePath).isFile()) {
    return realFilePath;
  }
  const realFilePathWithCaseSync = getRealPathWithCaseSync(realFilePath);
  if (fs.existsSync(realFilePathWithCaseSync)) {
    return realFilePathWithCaseSync;
  }
  const realSectionFilePath = path
    .join(filePath, '_index.adoc')
    .replace(new RegExp('^' + PROJECT_DIR, 'i'), PROJECT_DIR);
  if (fs.existsSync(realSectionFilePath) && fs.statSync(realSectionFilePath).isFile()) {
    return realSectionFilePath;
  }
  const realSectionFilePathWithCaseSync = getRealPathWithCaseSync(realSectionFilePath);
  if (fs.existsSync(realSectionFilePathWithCaseSync)) {
    return realSectionFilePathWithCaseSync;
  }
  // logger.error(`${realFilePath.replace(PDF_DIR, PROJECT_DIR)} ${realSectionFilePath.replace(PDF_DIR, PROJECT_DIR)} are not found both!`);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

function titleToID(title = '') {
  return title.replace(/ *link:\[id.*$/, '').replace(/[^0-9a-zA-Z\u4e00-\u9fa5]/gi, '');
}

function checkMeta(meta, filePath) {
  // check bannerImage
  if (meta.bannerImage) {
    const imageDir = path.join(STATIC_DIR, meta.bannerImage.replace(/[\?\#].+$/, ''));
    if (!fs.existsSync(imageDir)) {
      logger.error(
        `META_IMAGE_ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} [bannerImage: ${meta.bannerImage}] not exists!`,
      );
    }
  }
  // check study_section
  if (isArray(meta.study_section) && meta.study_section.length) {
    meta.study_section.forEach((section) => {
      if (isArray(section.children) && section.children.length) {
        section.children.forEach((item) => {
          if (isArray(item.children) && item.children.length) {
            item.children.forEach((child) => {
              if (child.url) {
                const urlFile = child.url.startsWith('/')
                  ? path.join(PDF_CONTENT_DIR, child.url)
                  : path.join(filePath.replace('_index.adoc', ''), child.url);
                if (!getRealFilePath(urlFile.split('#')[0])) {
                  logger.error(
                    `META_STUDY_SECTION_ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} [study_section: ${
                      child.url
                    }] not exists!`,
                  );
                }
              }
            });
          }
        });
      }
    });
  }

  // check product
  if (isArray(meta.product) && meta.product.length) {
    meta.product.forEach((item) => {
      const url = item.url?.trim();
      if (url && !url.startsWith('https://') && !url.startsWith('http://')) {
        const urlFile = url.startsWith('/')
          ? path.join(PDF_CONTENT_DIR, url)
          : path.join(filePath.replace('_index.adoc', ''), url);
        if (!getRealFilePath(urlFile.split('#')[0])) {
          logger.error(`META_PRODUCT_ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} [product: ${url}] not exists!`);
        }
      }
    });
  }
}

function checkImages(data, filePath) {
  const result = data.match(/(\/\/ *)*image:{1,2}([^\[]*)?\.(jpg|png|svg|webp|jpeg)/gi);
  const images = {};
  if (result && result.length) {
    result.forEach((v) => {
      if (!v.startsWith('//')) {
        const imagePath = v.replace(/^image:{1,2} *['"]? */i, '');
        if (!/^https?:\/\//i.test(imagePath)) {
          const realImagePath = path.join(STATIC_DIR, imagePath);
          if (!fs.existsSync(realImagePath)) {
            logger.error(`IMAGE_ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} ${v}`);
          } else {
            images[realImagePath] = fs.statSync(realImagePath).mtime.toLocaleString();
          }
        }
      }
    });
  }
  if (fileHashMapper) {
    fileHashMapper[filePath].images = images;
  }
}

function replaceIncludeComponent(fileDir, content) {
  let result = content;
  const reg = /include::([^\[]+)\[([^\]]*)\]/gim;
  if (!reg.test(content)) {
    return result;
  }

  result = content
    .replace(/\n\/\/ *include::([^\[]+)\[([^\]]*)\]/gim, '') // 如果引入文件内 include 行被注释掉，则删除这行信息，不进行操作
    .replace(reg, (match, p1, p2) => {
      let includePath = p1;
      if (!p1.startsWith('/')) {
        includePath = path.join(fileDir, '..', p1);
      }

      if (!fs.existsSync(includePath)) {
        return;
      }

      const includeContent = fs.readFileSync(includePath, 'utf8');
      const tags = p2.split(',').filter((v) => v.trim().startsWith('tag='));
      const tag = tags?.length && tags[0].replace(/^ *tag=/, '');
      if (!tag) {
        return replaceIncludeComponent(includePath, includeContent);
      }

      const tagName = tag.startsWith('!') ? tag.replace('!', '') : tag;
      const tagReg = new RegExp(`\\/\\/ *tag::${tagName}\\[\\]\n([\\s\\S]+?)\\/\\/ *end::${tagName}\\[\\]`, 'igm');
      const matchTag = includeContent.match(tagReg);
      let matchContent = tag.startsWith('!') ? includeContent : '';
      if (!matchTag.length) {
        return;
      }

      matchTag.forEach((v) => {
        if (tag.startsWith('!')) {
          matchContent = matchContent.replace(v, '');
        } else {
          matchContent += v.replace(tagReg, '$1');
        }
      });
      return replaceIncludeComponent(includePath, matchContent);
    });

  return result;
}

function parseAdocsData({ rootDir, checkType, fileType }) {
  fs.readdirSync(rootDir).forEach(function (fileName) {
    const fileDir = path.join(rootDir, fileName);
    const fileStat = fs.statSync(fileDir);
    if (fileStat.isDirectory()) {
      const childrenIndex = path.join(fileDir, '_index.adoc');
      const meta = getMeta(childrenIndex);
      if (meta && meta.draft) {
        // not check
      } else {
        parseAdocsData({ rootDir: fileDir, checkType, fileType });
      }
    }

    if (!fileStat.isFile() || !/\.adoc$/i.test(fileDir)) {
      return;
    }

    if (checkType === 'link') {
      parseAdocLink(fileDir);
      return;
    }

    const meta = getMeta(fileDir);
    if (meta?.draft !== true) {
      let content = replaceIncludeComponent(fileDir, fs.readFileSync(fileDir, 'utf8'));
      const config = getFileConfig({
        meta: {},
        data: content,
        filePath: fileDir,
      });
      // include 只引入 ifdef endif 之间定义好的内容
      content = content
        .replace(/\nifeval::\[([^\[]+)\]\n([\s\S]+?)endif::\[\]/g, (match, p1, p2) => {
          if (p1.search(`{file_output_type}`) !== -1) {
            const string = p1.replace(/"|'/g, '').replace(/ /g, '').replace('{file_output_type}', '').toLowerCase();
            const isHTML = ['==html'].includes(string);
            const isPDF = ['==pdf', '!=docx', '!=html'].includes(string);
            const isWord = ['==docx', '!=pdf', '!=html'].includes(string);
            if (isHTML) {
              return '\n';
            }
            if ((fileType === 'pdf' && isPDF) || (fileType === 'docx' && isWord)) {
              return `\n${p2}\n`;
            }
            return '\n';
          }
          return match;
        })
        .replace(/(\nifdef\:\:[^\[]+)\[([^\[]+)\]/g, (match, p1, p2) => {
          return `${p1}[]\n${p2}\nendif::[]\n`;
        })
        .replace(/\nifdef\:\:([^\[]+)\[[\s\S]+?\nendif::.*/g, (match, p1) => {
          const configKeys = Object.keys(config);
          if (p1) {
            const keys = p1.trim();
            if (keys.split(',').length > 1) {
              if (some(keys.split(','), (v) => configKeys.includes(v))) {
                return match;
              }
            }
            if (keys.split('+').length > 1) {
              if (every(keys.split('+'), (v) => configKeys.includes(v))) {
                return match;
              }
            }
            if (configKeys.includes(p1.trim())) {
              return match;
            }
          }
          return '\n';
        });
      // 替换 xref 链接
      content = content.replace(
        /(\n:relfileprefix: *\.\.\/.*\n)([\s\S]+?)(\n:relfileprefix: *\.\/\n)/g,
        (match, p1, p2, p3) => {
          const relfileprefix = p1
            .replace(/^\n:relfileprefix: */, '')
            .replace(/('|")/g, '')
            .trim();
          const relfilesuffix = config.relfilesuffix || '/';
          const data = p2.replace(/xref: *([^\[]+\.adoc)\[/g, (_match, _p1) => {
            const linkData = _p1.split('#')[0];
            const linkHash = _p1.split('#')[1] ? `#${_p1.split('#')[1]}` : '';
            return `link:${relfileprefix}${linkData
              .replace(/\.adoc$/, '/')
              .replace(/\/_index\/$/, '/')}${linkHash}${relfilesuffix}[`;
          });
          return `${p1}${data}${p3}`;
        },
      );
      // 去除所有注释
      content = content.replace(/\n\/{4}\n[\s\S]+\n\/{4}\n?/g, '\n').replace(/\n\/\/.*/g, (match) => {
        if (match.search(/\n\/\/ *tag::/) !== -1) {
          return match;
        }
        if (match.search(/\n\/\/ *end::/) !== -1) {
          return match;
        }
        return '';
      });
      // 处理无序列表 * {empty}\n\n:relfileprefix: ../ 问题，交换上下文
      content = content.replace(/(\n\*) *\{empty\}\n+(:relfileprefix: *\.\.\/.*\n+)/gi, '\n$2$1 ');
      fs.writeFileSync(fileDir, content);
    }

    parseAdoc(fileDir);
  });
}

function parseAdoc(filePath) {
  const data = fs.readFileSync(filePath, 'utf8').replace(/\r/gi, '\n');
  const fileHeader = data.match(/---\n[\s\S]+?\n---\n?/);
  if (!fileHeader) {
    return;
  }

  const meta = getMeta(filePath) || {};

  const { title, draft } = meta;
  if (draft) {
    draftFiles.push(filePath.toLowerCase());
    return;
  }

  if (fileHashMapper) {
    fileHashMapper[filePath] = {
      hash: md5(data),
      images: {},
      includes: [],
    };
  }

  checkMeta(meta, filePath);
  checkImages(data.replace(fileHeader[0], ''), filePath);

  const titleUUID = `fil-${uuid.v4()}`;
  const gTitle = title ? `[#${titleUUID}]\n= ${title.trim()}\n\n` : '';
  if (title) {
    linkMapper[filePath.toLowerCase()] = [
      {
        title,
        hash: titleUUID,
      },
    ];
  }

  const config = getFileConfig({ meta: {}, data, filePath });
  const writeContent = `\n${getContentBody(filePath)}`
    .replace(/`(https?:\/\/)(\.|<)/gim, '`\\$1$2')
    .replace(/\|===\n+[\s\S]+?\|===/gim, (match) => match.replace(/`(，|、|,)`/gim, '`$1 `')) // 获取所有表格
    .replace(/(image:+)\/images\//gim, '$1images/')
    .replace(/(\+*\n+)image:(images\/.*?\[.*?\]\n)/gim, '$1\nimage::$2')
    .replace(/\nvideo\:\:([^\[]+)\[([^\[\]]*)\]/i, (match, p1, p2) => {
      const name = p2?.trim() ? p2.trim() : decodeURI(p1).replace(/^.*\/([^\/]+)\.[^\.]+$/, '$1');
      return `\nlink:${p1}[${name}]`;
    })
    .replace(/include::content\//gim, `include::${PROJECT_DIR}/pdf/content/`)
    .replace(/include::(.*?)\[.*?\]/gim, (match, p1) => {
      const inCludeRealPath = path.join(filePath, '..', p1);
      if (
        fileHashMapper &&
        !fileHashMapper[filePath].includes.includes(inCludeRealPath) &&
        fs.existsSync(inCludeRealPath)
      ) {
        fileHashMapper[filePath].includes.push(inCludeRealPath);
        return match.replace(p1, inCludeRealPath);
      }
      if (fileHashMapper && !fileHashMapper[filePath].includes.includes(p1) && fs.existsSync(p1)) {
        fileHashMapper[filePath].includes.push(p1);
      }
      return match;
    })
    .replace(/xref:([^\[]+)\.adoc\[/g, (match, p1) => {
      return `link:${p1}${config.relfilesuffix || '/'}[`;
    })
    .replace(/\n*=+ +(.+)link:\[id=([a-zA-Z\d]+)\]\n/g, (match, p1, p2) => {
      const item = {
        hash: p2,
        title: titleToID(p1),
      };
      if (isArray(linkMapper[filePath.toLowerCase()])) {
        linkMapper[filePath.toLowerCase()].push(item);
      } else {
        linkMapper[filePath.toLowerCase()] = [item];
      }
      return match;
    })
    .replace(/(\n\[.+\])?\n+(=+ +)([^=\n]+)/gim, (match, p1, p2, p3) => {
      const generatedID = `fil-${uuid.v4()}`;
      const p2Num = p2.match(/=/g).length;
      const p2Class = `.file-class-level-${p2Num}`;
      const p3Result = p3.replace(/^(\d+)\. /, '+$1+. ');
      const customHash = p1 ? compact(p1.split('\n').map((v) => titleToID(v.replace(/.*(#.*)[\.\,\]]/g, '$1')))) : '';
      const item = {
        hash: generatedID,
        title: titleToID(p3),
      };
      if (customHash && customHash.length && customHash[customHash.length - 1] !== item.title) {
        item.customHash = customHash[customHash.length - 1];
      }
      if (isArray(linkMapper[filePath.toLowerCase()])) {
        linkMapper[filePath.toLowerCase()].push(item);
      } else {
        linkMapper[filePath.toLowerCase()] = [item];
      }
      return `\n${p1 || ''}\n[#${generatedID}]\n[${p2Class}]\n${p3Result}\n`;
    })
    .replace(/(\[\[)([\s\S]+?)(\]\])/gm, (match, p1 = '', p2 = '', p3 = '') => {
      const generatedID = `fil-${uuid.v4()}`;
      const item = {
        hash: generatedID,
        customHash: titleToID(p2),
      };
      if (isArray(linkMapper[filePath.toLowerCase()])) {
        linkMapper[filePath.toLowerCase()].push(item);
      } else {
        linkMapper[filePath.toLowerCase()] = [item];
      }
      return `${p1}${generatedID}${p3}`;
    })
    .replace(/(<<)(.+?)(>>)/gm, (match, p1, p2, p3) => {
      const p2Array = compact(
        p2
          .trim()
          .split(',')
          .map((v) => v.trim()),
      );
      const p2Link = titleToID(p2Array[0]);
      const p2Content = p2Array.slice(1).join(',');
      if (p2Array.length && !['<<', '>>'].find((v) => p2.includes(v))) {
        const linkItem = linkMapper[filePath.toLowerCase()].find((v) => {
          if (p2Link === v.customHash || p2Link.toLowerCase() === (v.title || '').toLowerCase()) {
            return true;
          }
          return false;
        });
        const linkName = p2Content || p2Link || '';
        if (linkItem) {
          return `link:#${linkItem.title}${linkName ? `[${linkName}]` : '[]'}`;
        }
        // ERROR 内链错误提示
        logger.error(`ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} ${p1}${p2}${p3}`);
        if (linkMapper[filePath.toLowerCase()].length) {
          return `link:#${linkMapper[filePath.toLowerCase()][0].title}${linkName ? `[${linkName}]` : '[]'}`;
        }
      }
      return `${p1}${p2}${p3}`;
    })
    .replace(/^\n+/, '');

  fs.writeFileSync(filePath, `${gTitle}${writeContent}`);
}

function parseAdocLink(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  if (
    !data ||
    draftFiles.includes(filePath.toLowerCase()) ||
    filePath.includes(`/@${namespace}/_custom/`) ||
    filePath.includes(`/@${namespace}/_custom-en/`)
  ) {
    return;
  }

  const writeContent = data
    .replace(/\n\/\/(.*)?(link:).*/gi, '')
    .replace(/(link:)(.+?)(\[)/gim, (match, p1, p2, p3, offset, string) => {
      const p2Array = compact(
        p2
          .trim()
          .split('#')
          .map((v) => v.trim().replace(/^_+/, '')),
      );
      const p2Link = p2.trim().startsWith('#')
        ? filePath.replace(PDF_CONTENT_DIR, '').replace('/_index.adoc', '/').replace('.adoc', '/')
        : p2Array[0];
      let hash = p2Array.length > 1 ? titleToID(p2Array[1]) : '';
      if (p2.trim().startsWith('#')) {
        hash = titleToID(p2Array[0]) || '';
      }

      if (!p2.trim() || /^https?:\/\//i.test(p2.trim())) {
        return match;
      }

      let realFile = '';
      if (p2Link.startsWith('/')) {
        realFile = path.join(PDF_CONTENT_DIR, p2Link);
      } else if (filePath.endsWith('/_index.adoc')) {
        realFile = path.join(filePath.replace('/_index.adoc', ''), p2Link);
      } else {
        realFile = path.join(filePath.replace(/(\/[^\/]+)\.adoc$/i, '$1'), p2Link);
      }

      // 这么一大堆代码，目的是把文档中的链接都替换成一个 hash 值？
      const realFilePath = getRealFilePath(realFile);
      if (realFilePath) {
        if (draftFiles.includes(realFilePath.toLowerCase())) {
          logger.error(`DRAFT_LINK_ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} ${p1}${p2}`);
          return `${p1}#${linkMapper[filePath.toLowerCase()][0].hash}${p3}`;
        }
        const linkRealFilePathResult = linkMapper[realFilePath.toLowerCase()] || [];
        const linkItem = linkRealFilePathResult.find((v) => {
          if (hash === v.customHash || hash === v.title || hash === v.hash) {
            return true;
          }
          return false;
        });
        if (linkItem) {
          return `${p1}#${linkItem.hash}${p3}`;
        }
        if (linkRealFilePathResult.length) {
          return `${p1}#${linkRealFilePathResult[0].hash}${p3}`;
        }
      } else if (/\.[a-zA-Z\d]+$/i.test(p2Link) && !p2Link.endsWith('.adoc')) {
        return `${p1}#${linkMapper[filePath.toLowerCase()][0].hash}${p3}`;
      } else {
        if (!/\n\/\/link:.+?\[/im.test(data)) {
          // ERROR link 错误提示
          logger.error(`LINK_ERROR: ${filePath.replace(PDF_DIR, PROJECT_DIR)} ${p1}${p2}, ${realFile} is not exists!`);
        }
        if (linkMapper[filePath.toLowerCase()]) {
          return `${p1}#${linkMapper[filePath.toLowerCase()][0].hash}${p3}`;
        }
      }
    });

  if (data !== writeContent) {
    // console.log('rewrite file:', filePath)
    fs.writeFileSync(filePath, writeContent);
  }
}

function parseFileHash() {
  const includeFiles = [];
  function checkFileHash() {
    const fileKeys = Object.keys(fileHashMapper);
    const includeFileKeys = uniq(flatten(Object.values(fileHashMapper).map((v) => v.includes)));
    if (!includeFileKeys.filter((k) => !fileKeys.includes(k)).length) {
      return;
    }

    Object.entries(fileHashMapper).forEach(([k, v]) => {
      if (!v.includes.length) {
        return;
      }

      includeFiles.push(
        ...v.includes.filter((item) => {
          let filePath = item;
          if (!item.startsWith('/')) {
            filePath = path.join(k, '..', item);
          }
          return !includeFiles.includes(filePath);
        }),
      );
    });

    includeFiles.forEach((filePath) => {
      if (fileHashMapper[filePath]) {
        return;
      }

      const data = fs.readFileSync(filePath, 'utf8').replace(/\r/gi, '\n');
      const fileHeader = data.match(/---\n[\s\S]+?\n---\n?/);
      let result = fileHeader ? data.replace(fileHeader[0], '') : data;
      const hash = md5(result);
      const imagesResult = data.match(/image:{1,2}(.*)?\.(jpg|png|svg|webp|jpeg)/gi);
      const images = {};
      if (imagesResult) {
        imagesResult.forEach((v) => {
          const imagePath = v.replace(/image:{1,2}/i, '').trim();
          if (/^https?:\/\//.test(imagePath)) {
            const realImagePath = imagePath.startsWith('/')
              ? path.join(STATIC_DIR, imagePath)
              : path.join(filePath.replace(/\/(.*)?\.[a-zA-Z\d]+$/, ''), imagePath);
            if (fs.existsSync(realImagePath)) {
              mtime = fs.statSync(realImagePath).mtime.toLocaleString();
              images[realImagePath] = mtime;
            }
          }
          return null;
        });
      }
      const includesResult = data.match(/include::(.*)?\[/gi);
      const includes = includesResult
        ? includesResult
            .map((v) =>
              v
                .replace(/include::content/gim, `include::${PROJECT_DIR}/pdf/content/`)
                .replace('include::', '')
                .replace(/\[$/, ''),
            )
            .map((v) => {
              if (!v.startsWith('/')) {
                return path.join(filePath, '..', v);
              }
              return v;
            })
            .filter(Boolean)
        : [];

      fileHashMapper[filePath] = { hash, images, includes };
    });
    checkFileHash();
  }

  checkFileHash();
  fs.writeFileSync(`${PDF_CONTENT_DIR}/@@hash@@.json`, JSON.stringify(fileHashMapper, null, 2));
}

// 这个function都是不是在 parse 什么内容，
// 而是在替换一些 “不合适” 的内容
// todo give this a better name
function parseAdocs(rootDir, fileType) {
  parseAdocsData({ rootDir, fileType });
  parseAdocsData({ rootDir, checkType: 'link', fileType });
  if (fileHashMapper) {
    parseFileHash();
  }
}

module.exports = parseAdocs;
