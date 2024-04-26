const data = require('./data');
const custom = require('./custom');
const fs = require('fs');
const path = require('path');
const { getMeta } = require('../utils');
const { isArray, some, every } = require('lodash');

const result = [];
const handleName = (name = '') => {
  const dirName = name.replace(/^\/+/, '').replace(/\/$/, '').trim();
  if (dirName && dirName !== '-') {
    return dirName;
  }
  return null;
};

function getRealFilePath(filePath) {
  const realFilePath = `${filePath.replace(/\/+$/, '')}.adoc`;
  if (fs.existsSync(realFilePath) && fs.statSync(realFilePath).isFile()) {
    return realFilePath;
  }
  const realSectionFilePath = path.join(filePath, '_index.adoc');
  if (fs.existsSync(realSectionFilePath) && fs.statSync(realSectionFilePath).isFile()) {
    return realSectionFilePath;
  }
  return null;
}

data.forEach((level1) => {
  const level1Dirname = handleName(level1.dir_name);
  const level1Name = handleName(level1.name);
  if (level1.items.length) {
    const children = level1.items
      .filter((level2) => !level2.items || level2.items.length === 0)
      .map((level2) => ({
        name: handleName(level2.name),
        dir_name: handleName(level2.dir_name),
        zh: level2['zh-cn'],
      }))
      .filter((v) => !!v.dir_name && !v.parent);
    if (children.length && !level1.parent) {
      result.push({
        name: level1Name,
        zh: level1['zh-cn'],
        icon: level1.icon,
        children: [
          level1Dirname
            ? {
                name: handleName(level1.name),
                zh: level1['zh-cn'],
                dir_name: level1Dirname,
              }
            : null,
          ...children,
        ].filter(Boolean),
      });
    }
    level1.items
      .filter((level2) => level2.items?.length)
      .forEach((level2) => {
        const children = level2.items
          .map((level3) => {
            const level3Dirname = handleName(level3.dir_name);
            const level3Name = handleName(level3.name);
            return {
              name: level3Name,
              dir_name: level3Dirname,
              zh: level3['zh-cn'],
            };
          })
          .filter((v) => !!v.dir_name && !v.parent);
        if (children.length && !level2.parent) {
          result.push({
            name: handleName(level2.name),
            zh: level2['zh-cn'],
            icon: level2.icon,
            children: [
              handleName(level2.dir_name)
                ? {
                    name: handleName(level2.name),
                    zh: level2['zh-cn'],
                    dir_name: handleName(level2.dir_name),
                  }
                : null,
              ...children,
            ].filter(Boolean),
          });
        }
      });
  }
});

result.push(
  ...[
    {
      name: 'audio_and_video',
      zh: '音视频服务',
      children: [],
    },
    {
      name: 'container',
      zh: '容器服务',
      children: [],
    },
  ],
);

const children = [];
function convertData(item) {
  if (isArray(item)) {
    item.forEach((child) => convertData(child));
  } else {
    if (item.parent) {
      children.push(item);
    }
    if (item.items?.length) {
      convertData(item.items);
    }
  }
}

convertData(data);
children.push(...custom);

result.forEach((item) => {
  const filtered = children.filter((v) => v.parent === item.name);
  if (filtered.length) {
    item.children?.push(
      ...filtered.map((v) => ({
        name: v.name,
        zh: v['zh-cn'],
        dir_name: v.dir_name,
      })),
    );
  }
});

// 根据数据去找每个版本的信息
const sidebarVersionMap = {};

const PROJECT_DIR = path.join(process.cwd(), `content/@enterprise`);
const versions = fs
  .readdirSync(PROJECT_DIR)
  .map((fileName) => {
    const currentPath = path.join(PROJECT_DIR, fileName);
    if (fs.statSync(currentPath).isDirectory() && !fileName.startsWith('_')) {
      sidebarVersionMap[fileName] = [];
      return currentPath;
    }
    return null;
  })
  .filter(Boolean);

versions.forEach((version) => {
  const versionDirArray = version.split('/').filter(Boolean);
  const versionName = versionDirArray[versionDirArray.length - 1];
  result.forEach((item) => {
    const sidebarItem = {
      title: item.zh,
      icon: item.icon,
      children: [],
    };
    if (item.children.length) {
      item.children.forEach((v) => {
        const filePath = getRealFilePath(path.join(version, v.dir_name));
        if (filePath) {
          const meta = getMeta(filePath);
          if (meta) {
            sidebarItem.children.push({
              title: meta.title,
              href: `/${versionName}/${v.dir_name}/`,
            });
          }
        }
      });
    }
    if (sidebarItem.children.length) {
      sidebarVersionMap[versionName].push(sidebarItem);
    }
  });
  if (sidebarVersionMap[versionName].length === 0) {
    delete sidebarVersionMap[versionName];
  }
});

fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify(result, null, 2));
fs.writeFileSync(
  path.join(process.cwd(), `themes/qing-theme/data/sidebar.json`),
  JSON.stringify(sidebarVersionMap, null, 2),
);
