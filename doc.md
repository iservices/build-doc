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

{{jsdoc}}