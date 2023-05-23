import path from 'path';

export default function (_env, argv) {
  return {
    mode: 'production',
    entry: './src/react_scatter_board.jsx',
    output: {
      path: path.resolve('react_scatter_board'),
      filename: 'react_scatter_board.js',
      library: 'react_scatter_board',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          resolve: {
            fullySpecified: false,
          },
          use: {
            loader: 'babel-loader',
            options: {
              envName: 'production',
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
                '@babel/plugin-transform-runtime',
                'dynamic-import-webpack',
                'remove-webpack'
              ],
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          // resourceQuery: /url-loader/,
          use: {
            loader: 'url-loader',
          }
        },
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    }
  };
};