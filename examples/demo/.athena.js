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
  serviceWorker: 'src/service-worker.js'
}
