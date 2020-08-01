'use strict';

const assert = require('assert');
const { Queue, Worker, QueueScheduler, QueueEvents } = require('bullmq');
const { connectionStringParse, createBullConnection } = require('./connectRedis');

const KindInvokeClass = {
  queue: Queue,
  worker: Worker,
  scheduler: QueueScheduler,
  events: QueueEvents,
};

module.exports = app => {
  app.addSingleton('bullmq', createQueue);
};

function createQueue(config, app) {
  const { kind, name, prefix, redis } = config;

  assert(kind, '[egg-bullmq] kind is required on config');
  const defaultKinds = [ 'queue', 'worker', 'scheduler', 'events' ]; // From bullmq kinds
  const extendKinds = app.config.bullmq.extendKinds || [];
  assert([ ...defaultKinds, ...extendKinds ].includes(kind), '[egg-bullmq] kind is required on config');
  const redisConnectObject = connectionStringParse(redis);
  validateRedisConnectUri(redisConnectObject);

  const options = { connection: createBullConnection(kind, redis), ...config };
  const queue = new KindInvokeClass[kind](name, options);

  /* istanbul ignore next */
  queue.on('error', error => {
    app.coreLogger.error(error);
    process.exit(1);
  });

  app.beforeStart(() => {
    app.coreLogger.info(`[egg-bullmq] kind ${kind} of Queue named ${name} which prefix is ${prefix} is OK.`);
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
