const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const logger = require('../logger');

function handleHTML(htmlPath) {
  if (!fs.existsSync(htmlPath)) {
    console.log('can not find html file of:', htmlPath);
    return;
  }

  const content = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(content);
  const cssDOM = $('head link[rel=stylesheet]');
  const cssContent = fs
    .readFileSync(cssDOM.attr('href'), 'utf8')
    .replace(/url\(\'\.\.\/fonts\//gim, `${process.cwd()}\/pdf\/fonts\/`);
  const htmlCssContent = fs.readFileSync(path.join(process.cwd(), `pdf/css/html.css`), 'utf8');
  const cssString = `<style>\n${cssContent}\n${htmlCssContent}\n</style>\n`;
  cssDOM.each(function () {
    $(this).remove();
  });
  $('head').append(cssString);

  const tocString = `function getTOC(level) {
    var result = '';
    var errorIDs = [];
    document.querySelectorAll("[id^='fil-']").forEach(v => {
      var elem = $('#' + v.id);
      var vLevel = elem.parent().attr('class') ? elem.parent().attr('class').replace(/(.*?sect)([0-9]+).*?/ig, '$2') : undefined;
      if (+vLevel <= (level || 3)) {
        var vPageNumber = elem.parents('.pagedjs_page').data('pageNumber');
        var vText = elem.text();
        if (/^([0-9]+\\.)+ /.test(vText)) {
          var levelNum = 1
          if (/^([0-9]+\\.){2} /.test(vText)) {
            levelNum = 2
          } else if (/^([0-9]+\\.){3} /.test(vText)) {
            levelNum = 3
          } else if (/^([0-9]+\\.){4} /.test(vText)) {
            levelNum = 4
          } else if (/^([0-9]+\\.){5} /.test(vText)) {
            levelNum = 5
          } else if (/^([0-9]+\\.){6} /.test(vText)) {
            levelNum = 6
          } else if (/^([0-9]+\\.){7} /.test(vText)) {
            levelNum = 7
          }
          result += '    '.repeat(levelNum - 1) + '"' + (vText || '') + '"' + ' ' + (vPageNumber || '') + '\\n';
        }
      }
      if (!vLevel) {
        errorIDs.push('#' + v.id);
      }
    });
    console.log(result);
    if (errorIDs.length) {
      console.error(errorIDs);
    }
    return result;
  }`;

  $('body').append(`<script src="${process.cwd()}/static/js/jquery-2.2.4.js"></script>\n`);
  $('body').append(`<script>\n${tocString}\n</script>\n`);

  fs.writeFileSync(htmlPath, $.html());
  logger.success(`Update ${htmlPath} success!`);
}

module.exports = handleHTML;
