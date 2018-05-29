const webpack = require('webpack')
const config = require('./index')
const paths = require('./paths')

module.exports = {
  entry: {
    vendor: config.dev.dll,
  },
  devtool: config.dev.devtool,
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: config.output,
    // This is the URL that app is served from. We use "/" in development.
    publicPath: config.dev.assetsPublicPath,
    filename: 'static/js/[name]-dll.[hash:8].js',
    library: '[name]_[hash]', // 必填项，将此dll包暴露到 window上
  },
  plugins: [
    new webpack.DllPlugin({
      path: paths.appDllManifest, // 必填项，存放manifest的路径
      name: '[name]_[hash]', // 必填项，manifest的name
    }),
  ],
}
