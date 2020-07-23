'use strict';

exports.keys = '123456';

exports.bullmq = {
  app: true,
  clients: {
    byte: { type: 'queue', name: 'byte', prefix: 'bull.demo' },
    dance: { type: 'scheduler', name: 'dance', prefix: 'bull.demo' },
  },
  default: {
    redis: 'redis://localhost:6379/0',
  },
};
