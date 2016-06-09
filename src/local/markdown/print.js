/* eslint-disable no-var, no-nested-ternary */
/**
 * Used to print out a tree of jsdoc information.
 *
 * @ignore
 * @module print
 */
'use strict';

// regex used for parsing the caption in example text
var captionPattern = /^[\s]*<caption>(.*)<\/caption>[\s]*/mi;

// regex used to find newlines
var newlinePattern = /\r?\n/g;

// regex used to find pipes
var pipePattern = /\|/g;

// regex used to find special case where comments appear in example
var commentPattern = /&#42;/g;

// regex used to replace bad longname characters for links
var longnamePattern = /[:]/g;

// regex used to process links
var linkPattern = /{\s*@link\s*([^|}]*)(\|)?([^}]*)?}/g;

/**
 * Replace newline characters with html breaks.
 *
 * @param {String} text - The text to escape.
 * @return {String} The escaped text.
 */
function escapeNewline(text) {
  if (!text) {
    return '';
  }
  return text.replace(newlinePattern, ' ');
}

/**
 * Replace pipe characters with html code.
 *
 * @param {String} text - The text to escape.
 * @return {String} The escaped text.
 */
function escapePipes(text) {
  if (!text) {
    return '';
  }
  return text.replace(pipePattern, '&#124;');
}

/**
 * Replace the html asterisk code with the actual character.
 *
 * @param {String} text - The text to escape.
 * @return {String} The escaped text.
 */
function escapeComment(text) {
  if (!text) {
    return '';
  }
  return text.replace(commentPattern, '*');
}

/**
 * Replace bad characters for links.
 *
 * @param {String} name - The longname to escape.
 * @return {String} The escaped name.
 */
function escapeLongname(name) {
  if (!name) {
    return '';
  }
  return name.replace(longnamePattern, '_');
}

/**
 * Format link text so it will display correctly in markdown.
 *
 * @param {RegExpMatchArray | String} match - The regex matched link text to format or a jsdoc namepath value.
 * @return {String} The formatted link.
 */
function formatLink(match) {
  var address = '';
  var display = '';

  if (Array.isArray(match)) {
    // process a regex match
    if (match.length > 1) {
      address = match[1] || '';
    }
    if (match.length > 3) {
      display = match[3] || address;
    }
    if (address && address.indexOf('http') !== 0) {
      address = escapeText(address, { longname: true });
      address = '#' + address;
    }
    return '[' + display + '](' + address + ')';
  } else if (typeof match === 'string') {
    // process a simple namepath value
    return '[' + match + '](' + escapeText(match, { longname: true }) + ')';
  }
  return '';
}

/**
 * Replace link directives with the markdown equivalent.
 *
 * @param {String} text - The text to escape.
 * @param {Boolean} [force] - When set to true the text will be treated as a link even if it doesn't match the pattern.
 * @return {String} The escaped text.
 */
function escapeLink(text, force) {
  var match = null;
  var result = [];
  var lastIndex = 0;

  if (!text) {
    return '';
  }

  while ((match = linkPattern.exec(text)) !== null) { // eslint-disable-line no-cond-assign
    result.push(text.slice(lastIndex, match.index));
    result.push(formatLink(match));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex) {
    result.push(text.slice(lastIndex));
    return result.join('');
  } else if (force) {
    return formatLink(text);
  }
  return text;
}

/**
 * Escape the text using the given option.
 *
 * @param {String} text - The text to escape when true.
 * @param {Object} options - The escape optons when true.
 * @param {Boolean} options.newline - Escape newlines when true.
 * @param {Boolean} options.pipes - Escape pipes when true.
 * @param {Boolean} options.comment - Escape comments when true.
 * @param {Boolean} options.longname - Escape longname when true.
 * @param {Boolean} options.link - Escape link when true.
 * @return {String} The escaped text.
 */
function escapeText(text, options) {
  var result = text;
  var opts = options || {};

  if (opts.newline) {
    result = escapeNewline(result);
  }
  if (opts.pipes) {
    result = escapePipes(result);
  }
  if (opts.comment) {
    result = escapeComment(result);
  }
  if (opts.longname) {
    result = escapeLongname(result);
  }
  if (opts.link) {
    result = escapeLink(result);
  }

  return result;
}

/**
 * Turn the given text into block formatted text.
 *
 * @param {String} text - The text to turn into block text.
 * @return {String} The block formatted text.
 */
function createBlockText(text) {
  if (!text) {
    return '';
  }
  return escapeText(text.replace(newlinePattern, ' '), { link: true });
}

/**
 * Create type text for the given node.
 *
 * @param {Object} node - The type node to create text for.
 * @return {String} The text for the type node.
 */
function createType(node) {
  if (!node) {
    return '';
  }
  if (node.names) {
    return node.names.join(' or ');
  }
  if (node.join) {
    return node.join(' or ');
  }
  return node;
}

/**
 * Create a signature for the given node.
 *
 * @param {Object} node - The node to create a signature for.
 * @return {String} - The signature for the given node.
 */
function createSignature(node) {
  var result = '';
  var params = [];
  if (!node) {
    return '';
  }

  if (node.scope === 'static') {
    result = '(static) ';
  }
  if (node.kind === 'constructor') {
    result += 'new ';
  }
  result += node.name + '(';
  if (node.parameters) {
    node.parameters.forEach(function (param) {
      if (param.name.indexOf('.') !== -1) {
        // don't include parameters with dots as this is likely
        // details about another paramter.
        return;
      } else if (param.optional) {
        params.push(param.name + '<sub><small>opt</small></sub>');
      } else {
        params.push(param.name);
      }
    });
  }
  result += params.join(', ') + ')';
  if (node.returns && node.returns.type) {
    result += ' ⇒ ' + createType(node.returns.type);
  }

  return result;
}

/**
 * Create a table for the params in the given node.
 *
 * @param {Object} node - The node to create a param table for.
 * @return {void}
 */
function createParamTable(node) {
  var result = '';
  if (!node || !node.parameters || !node.parameters.length) {
    return '';
  }

  result = '| Param | Type | Attributes | Description |\n| --- | --- | --- | --- |\n';
  node.parameters.forEach(function (param) {
    result += '| '
           + param.name + ' | `'
           + createType(param.type) + '` | '
           + (param.optional ? 'optional' : ' ') + ' | '
           + escapeText(param.description, { newline: true, pipes: true, link: true }) + ' |\n';
  });

  return result;
}

/**
 * Write the examples out.
 *
 * @param {Object} node - The node to write examples out for.
 * @param {Stream} out - The stream to write out to.
 * @return {void}
 */
function writeExamples(node, out) {
  var match = null;
  var caption = '';
  var text = '';
  if (node && node.examples && node.examples.length) {
    node.examples.forEach(function (example) {
      match = captionPattern.exec(example);
      if (match && match.length > 0) {
        text = example.slice(match.index + match[0].length);
        caption = (match.length > 1) ? match[1] : null;
      } else {
        text = example;
        caption = null;
      }
      if (caption) {
        out.write('Example *(' + caption + ')*:  \n');
      } else {
        out.write('Example:  \n');
      }
      out.write('```js\n');
      out.write(escapeText(text, { comment: true }));
      out.write('\n```  \n');
    });
  }
}

/**
 * Write the see tags out.
 *
 * @param {Object} node - The node to write out the see tags for.
 * @param {Stream} out - The stream to write out to.
 * @return {void}
 */
function writeSees(node, out) {
  var result = [];
  if (node && node.see && node.see.length) {
    out.write('** See:**  \n* ');
    node.see.forEach(function (see) {
      result.push(escapeLink(see, true));
    });
    out.write(result.join('  \n* ') + '  \n');
  }
}

/**
 * Write the given function out.
 *
 * @param {Object} node - The function node to write out.
 * @param {Stream} out - The stream to write to.
 * @return {void}
 */
function writeFunction(node, out) {
  if (node.kind !== 'constructor') {
    out.write('<a name="' + escapeText(node.longname, { longname: true }) + '"></a>\n');
  }
  out.write('## ' + createSignature(node) + '  \n');
  if (node.description) {
    out.write(createBlockText(node.description) + '  \n');
  }
  out.write('  \n');

  if (node.parameters && node.parameters.length) {
    out.write('**Parameters:**  \n\n');
    out.write(createParamTable(node) + '  \n');
  }

  if (node.returns) {
    out.write('**Returns:** `' + createType(node.returns.type) + '`  \n');
    if (node.returns.description) {
      out.write(createBlockText(node.returns.description) + '  \n');
    }
  }

  out.write('\n');
  writeExamples(node, out);
  writeSees(node, out);
  out.write('\n<br/>\n');
}

/**
 * Write member out to the stream.
 *
 * @param {Object} node - The node to write the member out.
 * @param {Stream} out - The stream to write out to.
 * @return {void}
 */
function writeMember(node, out) {
  out.write('<a name="' + escapeText(node.longname, { longname: true }) + '"></a>\n');
  if (node.scope === 'static') {
    out.write('## (static) ' + node.name + ' : `' + createType(node.type) + '`  \n');
  } else {
    out.write('## ' + node.name + ' : `' + createType(node.type) + '`  \n');
  }
  if (node.description) {
    out.write(createBlockText(node.description) + '  \n');
  }
  out.write('  \n');

  out.write('\n');
  writeExamples(node, out);
  writeSees(node, out);
  out.write('\n<br/>\n');
}

/**
 * Print the collection of items.
 *
 * @param {Object[]} [items] - The items to print.
 * @param {String} [title] - The title for the collection.
 * @param {Stream} out - The stream to write the items to.
 * @return {void}
 */
function printCollection(items, title, out) {
  if (items) {
    if (title) {
      out.write('### **' + title + '**  \n<br/>\n');
    }
    items.forEach(function (item) {
      printNode(item, out); // eslint-disable-line no-use-before-define
    });
  }
}

/**
 * Print the content for each component.
 *
 * @param {Object} node - A node in the object tree to recursively print the content for.
 * @param {Stream} out - The stream to write the content out to.
 * @return {void}
 */
function printNode(node, out) {
  if (!node) {
    return;
  }

  if (node.kind === 'class') {
    //
    // class
    //
    out.write('<br/><a name="' + escapeText(node.longname, { longname: true }) + '"></a>\n');
    if (node.extends) {
      out.write('## **' + node.name + '** (class extends ' + node.extends + ')  \n');
    } else {
      out.write('## **' + node.name + '** (class)  \n');
    }
    out.write(createBlockText(node.description) + '  \n<br/>\n');
    writeFunction(node.constructor, out);
  } else if (node.kind === 'module') {
    //
    // module
    //
    out.write('<br/><a name="' + escapeText(node.longname, { longname: true }) + '"></a>\n');
    out.write('## **' + node.name + '** (module)  \n');
    out.write(createBlockText(node.description) + '  \n\n');
    writeExamples(node, out);
    writeSees(node, out);
    out.write('\n<br/>\n');
  } else if (node.kind === 'function') {
    //
    // function
    //
    writeFunction(node, out);
  } else if (node.kind === 'member') {
    //
    // member
    //
    writeMember(node, out);
  }

  printCollection(node.classes, '', out);
  printCollection(node.modules, '', out);
  printCollection(node.properties, 'Members', out);
  printCollection(node.functions, 'Functions', out);
}

/**
 * Used to print the index of all components.
 *
 * @param {Object} node - The node in the object tree to print the table of contents for.
 * @param {Stream} out - The stream to write the index out to.
 * @return {void}
 */
function printIndex(node, out) {
  if (!node) {
    return;
  }

  //
  // classes
  //
  if (node.classes) {
    out.write('## Classes\n\n');
    node.classes.forEach(function (cls) {
      out.write('* [' + cls.name + '](#' + escapeText(cls.longname, { longname: true }) + ')\n');

      if (cls.properties) {
        out.write('  * Members\n');
        cls.properties.forEach(function (prop) {
          out.write('  * [' + prop.name + '](#' + escapeText(prop.longname, { longname: true }) + ')\n');
        });
      }

      if (cls.functions) {
        out.write('  * Functions\n');
        cls.functions.forEach(function (func) {
          out.write('  * [' + func.name + '](#' + escapeText(func.longname, { longname: true }) + ')\n');
        });
      }
    });
  }

  //
  // modules
  //
  if (node.modules) {
    if (node.classes) {
      out.write('\n');
    }
    out.write('## Modules\n\n');
    node.modules.forEach(function (mod) {
      out.write('* [' + mod.name + '](#' + escapeText(mod.longname, { longname: true }) + ')\n');

      if (mod.properties) {
        out.write('  * Members\n');
        mod.properties.forEach(function (prop) {
          out.write('  * [' + prop.name + '](#' + escapeText(prop.longname, { longname: true }) + ')\n');
        });
      }

      if (mod.functions) {
        out.write('  * Functions\n');
        mod.functions.forEach(function (func) {
          out.write('  * [' + func.name + '](#' + escapeText(func.longname, { longname: true }) + ')\n');
        });
      }
    });
  }

  out.write('\n\n');
}

/**
 * Print the given tree out to the given stream.
 *
 * @param {Object} root - The tree to print out.
 * @param {Stream} out - The stream to print to.
 * @return {void}
 */
function print(root, out) {
  printIndex(root, out);
  printNode(root, out);
}

module.exports = print;
