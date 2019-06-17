require('webpack');
require('babel-core/register');
const path = require('path');

const webpackConfig = {
  entry: {
    'build/ongaq': './src/api.js'
  },
  output: {
    path: path.resolve('./')
  },
  mode: "production"
};


module.exports = webpackConfig;
