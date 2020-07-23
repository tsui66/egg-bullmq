'use strict';
const path = require('path');

/**
 * egg-bullmq default config
 * @member Config#bullmq
 * @property {String} SOME_KEY - some description
 */
exports.bullmq = {

};

exports.schedule = {
  directory: [
    path.join(__dirname, '../app/bullmq'),
  ],
};
