const paths = require('./paths')

const { resolveApp, appPackageJson } = paths
const customedConfig = require(resolveApp('.athena.js'))

// Deal with proxy is {}
let { proxy } = customedConfig
if (proxy && Object.keys(proxy).length === 0) {
  proxy = null
}

module.exports = {
  name: require(appPackageJson).name,
  entry: customedConfig.entry ? resolveApp(customedConfig.entry) : paths.appIndexJs,
  output: paths.appBuild,

  customed: {
    babel: customedConfig.babel,
    webpack: customedConfig.webpack,
  },

  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxy,

    // Various Dev Server settings
    host: process.env.HOST || '0.0.0.0', // can be overwritten by process.env.HOST
    port: parseInt(process.env.PORT, 10) || 3000, // can be overwritten by process.env.PORT
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    // Set to `true` or `false` to always turn it on or off
    showPageSkeleton: process.env.SKELETON,
  },

  build: {
    // Template for index.html
    index: resolveApp('public/index.html'),

    // Paths
    assetsRoot: resolveApp('dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: customedConfig.publicPath || '/',
    cssFilename: 'static/css/[name].[contenthash:8].css',

    // https://webpack.js.org/configuration/devtool/#production
    devtool: 'source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `athena build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.argv.includes('--report'),
  },
}
