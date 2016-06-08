/* eslint-env node, mocha */
'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

/**
 * Unit tests for registerTasks function.
 */
describe('registerTasks', function () {
  gulp.on('stop', function () {
    process.exit(0); // need this call to end long running watch process
  });

  it('should generate markdown correctly.', function (done) {
    del.sync(path.normalize(__dirname + '/../../testOutput/simple/'));
    require(__dirname + '/fixtures/simple/gulpfile');
    gulp.on('task_stop', function (e) {
      if (e.task === 'simple-doc') {
        const text = fs.readFileSync(__dirname + '/../../testOutput/simple/README.md');
        assert.notEqual(text.indexOf('# A readme file'), -1, 'Could not find A readme file');
        assert.notEqual(text.indexOf('MyABCClass'), -1, 'Could not find MyABCClass');
        assert.notEqual(text.indexOf('# End of file'), -1, 'Could not find End of file');
        done();
      }
    });
    gulp.start('simple-doc');
  });

  it('should watch for changes.', function (done) {
    this.timeout(8000);

    del.sync(path.normalize(__dirname + '/../../testOutput/watch/'));
    require(__dirname + '/fixtures/watch/gulpfile');
    gulp.on('task_stop', function (e) {
      if (e.task === 'watch-watch-doc') {
        setTimeout(function () {
          const text = fs.readFileSync(__dirname + '/fixtures/watch/example/myABCClass.js', 'utf8');
          fs.writeFileSync(__dirname + '/fixtures/watch/example/myABCClass.js', text);
        }, 2000);
        setTimeout(function (finish) {
          fs.statSync(__dirname + '/../../testOutput/watch/README.md');
          finish();
        }, 4000, done);
      }
    });
    gulp.start('watch-watch-doc');
  });
});
