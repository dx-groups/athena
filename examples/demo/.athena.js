const path = require('path')
module.exports = {
  entry: 'src/index.js',
  babel: {},
  webpack: {
    dev: {},
    prod: {
      externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
      },
    },
    vendor: [],
    dll: [
      'react',
      'react-dom',
    ],
  },
  proxy: {},
  serviceWorker: {
    swSrc: path.resolve(__dirname, 'src/service-worker.js')
  }
}
