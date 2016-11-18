angular.module("main", []);

angular.module("main").run(function($rootScope) {

	ClassHelpers.init();
	AnimatedHeader.init();
	ContactForm.init();
	FormValidation.init();
	Theme.init();
	Particles.init();

	$rootScope.flipLogo = function() {
    	document.getElementById("logo").classList.toggle("flip");
    }

});
