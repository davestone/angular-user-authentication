'use strict';

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'angular-user-authentication.js',
      'angular-user-authentication-spec.js',
    ],
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      'angular-user-authentication.js': ['coverage']
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },
    reporters: ['progress', 'coverage'],
    singleRun: true
  });
};
