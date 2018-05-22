#!/usr/bin/env node
const chalk = require('chalk')
const { fork, exec } = require('child_process')
// const spawn = require('react-dev-utils/crossSpawn')

console.log()
console.log(chalk.blue('Athena is running!'))
console.log(chalk.blue('For further info, please visit https://github.com/elephant-fe/athena'))
console.log()

// Notify update when process exits
const updater = require('update-notifier')
const pkg = require('../package.json')

updater({ pkg }).notify({ defer: true })

const script = process.argv[2]
const args = process.argv.slice(3)

switch (script) {
  case '-v':
  case '--version':
    console.log(pkg.version)
    if (!(pkg._from && pkg._resolved)) {
      console.log(chalk.cyan('@local'))
    }
    break
  case 'start':
  case 'build':
  case 'test': {
    const proc = fork(
      require.resolve(`../lib/${script}`),
      args,
      {
        // stdio: 'inherit',
        execArgv: process.execArgv.filter(a => a.includes('inspect-brk')).length > 0 ? ['--inspect-brk'] : [],
      },
    )

    proc.once('exit', (code) => {
      // eslint-disable-next-line
      code !== 0 && console.log('The build failed because the process exited too early. ' +
        'This probably means the system ran out of memory or someone called ' +
        '`kill -9` on the process.')
      process.exit(code)
    })
    process.once('exit', () => {
      // console.log(
      //   'The build failed because the process exited too early. ' +
      //   'Someone might have called `kill` or `killall`, or the system could ' +
      //   'be shutting down.'
      // );
      proc.kill()
    })
    break
  }
  case 'lint': {
    console.log(`Starting lint ${chalk.cyan(chalk.bold(args))} ...\n`)
    const esArgs = args.join(' ')
    const styleArgs = args.map(f => `${f}/**/*.less`).join(' ')
    exec(`eslint ${esArgs} && stylelint "${styleArgs}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Athena lint error: ${error}`)
        // return;
      }
      console.log('Athena lint finished')
    })
    break
  }
  case 'lint-fix': {
    console.log(`Starting lint-fix ${chalk.cyan(chalk.bold(args))} ...\n`)
    const esArgs = args.join(' ')
    const styleArgs = args.map(f => `${f}/**/*.less`).join(' ')
    exec(`eslint --fix ${esArgs} && stylelint --fix "${styleArgs}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Athena lint-fix error: ${error}`)
        // return;
      }
      console.log('Athena lint finished')
    })
    break
  }
  default:
    console.log(`Unknown script "${script}".`)
    console.log('Perhaps you need to update @dx-groups/athena?')
    console.log(`Unknown script ${chalk.cyan(script)}.`)
    break
}
