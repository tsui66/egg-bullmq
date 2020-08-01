'use strict';

const assert = require('assert');
const createQueue = require('./lib/bullmq');
const { Worker } = require('bullmq');
const { createBullConnection } = require('./lib/connectRedis');

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
      const { default: { redis: connection }, client, clients } = config;
      if (!client && !clients) {
        throw new Error('[egg-bullmq] Either `client` or `clients` must be provided in config');
      }
      const workflowConfig = client ? client : clients.workflow;
      assert(workflowConfig.kind, '[egg-bullmq] kind is required on config');
      const redisInstance = createBullConnection(workflowConfig.kind, connection);
      const worker = new Worker(queueName, async job => {
        if (job.data.length > 0) {
          agent.coreLogger.info('[egg-bullmq] there is non job data passed, default pass');
          return;
        }
        if (schedule.worker === 'all') {
          this.sendAll({ schedule, job });
        } else if (schedule.worker === 'one') {
          this.sendOne({ schedule, job });
        } else {
          throw new Error(`[egg-bullmq] unknow worker kind ${schedule.worker}`);
        }
      }, { connection: redisInstance, prefix });
      agent.coreLogger.info(`[egg-bullmq] Worker named: ${worker.name} has worked`);
    }
  }

  agent.schedule.use('queue', QueueStrategy);

  class QueueWorkFlowStrategy extends agent.ScheduleStrategy {
    async start() {
      const { schedule } = this;
      const { schedule: { queue: queueName, prefix } } = this;
      const { default: { redis: connection }, client, clients } = config;
      if (!client && !clients) {
        throw new Error('[egg-bullmq] Either `client` or `clients` must be provided in config');
      }
      const workflowConfig = client ? client : clients.workflow;
      assert(workflowConfig.kind, '[egg-bullmq] kind is required on config');
      const redisInstance = createBullConnection(workflowConfig.kind, connection);
      const worker = new Worker(queueName, async job => {
        if (job.data.length > 0) {
          agent.coreLogger.info('[egg-bullmq] there is non job data passed, default pass');
          return;
        }
        const emitterId = `${job.queue.keys.id}:${job.id}`;
        const emitCompleted = `${emitterId}:completed`;
        const emitProgress = `${emitterId}:updateProgress`;
        const emitRemoved = `${emitterId}:removed`;
        const emitter = { emitCompleted, emitProgress, emitRemoved };
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
        // when remove a job, notify all workers clear timers
        agent.on('removed', job => {
          agent.coreLogger.info(`[egg-bullmq] Job id: ${job.id} has been removed`);
          agent.messenger.sendToApp(emitRemoved, job);
        });
      }, { connection: redisInstance, prefix });
      agent.coreLogger.info(`[egg-bullmq] Worker named: ${worker.name} has worked`);
      // agent.messenger.on('bullmq_ack', data => {});
    }
  }

  agent.schedule.use('workflow', QueueWorkFlowStrategy);
};
