require('webpack');
require('babel-core/register');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');

const webpackConfig = {
  entry: {
    'build/ongaq': './src/api.js'
  },
  output: {
    path: path.resolve('./')
  },
  plugins: [
    // new HardSourceWebpackPlugin()
  ],
  mode: "production"
};


module.exports = webpackConfig;
