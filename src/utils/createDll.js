const fs = require('fs')
const chalk = require('chalk')
const glob = require('glob')
const webpack = require('webpack')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const webpackDllConfig = require('../config/webpack.config.dll')
const paths = require('../config/paths')

exports.ensureDll = function ensureDll(cb) {
  const exists = fs.existsSync(paths.appDllManifest)
    && glob.sync('static/js/*-dll.*.js', { cwd: paths.appBuild }).length > 0
  if (exists) {
    cb()
  } else {
    createDll(cb)
  }
}

function createDll(cb) {
  console.log('Creating an split dll bundles for development...\n')

  const compiler = webpack(webpackDllConfig)
  compiler.run((err, stats) => {
    if (err) {
      console.log(chalk.red('Failed to create dll bundles.\n'))
      console.log(`${err}\n`)
      process.exit(1)
    }
    const messages = formatWebpackMessages(stats.toJson({}, true))
    if (messages.errors.length) {
      console.log(chalk.red('Failed to create dll bundles.\n'))
      console.log(`${messages.errors.join('\n\n') || err}\n`)
      process.exit(1)
    }
    cb()
  })
}
