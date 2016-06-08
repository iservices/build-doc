/**
 * The entry point for this package.
 */
'use strict';

const tasks = require('./src/local/docTasks');

module.exports = {
  registerTasks: tasks
};
