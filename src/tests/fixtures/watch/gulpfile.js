const doc = require('../../../../index');

doc.registerTasks({
  glob: '**/*.[jt]s',
  inputDir: __dirname + '/example/',
  templateFile: __dirname + '/docs.md',
  outputDir: __dirname + '/../../../../testOutput/watch/',
  outputFile: 'README.md',
  tasksPrefix: 'watch'
});
