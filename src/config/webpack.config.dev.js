

const webpack = require('webpack')
const merge = require('webpack-merge')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('../utils/react-dev/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('../utils/react-dev/WatchMissingNodeModulesPlugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
// const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

const { getClientEnvironment } = require('./env')
const config = require('./index')
const paths = require('./paths')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
// const StyleLintPlugin = require('stylelint-webpack-plugin')

const { generalLoaders } = require('../utils/generalpacks')
// const { happyLoaders, happyPlugins } = require('../utils/happypacks')

// process.traceDeprecation = true

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = ''
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: config.dev.devtool,
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // Include an alternative client for WebpackDevServer. A client's job is to
    // connect to WebpackDevServer by a socket and get notified about changes.
    // When you save a file, the client will either apply hot updates (in case
    // of CSS changes), or refresh the page (in case of JS changes). When you
    // make a syntax error, this client will display a syntax error overlay.
    // Note: instead of the default WebpackDevServer client, we use a custom one
    // to bring better experience for Create React App users. You can replace
    // the line below with these two lines if you prefer the stock client:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    require.resolve('react-dev-utils/webpackHotDevClient'),
    // We ship a few polyfills by default:
    require.resolve('./polyfills'),
    // Errors should be considered fatal in development
    require.resolve('react-error-overlay'),
    // Finally, this is your app's code:
    config.entry,
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: config.output,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    // Webpack uses `publicPath` to determine where the app is being served from.
    // In development, we always serve from the root. This makes config easier.
    publicPath: config.dev.assetsPublicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },

  module: {
    rules: generalLoaders({ extract: false, isProduction: false }),
    // rules: happyLoaders({ extract: false, isProduction: false }),
  },
  // plugins: happyPlugins({ extract: false, isProduction: false }).concat(
  plugins: (
    config.dev.dll.length > 0 ? [
      new webpack.DllReferencePlugin({
        manifest: require(paths.appDllManifest),
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
      new AddAssetHtmlPlugin({
        filepath: path.resolve(paths.appBuild, 'static/js/*-dll.*.js'),
      }),
    ] : [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
    ]).concat([
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin(env.raw),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebook/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebook/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: config.dev.assetsPublicPath,
    }),
    // Warns when your bundle contains multiple versions of the same package
    // new DuplicatePackageCheckerPlugin(),

    // new StyleLintPlugin({
    //   files: ['src/**/*.less', 'src/**/*.css'],
    // }),
  ]),
  optimization: {
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    splitChunks: {
      chunks: 'all',
      name: 'vendors',
    },
    // Keep the runtime chunk seperated to enable long term caching
    // https://twitter.com/wSokra/status/969679223278505985
    runtimeChunk: true,
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
}, config.customed.webpack.dev)

// if (config.dev.showPageSkeleton) {
//   const { SkeletonPlugin } = require('page-skeleton-webpack-plugin')
//   devWebpackConfig.plugins.push(new SkeletonPlugin({
//     pathname: paths.resolveApp('shell'), // 用来存储 shell 文件的地址
//     staticDir: config.output, // 最好和 `output.path` 相同
//     routes: ['/'],
//     port: '7890',
//     loading: 'chiaroscuro',
//     svg: {
//       color: '#EFEFEF',
//       shape: 'circle',
//       shapeOpposite: ['.Rating-gray_1kpffd5_0 svg'],
//     },
//     image: {
//       shape: 'rect', // `rect` | `circle`
//       color: '#EFEFEF',
//       shapeOpposite: ['.mint-swipe-items-wrap img'],
//     },
//     pseudo: {
//       color: '#EFEFEF', // or transparent
//       shape: 'circle', // circle | rect
//       shapeOpposite: ['.delivery-icon-hollow_3q8_B5r_0', '.index-premium_39rl0v9'],
//     },
//     button: {
//       color: '#EFEFEF',
//       excludes: ['.mint-swipe-items-wrap a'],
//     },
//     defer: 5000,
//     excludes: [],
//     remove: [],
//     hide: ['.index-dashedline_7B79b3W', '.Rating-actived_GBtiHkB_0'],
//     grayBlock: ['#header'],
//     cssUnit: 'rem',
//     headless: true,
//     // minify: false,
//     noInfo: false,
//   }))
// }

if (config.serviceWorker) {
  const WorkBoxPlugin = require('workbox-webpack-plugin')
  const SwRegisterWebpackPlugin = require('sw-register-webpack-plugin')

  devWebpackConfig.plugins.push(
    new WorkBoxPlugin.InjectManifest({
      swSrc: config.serviceWorker.swSrc
    })
  )

  devWebpackConfig.plugins.push(
    new SwRegisterWebpackPlugin({
      version: +new Date()
    })
  )
}

module.exports = devWebpackConfig
