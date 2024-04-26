var colors = require('colors');
var emoji = require('node-emoji');
global.LOGGER_ERRORS = [];

const logger = {
  success(msg) {
    console.log(`${emoji.get('tada')} ${colors.green(msg)}\n`);
  },
  info(msg) {
    console.log(`${emoji.get('star2')} ${colors.cyan(msg)}\n`);
  },
  warn(msg) {
    console.log(`${emoji.get('ghost')} ${colors.yellow(msg)}\n`);
  },
  error(msg) {
    global.LOGGER_ERRORS.push(msg);
    console.log(`${emoji.get('exclamation')} ${colors.red(msg)}\n`);
  },
};

module.exports = logger;
