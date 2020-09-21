/**
 * @module loaders
 * @listens MIT
 * @author nuintun
 * @description Get webpack loaders.
 */

'use strict';

const theme = require('../../theme');
const { context } = require('../configure');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');

const sourceMap = process.env.NODE_ENV !== 'production';
const localIdentName = sourceMap ? '[local]-[hash:base64:6]' : '[hash:base64:6]';

module.exports = (hot = false) => {
  return [
    // The loader for js
    {
      test: /\.jsx?$/i,
      exclude: /[/\\]node_modules[/\\]/,
      use: [{ loader: 'babel-loader', options: { highlightCode: true, cacheDirectory: true } }]
    },
    // The loader for css
    {
      test: /\.css$/i,
      sideEffects: true,
      exclude: /\.module\.css$/i,
      use: [
        {
          loader: ExtractCssChunks.loader,
          options: { hot, reloadAll: hot }
        },
        { loader: 'css-loader', options: { sourceMap, importLoaders: 1 } },
        { loader: 'postcss-loader', options: { sourceMap } }
      ]
    },
    // The loader for css module
    {
      test: /\.module\.css$/i,
      exclude: /[/\\]node_modules[/\\]/,
      use: [
        {
          loader: ExtractCssChunks.loader,
          options: { hot, reloadAll: hot }
        },
        {
          loader: 'css-loader',
          options: { sourceMap, importLoaders: 1, modules: { localIdentName }, localsConvention: 'camelCaseOnly' }
        },
        { loader: 'postcss-loader', options: { sourceMap } }
      ]
    },
    // The loader for less
    {
      test: /\.less$/i,
      sideEffects: true,
      exclude: /\.module\.less$/i,
      use: [
        {
          loader: ExtractCssChunks.loader,
          options: { hot, reloadAll: hot }
        },
        { loader: 'css-loader', options: { sourceMap, importLoaders: 2 } },
        { loader: 'postcss-loader', options: { sourceMap } },
        { loader: 'less-loader', options: { modifyVars: theme, sourceMap, javascriptEnabled: true } }
      ]
    },
    // The loader for less module
    {
      test: /\.module\.less$/i,
      exclude: /[/\\]node_modules[/\\]/,
      use: [
        {
          loader: ExtractCssChunks.loader,
          options: { hot, reloadAll: hot }
        },
        {
          loader: 'css-loader',
          options: { sourceMap, importLoaders: 2, modules: { localIdentName }, localsConvention: 'camelCaseOnly' }
        },
        { loader: 'postcss-loader', options: { sourceMap } },
        { loader: 'less-loader', options: { modifyVars: theme, sourceMap, javascriptEnabled: true } }
      ]
    },
    // The loader for assets
    {
      test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot)$/i,
      use: [{ loader: 'url-loader', options: { limit: 8192, context, esModule: false, name: '[path][name]-[hash:8].[ext]' } }]
    }
  ];
};
