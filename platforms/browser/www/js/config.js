happyLeaf.config(function (localStorageServiceProvider, $mdThemingProvider) {
  localStorageServiceProvider
    .setPrefix('happyLeaf')
    .setStorageType('sessionStorage')
    .setNotify(true, true);

    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
});
