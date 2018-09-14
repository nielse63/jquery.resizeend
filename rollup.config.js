import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies || {});

const plugins = [
  babel(),
];

export default {
  input: 'src/index.js',
  plugins,
  external,
  output: [{
    file: pkg.main,
    format: 'umd',
    moduleName: pkg.name,
    sourceMap: true,
  }],
};
