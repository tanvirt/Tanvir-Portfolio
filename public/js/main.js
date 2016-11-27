angular.module("main", ['ngAnimate']);

angular.module("main").run(function($rootScope, $timeout) {

	ClassHelpers.init();
	FormValidation.init();

	var speechRecognition = new SpeechRecognition();

	$rootScope.showGraphic = false;
	$rootScope.showControlsWindow = false;
	$rootScope.showDrawModesWindow = false;
	$rootScope.showProjectorModesWindow = false;
	$rootScope.showFullScreen = false;
	$rootScope.isDesktop = Device.isDesktop();

	var numIncludesToBeLoaded = document.querySelectorAll('.include').length;
	$rootScope.graphicCanvas = null;

	$rootScope.$on('$includeContentLoaded', function(event, templateName) {
		$timeout(function() {
			numIncludesToBeLoaded--;
			if(numIncludesToBeLoaded == 0) {
				AnimatedHeader.init();
				ContactForm.init();
				Theme.init();
				if($rootScope.isDesktop) {
					Particles.init("app-header");
				}
				$rootScope.graphicCanvas = new GraphicCanvas("graphic-canvas");
				$rootScope.graphicCanvas.render();
			}
		});
	});

	$rootScope.requestFullScreen = function() {
		$rootScope.graphicCanvas.requestFullScreen();
	}

	$rootScope.showFullScreenDialog = function() {
		$rootScope.showFullScreen = true;
	}

	$rootScope.hideFullScreenDialog = function() {
		$rootScope.showFullScreen = false;
	}

	$rootScope.hideGraphicWindows = function() {
		$rootScope.hideControlsWindow();
		$rootScope.hideDrawModesWindow();
		$rootScope.hideProjectorModesWindow();
		$rootScope.hideFullScreenDialog();
	}

	$rootScope.toggleControlsWindow = function() {
		if(!$rootScope.showControlsWindow) {
			$rootScope.hideGraphicWindows();
			$rootScope.showControlsWindow = true;
		}
		else {
			$rootScope.hideGraphicWindows();
			$rootScope.showControlsWindow = false;
		}
	}

	$rootScope.hideControlsWindow = function() {
    	$rootScope.showControlsWindow = false;
	}

	$rootScope.toggleDrawModesWindow = function() {
		if(!$rootScope.showDrawModesWindow) {
			$rootScope.hideGraphicWindows();
			$rootScope.showDrawModesWindow = true;
		}
		else {
			$rootScope.hideGraphicWindows();
			$rootScope.showDrawModesWindow = false;
		}
	}

	$rootScope.hideDrawModesWindow = function() {
	    $rootScope.showDrawModesWindow = false;
	}

	$rootScope.toggleProjectorModesWindow = function() {
		if(!$rootScope.showProjectorModesWindow) {
			$rootScope.hideGraphicWindows();
			$rootScope.showProjectorModesWindow = true;
		}
		else {
			$rootScope.hideGraphicWindows();
			$rootScope.showProjectorModesWindow = false;
		}
	}

	$rootScope.hideProjectorModesWindow = function() {
	    $rootScope.showProjectorModesWindow = false;
	}

    $rootScope.flipLogo = function() {
		if(!$rootScope.showGraphic) {
			flipAppLogo();
		}
    }

    $rootScope.toggleGraphic = function() {
    	if($rootScope.showGraphic) {
    		$rootScope.hideGraphicWindows();
    		$rootScope.showGraphic = false;
    		setTimeout(function() {
    			$rootScope.dispatchToggleGraphicEvent();
	    	}, 200);
    	}
    	else {
    		$rootScope.showGraphic = true;
			$rootScope.dispatchToggleGraphicEvent();
    	}
    }

    $rootScope.hideGraphic = function() {
    	$rootScope.hideGraphicWindows();
    	$rootScope.showGraphic = false;
	    setTimeout(function() {
    		$rootScope.dispatchToggleGraphicEvent();
    	}, 200);
    }

    $rootScope.dispatchToggleGraphicEvent = function() {
		EventDispatcher.dispatch(new Event(
	    	"toggleGraphic",
	    	{ showGraphic: $rootScope.showGraphic }
	    ));
    }

    $rootScope.resetGraphic = function() {
    	$rootScope.graphicCanvas.reset();
    }

    $rootScope.clickJump = function() {
	    EventDispatcher.dispatch(new Event("jumpLogo"));
    }

    $rootScope.useRegularProjector = function() {
    	$rootScope.graphicCanvas.useRegularProjector();
    	var image = document.getElementById("viewModeIcon");
    	image.src = "img/creative/eye_icon.png";
    }

    $rootScope.useRedCyanProjector = function() {
    	$rootScope.graphicCanvas.useRedCyanProjector();
    	var image = document.getElementById("viewModeIcon");
    	image.src = "img/creative/red_cyan_icon.png";
    }

    $rootScope.useVRProjector = function() {
    	$rootScope.graphicCanvas.useVRProjector();
    	var image = document.getElementById("viewModeIcon");
    	image.src = "img/creative/vr_icon.png";
    }

    $rootScope.useARProjector = function() {
    	$rootScope.graphicCanvas.useARProjector();
    	var image = document.getElementById("viewModeIcon");
    	image.src = "img/creative/lens_icon.png";
    }

    $rootScope.setDrawModeTriangles = function() {
	    $rootScope.graphicCanvas.setDrawModeTriangles();
    }

    $rootScope.setDrawModeLines = function() {
	    $rootScope.graphicCanvas.setDrawModeLines();
    }

    $rootScope.setDrawModePoints = function() {
	    $rootScope.graphicCanvas.setDrawModePoints();
    }

    var getTitleCSS = function() {
		return 	"padding: 28px 82px;" +
				"line-height: 90px;" +
				"color: rgb(255,255,255);" +
				"background-color: rgb(120, 120, 120);" +
				"text-shadow: 0.5px 1px 0 #888, 1px 2px 0 #898989, 1.5px 3px 0 #777, 2px 4px 0 #797979, 2.5px 5px 0 #666, 0 6px 1px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3), 0 3px 5px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.2), 0 20px 20px rgba(0, 0, 0, 0.15);" +
				"font-size: 40px;";
	}

	var getSubTitleCSS = function() {
		return 	"padding: 28px 46px;" +
				"font-size: 18px;";
	}

	console.log("%cTanvir Talukder - Developer", getTitleCSS());
	console.log("%cLet's Build Something Amazing Together", getSubTitleCSS());

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
