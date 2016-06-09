# build-doc

This package is currently in **BETA**

## Overview
This is a node package that defines gulp tasks that can be used to generate documentation from code.
The [jsdoc](https://www.npmjs.com/package/jsdoc) package is used for generating markdown documentation which
can be included in a README.md file.

## Guide

To install this package execute the following command in the console from within your project.

```
npm install --save build-doc
```

Once the package is installed you will need to create a `gulpfile.js` file within the root folder of your project if there isn't one already.
Within this file you will register the gulp tasks that are defined within this package using the registerTasks function.  The following is an example of this.

```
const doc = require('build-doc');

doc.registerTasks({
 glob: '**/*.[jt]s',
 inputDir: './src/local/',
 templateFile: './doc.md',
 outputDir: './',
 outputFile: 'README.md'
});
```

Once you have registered the doc tasks you can generate documentation using gulp.
To generate documentation simply execute the following console command from within your project.

```
gulp doc
```

In addition to executing tasks from the console you can also chain the gulp doc tasks together with other gulp tasks to utilize the documentation functionality however it's needed.

## Modules

* [build-doc](#module_build-doc)
  * Functions
  * [registerTasks](#module_build-doc~registerTasks)


<br/><a name="module_build-doc"></a>
## **build-doc** (module)  
Register gulp tasks used to generate documentation using jsdoc.  

### **Functions**  
<a name="module_build-doc~registerTasks"></a>
## registerTasks(opts) ⇒ void  
Register documentation generation tasks.  
  
**Parameters:**  

| Param | Type | Attributes | Description |
| --- | --- | --- | --- |
| opts | `Object` |   | The configuration options. |
| opts.glob | `String or Array.<String>` |   | Glob pattern relative to the inputDir that identifies the files to document. |
| opts.inputDir | `String` | optional | The root directory that contains the files to create documentation for. |
| opts.templateFile | `String` | optional | A path to a file that is used as a template.  When provided the template will                                       be written out with the first occurance of the text `{{jsdoc}}` replaced                                       with the markdown that is generated. |
| opts.outputDir | `String` | optional | The output directory. |
| opts.outputFile | `String` |   | The file path relative to outputDir that the documentation is written to. |
| opts.tasksPrefix | `String` | optional | An optional prefix to apply to task names. |
| opts.tasksDependencies | `Array.<String>` | optional | Optional array of tasks names that must be completed before these registered tasks run. |
  
**Returns:** `void`  


