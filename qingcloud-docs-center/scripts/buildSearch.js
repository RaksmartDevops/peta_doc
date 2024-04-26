const checkNamespace = require('./checkNamespace');
const build = require('./build');
const search = require('./search/search');

const isEmbed = process.argv[2] === 'embed';
const namespace = checkNamespace(process.argv[3]);

build({ namespace, isEmbed });
search(namespace, isEmbed);
