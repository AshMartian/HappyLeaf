happyLeaf.config(function (localStorageServiceProvider, $mdThemingProvider, $locationProvider) {
  localStorageServiceProvider
    .setPrefix('happyLeaf')
    .setStorageType('sessionStorage')
    .setNotify(true, true);

    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();

    /*$locationProvider.html5Mode({
      enabled: true
    });*/
});
