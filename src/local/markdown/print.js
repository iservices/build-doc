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
    out.write('## Classes\n\n<ul>\n');
    node.classes.forEach(function (cls) {
      out.write('<li><a href="#' + cls.longname + '">' + cls.name + '</a>\n');

      if (cls.properties) {
        out.write('<ul>Members');
        cls.properties.forEach(function (prop) {
          out.write('<li><a href="#' + prop.longname + '">' + prop.name + '</a>\n');
        });
        out.write('</ul><br/>');
      }

      if (cls.functions) {
        out.write('<ul>Functions');
        cls.functions.forEach(function (func) {
          out.write('<li><a href="#' + func.longname + '">' + func.name + '</a>\n');
        });
        out.write('</ul><br/>');
      }

      out.write('</li>\n');
    });
    out.write('</ul>');
  }

  //
  // modules
  //
  if (node.modules) {
    out.write('## Modules\n\n<ul>\n');
    node.modules.forEach(function (mod) {
      out.write('<li><a href="#' + mod.longname + '">' + mod.name + '</a>\n');

      if (mod.properties) {
        out.write('<ul>Members');
        mod.properties.forEach(function (prop) {
          out.write('<li><a href="#' + prop.longname + '">' + prop.name + '</a>\n');
        });
        out.write('</ul><br/>');
      }

      if (mod.functions) {
        out.write('<ul>Functions');
        mod.functions.forEach(function (func) {
          out.write('<li><a href="#' + func.longname + '">' + func.name + '</a>\n');
        });
        out.write('</ul><br/>');
      }

      out.write('</li>\n');
    });
    out.write('</ul>\n\n');
  }
}

/**
 * Turn the given text into block quote formatted text.
 *
 * @param {String} text - The text to turn into block quote text.
 * @return {String} The block quote formatted text.
 */
function createBlockText(text) {
  if (!text) {
    return '';
  }
  return '> ' + text.replace(newlinePattern, ' ');
}

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

  result = '> | Param | Type | Attributes | Description |\n> | --- | --- | --- |\n';
  node.parameters.forEach(function (param) {
    result += '> | '
           + param.name + ' | `'
           + createType(param.type) + '` | '
           + (param.optional ? 'optional' : ' ') + ' | '
           + escapeNewline(escapePipes(param.description)) + ' |\n';
  });

  return result;
}

/**
 * Write the examples out.
 *
 * @param {Object} node - The node to write examples out for.
 * @param {Stream} out - The stream to write out to.
 * @param {Boolean} blockQuote - When true the examples will be written out within a block quote.
 * @return {void}
 */
function writeExamples(node, out, blockQuote) {
  var match = null;
  var caption = '';
  var text = '';
  var prefix = blockQuote ? '> ' : '';
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
        out.write(prefix + 'Example *(' + caption + ')*:  \n');
      } else {
        out.write(prefix + 'Example:  \n');
      }
      out.write(prefix + '```js\n');
      if (blockQuote) {
        out.write(createBlockText(escapeComment(text)));
      } else {
        out.write(escapeComment(text));
      }
      out.write('\n' + prefix + '```  \n');
    });
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
    out.write('<a name="' + node.longname + '"></a>\n');
  }
  out.write('## ' + createSignature(node) + '  \n');
  if (node.description) {
    out.write(createBlockText(node.description) + '  \n');
  }
  out.write('  \n');

  if (node.parameters && node.parameters.length) {
    out.write('> Parameters:  \n\n');
    out.write(createParamTable(node) + '  \n');
  }

  if (node.returns) {
    out.write('> Returns: `' + createType(node.returns.type) + '`  \n');
    if (node.returns.description) {
      out.write(createBlockText(node.returns.description) + '  \n');
    }
  }

  out.write('\n');

  if (node.examples && node.examples.length) {
    writeExamples(node, out, true);
  }
  out.write('\n');
}

/**
 * Write member out to the stream.
 *
 * @param {Object} node - The node to write the member out.
 * @param {Stream} out - The stream to write out to.
 * @return {void}
 */
function writeMember(node, out) {
  out.write('<a name="' + node.longname + '"></a>\n');
  if (node.scope === 'static') {
    out.write('> `(static) ' + node.name + ' : ' + createType(node.type) + '`  \n');
  } else {
    out.write('> `' + node.name + ' : ' + createType(node.type) + '`  \n');
  }
  if (node.description) {
    out.write(createBlockText(node.description) + '  \n');
  }
  out.write('  \n');
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
      out.write('### **' + title + '**  \n');
    }
    items.forEach(function (item) {
      printNode(item, out); /* eslint-disable-line */
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
    out.write('<br/><a name="' + node.longname + '"></a>\n');
    if (node.extends) {
      out.write('## **' + node.name + '** (class extends ' + node.extends + ')  \n');
    } else {
      out.write('## **' + node.name + '** (class)  \n');
    }
    out.write(node.description + '  \n\n');
    writeFunction(node.constructor, out);
  } else if (node.kind === 'module') {
    //
    // module
    //
    out.write('<br/><a name="' + node.longname + '"></a>\n');
    out.write('## **' + node.name + '** (module)  \n');
    out.write(node.description + '  \n\n');
    writeExamples(node, out, false);
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
