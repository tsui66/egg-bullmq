'use strict';

const createQueue = require('./lib/bullmq');
// const { Worker } = require('bullmq');

module.exports = agent => {
  agent.logger.info('[egg-bullmq] plugin init');

  const config = agent.config.bullmq;
  if (config.agent) {
    createQueue(agent);
  }

  class QueueStrategy extends agent.ScheduleStrategy {
    start() {
      const { schedule: { queue: queueName, worker, prefix } } = this;
      const { default: { redis } } = config;
      if (worker === 'all') {
        this.sendAll({ redis, queueName, prefix });
      } else if (worker === 'one') {
        this.sendOne({ redis, queueName, prefix });
      } else {
        throw new Error(`[egg-bullmq] unknow worker type ${worker}`);
      }
    }
  }

  agent.schedule.use('queue', QueueStrategy);

  class QueueWorkFlowStrategy extends agent.ScheduleStrategy {
    start() {
      const { schedule: { queue: queueName, worker, prefix } } = this;
      const { default: { redis } } = config;
      if (worker === 'one') {
        this.sendOne({ redis, queueName, prefix });
      } else {
        throw new Error('[egg-bullmq] workflow pattern only support `one`');
      }
    }
  }

  agent.schedule.use('workflow', QueueWorkFlowStrategy);
};
