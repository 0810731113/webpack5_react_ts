const { merge } = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const common = require('./webpack.common.js');
const paths = require('../paths');
const CopyPlugin = require('copy-webpack-plugin');
const { shouldOpenAnalyzer, ANALYZER_HOST, ANALYZER_PORT } = require('../conf');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  target: 'browserslist',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    path: paths.appBuild,
    assetModuleFilename: 'images/[name].[contenthash:8].[ext]',
    publicPath: '/web/',

  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    new CopyPlugin({
      patterns:[
        { from: path.join(process.cwd(), './public'), to: path.join(process.cwd(), './build') },
        { from: path.join(process.cwd(), './template/favicon.ico'), to: path.join(process.cwd(), './build/favicon.ico') },
      ]
    }),
    shouldOpenAnalyzer &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: ANALYZER_HOST,
        analyzerPort: ANALYZER_PORT,
      }),
  ].filter(Boolean),
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: { pure_funcs: ['console.log'] },
        },
      }),
      new CssMinimizerPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve('./template/prod.html'),
        filename: 'index.html',
        favoicon: path.resolve(process.cwd(), './template/favicon.ico'),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          removeAttributeQuotes: true
        }
      }),
    ],
    splitChunks: {
      chunks: 'initial',
      maxInitialRequests: 1,
      minSize: 30000,
      maxSize: 1204000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
  },
});
