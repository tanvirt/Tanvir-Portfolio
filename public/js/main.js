angular.module("main", []);

angular.module("main").run(function($rootScope, $timeout) {

	ClassHelpers.init();
	AnimatedHeader.init();
	ContactForm.init();
	FormValidation.init();

    $rootScope.showGraphic = false;

    var numIncludes = 2;
    var numLoadedIncludes = 0;
    $rootScope.$on('$includeContentLoaded', function() {
		$timeout(function() {
			numLoadedIncludes++;
			if(numLoadedIncludes == numIncludes) {
				Theme.init();
				Particles.init("app-header");
			}
		});
	});

    $rootScope.flipLogo = function() {
		if(!$rootScope.showGraphic) {
			flipAppLogo();
		}
    }

    $rootScope.resetGraphic = function() {
    	if($rootScope.showGraphic) {
	    	EventDispatcher.dispatch(new Event("resetGraphic"));
	    }
    }

    $rootScope.clickJump = function() {
    	if($rootScope.showGraphic) {
	    	EventDispatcher.dispatch(new Event("clickJump"));
	    }
    }

    $rootScope.viewRedCyan = function() {
    	if($rootScope.showGraphic) {
	    	EventDispatcher.dispatch(new Event("viewRedCyan"));
	    }
    }

});

var flipAppLogo = function() {
	if(document.getElementById('logo')) {
		document.getElementById('logo').classList.toggle('flip');
	}
}
