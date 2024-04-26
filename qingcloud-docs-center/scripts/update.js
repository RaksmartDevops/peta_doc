const fs = require('fs');
const shell = require('shelljs');
const checkNamespace = require('./checkNamespace');
const path = require('path');
const logger = require('./logger');
const build = require('./build');
const search = require('./search/search');
const pubCloudProductNews = require('./pubCloudProductNews');
const { getConfig, mergeDeep } = require('./utils');
const axios = require('axios');
const YAML = require('yaml');

process.on('SIGINT', () => process.exit());
process.on('SIGQUIT', () => process.exit());
process.on('SIGTERM', () => process.exit());

const UPDATE_DATA_PATH = path.join(process.cwd(), 'scripts/data/update.json');

function getNamespacesAndQuitePreviousProcess() {
  const namespaces = process.argv.slice(2);

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

  return namespaces;
}

function resetUpdateCommand() {
  fs.writeFileSync(UPDATE_DATA_PATH, JSON.stringify({}));
}

async function execCommand(namespace, isEmbed) {
  await build({ namespace, isEmbed });

  search(namespace, isEmbed);

  if (namespace === 'pubCloud' && !isEmbed) {
    pubCloudProductNews();
  }

  if (fs.existsSync(`pdf/files/@${namespace}/pdf`)) {
    const destination = isEmbed ? `${namespace.toLowerCase()}_embed` : namespace.toLowerCase();
    shell.exec(`cp -R pdf/files/@${namespace}/pdf public/${destination}`);
  }
}

async function runSingle(namespace) {

  await execCommand(namespace, false);

  if (getConfig(namespace).params.docHostPort) {
    await execCommand(namespace, true);
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
}

runCommand(getNamespacesAndQuitePreviousProcess());
