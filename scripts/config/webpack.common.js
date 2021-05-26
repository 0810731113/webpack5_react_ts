const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBar = require('webpackbar');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const paths = require('../paths');
const { isDevelopment, isProduction } = require('../env');
const { imageInlineSizeLimit } = require('../conf');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const Dotenv = require('dotenv-webpack');

const { srcArr } = require('../getSrcDir');
const srcDirObj = {};
srcArr.map(item => {
  srcDirObj[item] = path.resolve(process.cwd(), `src/${item}`);
});

console.log(`srcDirObj`);
console.log(srcDirObj);

const getCssLoaders = (importLoaders) => [
  isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      modules: false,
      sourceMap: isDevelopment,
      importLoaders,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          require('postcss-flexbugs-fixes'),
          isProduction && [
            'postcss-preset-env',
            {
              autoprefixer: {
                grid: true,
                flexbox: 'no-2009',
              },
              stage: 3,
            },
          ],
        ].filter(Boolean),
      },
    },
  },
];

module.exports = {
  entry: {
    app: paths.appIndex,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': paths.appSrc,
      src: paths.appSrc,
      consts: path.resolve(process.cwd(), './src/consts'),
      api: path.resolve(process.cwd(), './src/api'),
      page: path.resolve(process.cwd(), './src/page'),
      AppPanel: path.resolve(process.cwd(), './src/AppPanel'),
      style: path.resolve('./src/AppPanel'),
      component: paths.appSrcComponent,
      util: paths.appSrcUtil,
      ...srcDirObj,
    },
  },
  externals: {
    // react: 'React',
    // 'react-dom': 'ReactDOM',
    // axios: 'axios',
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: getCssLoaders(1),
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        }],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'file-loader',
        exclude: /node_modules/,
        options: {
          name: 'assets/image/[name].[ext]?[hash:7]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'file-loader',
        exclude: /node_modules/,
        options: {
          name: 'assets/media/[name].[ext]?[hash:7]',
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'file-loader',
        exclude: /node_modules/,
        options: {
          name: 'assets/font/[name].[ext]?[hash:7]'
        }
      }
    ],
  },
  plugins: [
    new InterpolateHtmlPlugin({
      NODE_ENV: 'development',
      PUBLIC_URL: '1111333666',
    }),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      cache: true,
    }),
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        {
          context: paths.appPublic,
          from: '*',
          to: paths.appBuild,
          toType: 'dir',
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new WebpackBar({
      name: isDevelopment ? 'RUNNING' : 'BUNDLING',
      color: isDevelopment ? '#52c41a' : '#722ed1',
    }),
    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     // configFile: paths.appTsConfig,
    //   },
    // }),
  ],
};
