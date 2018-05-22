module.exports = {
  entry: 'src/index.js',
  babel: {
    presets: [
      "es2015",
      "react",
      "stage-0"
    ],
    plugins: [
      "transform-runtime"
    ],
    env: {
      test: {
        plugins: [ "istanbul" ]
      }
    }
  },
  webpack: {},
  proxy: {}
}
