const path = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV;
const prod = env === 'production';

function resolve(dir) {
  return path.join(__dirname, dir);
}

const plugins = [
  new webpack.DefinePlugin({
    'process.env': env,
  }),
];

if (prod) {
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      uglifyOptions: {
        ie8: false,
        ecma: 5,
        compress: true,
        output: {
          comments: false,
          beautify: false,
        },
      },
    }),
  );
}

module.exports = {
  entry: './src/resizeend.js',
  output: {
    path: resolve('lib'),
    filename: prod ? 'resizeend.min.js' : 'resizeend.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')],
      },
    ],
  },
  plugins,
};
