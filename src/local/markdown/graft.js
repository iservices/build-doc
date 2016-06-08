/* eslint-disable no-var, no-nested-ternary */
/**
 * Used to turn the table format jsdoc information into a tree structure.
 *
 * @ignore
 * @module print
 */
'use strict';

var hasOwnProp = Object.prototype.hasOwnProperty;

function graft(parentNode, childNodes, parentLongname) {
  childNodes
    .filter(function (element) {
      return (!element.ignore && element.memberof === parentLongname);
    })
    .forEach(function (element) {
      var i;
      var len;
      var thisNamespace;
      var thisMixin;
      var thisFunction;
      var thisEvent;
      var thisModule;
      var thisClass;

      if (element.kind === 'namespace') {
        //
        // namespace
        //
        if (!parentNode.namespaces) {
          parentNode.namespaces = [];
        }

        thisNamespace = {
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'description': element.description || '',
          'access': element.access || '',
          'virtual': !!element.virtual
        };

        parentNode.namespaces.push(thisNamespace);

        graft(thisNamespace, childNodes, element.longname, element.name);
      } else if (element.kind === 'mixin') {
        //
        // mixin
        //
        if (!parentNode.mixins) {
          parentNode.mixins = [];
        }

        thisMixin = {
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'description': element.description || '',
          'access': element.access || '',
          'virtual': !!element.virtual
        };

        parentNode.mixins.push(thisMixin);

        graft(thisMixin, childNodes, element.longname, element.name);
      } else if (element.kind === 'function') {
        //
        // function
        //
        if (!parentNode.functions) {
          parentNode.functions = [];
        }

        thisFunction = {
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'access': element.access || '',
          'scope': element.scope,
          'virtual': !!element.virtual,
          'description': element.description || '',
          'parameters': [],
          'examples': []
        };

        parentNode.functions.push(thisFunction);

        if (element.returns) {
          thisFunction.returns = {
            'type': element.returns[0].type ? (element.returns[0].type.names.length === 1 ? element.returns[0].type.names[0] : element.returns[0].type.names) : '',
            'description': element.returns[0].description || ''
          };
        }

        if (element.examples) {
          for (i = 0, len = element.examples.length; i < len; i++) {
            thisFunction.examples.push(element.examples[i]);
          }
        }

        if (element.params) {
          for (i = 0, len = element.params.length; i < len; i++) {
            thisFunction.parameters.push({
              'name': element.params[i].name,
              'kind': 'param',
              'type': element.params[i].type ? (element.params[i].type.names.length === 1 ? element.params[i].type.names[0] : element.params[i].type.names) : '',
              'description': element.params[i].description || '',
              'default': hasOwnProp.call(element.params[i], 'defaultvalue') ? element.params[i].defaultvalue : '',
              'optional': typeof element.params[i].optional === 'boolean' ? element.params[i].optional : '',
              'nullable': typeof element.params[i].nullable === 'boolean' ? element.params[i].nullable : ''
            });
          }
        }
      } else if (element.kind === 'member') {
        //
        // member
        //
        if (!parentNode.properties) {
          parentNode.properties = [];
        }
        parentNode.properties.push({
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'access': element.access || '',
          'virtual': !!element.virtual,
          'description': element.description || '',
          'type': element.type ? (element.type.length === 1 ? element.type[0] : element.type) : ''
        });
      } else if (element.kind === 'event') {
        //
        // event
        //
        if (!parentNode.events) {
          parentNode.events = [];
        }

        thisEvent = {
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'access': element.access || '',
          'virtual': !!element.virtual,
          'description': element.description || '',
          'parameters': [],
          'examples': []
        };

        parentNode.events.push(thisEvent);

        if (element.returns) {
          thisEvent.returns = {
            'type': element.returns.type ? (element.returns.type.names.length === 1 ? element.returns.type.names[0] : element.returns.type.names) : '',
            'description': element.returns.description || ''
          };
        }

        if (element.examples) {
          for (i = 0, len = element.examples.length; i < len; i++) {
            thisEvent.examples.push(element.examples[i]);
          }
        }

        if (element.params) {
          for (i = 0, len = element.params.length; i < len; i++) {
            thisEvent.parameters.push({
              'name': element.params[i].name,
              'kind': 'param',
              'type': element.params[i].type ? (element.params[i].type.names.length === 1 ? element.params[i].type.names[0] : element.params[i].type.names) : '',
              'description': element.params[i].description || '',
              'default': hasOwnProp.call(element.params[i], 'defaultvalue') ? element.params[i].defaultvalue : '',
              'optional': typeof element.params[i].optional === 'boolean' ? element.params[i].optional : '',
              'nullable': typeof element.params[i].nullable === 'boolean' ? element.params[i].nullable : ''
            });
          }
        }
      } else if (element.kind === 'module') {
        //
        // module
        //
        if (!parentNode.modules) {
          parentNode.modules = [];
        }

        thisModule = {
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'description': element.description || '',
          'examples': []
        };

        parentNode.modules.push(thisModule);

        if (element.examples) {
          for (i = 0, len = element.examples.length; i < len; i++) {
            thisModule.examples.push(element.examples[i]);
          }
        }

        graft(thisModule, childNodes, element.longname, element.name);
      } else if (element.kind === 'class') {
        //
        // class
        //
        if (!parentNode.classes) {
          parentNode.classes = [];
        }

        thisClass = {
          'name': element.name,
          'longname': element.longname,
          'kind': element.kind,
          'description': element.classdesc || '',
          'extends': element.augments || null,
          'access': element.access || '',
          'virtual': !!element.virtual,
          'fires': element.fires || '',
          'constructor': {
            'name': element.name,
            'kind': 'constructor',
            'description': element.description || '',
            'parameters': [],
            'examples': []
          }
        };

        parentNode.classes.push(thisClass);

        if (element.examples) {
          for (i = 0, len = element.examples.length; i < len; i++) {
            thisClass.constructor.examples.push(element.examples[i]);
          }
        }

        if (element.params) {
          for (i = 0, len = element.params.length; i < len; i++) {
            thisClass.constructor.parameters.push({
              'name': element.params[i].name,
              'kind': 'param',
              'type': element.params[i].type ? (element.params[i].type.names.length === 1 ? element.params[i].type.names[0] : element.params[i].type.names) : '',
              'description': element.params[i].description || '',
              'default': hasOwnProp.call(element.params[i], 'defaultvalue') ? element.params[i].defaultvalue : '',
              'optional': typeof element.params[i].optional === 'boolean' ? element.params[i].optional : '',
              'nullable': typeof element.params[i].nullable === 'boolean' ? element.params[i].nullable : ''
            });
          }
        }

        graft(thisClass, childNodes, element.longname, element.name);
      }
    });
}

module.exports = graft;
