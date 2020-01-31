const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/bh.js',
  output: {
    path: path.resolve('dist'),
    filename: 'bh.min.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
