const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const YAML = require('yaml');
const { flatten } = require('lodash');

const { getImageDirectories, getCurrentVersion } = require('./utils');
const logger = require('./logger');

const NAMESPACE = ['enterprise', 'boss'];

function execHinata(namespace) {
  if (fs.existsSync(`config/@${namespace}/hinata/schema/DocLinkKeyMap.json`)) {
    logger.info(`生成 @${namespace}/hinata/configs/link_key_mapper.json`);
    shell.exec(`npm run linkkey:result ${namespace}`);
    shell.exec(`cp scripts/linkkeys/keyUriMapper.json config/@${namespace}/hinata/configs/link_key_mapper.json`);
  }
  if (fs.existsSync(`config/@${namespace}/hinata/schema/DocsCenterParams.json`)) {
    logger.info(`生成 @${namespace}/hinata/configs/docs_center_params.yaml`);
    const centerParams = JSON.parse(
      fs.readFileSync(`config/@${namespace}/hinata/schema/DocsCenterParams.json`, 'utf-8'),
    );
    const result = {
      markup: {
        asciidocExt: {
          attributes: {},
        },
      },
      params: {},
    };
    Object.entries(centerParams.properties.params.properties).forEach(([k, v]) => {
      if (v.default) {
        result.params[k] = v.default;
      }
    });
    Object.entries(centerParams.properties.markup.properties.asciidocExt.properties.attributes.properties).forEach(
      ([k, v]) => {
        if (v.default) {
          result.markup.asciidocExt.attributes[k] = v.default;
        }
      },
    );
    fs.writeFileSync(`config/@${namespace}/hinata/configs/docs_center_params.yaml`, YAML.stringify(result));
  }
}

function cpImages() {
  const imageDirs = flatten(NAMESPACE.map((namespace) => getImageDirectories(namespace)));

  if (fs.existsSync(`static/images`)) {
    shell.mkdir('-p', 'qingcloud-docs-center/static/images');
    shell.exec(`cp static/images/*.* qingcloud-docs-center/static/images`);
    fs.readdirSync(`static/images`).forEach(function (fileName) {
      const fileDir = path.join(`static/images`, fileName);
      if (fs.statSync(fileDir).isDirectory()) {
        if (imageDirs.includes(fileName.toLowerCase()) || fileName === 'icons') {
          shell.exec(`cp -R "${fileDir}" qingcloud-docs-center/static/images`);
        }
      }
    });
  }
}

shell.cd(process.cwd());
if (fs.existsSync('qingcloud-docs-center.tar.gz')) {
  shell.exec('rm qingcloud-docs-center.tar.gz');
}
shell.exec('rm -rf qingcloud-docs-center');
shell.mkdir('qingcloud-docs-center');

NAMESPACE.forEach(function (namespace) {
  const currentVersion = getCurrentVersion(namespace);

  execHinata(namespace);
  shell.mkdir('-p', 'qingcloud-docs-center/config');
  shell.exec(`cp -R config/@${namespace} config/*.yaml qingcloud-docs-center/config`);
  const configFiles = ['_variables.scss', 'config.yaml', 'hinata'];
  fs.readdirSync(`qingcloud-docs-center/config/@${namespace}`).forEach((filename) => {
    const dirname = `qingcloud-docs-center/config/@${namespace}/${filename}`;
    if (!configFiles.includes(filename)) {
      shell.exec(`rm -rf ${dirname}`);
    }
    if (filename === 'config.yaml' && namespace === 'enterprise') {
      const fileContent = fs.readFileSync(dirname, 'utf-8');
      const fileContentYAML = YAML.parse(fileContent);
      fileContentYAML.params.docHostPort = 'SITE_PROTOCOL://docs.DOMAIN';
      fileContentYAML.params.navLink = [
        {
          title: '控制台',
          url: 'SITE_PROTOCOL://console.DOMAIN',
        },
      ];
      fs.writeFileSync(dirname, YAML.stringify(fileContentYAML));
    }
  });
  shell.exec(`cp -R pkgs qingcloud-docs-center`);
  shell.mkdir('-p', 'qingcloud-docs-center/content');
  fs.readdirSync('content').forEach((filename) => {
    const dirname = `content/${filename}`;
    if (fs.statSync(dirname).isDirectory() && !filename.startsWith('.')) {
      if ((filename.startsWith('@') && filename === `@${namespace}`) || !filename.startsWith('@')) {
        shell.exec(`cp -R ${dirname} qingcloud-docs-center/content`);
      }
    }
  });
  shell.mkdir('-p', 'qingcloud-docs-center/static');
  shell.exec(`cp -R static/css static/fonts static/js qingcloud-docs-center/static`);
  shell.exec(`cp -R libs node_modules scripts themes package.json qingcloud-docs-center`);

  fs.readdirSync(`qingcloud-docs-center/content/@${namespace}`).forEach((filename) => {
    const dirname = `qingcloud-docs-center/content/@${namespace}/${filename}`;
    if (filename.startsWith('.')) {
      shell.exec(`rm -rf ${dirname}`);
    } else if (!filename.startsWith('_') && filename !== currentVersion) {
      shell.exec(`rm -rf ${dirname}`);
    }
  });
});

cpImages();

shell.exec(`tar -cf qingcloud-docs-center.tar.gz --exclude '*.DS_Store' ./qingcloud-docs-center`);
shell.exec('rm -rf qingcloud-docs-center');

logger.success(`Bundle installer ${NAMESPACE.map((namespace) => `@${namespace}`)} Success!`);
