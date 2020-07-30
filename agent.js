'use strict';

const createQueue = require('./lib/bullmq');
const { Worker } = require('bullmq');

module.exports = agent => {
  agent.logger.info('[egg-bullmq] plugin init');

  const config = agent.config.bullmq;
  if (config.agent) {
    createQueue(agent);
  }

  class QueueStrategy extends agent.ScheduleStrategy {
    start() {
      const { schedule } = this;
      const { schedule: { queue: queueName, prefix } } = this;
      const { default: { redis: connection } } = config;
      const worker = new Worker(queueName, async job => {
        agent.coreLogger.info('[egg-bullmq] using egg-bullmq plugin to connect RabbitMQ append to an issue');
        if (job.data.length > 0) {
          agent.coreLogger.info('[egg-bullmq] there is non job data passed, default pass');
          return;
        }
        if (schedule.worker === 'all') {
          this.sendAll({ schedule, job });
        } else if (schedule.worker === 'one') {
          this.sendOne({ schedule, job });
        } else {
          throw new Error(`[egg-bullmq] unknow worker type ${schedule.worker}`);
        }
      }, { connection, prefix });
      agent.coreLogger.info(`[egg-bullmq] Worker named: ${worker.name} has worked`);
    }
  }

  agent.schedule.use('queue', QueueStrategy);

  class QueueWorkFlowStrategy extends agent.ScheduleStrategy {
    async start() {
      const { schedule } = this;
      const { schedule: { queue: queueName, prefix } } = this;
      const { default: { redis: connection } } = config;
      const worker = new Worker(queueName, async job => {
        if (job.data.length > 0) {
          agent.coreLogger.info('[egg-bullmq] there is non job data passed, default pass');
          return;
        }
        const emitterId = `${job.queue.keys.id}:${job.id}`;
        const emitCompleted = `${emitterId}:completed`;
        const emitProgress = `${emitterId}:updateProgress`;
        const emitter = { emitCompleted, emitProgress };
        if (schedule.worker === 'one') {
          this.sendOne({ schedule, job, emitter });
        } else {
          throw new Error('[egg-bullmq] workflow pattern only support `one`');
        }
        // updateProgress
        agent.messenger.on(emitProgress, async progress => {
          if (progress) {
            progress = parseFloat(progress);
          } else {
            // TODO SOME STUFF
          }
          job.updateProgress(progress);
        });
        // await one job completed
        await new Promise(resolve => {
          agent.messenger.on(emitCompleted, resolve);
        });
      }, { connection, prefix });
      agent.coreLogger.info(`[egg-bullmq] Worker named: ${worker.name} has worked`);
      // agent.messenger.on('bullmq_ack', data => {});
    }
  }

  agent.schedule.use('workflow', QueueWorkFlowStrategy);
};
