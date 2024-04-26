const fs = require('fs');
const path = require('path');

const getBuildEmbedCommand = ({ namespace, isEmbed }) => {
  const destination = isEmbed ? `${namespace.toLowerCase()}_embed` : `${namespace.toLowerCase()}`;

  const configFiles = [
    'config/default.yaml',
    isEmbed ? 'config/embed.yaml' : '',
    `config/@${namespace}/config.yaml`,
    fs.existsSync(`config/@${namespace}/custom.yaml`) ? `config/@${namespace}/custom.yaml` : '',
    fs.existsSync(`config/@${namespace}/external.yaml`) ? `config/@${namespace}/external.yaml` : '',
  ]
    .filter(Boolean)
    .join(',');

  return `hugo --destination public/${destination} --cleanDestinationDir -c content/@${namespace} --config ${configFiles}`;
};

const getDevEmbedCommand = ({ namespace, isEmbed }) => {
  const customConfig = fs.existsSync(path.join(process.cwd(), `config/@${namespace}/custom.yaml`))
    ? `,config/@${namespace}/custom.yaml`
    : '';
  const externalConfigFile = path.join(process.cwd(), `config/@${namespace}/external.yaml`);
  const externalConfig = fs.existsSync(externalConfigFile) ? `,config/@${namespace}/external.yaml` : '';
  const embedConfig = isEmbed ? ',config/embed.yaml' : '';
  return `hugo server --destination public -c content/@${namespace} --config config/default.yaml${embedConfig}${customConfig},config/@${namespace}/config.yaml${customConfig}${externalConfig}`;
};

module.exports = {
  getBuildEmbedCommand,
  getDevEmbedCommand,
};
