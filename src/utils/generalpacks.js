const {
  styleLoader,
  extractTextPluginOptions,
  loaders: customLoaders,
  INCLUDES,
  TESTRES,
} = require('./loaders')

function customGeneralLoaders(options) {
  options = options || {}

  // generate general loader string to be used with extract text plugin
  function generateGeneralLoaders(loader) {
    const loaders = customLoaders(options)[loader]

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
    babel: generateGeneralLoaders('babel'),
    css: generateGeneralLoaders('css'),
    less: generateGeneralLoaders('less'),
    lessModule: generateGeneralLoaders('lessModule'),
  }
}

// Generate general loaders for standalone js/jsx and style files
exports.generalLoaders = function generalLoaders(options) {
  const loaders = customGeneralLoaders(options)

  return Object.keys(loaders).map(extension => ({
    test: new RegExp(`\\.${TESTRES[extension]}$`),
    use: loaders[extension],
    // exclude: /node_modules/,
    include: INCLUDES[extension],
  }))
}
