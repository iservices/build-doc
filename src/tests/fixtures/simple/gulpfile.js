const doc = require('../../../../index');

doc.registerTasks({
  glob: '**/*.[jt]s',
  inputDir: __dirname + '/example/',
  templateFile: __dirname + '/docs.md',
  outputDir: __dirname + '/../../../../testOutput/simple/',
  outputFile: 'README.md',
  tasksPrefix: 'simple'
});
