'use strict';

const { Worker, QueueEvents } = require('bullmq');
const createQueue = require('./lib/bullmq');
const { createBullConnection } = require('./lib/connectRedis');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    const { app } = this;
    if (app.config.bullmq.app) {
      createQueue(app);
    }
  }

  async didReady() {
    this.app.bullmq.Worker = Worker;
    this.app.bullmq.QueueEvents = QueueEvents;
    this.app.bullmq.createBullConnection = createBullConnection;
  }
}

module.exports = AppBootHook;
