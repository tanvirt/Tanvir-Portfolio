angular.module("main", []);

angular.module("main").run(function($rootScope, $timeout) {

	console.log("%cTanvir Talukder - Developer", getTitleCSS());
	console.log("%cLet's Build Something Amazing Together", getSubTitleCSS());

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
    	$rootScope.showGraphic = !$rootScope.showGraphic;
	    EventDispatcher.dispatch(new Event(
	    	"toggleGraphic",
	    	{ showGraphic: $rootScope.showGraphic }
	    ));
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

var isVisibleInViewport = function(element) {
    var y = element.offsetTop;
    var height = element.offsetHeight;

    while(element = element.offsetParent) {
        y += element.offsetTop;
    }

    var maxHeight = y + height;
    var isVisible = (y < ( window.pageYOffset + window.innerHeight)) && 
    				(maxHeight >= window.pageYOffset);

    return isVisible; 
}

var getTitleCSS = function() {
	return 	"padding:28px 82px;" +
			"line-height:90px;" +
			"color:rgb(255,255,255);" +
			"background-color:rgb(120,120,120);" +
			"text-shadow: 0.5px 1px 0 #888, 1px 2px 0 #898989, 1.5px 3px 0 #777, 2px 4px 0 #797979, 2.5px 5px 0 #666, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);" +
			"font-size: 40px;";
}

var getSubTitleCSS = function() {
	return 	"padding:28px 46px;" +
			"font-size: 18px;";
}
