angular.module("main", []);

angular.module("main").run(function($rootScope, $timeout) {

	ClassHelpers.init();
	
	FormValidation.init();

    $rootScope.showGraphic = false;

    var numIncludesToBeLoaded = document.querySelectorAll('.include').length;

    $rootScope.$on('$includeContentLoaded', function() {
		$timeout(function() {
			numIncludesToBeLoaded--;
			if(numIncludesToBeLoaded == 0) {
				AnimatedHeader.init();
				ContactForm.init();
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

    $rootScope.toggleGraphic = function() {
    	$rootScope.showGraphic = !$rootScope.showGraphic;
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
