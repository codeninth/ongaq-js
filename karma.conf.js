/*
  Karma - Configuration
  http://karma-runner.github.io/3.0/config/configuration-file.html

*/
module.exports = config => {
  config.set({
    frameworks: ['jasmine'],
    port: 9876,
    files: [
      'test/test.bundle.js'
    ]
  })
}
