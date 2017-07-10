import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies || {});

const plugins = [
  babel(),
];

export default {
  entry: 'src/index.js',
  plugins,
  external,
  targets: [{
    dest: pkg.main,
    format: 'umd',
    moduleName: pkg.name,
    sourceMap: true,
  }],
};
