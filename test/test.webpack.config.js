const path = require('path');

module.exports = {
  entry: [
    './test/execute.entry.js'
  ],
  output: {
    path: path.resolve('./test'),
    filename: 'test.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {'modules': false}]
              ]
            }
          }
        ],
        exclude: /node_modules/,
      }
    ]
  }
};
