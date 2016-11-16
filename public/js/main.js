angular.module("main", []);

angular.module("main").run(function($rootScope) {

	Theme.init();

	$rootScope.flipLogo = function() {
    	document.getElementById("logo").classList.toggle('flip');
    }

});
