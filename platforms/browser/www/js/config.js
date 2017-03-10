happyLeaf.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('happyLeaf')
    .setStorageType('sessionStorage')
    .setNotify(true, true)
});
