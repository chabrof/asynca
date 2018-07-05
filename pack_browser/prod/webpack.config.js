const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

console.log(__dirname)
module.exports = {
  entry: {
    path: path.join(__dirname, '../../src')
  },
  output: {
    filename: 'asynca.js',
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
        compact: true
      }
    }]
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true
    })
  ]
}
