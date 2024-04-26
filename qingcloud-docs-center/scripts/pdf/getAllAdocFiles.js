const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');
const { uniq, flatten, compact, isArray } = require('lodash');
const {
  PDF_CONTENT_DIR,
  PDF_CONTENT_EXCLUDE_DIR,
  PDF_CONTENT_INCLUDE_DIR,
  PDF_CONTENT_ONLY_DIR,
  PDF_CONTENT_VERSIONS_DIR,
  CONFIG,
} = require('./constants');
const { getMeta } = require('../utils');
const logger = require('../logger');

function getDepth(filePath) {
  return (
    compact(filePath.replace(/\/_index.adoc$/i, '').split('/')).length - compact(PDF_CONTENT_DIR.split('/')).length
  );
}

const mediaFolderReg = /\/(news|video|videos|_\w+)\//i;

function getAllAdocFiles() {
  // const listFiles = [];
  const searchPageSections = [];
  const studySections = [];

  const draftFolders = [];

  // PDF_CONTENT_DIR is /path/to/qingcloud-docs-center/pdf/content/@project
  const listFiles = globSync(`${PDF_CONTENT_DIR}/**/*.adoc`)
    .filter((filePath) => {
      // 文件如果在 PDF_CONTENT_EXCLUDE_DIR 内，则不渲染
      if (PDF_CONTENT_EXCLUDE_DIR.find((v) => filePath.startsWith(v))) {
        return false;
      }

      // 忽略媒体文件夹和以 _ 开头的文件夹内的文件
      if (mediaFolderReg.test(filePath)) {
        return false;
      }

      return true;
    })
    .map((filePath) => {
      const meta = getMeta(filePath);
      if (!meta) {
        logger.error(`no file meta for file: ${filePath}`);
        return;
      }

      const weight = meta.weight || meta.Weight;

      return {
        filePath,
        meta,
        title: meta.title,
        depth: getDepth(filePath),
        weight,
        type: 'file',
      };
    })
    .filter((_item) => {
      if (!_item) {
        return false;
      }

      // 过滤掉 draft 和 not_show 的页面及其子页面
      if (_item.filePath.endsWith('_index.adoc') && (_item.meta.draft || _item.meta.not_show)) {
        draftFolders.push(path.dirname(_item.filePath));
        return false;
      }

      if (draftFolders.some((folder) => _item.filePath.startsWith(folder))) {
        return false;
      }

      if (_item.meta.draft || _item.meta.not_show) {
        return false;
      }

      return true;
    });

  // 生成每个文件夹的 路径 和 权重 map，方便后面查找
  const folderWeightMap = listFiles
    .filter(({ filePath }) => filePath.endsWith('/_index.adoc'))
    .reduce((acc, { filePath, weight }) => {
      // if filePath is `/path/to/qingcloud-docs-center/pdf/content/@boss/v4.3/product_use/resource/vm/express_vm/vm_manage/_index.adoc`
      // then key is `v4.3/product_use/resource/vm/express_vm/vm_manage`
      acc[path.dirname(filePath.slice(PDF_CONTENT_DIR.length + 1))] = weight;

      return acc;
    }, {});

  // 这段排序代码非常难理解，是因为在前面偷懒用了 glob 获取了全部的 adoc
  // 如果改成递归逐层获取会好容易理解很多，因为被排序的对象始终局限于同一个文件夹内的文件和一级子文件夹之间
  listFiles.sort((fileA, fileB) => {
    const parentPathA = path.dirname(fileA.filePath);
    const parentPathB = path.dirname(fileB.filePath);

    // 同一个文件内的文件要按照 weight 从低到高排序
    if (parentPathA === parentPathB) {
      // `_index.adoc` 的顺序始终优先
      if (fileA.filePath.endsWith('/_index.adoc')) {
        return -1;
      }

      if (fileB.filePath.endsWith('/_index.adoc')) {
        return 1;
      }

      return fileA.weight - fileB.weight;
    }

    const weightSequenceA = fileA.filePath
      .slice(PDF_CONTENT_DIR.length + 1)
      .split('/')
      .filter((v) => v !== '_index.adoc')
      .map((pathSegment, index, segments) => {
        if (pathSegment.endsWith('.adoc')) {
          return fileA.weight;
        }

        return folderWeightMap[segments.slice(0, index + 1).join('/')];
      });

    const weightSequenceB = fileB.filePath
      .slice(PDF_CONTENT_DIR.length + 1)
      .split('/')
      .filter((v) => v !== '_index.adoc')
      .map((pathSegment, index, segments) => {
        if (pathSegment.endsWith('.adoc')) {
          return fileB.weight;
        }

        return folderWeightMap[segments.slice(0, index + 1).join('/')];
      });

    for (let i = 0; i <= Math.min(weightSequenceA.length, weightSequenceB.length); i++) {
      if (weightSequenceA[i] === weightSequenceB[i]) {
        continue;
      }

      return weightSequenceA[i] - weightSequenceB[i];
    }

    return fileA.filePath < fileB.filePath ? 1 : -1;
  });

  listFiles.forEach((item) => {
    if (item.meta.study_section) {
      studySections.push(path.dirname(item.filePath));
    }
  });

  const nextStudySections = flatten(
    studySections.map((section) => {
      // 获取在当前 studySection 目录下的文件
      const arr = listFiles
        .filter((v) => v.filePath.startsWith(`${section}/`) && !v.filePath.endsWith('_index.adoc'))
        // 这段是什么意思？没看懂
        // 应该是获取 study section 的所有 first level folder
        .map((v) => {
          return path.join(section, compact(v.filePath.replace(section, '').split('/'))[0]);
        });

      return uniq(arr);
    }),
  );

  const sections = uniq(PDF_CONTENT_ONLY_DIR).length
    ? uniq(PDF_CONTENT_ONLY_DIR)
    : uniq(
        [
          ...PDF_CONTENT_INCLUDE_DIR, // 自定义目录
          ...searchPageSections, // searchPageSections
          ...studySections, // studySections
          ...nextStudySections, // studySections 一级子目录
          ...(PDF_CONTENT_VERSIONS_DIR || []).filter((v) => studySections.find((section) => v.startsWith(section))), // 命令行自定义目录
        ].map((v) => (v.endsWith('.adoc') ? v : `${v.replace(/\/+$/, '')}/`)),
      );
  const PICKED_SECTION_DIR_MAP = {};
  const pickedSessions = uniq(PDF_CONTENT_ONLY_DIR).length ? CONFIG.params.pdf.pdf_only : CONFIG.params.pdf.pdf_include;
  (pickedSessions || []).forEach((v) => {
    if (isArray(v) && v.length > 1) {
      PICKED_SECTION_DIR_MAP[path.join(PDF_CONTENT_DIR, v[0])] = v.map((item) => path.join(PDF_CONTENT_DIR, item));
    }
  });
  const pickedSections = sections.filter((v) => Object.keys(PICKED_SECTION_DIR_MAP).includes(v));
  const normalSections = sections.filter((v) => !Object.keys(PICKED_SECTION_DIR_MAP).includes(v));

  function parseSections(checkSections) {
    const result = {};
    listFiles.forEach((v) => {
      checkSections.forEach((section) => {
        const inSection = section.endsWith('/')
          ? v.filePath.startsWith(section)
          : v.filePath.startsWith(section) &&
            (v.filePath.replace(section, '').startsWith('/') ||
              v.filePath.replace(section, '') === '' ||
              v.filePath.replace(section, '') === '_index.adoc');

        if (!inSection) {
          return;
        }

        if (path.join(section, '_index.adoc') === v.filePath && nextStudySections.includes(section)) {
          const parentMeta = getMeta(path.join(section, '../_index.adoc'));
          if (parentMeta?.title) {
            v.parentTitle = parentMeta.title;
          }
        }

        if (
          !v.filePath.endsWith('_index.adoc') &&
          fs.existsSync(v.filePath.replace(/\/[^\/]+?\.adoc$/i, '/_index.adoc')) &&
          studySections.includes(v.filePath.replace(/\/[^\/]+?\.adoc$/i, ''))
        ) {
          const parentMeta = getMeta(v.filePath.replace(/\/[^\/]+?\.adoc$/i, '/_index.adoc'));
          if (parentMeta?.title) {
            v.parentTitle = parentMeta.title;
          }
        }

        if (result[section]) {
          result[section].push(v);
        } else {
          result[section] = [v];
        }
      });
    });
    return result;
  }

  const normals = parseSections(normalSections);
  const picks = {};
  pickedSections.forEach(function (section) {
    const sections = PICKED_SECTION_DIR_MAP[section];
    const result = parseSections(sections);
    const sectionDirs = sections.map((v) => v.replace(/\/+[^/]+\.adoc$/i, '/'));
    const pickedSection = flatten(sections.map((k) => result[k]).filter(Boolean));

    picks[section] = pickedSection
      .map((v, idx) => {
        if (
          pickedSection[idx - 1] &&
          pickedSection[idx] &&
          pickedSection[idx].depth - pickedSection[idx - 1].depth > 1
        ) {
          pickedSection[idx].depth = pickedSection[idx - 1].depth + 1;
        }
        return v;
      })
      .map((v, idx) => {
        const sectionBaseIndex = sectionDirs.findIndex((dir) => v.filePath.startsWith(dir));
        const sectionBaseDir = sectionDirs.find((dir) => v.filePath.startsWith(dir));
        if (sectionBaseIndex > 0) {
          const baseSectionIndex = pickedSection.findIndex((r) => r.filePath.startsWith(sectionBaseDir));
          if (baseSectionIndex === idx) {
            pickedSection[baseSectionIndex].originDepth = pickedSection[baseSectionIndex].depth;
            pickedSection[baseSectionIndex].depth = pickedSection[0].depth + 1;
          } else {
            v.depth = v.depth - pickedSection[baseSectionIndex].originDepth + pickedSection[baseSectionIndex].depth;
          }
        }
        return v;
      });
  });

  const resultMap = {
    ...normals,
    ...picks,
  };

  const result = sections
    .map((section) => resultMap[section])
    .filter((section) => {
      // PDF_CONTENT_VERSIONS_DIR 存在，如果在 PDF_CONTENT_VERSIONS_DIR 内，则渲染，PDF_CONTENT_VERSIONS_DIR为 null 则渲染全部
      // ===========================================
      // 上面的这句注释不但没有任何的解释作用，反而让人更加迷惑了
      // 这里的 version 不是字面意思上的 version，而是限定了一个目录，当有这个目录存在时，只导出此目录下的 pdf
      // PDF_CONTENT_ONLY_DIR 的值取自命令 npm run pdf namespace folder_path 中的 folder_path
      // 实现了只导出部分 project pdf 的能力
      if (section[0]?.filePath && PDF_CONTENT_VERSIONS_DIR) {
        return PDF_CONTENT_VERSIONS_DIR.find((v) => section[0].filePath.startsWith(v));
      }
      return true;
    });

  return result;
}

module.exports = getAllAdocFiles;
