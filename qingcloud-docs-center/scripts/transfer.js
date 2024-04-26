const logger = require('./logger');
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const { uniq } = require('lodash');
const checkNamespace = require('./checkNamespace');

const namespace = checkNamespace();

let from = process.argv[3];
let to = process.argv[4];

if (!from || !to) {
  logger.error('源文件夹或目标文件夹未定义!');
  process.exit(1);
}

from = from.trim();
to = to.trim();

const nameReg = /^[a-zA-Z0-9\._-]+$/i;
if (!nameReg.test(from) || !nameReg.test(to)) {
  logger.error('源文件夹或目标文件夹名称 只能是数字、字母以及 . _ - 字符！');
  process.exit(1);
}

const fromDir = path.join(process.cwd(), `content/@${namespace}/${from}`);
const toDir = path.join(process.cwd(), `content/@${namespace}/${to}`);

if (!fs.existsSync(fromDir)) {
  logger.error(`源文件夹 content/@${namespace}/${from} 不存在！`);
  process.exit(1);
}

if (fs.existsSync(fromDir) && fs.statSync(fromDir).isFile()) {
  logger.error(`源文件夹  content/@${namespace}/${from} 非文件夹！`);
  process.exit(1);
}

if (fs.existsSync(toDir)) {
  logger.error('目标文件夹已存在，请更换文件夹名称！');
  process.exit(1);
}

shell.exec(`cp -r -p "${fromDir}" "${toDir}"`);

const list = [];

function loopDirection(dir) {
  fs.readdirSync(dir).forEach(function (fileName) {
    const fileDir = path.join(dir, fileName);
    const fileStat = fs.statSync(fileDir);
    if (fileStat.isDirectory()) {
      loopDirection(fileDir);
    }
    if (fileStat.isFile() && /\.adoc$/i.test(fileDir)) {
      const data = fs.readFileSync(fileDir, 'utf8');
      const fromString = `([ '":\`{]\.\/)/${from}([ '":\`/}])`;
      const checkString = `([ '":\`{]\.\/)/${from}`;

      const reg = new RegExp(fromString, 'img');
      const checkReg = new RegExp(checkString, 'img');
      const _data = data.replace(reg, `$1/${to}$2`);
      if (checkReg.test(_data)) {
        list.push(fileDir.replace(process.cwd(), ''));
      }
      fs.writeFileSync(fileDir, _data);
    }
  });
}

loopDirection(toDir);

const uniqList = uniq(list);
if (uniqList.length) {
  logger.success(`content/@${namespace}/${to} 目录已生成!`);
  logger.warn(`仍可能存在未转换的文件，请手动查看文件列表，该文件为 content/@${namespace}/warning.txt`);
  const warningFilePath = path.join(process.cwd(), `content/@${namespace}/warning.txt`);
  fs.writeFileSync(warningFilePath, uniqList.join('\n'));
} else {
  logger.success(`content/@${namespace}/${to} 目录已生成，文件转换成功！`);
}
