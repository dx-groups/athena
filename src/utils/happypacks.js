const autoprefixer = require('autoprefixer')
const HappyPack = require('happypack')
const os = require('os')
const paths = require('../config/paths')
const config = require('../config/index')

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

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

function customLoaders(options) {
  options = options || {}

  const LoaderRules = {
    babel: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: !options.isProduction,
          compact: options.isProduction,
          presets: [
            'env',
            'stage-0',
            'react',
          ],
          plugins: [
            'transform-runtime',
          ],
          env: {
            test: {
              plugins: ['istanbul'],
            },
          },
          ...config.customed.babel,
        },
      },
    ],
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
    let loaders = LoaderRules[loader]

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract && loader !== 'babel') {
      loaders = loaders.slice(1)
    }

    return loaders
  }

  return {
    babel: generateLoaders('babel'),
    css: generateLoaders('css'),
    less: generateLoaders('less'),
  }
}

function customHappyLoaders(options) {
  options = options || {}

  const HappyLoaderRules = {
    babel: ['happypack/loader?id=babel'],
    css: ['happypack/loader?id=css'],
    less: ['happypack/loader?id=less'],
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
  }
}

const TEXTRE = {
  babel: '(js|jsx)',
  css: 'css',
  less: 'less',
}

// Generate happy loaders for standalone style files
exports.happyLoaders = function styleLoaders(options) {
  const loaders = customHappyLoaders(options)

  return Object.keys(loaders).map(extension => ({
    test: new RegExp(`\\.${TEXTRE[extension]}$`),
    use: loaders[extension],
    exclude: /node_modules/,
    include: paths.appSrc,
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
