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
      const { schedule } = this;
      const { default: { redis } } = config;
      if (schedule.worker === 'all') {
        this.sendAll(Object.assign({}, schedule, { redis }));
      } else if (schedule.worker === 'one') {
        this.sendOne(Object.assign({}, schedule, { redis }));
      } else {
        throw new Error(`[egg-bullmq] unknow worker type ${schedule.worker}`);
      }
    }
  }

  agent.schedule.use('queue', QueueStrategy);

  class QueueWorkFlowStrategy extends agent.ScheduleStrategy {
    start() {
      const { schedule } = this;
      const { default: { redis } } = config;
      if (schedule.worker === 'one') {
        this.sendOne(Object.assign({}, schedule, { redis }));
      } else {
        throw new Error('[egg-bullmq] workflow pattern only support `one`');
      }
    }
  }

  agent.schedule.use('workflow', QueueWorkFlowStrategy);
};
