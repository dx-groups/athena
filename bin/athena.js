#!/usr/bin/env node
const chalk = require('chalk')
const { fork } = require('child_process')
// const spawn = require('react-dev-utils/crossSpawn')

console.log()
console.log(chalk.blue('Athena is running!'))
console.log(chalk.blue('For further info, please visit https://github.com/elephant-fe/athena'))
console.log()

// Notify update when process exits
const updater = require('update-notifier')
const pkg = require('../package.json')
updater({ pkg: pkg }).notify({ defer: true })

const script = process.argv[2];
const args = process.argv.slice(3);

switch (script) {
  case '-v':
  case '--version':
    console.log(pkg.version);
    if (!(pkg._from && pkg._resolved)) {
      console.log(chalk.cyan('@local'));
    }
    break;
  case 'start':
  case 'build':
  case 'test': {
    const proc = fork(
      require.resolve(`../src/${script}`),
      args,
      {
        // stdio: 'inherit',
        execArgv: process.execArgv.filter(a => a.includes('inspect-brk')).length > 0 ? ['--inspect-brk'] : []
      },
    );

    proc.once('exit', code => {
      code !== 0 && console.log(
        'The build failed because the process exited too early. ' +
        'This probably means the system ran out of memory or someone called ' +
        '`kill -9` on the process.'
      );
      process.exit(code);
    });
    process.once('exit', () => {
      // console.log(
      //   'The build failed because the process exited too early. ' +
      //   'Someone might have called `kill` or `killall`, or the system could ' +
      //   'be shutting down.'
      // );
      proc.kill();
    });
    break;
  }
  default:
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update @dx-groups/athena?');
    console.log(`Unknown script ${chalk.cyan(script)}.`);
    break;
}
