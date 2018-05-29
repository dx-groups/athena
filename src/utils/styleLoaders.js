const autoprefixer = require('autoprefixer')
const config = require('../config/index')

// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = config.build.assetsPublicPath === './'

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
  { publicPath: Array(config.build.cssFilename.split('/').length).join('../') }
  : {}

exports.cssLoaders = function cssLoaders(options) {
  options = options || {}

  const styleLoader = require.resolve('style-loader')
  const lessLoader = require.resolve('less-loader')

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      // sourceMap: options.sourceMap,
      // Necessary for external CSS imports to work
      // https://github.com/facebookincubator/create-react-app/issues/2677
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'),
        // require('precss'),
        autoprefixer({
          browsers: [
            '>1%',
            'last 4 versions',
            'Firefox ESR',
            'not ie < 9', // React doesn't support IE8 anyway
          ],
          flexbox: 'no-2009',
        }),
      ],
    },
  }

  const LoaderRules = {
    css: [
      styleLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 1,
          minimize: options.isProduction,
          sourceMap: true,
        },
      },
      postcssLoader,
    ],
    less: [
      styleLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 2,
          minimize: options.isProduction,
          sourceMap: true,
          modules: true,
          localIdentName: '[name]_[local]_[hash:base64:3]',
        },
      },
      postcssLoader,
      lessLoader,
    ],
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader) {
    const loaders = LoaderRules[loader]

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      const ExtractTextPlugin = require('extract-text-webpack-plugin')
      return ExtractTextPlugin.extract({
        fallback: styleLoader,
        use: loaders.slice(1),
        ...extractTextPluginOptions,
      })
    } else {
      return loaders
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders('css'),
    less: generateLoaders('less'),
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function styleLoaders(options) {
  const loaders = exports.cssLoaders(options)

  return Object.keys(loaders).map(extension => ({
    test: new RegExp(`\\.${extension}$`),
    use: loaders[extension],
  }))
}
