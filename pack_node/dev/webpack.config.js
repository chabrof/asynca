const path = require('path');

console.log('path', path.join(__dirname, '../../dist'))
module.exports = {
  entry: {
    path: path.join(__dirname, '../../src')
  },
  output: {
    filename: 'asynca.debug.js',
    path: path.join(__dirname, '../../dist/node'),
    libraryTarget: "commonjs2"
  },
  target: 'node',
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
};
