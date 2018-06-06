const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const InterpolateHtmlPlugin = require('../utils/react-dev/InterpolateHtmlPlugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
// const PrepackWebpackPlugin = require('prepack-webpack-plugin').default

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const paths = require('./paths')
const { getClientEnvironment } = require('./env')
const config = require('./index')
const baseWebpackConfig = require('./webpack.base.conf')
const { generalLoaders } = require('../utils/generalpacks')
// const { happyLoaders, happyPlugins } = require('../utils/happypacks')

// process.traceDeprecation = true

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1)
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.')
}


const vendorChunks = config.build.vendor
  .reduce((a, c) => ({
    ...a,
    [c]: {
      name: c,
      chunks: 'all',
      minChunks: 1,
      priority: -5,
      // reuseExistingChunk: true,
      test(module) {
        // any required modules inside node_modules are extracted to vendor
        const { resource } = module
        return (
          resource &&
          /\.js$/.test(resource) &&
          resource.indexOf(paths.resolveApp('node_modules')) >= 0 &&
          resource.indexOf(c) >= 0
        )
      },
    },
  }), {})
// const vendorChunks = {
//     [config.build.vendor.join('-')]: {
//       name: config.build.vendor.join('-'),
//       chunks: 'all',
//       minChunks: 1,
//       priority: -5,
//       // reuseExistingChunk: true,
//       test(module) {
//         // any required modules inside node_modules are extracted to vendor
//         const { resource } = module
//         return (
//           resource &&
//           /\.js$/.test(resource) &&
//           resource.indexOf(paths.resolveApp('node_modules')) >= 0 &&
//           config.build.vendor.some(m => resource.indexOf(m) >= 0)
//         )
//       }
//     }
//   }


// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: config.build.devtool,
  // In production, we only want to load the polyfills and the app code.
  entry: [require.resolve('./polyfills'), config.entry],
  output: {
    // The build folder.
    path: config.output,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: config.build.jsFilename,
    chunkFilename: config.build.jsChunkFilename,
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: config.build.assetsPublicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),
  },
  module: {
    rules: generalLoaders({ extract: true, isProduction: true }),
    // rules: happyLoaders({ extract: true, isProduction: true }),
  },
  plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer',
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      as: 'script',
      include: 'allChunks',
      fileBlacklist: [/\.(css|map)$/, /base?.+/],
    }),
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In production, it will be an empty string unless you specify "homepage"
    // in `package.json`, in which case it will be the pathname of that URL.
    new InterpolateHtmlPlugin(env.raw),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),

    // extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: config.build.cssFilename,
      // chunkFilename: config.build.cssChunkFilename,
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: config.build.assetsPublicPath,
    }),
    // Generate a service worker script that will precache, and keep up to date,
    // the HTML & assets that are part of the Webpack build.
    new SWPrecacheWebpackPlugin({
      // By default, a cache-busting query parameter is appended to requests
      // used to populate the caches, to ensure the responses are fresh.
      // If a URL is already hashed by Webpack, then there is no concern
      // about it being stale, and the cache-busting can be skipped.
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          // This message occurs for every build and is a bit too noisy.
          return
        }
        if (message.indexOf('Skipping static resource') === 0) {
          // This message obscures real errors so we ignore it.
          // https://github.com/facebookincubator/create-react-app/issues/2612
          return
        }
        console.log(message)
      },
      minify: true,
      // For unknown URLs, fallback to the index page
      navigateFallback: `${publicUrl}/index.html`,
      // Ignores URLs starting from /__ (useful for Firebase):
      // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      // Don't precache sourcemaps (they're large) and build asset manifest:
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // To make JavaScript code run faster
    // new PrepackWebpackPlugin()
  ],
  optimization: {
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    splitChunks: {
      // name: 'vendor',
      cacheGroups: {
        default: {
          chunks: 'initial',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          name: 'vendor',
          chunks: 'all',
          // reuseExistingChunk: true,
          test(module) {
            // any required modules inside node_modules are extracted to vendor
            const { resource } = module
            // console.log('** vendor **', resource)
            return (
              resource &&
              /\.js$/.test(resource) &&
              resource.indexOf(paths.resolveApp('node_modules')) >= 0 &&
              config.build.vendor.every(m => resource.indexOf(m) < 0)
            )
          },
        },
        ...vendorChunks,
        styles: {
          name: 'styles',
          test: /\.(less|css)$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    // Keep the runtime chunk seperated to enable long term caching
    // https://twitter.com/wSokra/status/969679223278505985
    runtimeChunk: true,
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    concatenateModules: true, // ModuleConcatenationPlugin
  },
}, config.customed.webpack.prod)

if (config.build.bundleAnalyzerReport) {
  // Webpack dashboard
  const Jarvis = require('webpack-jarvis')
  const openBrowser = require('react-dev-utils/openBrowser')
  webpackConfig.plugins.push(new Jarvis())
  openBrowser('localhost:1337')

  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
