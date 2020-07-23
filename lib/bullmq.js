'use strict';

const assert = require('assert');
const { Queue, Worker, QueueScheduler, QueueEvents } = require('bullmq');
const { connectionStringParse, createBullConnection } = require('./connectRedis');

const TypeInvokeFunc = {
  queue: Queue,
  worker: Worker,
  scheduler: QueueScheduler,
  events: QueueEvents,
};

module.exports = app => {
  app.addSingleton('bullmq', createQueue);
};

function createQueue(config, app) {
  const { type, name, prefix, redis } = config;

  assert(type, '[egg-bullmq] type is required on config');
  const defaultTypes = [ 'queue', 'worker', 'scheduler', 'events' ];
  const extendTypes = app.config.bullmq.extendTypes || [];
  assert([ ...defaultTypes, ...extendTypes ].includes(type), '[egg-bullmq] type is required on config');
  const redisConnectObject = connectionStringParse(redis);
  validateRedisConnectUri(redisConnectObject);

  const options = { connection: createBullConnection(type, redis), ...config };
  const queue = new TypeInvokeFunc[type](name, options);

  /* istanbul ignore next */
  queue.on('error', error => {
    app.coreLogger.error(error);
    process.exit(1);
  });

  app.beforeStart(() => {
    app.coreLogger.info(`[egg-bullmq] Type ${type} of Queue named ${name} which prefix is ${prefix} is OK.`);
  });

  return queue;
}

function validateRedisConnectUri(redisConnectObject) {
  assert(
    [ 'redis', 'rediss', 'redis-socket', 'redis-sentinel' ].includes(redisConnectObject.scheme),
    '[egg-bullmq] schema of redis are required on config'
  );
  for (const item of redisConnectObject.hosts) {
    assert(
      item.host,
      '[egg-bullmq] host of redis are required on config'
    );
    assert(
      item.port,
      '[egg-bullmq] port of redis are required on config'
    );
  }
  assert(
    redisConnectObject.path.length > 0,
    '[egg-bullmq] path of redis are required on config'
  );
}
