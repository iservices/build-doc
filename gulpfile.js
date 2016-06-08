const test = require('build-test');
const doc = require('./src/index');

test.registerTasks({
  testGlob: ['src/tests/**/*.spec.js'],
  codeGlob: ['src/local/**/*.js'],
  thresholds: { global: 0 },
  outputDir: './testResults'
});

doc.registerTasks({
  glob: '**/*.[jt]s',
  inputDir: './src/local/',
  templateFile: './doc.md',
  outputDir: './',
  outputFile: 'README.md'
});
