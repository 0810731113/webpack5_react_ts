const Webpack = require('webpack');
// const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const paths = require('../paths');

const declaredEnv = process.env.REACT_APP_ENV;
const prod = ["trial", "production", "production-b"].includes(declaredEnv);
const cdnMap = {
  development: 'de',
  production: 'gteam-a',
  'production-b': 'gteam-b',
  qa: 'qa',
  qastg: 'qastg',

};

const PUBLIC_PATH = '/web/' ;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  target: 'web',
  output: {
    filename: 'js/[name].js',
    // filename: 'assets/js/[name].[chunkhash:7].js',
    path: paths.appBuild,
    // publicPath: '/web/',
    // publicPath: `//gdc-${cdnMap[declaredEnv] || declaredEnv}-cdn.glodon.com`,
  },
  devServer: {
    compress: true,
    // stats: 'errors-only',
    // clientLogLevel: 'silent',
    open: true,
    hot: true,
    noInfo: true,
    proxy: {
      // ...require(paths.appProxySetup),
    },
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: [path.resolve('./src')],
    // historyApiFallback: {
    //   // rewrites: [{from: /^\/web/, to: '/index.html'}]
    // },
    inline: true,
    quiet: false,
    clientLogLevel: 'none',
    overlay: {
      warnings: true,
      errors: true
    },
    // openPage: 'trialPartner/tasklibrary',
    // openPage: 'web',
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    // new ErrorOverlayPlugin()
  ],
  optimization: {
    minimize: false,
    minimizer: [],
    splitChunks: {
      chunks: 'all',
      minSize: 0,
    },
  },
});
