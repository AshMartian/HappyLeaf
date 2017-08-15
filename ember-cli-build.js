/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  //app.import('bower_components/async/dist/async.min.js');
  //app.import('bower_components/material-design-icons-iconfont/dist/fonts/material-icons.css');
  //app.import('bower_components/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.woff');
  //app.import('bower_components/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.woff2');
  app.import('app/styles/loading_spinner.css');
  app.import('bower_components/components-font-awesome/css/font-awesome.css');
  app.import('bower_components/components-font-awesome/fonts/fontawesome-webfont.ttf');

  return app.toTree();
};
