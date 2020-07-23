# egg-bullmq

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bullmq.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bullmq
[travis-image]: https://img.shields.io/travis/eggjs/egg-bullmq.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-bullmq
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-bullmq.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-bullmq?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-bullmq.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bullmq
[snyk-image]: https://snyk.io/test/npm/egg-bullmq/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bullmq
[download-image]: https://img.shields.io/npm/dm/egg-bullmq.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bullmq

<!--
Description here.
-->

## Install

```bash
$ npm i egg-bullmq --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.bullmq = {
  enable: true,
  package: 'egg-bullmq',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.bullmq = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
