const path = require('path');
const fs = require('fs');
const { omit } = require('lodash');
const { getConfig } = require('./utils');

const rsyncAdocAttributes = function (namespace) {
  const CONFIG = getConfig(namespace);
  const attributes = CONFIG.markup.asciidocExt.attributes || {};
  fs.writeFileSync(
    path.join(process.cwd(), `themes/qing-theme/data/attributes.json`),
    JSON.stringify(omit(attributes, ['toc', 'toclevels']), null, 2),
  );
};

module.exports = rsyncAdocAttributes;
