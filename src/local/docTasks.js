/**
 * Register gulp tasks used to generate documentation using jsdoc.
 *
 * @module build-doc
 */
'use strict';

const gulp = require('gulp');
const glob = require('globby');
const os = require('os');
const fs = require('fs');
const path = require('path');
const execFile = require('child_process').execFile;

/**
 * This function is copied from https://github.com/mrjoelkemp/jsdoc3-parser
 * Locates the JSDoc executable command. Since a module is not provided,
 * `require.resolve('jsdoc')` does not work and must be done manually.
 *
 * @ignore
 * @param {String}  dir - The starting directory to search.
 * @return {String} The executable path, or null if not found.
 */
function locateJSDocCommand(dir) {
  const executable = os.platform() === 'win32' ? 'jsdoc.cmd' : 'jsdoc';
  let cmd = null;

  let folder = path.resolve(dir);

  while (folder) {
    try {
      cmd = path.join(folder, 'node_modules', '.bin', executable);
      // End the search if the command is found.
      // If not found, an exception is thrown.
      fs.statSync(cmd);
      break;
    } catch (ex) {
      cmd = null;

      // Otherwise, iterate to the parent directory, if possible.
      if (path.dirname(folder) === folder) {
        break;
      }

      folder = path.resolve(path.dirname(folder));
    }
  }

  return cmd;
}

/**
 * Execute the jsdoc command with the given inputs.
 *
 * @ignore
 * @param {String[]} files - The files to generate documentation for.
 * @param {Object} opts - The options for the command.
 * @param {Object} opts.input - Input collected in the registerTasks function.
 * @param {Function} [cb] - The function called when this function completes.
 *                          The callback signature is `cb(err)`.
 * @return {void}
 */
function executeJSDoc(files, opts, cb) {
  if (!files || !files.length) {
    return;
  }

  const cmd = locateJSDocCommand(__dirname);
  if (!cmd) {
    cb(new Error('Could not find jsdoc command.'));
    return;
  }

  const args = files.map(function (item) { return item; });
  args.push('-t');
  args.push(path.resolve(__dirname + '/markdown'));
  args.push('-d');
  args.push(opts.input.outputFile);
  args.push('-q');
  args.push('template=' + opts.input.templateFile);

  execFile(cmd, args, {}, cb);
}

/**
 * Turn source files into a documentation file.
 *
 * @ignore
 * @param {Object} opts - Options for the function.
 * @param {Object} opts.input - Input arguments collected in the registerTasks function.
 * @param {Function} [cb] - Function that is called when the function is complete.
 *                          The callback signature is `cb(err)`.
 * @return {void}
 */
function transform(opts, cb) {
  glob(opts.input.glob)
    .then(function (files) {
      executeJSDoc(files, opts, cb);
    });
}

/**
  * This function is used to notify developers of an error that occured
  * as a result of a changed file.
  *
  * @ignore
  * @param {Error} err - The error to notify the user about.
  * @param {string} title - The title for the notification window.
  * @param {string} message - The message to display in the notification window.
  * @return {void}
  */
function notify(err, title, message) {
  require('node-notifier').notify({
    title: title,
    message: message
  });

  if (err) {
    if (err.message) {
      console.log(err.message); // eslint-disable-line no-console
    } else {
      console.log(err); // eslint-disable-line no-console
    }
  }
}

/**
 * Register documentation generation tasks.
 *
 * @param {Object} opts - The configuration options.
 * @param {String|String[]} opts.glob - Glob pattern relative to the inputDir that identifies the files to document.
 * @param {String} [opts.inputDir] - The root directory that contains the files to create documentation for.
 * @param {String} [opts.templateFile] - A path to a file that is used as a template.  When provided the template will
 *                                       be written out with the first occurance of the text `{{jsdoc}}` replaced
 *                                       with the markdown that is generated.
 * @param {String} [opts.outputDir] - The output directory.
 * @param {String} opts.outputFile - The file path relative to outputDir that is written with the documentation.
 * @param {String} [opts.tasksPrefix] - An optional prefix to apply to task names.
 * @param {String[]} [opts.tasksDependencies] - Optional array of tasks names that must be completed before these registered tasks runs.
 * @returns {void}
 */
function registerTasks(opts) {
  let globParam = null;
  if (Array.isArray(opts.glob)) {
    globParam = opts.glob.map(function (value) {
      if (value[0] === '!') {
        return '!' + path.join(opts.inputDir, value.slice(1));
      }
      return path.join(opts.inputDir, value);
    });
  } else {
    if (opts.glob[0] === '!') {
      globParam = '!' + path.join(opts.inputDir, opts.glob.slice(1));
    } else {
      globParam = path.join(opts.inputDir, opts.glob);
    }
  }

  const input = {
    glob: globParam,
    inputDir: path.normalize(opts.inputDir),
    templateFile: path.resolve(opts.templateFile),
    outputDir: path.resolve(opts.outputDir),
    outputFile: path.resolve(opts.outputDir, opts.outputFile),
    tasksDependencies: opts.tasksDependencies || []
  };

  if (opts.tasksPrefix) {
    input.tasksPrefix = opts.tasksPrefix + '-';
  } else {
    input.tasksPrefix = '';
  }

  /*
   * Process the files.
   */
  gulp.task(input.tasksPrefix + 'doc', input.tasksDependencies, function (done) {
    transform({ input: input }, function (err) {
      done(err);
    });
  });

  /*
   * Watch for changes to files.
   */
  gulp.task(input.tasksPrefix + 'watch-doc', function () {
    const watch = require('gulp-watch');
    watch(input.glob, function (file) {
      console.log('watch doc: ' + file.path + ' event: ' + file.event); // eslint-disable-line no-console
      const errorHandler = function (err) {
        if (err) {
          notify(err, 'Doc Error', 'See console for details.');
        }
      };

      transform({ input: input }, errorHandler);
    });
  });
}

module.exports = registerTasks;
