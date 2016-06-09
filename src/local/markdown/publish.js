/* eslint-disable no-var */
/**
 * The module that is loaded by the jsdoc tool.
 *
 * @ignore
 * @module publish
 */
'use strict';

var graft = require('./graft');
var print = require('./print');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

/**
 * Called by the jsdoc tool to create a markdown document.
 * @param {TaffyDB} data - The jsdoc data.
 * @param {Object} [options] - Options for the function.
 * @param {String} [options.destination] - The destination for the markdown that is created.
 * @param {String} [options.template] - A path to a file that is used as a template.  When provided the
 * template will be written out with the first occurance of the text `{{jsdoc}}` replaced with
 * the markdown that is generated.
 * @return {void}
 */
exports.publish = function (data, options) {
  var opts = options || {};
  var root = {};
  var docs;
  var insert = -1;
  var template = '';
  var out = null;
  var destination = opts.destination;

  if (!opts.destination) {
    throw new Error('destination must be provided in the provided options.');
  }

  // setup output stream
  mkdirp.sync(path.dirname(opts.destination));

  if (opts.destination[opts.destination.length - 1] === '/' || opts.destination[opts.destination.length - 1] === '\\') {
    destination = destination + 'README.md';
  }
  out = fs.createWriteStream(destination);

  // read in template if one is specified
  if (opts.query && opts.query.template) {
    template = fs.readFileSync(opts.query.template);
    insert = template.indexOf('{{jsdoc}}');
  }

  // format the data for printing
  data({ undocumented: true }).remove();
  docs = data().order('name').get(); // <-- an array of Doclet objects

  graft(root, docs);

  // write beginning of template
  if (insert > 0) {
    out.write(template.slice(0, insert));
  } else {
    out.write(template);
  }

  // write the jsdoc output
  print(root, out);

  // write the end of the output
  if (insert > 0) {
    out.write(template.slice(insert + 9));
  }
};
