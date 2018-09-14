# jquery.resizeend

[![Build Status](https://travis-ci.org/nielse63/jquery.resizeend.svg?branch=master)](https://travis-ci.org/nielse63/jquery.resizeend)
[![devDependencies Status](https://david-dm.org/nielse63/jquery.resizeend/dev-status.svg)](https://david-dm.org/nielse63/jquery.resizeend?type=dev)
[![Code Climate](https://codeclimate.com/github/nielse63/jquery.resizeend/badges/gpa.svg)](https://codeclimate.com/github/nielse63/jquery.resizeend)
[![NPM version](https://badge.fury.io/js/jquery.resizeend.svg)](http://badge.fury.io/js/jquery.resizeend)
[![npm](https://img.shields.io/npm/dt/jquery.resizeend.svg?style=flat-square)](https://www.npmjs.com/package/jquery.resizeend)
[![Greenkeeper badge](https://badges.greenkeeper.io/nielse63/jquery.resizeend.svg)](https://greenkeeper.io/)

A jQuery plugin that allows for window resize-end event handling.

## Installation

### With `yarn`

```sh
yarn add jquery.resizeend
```

### With `npm`

```sh
npm install jquery.resizeend
```

### In the browser

Reference your local script:

```html
<script src="node_modules/jquery.resizeend/lib/jquery.resizeend.min.js"></script>
```

Or load the script via jsdelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/jquery.resizeend@latest/lib/jquery.resizeend.min.js"></script>
```

## Usage

```js
$(window).on('resizeend', function(e) {
  // ...
});
```

## Contributing

Fork the repo and clone locally, then run:

```sh
yarn install
```

This will install the `devDependencies` packages and build the `dist` folder.

Once you've made your desired changes, make sure to write any new tests for
your feature and run the tests:

```sh
yarn run lint # lints js

yarn test     # runs test suite
```

If all tests pass, [create a pull request](https://github.com/nielse63/jquery.resizeend/pulls).

## License

This plugin is licensed under the [MIT license](http://opensource.org/licenses/MIT).
