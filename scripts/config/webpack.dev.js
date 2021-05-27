const Webpack = require('webpack');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const paths = require('../paths');

const filename = 'assets/js/[name].[chunkhash:7].js';
const distPath = path.resolve('build');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  target: 'web',
  output: {
    filename,
    chunkFilename: filename,
    path: distPath,
    publicPath: '/web/',
    libraryTarget: 'umd',
  },
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: [path.resolve('./src')],
    historyApiFallback: {
      rewrites: [{ from: /^\/web/, to: '/web/dev.html' }]
    },
    compress: true,
    hot: true,
    open: true,
    inline: true,
    noInfo: false,
    quiet: false,
    clientLogLevel: 'none',
    overlay: {
      warnings: true,
      errors: true
    },
    // openPage: 'trialPartner/tasklibrary',
    openPage: 'web/',
    // proxy: mode[process.env.BUILD_ENV]

  },
  plugins: [new Webpack.HotModuleReplacementPlugin(), new ErrorOverlayPlugin()],
  optimization: {
    minimize: false,
    minimizer: [],
    splitChunks: {
      chunks: 'all',
      minSize: 0,
    },
  },
});
