/**
 * The entry point for this package.
 *
 * @ignore
 */
'use strict';

const tasks = require('./local/docTasks');

module.exports = {
  registerTasks: tasks
};
