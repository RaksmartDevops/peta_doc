const { getStagedProjects } = require('./utils');
const shell = require('shelljs');
const logger = require('./logger');

const projects = getStagedProjects();

let passed = true;

if (projects.length) {
  projects.forEach((project) => {
    const { code } = shell.exec(`npm run check ${project}`);
    if (code !== 0) {
      passed = false;
    }
  });
}

if (!passed) {
  logger.warn(`Git commit 失败！请检查报错信息，修复后重新提交！`);
  process.exit(1);
} else {
  logger.success(`Git commit 成功！`);
}
