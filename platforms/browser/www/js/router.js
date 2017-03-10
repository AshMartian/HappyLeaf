/*
happyLeaf.config(function($stateProvider, $urlRouterProvider) {
	//$urlRouterProvider.otherwise('/stores');

	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'controllers/home/home.html',
		controller: 'home'
	});

	$stateProvider.state('welcome', {
		url: '/',
		templateUrl: 'controllers/welcome/welcome.html',
		controller: 'welcome'
	});

});
*/

happyLeaf.config(function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: 'controllers/home/home.html',
        controller: 'HomeController'
    }).
    when('/welcome', {
        templateUrl: 'controllers/welcome/welcome.html',
        controller: 'WelcomeController'
    }).
    otherwise({
        redirectTo: '/welcome'
    });
});
