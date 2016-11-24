angular.module("main", []);

angular.module("main").run(function($rootScope, $timeout) {

	ClassHelpers.init();
	FormValidation.init();

    $rootScope.showGraphic = false;

    var numIncludesToBeLoaded = document.querySelectorAll('.include').length;

    $rootScope.$on('$includeContentLoaded', function(event, templateName) {
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
	    EventDispatcher.dispatch(new Event("toggleGraphic"));
    }

    EventDispatcher.addEventHandler("toggleGraphic", function(event) {
    	$rootScope.showGraphic = !$rootScope.showGraphic;
    });

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

var isVisibleInViewport = function(elem) {
    var y = elem.offsetTop;
    var height = elem.offsetHeight;

    while(elem = elem.offsetParent) {
        y += elem.offsetTop;
    }

    var maxHeight = y + height;
    var isVisible = 
    	(y < ( window.pageYOffset + window.innerHeight)) && 
    	(maxHeight >= window.pageYOffset);
    return isVisible; 
}
