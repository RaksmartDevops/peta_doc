const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cluster = require('cluster');
const { getDevEmbedCommand } = require('./constants/commands');
const checkNamespace = require('./checkNamespace');
const rsyncVariables = require('./rsyncVariables');
const rsyncAdocAttributes = require('./rsyncAdocAttributes');
const dealExternalFiles = require('./dealExternalFiles');

const dealAsciidoctorBug = require('./dealAsciidoctorBug');

const isEmbed = process.argv[2] === 'embed';
const namespace = checkNamespace(process.argv[3]);
// 多线程处理 watch, 主进程负责 server, 子进程负责同步 _variables.scss
if (cluster.isMaster) {
  dealAsciidoctorBug();
  dealExternalFiles(namespace);
  rsyncAdocAttributes(namespace);
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
  const command = getDevEmbedCommand({ namespace, isEmbed });
  shell.exec(command);
} else {
  rsyncVariables(namespace);
  fs.watch(path.join(process.cwd(), `config/@${namespace}`), (event, filename) => {
    if (filename === '_variables.scss') {
      rsyncVariables(namespace);
    }
    if (filename.endsWith('.yaml')) {
      rsyncAdocAttributes(namespace);
    }
  });
}
