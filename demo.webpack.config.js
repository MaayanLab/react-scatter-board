const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = function (_env, argv) {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    devtool: isDevelopment && 'cheap-module-source-map',
    entry: './src/demo.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/js/[name].[contenthash:8].js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? 'production' : 'development',
              presets: [
                [
                  '@babel/preset-env',
                  {
                    modules: false
                  }
                ],
                '@babel/preset-react'
              ],
              plugins: [
                '@babel/plugin-transform-runtime'
              ],
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.svg$/,
          resourceQuery: /svgr/,
          use: ['@svgr/webpack'],
        },
        {
          type: 'javascript/auto',
          test: /\.(png|jpg|gif|svg|json)$/,
          resourceQuery: /url-loader/,
          loader: 'file-loader',
          options: {
            name: 'assets/media/[name].[hash:8].[ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      isProduction &&
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].[contenthash:8].css',
        chunkFilename: 'assets/css/[name].[contenthash:8].chunk.css'
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/demo.html'),
        inject: true
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        )
      })
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              comparisons: false
            },
            mangle: {
              safari10: true
            },
            output: {
              comments: false,
              ascii_only: true
            },
            warnings: false
          }
        }),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 0,
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `${cacheGroupKey}.${packageName.replace('@', '')}`;
            }
          },
          common: {
            minChunks: 2,
            priority: -10
          }
        }
      },
      runtimeChunk: 'single'
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      port: 5000,
      compress: true,
      historyApiFallback: true,
      open: true,
      overlay: true
    }
  };
};