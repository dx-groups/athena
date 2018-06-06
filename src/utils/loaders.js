const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const paths = require('../config/paths')
const config = require('../config/index')

// const styleLoader = require.resolve('style-loader')
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
      require('autoprefixer')({
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

// Generate loaders for standalone js/jsx and style files
function loaders(options) {
  options = options || {}

  const styleLoader = options.extract ? MiniCssExtractPlugin.loader : require.resolve('style-loader')
  const LoaderRules = {
    babel: [
      // This loader parallelizes code compilation, it is optional but
      // improves compile time on larger projects
      require.resolve('thread-loader'),
      {
        loader: require.resolve('babel-loader'),
        options: {
          // @remove-on-eject-begin
          babelrc: false,
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: !options.isProduction,
          compact: options.isProduction,
          highlightCode: true,
          presets: [
            ['@babel/preset-env', { modules: false }],
            ['@babel/preset-stage-0', { decoratorsLegacy: true }],
            '@babel/preset-react',
          ],
          plugins: [
            // '@babel/plugin-transform-runtime',
            'react-hot-loader/babel',
          ],
          // env: {
          //   test: {
          //     plugins: ['istanbul'],
          //   },
          // },
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
          modules: false,
        },
      },
      postcssLoader,
      lessLoader,
    ],
    lessModule: [
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
    return loaders
  }

  return {
    babel: generateLoaders('babel'),
    css: generateLoaders('css'),
    less: generateLoaders('less'),
    lessModule: generateLoaders('lessModule'),
  }
}


const TESTRES = {
  babel: '(js|jsx)',
  css: 'css',
  less: 'less',
  lessModule: 'less',
}

const INCLUDES = {
  babel: paths.appSrc,
  css: paths.appDirectory,
  less: paths.appNodeModules,
  lessModule: paths.appSrc,
}

module.exports = {
  loaders,
  TESTRES,
  INCLUDES,
}
