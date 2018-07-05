const path = require('path');

module.exports = {
  mode: "development",
  entry: {
    path: path.join(__dirname, '../../src')
  },
  output: {
    filename: 'asynca.debug.js',
    path: path.join(__dirname, '../../dist/browser'),
    libraryTarget: "umd"
  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        compact: false
      }
    }]
  }
}
