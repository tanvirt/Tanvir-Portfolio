angular.module("main", []);

angular.module("main").run(function($rootScope) {

	ClassHelpers.init();
	AnimatedHeader.init();
	ContactForm.init();
	FormValidation.init();
	Theme.init();
	Particles.init("app-header");

	$rootScope.flipLogo = function() {
		flipLogo();
    }

});

var flipLogo = function() {
	if(document.getElementById('logo')) {
		document.getElementById('logo').classList.toggle('flip');
	}
}
