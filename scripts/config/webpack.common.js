//const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackBar = require('webpackbar');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { projectEnv } = require('../processEnv');
const paths = require('../paths');
const { isDevelopment, isProduction } = require('../env');
const { imageInlineSizeLimit } = require('../conf');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');

const { srcArr } = require('../getSrcDir');
const srcDirObj = {};
srcArr.map(item => {
  srcDirObj[item] = path.resolve(process.cwd(), `src/${item}`);
});
const Dotenv = require('dotenv-webpack');
// console.log(`srcDirObj`);
// console.log(srcDirObj);

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
  output: {
    // publicPath: '/',
    // libraryTarget: 'umd',
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
      // util: paths.appSrcUtil,
      ...srcDirObj,
    },
    fallback: { crypto: false },
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
        use: ['style-loader','css-loader' ,'sass-loader'],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader','css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  "@primary-color": "#13C2C2", // for example, you use Ant Design to change theme color.
                },
              },
            },
          },
        ],
      },
      // {
      //   test: /\.scss$/,
      //   loader: ExtractTextPlugin.extract({
      //     use:['css-loader', 'sass-loader'],
      //     fallback: 'style-loader',
      //   }) ,
      //   include: [path.resolve(process.cwd(),'./public'),path.resolve(process.cwd(),'./src')],
      // },
      // {
      //   test: /\.css$/,
      //   loader  : ExtractTextPlugin.extract({
      //     use:['css-loader', 'sass-loader'],
      //     fallback: 'style-loader',
      //   }),
      //   include : [path.resolve(process.cwd(),'./public'),path.resolve(process.cwd(),'./src')],
      // },
      // {
      //   test: /\.less$/,
      //   loader  : ExtractTextPlugin.extract({
      //     use:['css-loader', 'less-loader'],
      //     fallback: 'style-loader',
      //   }),
      //   include : [path.resolve(process.cwd(),'./public'),path.resolve(process.cwd(),'./src')],
      // },
      // {
      //   test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      //   loader: 'file-loader',
      //   exclude: /node_modules/,
      //   options: {
      //     name: 'assets/images/[name].[ext]',
      //   },
      // },
      // {
      //   test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      //   loader: 'file-loader',
      //   exclude: /node_modules/,
      //   options: {
      //     name: 'assets/media/[name].[ext]?[hash:7]',
      //   }
      // },
      // {
      //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      //   loader: 'file-loader',
      //   exclude: /node_modules/,
      //   options: {
      //     name: 'assets/font/[name].[ext]?[hash:7]'
      //   },
      // },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new InterpolateHtmlPlugin({
      // NODE_ENV: 'development',
      // PUBLIC_URL: '1111333666',
      ...projectEnv,
    }),
    new Dotenv({
      path: `.env.${process.env.NODE_ENV}`,
    }),
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       context: paths.appPublic,
    //       from: '*',
    //       to: paths.appBuild,
    //       toType: 'dir',
    //       globOptions: {
    //         dot: true,
    //         gitignore: true,
    //         ignore: ['**/index.html'],
    //       },
    //     },
    //   ],
    // }),
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       context: paths.appPublic,
    //       from: path.join(process.cwd(), './public'),
    //       to: paths.appBuild,
    //       toType: 'dir',
    //       // globOptions: {
    //       //   dot: true,
    //       //   gitignore: true,
    //       //   ignore: ['**/index.html'],
    //       // },
    //     },
    //   ],
    // }),
    // new CopyPlugin({
    //   patterns:[
    //     { from: path.join(process.cwd(), './public'), to: path.join(process.cwd(), './build/web') },
    //     { from: path.join(process.cwd(), './template/favicon.ico'), to: path.join(process.cwd(), './build/favicon.ico') },
    //   ]
    // }),
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
