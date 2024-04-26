const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

function dealAsciidoctorBug() {
  const source = path.join(process.cwd(), 'libs/@asciidoctor/cli/lib/invoker.js');
  const dest = path.join(process.cwd(), 'node_modules/@asciidoctor/cli/lib/invoker.js');
  if (fs.existsSync(source)) {
    shell.cp(source, dest);
  }
}

module.exports = dealAsciidoctorBug;
