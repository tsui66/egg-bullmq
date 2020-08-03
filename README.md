# egg-bullmq

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bullmq.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bullmq
[travis-image]: https://img.shields.io/travis/Quinton/egg-bullmq.svg?style=flat-square
[travis-url]: https://travis-ci.org/Quinton/egg-bullmq
[codecov-image]: https://img.shields.io/codecov/c/github/Quinton/egg-bullmq.svg?style=flat-square
[codecov-url]: https://codecov.io/github/Quinton/egg-bullmq?branch=master
[david-image]: https://img.shields.io/david/Quinton/egg-bullmq.svg?style=flat-square
[david-url]: https://david-dm.org/Quinton/egg-bullmq
[snyk-image]: https://snyk.io/test/npm/egg-bullmq/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bullmq
[download-image]: https://img.shields.io/npm/dm/egg-bullmq.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bullmq

<!--
Description here.
-->

## 依赖说明

### 依赖的 egg 版本

egg-bullmq 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件
<!--

如果有依赖其它插件，请在这里特别说明。如

- security
- multipart

-->

## 开启插件

```js
// config/plugin.js
exports.bullmq = {
  enable: true,
  package: 'egg-bullmq',
};
```

## 使用场景

- 定时任务
- 工作流

## 目录结构 & 

```
.
├── app
│   ├── schedule
│   │   └── workflow.js
│   └── router.js
```
## 消费者
```
// /app/schedule/comsumer.js

module.exports = app => {
  return {
    schedule: {
      type: 'queue | workflow', // 扩展定时任务类型, 具体参考 [Egg.js Schedule](https://Quinton.org/zh-cn/basics/schedule.html#%E6%89%A9%E5%B1%95%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E7%B1%BB%E5%9E%8B)
      // below are self-defined args
      queue: 'speed_test',
      prefix: 'com.task.workflow',
      pattern: 'workflow',
    },
    // schedule 就是上面的 schedule
    async task(ctx, { schedule: { queueName }, msg, ackEvent }) {
      // do something stuff
    },
  };
};
```

## 详细配置

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。

## 单元测试

<!-- 描述如何在单元测试中使用此插件，例如 schedule 如何触发。无则省略。-->

## 提问交流

请到 [egg issues](https://github.com/Quinton/egg/issues) 异步交流。

## License

[MIT](LICENSE)
