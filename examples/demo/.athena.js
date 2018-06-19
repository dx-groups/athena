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
  serviceWorker: 'src/service-worker.js',
  proxy: {},
}
