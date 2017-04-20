happyLeaf.config(function (localStorageServiceProvider, $mdThemingProvider, $locationProvider, $compileProvider) {
  localStorageServiceProvider
    .setPrefix('happyLeaf')
    .setStorageType('sessionStorage')
    .setNotify(true, true);

    $mdThemingProvider.theme('dark-grey').primaryPalette('grey').backgroundPalette('grey').dark();
    $mdThemingProvider.alwaysWatchTheme(true);

    $compileProvider.debugInfoEnabled(false);
    /*$locationProvider.html5Mode({
      enabled: true
    });*/
});
