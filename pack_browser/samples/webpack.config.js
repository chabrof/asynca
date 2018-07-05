let devConfig = require('../dev/webpack.config')
const CopyWebpackPlugin = require("copy-webpack-plugin")

const path = require('path')

devConfig.entry = {
  simpleSample: path.join(__dirname, '../../samples/simpleSample.js'), // change entry path
  combiSample: path.join(__dirname, '../../samples/combiSample.js')
}
devConfig.output.path = path.join(__dirname, '../../dist/samples')
devConfig.output.filename = undefined
devConfig.plugins = devConfig.plugins || []
devConfig.plugins.push(
  new CopyWebpackPlugin([{ from: path.join(__dirname, '../../samples/*.html'), flatten: true }])
)

module.exports = devConfig
