/**
 * @module configure
 * @listens MIT
 * @author nuintun
 * @description Paths configure.
 */

'use strict';

const path = require('path');

const src = path.resolve('src');
const js = path.resolve('src/js');
const css = path.resolve('src/css');
const fonts = path.resolve('src/fonts');
const images = path.resolve('src/images');

module.exports = {
  title: '收银中心',
  publicPath: '/assets/public/',
  context: path.resolve('src'),
  entryHTML: path.resolve('index.html'),
  outputPath: path.resolve('assets/public'),
  entry: [require.resolve('./bin/polyfills.js'), path.resolve('src/js/pages/App.jsx')],
  alias: {
    js,
    css,
    src,
    fonts,
    images,
    '~js': js,
    '~css': css,
    '~src': src,
    '~fonts': fonts,
    '~images': images
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    repl: 'empty',
    dgram: 'empty',
    module: 'empty',
    cluster: 'empty',
    readline: 'empty',
    child_process: 'empty'
  },
  stats: {
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    entrypoints: false,
    modules: false,
    moduleTrace: false,
    publicPath: false,
    reasons: false,
    source: false,
    timings: false
  },
  performance: {
    hints: false
  },
  recordsPath: path.resolve('node_modules/.cache/webpack/records.json'),
  sourceMapExclude: /[/\\](runtime|react|antd|antv|vendor-[^/\\]+)\.(js|css)$/i
};
