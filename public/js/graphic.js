var body_onload = function() {

	var canvas = new GLCanvas("graphic-canvas");
	var keys = new Keys();
	var logo = null;
	var logoMovement = null;
	var projectorToggle = false;
	var showGraphic = false;
	var showLogo = false;

	EventDispatcher.addEventHandler("toggleGraphic", function(event) {
		showGraphic = event.getData().showGraphic;
		showLogo = showGraphic;
	});

	EventDispatcher.addEventHandler("resetGraphic", function(event) {
		reset();
	});

	EventDispatcher.addEventHandler("clickJump", function(event) {
		logoMovement.jump();
	});

	EventDispatcher.addEventHandler("viewRedCyan", function(event) {
		logoMovement.jump();
		if(projectorToggle) {
    		canvas.useRegularProjector();
    	}
    	else {
    		canvas.useRedCyanProjector();
    	}
    	projectorToggle = !projectorToggle;
	});

	var reset = function() {
		canvas.useRegularProjector();
		logoMovement.reset();
		logo.reset();
		logo.translateZ(-4);
		logo.getGraphic().setDrawModeTriangles();
	}

	var handleKeys = function() {
		if(keys.leftArrowIsDown()) {
			logoMovement.turnLeft();
		}
		if(keys.rightArrowIsDown()) {
			logoMovement.turnRight();
		}
		if(keys.upArrowIsDown()) {
			logoMovement.moveForward();
		}
		if(keys.downArrowIsDown()) {
			logoMovement.moveBackward();
		}
		if(keys.wIsDown()) {
			logoMovement.rollForward();
		}
		if(keys.aIsDown()) {
			logoMovement.yawBackward();
		}
		if(keys.sIsDown()) {
			logoMovement.rollBackward();
		}
		if(keys.dIsDown()) {
			logoMovement.yawForward();
		}
	}

	var interactiveKeyDown = function() {
		return keys.leftArrowIsDown() || 
			keys.upArrowIsDown() || 
			keys.rightArrowIsDown() || 
			keys.downArrowIsDown() || 
			keys.spaceBarIsDown() ||
			keys.wIsDown() ||
			keys.aIsDown() ||
			keys.sIsDown() ||
			keys.dIsDown();
	}

	var updateCanvasVisibility = function() {
		if(showLogo && !isVisibleInViewport(canvas.getDiv())) {
			showLogo = false;
			reset();
		}
		else if(!showLogo && isVisibleInViewport(canvas.getDiv())) {
			showLogo = true;
		}
	}

	var canvasNotVisible = function() {
		return !showGraphic || !showLogo;
	}

	canvas.onSetup = function() {
		keys.addEventListener(canvas);

	    logo = new Logo(canvas, 1, 0.05, 1);
	    logoMovement = new MovementDirector(logo);
	    logo.translateZ(-4);
	    logo.getGraphic().onTap = function(event) {
	    	logoMovement.jump();
	    }

		canvas.setBackgroundColor(0, 0, 0, 0.75);
		//canvas.setBackgroundColor(0, 0.05, 0.16, 0.95);

		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) {
			canvas.getCamera().oneFingerRotate(
				event,
				{ radius: 2, type: 'polar' }
			);
		};
	};

	canvas.onDraw = function() {
		updateCanvasVisibility();
		if(canvasNotVisible()) {
			return;
		}
		handleKeys();
		if(!interactiveKeyDown()) {
			logoMovement.pitchForward();
			logoMovement.rotateTowardInitialRoll();
			logoMovement.rotateTowardInitialYaw();
		}
		logoMovement.update();
		logo.draw();
	};

	canvas.onKeyDown = function(keyCode, event) {
		if(canvasNotVisible()) {
			return;
		}
		if(interactiveKeyDown()) {
			event.preventDefault();
		}
		if(keys.spaceBarIsDown()) {
			logoMovement.jump();
		}
	};

	canvas.start();

}
