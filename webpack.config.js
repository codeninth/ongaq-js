require('webpack');
require('babel-core/register');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = {
  entry: {
    'build/ongaq': './src/api.js'
  },
  output: {
    path: path.resolve('./')
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  mode: "production"
}
