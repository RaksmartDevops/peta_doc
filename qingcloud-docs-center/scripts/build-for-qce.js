// this is just a copy version of scripts/update.js
// TODO Rewrite it!
const fs = require('fs');
const shell = require('shelljs');
const checkNamespace = require('./checkNamespace');
const path = require('path');
const logger = require('./logger');
const build = require('./build');
const search = require('./search/search');
const { getConfig, mergeDeep } = require('./utils');
const axios = require('axios');
const YAML = require('yaml');

process.on('SIGINT', () => process.exit());
process.on('SIGQUIT', () => process.exit());
process.on('SIGTERM', () => process.exit());

const UPDATE_DATA_PATH = path.join(process.cwd(), 'scripts/data/update.json');

const NAMESPACES = ['enterprise', 'boss'];

function resetUpdateCommand() {
  fs.writeFileSync(UPDATE_DATA_PATH, JSON.stringify({}));
}

async function execCommand({ namespace, isEmbed }) {
  await build({ namespace, isEmbed });

  search(namespace, isEmbed);
  if (fs.existsSync(`pdf/files/@${namespace}/pdf`)) {
    const destination = isEmbed ? `${namespace.toLowerCase()}_embed` : namespace.toLowerCase();
    shell.exec(`cp -R pdf/files/@${namespace}/pdf public/${destination}`);
  }
}


const CONFIG_CENTER_URL = 'http://api.qingcloud.com:13001/config';

async function updateLocalConfigByHinata(namespace) {
  const config = getConfig(namespace);
  const CONFIG_PATH = path.join(process.cwd(), `config/@${namespace}`);
  const CONFIG_NAMES = [];
  [config.externalConfigs, config.externalStyles].forEach((v) => {
    if (!v) {
      return;
    }

    v.split(',')
      .filter(Boolean)
      .forEach((file) => {
        const [name, type] = file.split('.');
        if (name?.trim() && type?.trim()) {
          CONFIG_NAMES.push({ name: name.trim(), extension: type.trim() });
        }
      });
  });

  if (!CONFIG_NAMES.length) {
    return;
  }

  const result = await Promise.all(
    CONFIG_NAMES.map((v) =>
      axios
        .post(
          `${CONFIG_CENTER_URL}/${v.name}`,
          {
            host: { appName: 'docs-center', appVersion: '1.0.0' },
            merge: { app: ['webconsole-common'] },
            rootNS: 'GLOBAL',
          },
          { headers: { 'Content-Type': 'application/json' } },
        )
        .catch(function (err) {
          return null;
        }),
    ),
  );

  result.forEach((response, idx) => {
    if (response?.data?.statusCode !== 0 || !response.data?.result?.content) {
      return;
    }

    const { name, extension } = CONFIG_NAMES[idx];
    const responseContent = response.data.result.content;
    const filePath = path.join(CONFIG_PATH, `${name}.${extension}`);
    let originContent = {};
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      originContent =
        (extension === 'yaml'
          ? YAML.parse(fs.readFileSync(filePath, 'utf8'))
          : JSON.parse(fs.readFileSync(filePath, 'utf8'))) || {};
    }
    const fileContent =
      extension === 'yaml'
        ? YAML.stringify(mergeDeep(originContent, responseContent))
        : JSON.stringify(mergeDeep(originContent, responseContent), null, 2);
    fs.writeFileSync(filePath, fileContent);
    logger.success(`${filePath} 写入成功!`);
  });
}


async function runSingle(namespace) {
  await updateLocalConfigByHinata(namespace);

  await execCommand({ namespace, isEmbed: false });

  if (getConfig(namespace).params.docHostPort) {
    await execCommand({ namespace, isEmbed: true });
  }

  logger.success(`Build @${namespace} Success!`);
}

async function runCommand(namespaces) {
  namespaces.forEach((namespace) => checkNamespace(namespace));

  logger.info(`${namespaces.map((v) => `@${v}`).join(' ')} 正在更新，请稍后...`);

  await namespaces.reduce(async (acc, namespace) => {
    return acc.then(() => runSingle(namespace));
  }, Promise.resolve());

  resetUpdateCommand();

  logger.info(`${namespaces.map((v) => `@${v}`).join(' ')} 更新成功!`);

  // https://wiki.yunify.com/pages/viewpage.action?pageId=173377243
  // 根据上面文档的约定，部署时需要在 WS 上执行此脚本，并输出最后构建后的文档到 `/pitrix/lib` 下
  // 如果要变更此处的逻辑，请提前和 installer 的同事沟通
  shell.exec('rm -rf ../qingcloud-docs-center-dist-enterprise ../qingcloud-docs-center-dist-enterprise ../qingcloud-docs-center-dist-enterprise_embed');
  shell.exec('mv public/enterprise ../qingcloud-docs-center-dist-enterprise');
  shell.exec('mv public/enterprise_embed ../qingcloud-docs-center-dist-enterprise_embed');
  shell.exec('mv public/boss ../qingcloud-docs-center-dist-boss');
}

// Quite previous process
const updateData = {
  pid: process.pid,
  time: new Date().toLocaleString(),
};

if (fs.existsSync(UPDATE_DATA_PATH)) {
  const data = JSON.parse(fs.readFileSync(UPDATE_DATA_PATH, 'utf8'));
  if (data.pid) {
    shell.exec(`kill -9 ${data.pid}`);
    logger.warn(`[pid ${data.pid} killed] npm run update ${data.params?.join(' ')}`);
  }
}

fs.writeFileSync(UPDATE_DATA_PATH, JSON.stringify(updateData, null, 2));

runCommand(NAMESPACES);
