const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env = {}, argv = {}) => {
  const target = env.target === 'firefox' ? 'firefox' : 'chrome';
  const manifestFile = target === 'firefox' ? 'public/manifest.firefox.json' : 'public/manifest.json';
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      app: './src/index.tsx',
      background: './src/background.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist', target),
      filename: '[name].js',
      clean: true,
      globalObject: 'self',
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
          use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'app.html',
        chunks: ['app'],
      }),
      ...(isProduction ? [new MiniCssExtractPlugin({ filename: 'styles.css' })] : []),
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
