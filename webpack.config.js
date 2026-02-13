const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env = {}) => {
  const target = env.target === 'firefox' ? 'firefox' : 'chrome';
  const manifestFile = target === 'firefox' ? 'public/manifest.firefox.json' : 'public/manifest.json';

  return {
    entry: {
      app: './src/index.tsx',
      background: './src/background.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist', target),
      filename: '[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      fallback: {
        net: false,
        tls: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'app.html',
        chunks: ['app'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: manifestFile, to: 'manifest.json' },
          { from: 'public/icons', to: 'icons', noErrorOnMissing: true },
        ],
      }),
    ],
    optimization: {
      splitChunks: false,
    },
  };
};
