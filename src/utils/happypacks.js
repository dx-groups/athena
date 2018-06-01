const HappyPack = require('happypack')
const os = require('os')

const {
  styleLoader,
  extractTextPluginOptions,
  loaders: customLoaders,
  INCLUDES,
  TESTRES,
} = require('./loaders')

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

function customHappyLoaders(options) {
  options = options || {}

  const HappyLoaderRules = {
    babel: ['happypack/loader?id=babel'],
    css: ['happypack/loader?id=css'],
    less: ['happypack/loader?id=less'],
    lessModule: ['happypack/loader?id=lessModule'],
  }

  // generate happy loader string to be used with extract text plugin
  function generateHappyLoaders(loader) {
    const loaders = HappyLoaderRules[loader]

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract && loader !== 'babel') {
      const ExtractTextPlugin = require('extract-text-webpack-plugin')
      return ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: loaders,
        ...extractTextPluginOptions,
      })
    } else {
      return loaders
    }
  }

  return {
    babel: generateHappyLoaders('babel'),
    css: generateHappyLoaders('css'),
    less: generateHappyLoaders('less'),
    lessModule: generateHappyLoaders('lessModule'),
  }
}

// Generate happy loaders for standalone style files
exports.happyLoaders = function happyLoaders(options) {
  const loaders = customHappyLoaders(options)

  return Object.keys(loaders).map(extension => ({
    test: new RegExp(`\\.${TESTRES[extension]}$`),
    use: loaders[extension],
    // exclude: /node_modules/,
    include: INCLUDES[extension],
  }))
}

exports.happyPlugins = function happyPlugins(options) {
  const loaders = customLoaders(options)

  return Object.keys(loaders).map(extension =>
    new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: extension,
      threadPool: happyThreadPool,
      verbose: true,
      loaders: loaders[extension],
    }))
}
