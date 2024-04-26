const { spawn } = require('child_process');
const { getBuildEmbedCommand } = require('./constants/commands');
const rsyncVariables = require('./rsyncVariables');
const rsyncAdocAttributes = require('./rsyncAdocAttributes');
const dealAsciidoctorBug = require('./dealAsciidoctorBug');
const dealExternalFiles = require('./dealExternalFiles');
const logger = require('./logger');

async function build({ namespace, isEmbed }) {
  dealAsciidoctorBug();
  dealExternalFiles(namespace);
  rsyncVariables(namespace);
  rsyncAdocAttributes(namespace);
  const command = getBuildEmbedCommand({ namespace, isEmbed });
  // await new Promise((resolve) => shell.exec(command, () => resolve()));

  logger.info(`spawn command: ${command}`);
  await new Promise((resolve, reject) => {
    const hugoProcess = spawn(command, { stdio: 'inherit', shell: true }).on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject();
    });

    hugoProcess.on('disconnect', () => hugoProcess.kill());
    process.on('SIGINT', () => hugoProcess.kill());
    process.on('SIGQUIT', () => hugoProcess.kill());
    process.on('SIGTERM', () => hugoProcess.kill());
    process.on('exit', () => hugoProcess.kill());
  });
}

module.exports = build;
