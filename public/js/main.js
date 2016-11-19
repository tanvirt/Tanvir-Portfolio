angular.module("main", []);

angular.module("main").run(function($rootScope) {

	ClassHelpers.init();
	AnimatedHeader.init();
	ContactForm.init();
	FormValidation.init();
	Theme.init();
	Particles.init("app-header");

	$rootScope.flipLogo = function() {
		var logo = document.getElementById("logo");
		if(logo) {
	    	logo.classList.toggle("flip");
	    }
    }

});
