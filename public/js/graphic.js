var body_onload = function() {

	var canvas = new GLCanvas("graphic-canvas");
	var keys = new Keys();
	var logo = null;
	var projectorToggle = false;
	var showGraphic = false;

	EventDispatcher.addEventHandler("toggleGraphic", function(event) {
		showGraphic = !showGraphic;
	});

	EventDispatcher.addEventHandler("resetGraphic", function(event) {
		canvas.useRegularProjector();
		logo.reset();
		logo.translate([0, 0, -4]);
		logo.getGraphic().setDrawModeTriangles();
	});

	EventDispatcher.addEventHandler("clickJump", function(event) {
		logo.jump();
	});

	EventDispatcher.addEventHandler("viewRedCyan", function(event) {
		logo.jump();
		if(projectorToggle) {
    		canvas.useRegularProjector();
    	}
    	else {
    		canvas.useRedCyanProjector();
    	}
    	projectorToggle = !projectorToggle;
	});

	var handleKeys = function() {
		if(keys.leftArrowIsDown()) {
			logo.rotate([0, 0.03, 0]);
		}
		if(keys.upArrowIsDown()) {
			logo.translate([
				Math.cos(logo.getRotation()[1])*0.1,
				0,
				-Math.sin(logo.getRotation()[1])*0.1
			]);
		}
		if(keys.rightArrowIsDown()) {
			logo.rotate([0, -0.03, 0]);
		}
		if(keys.downArrowIsDown()) {
			logo.translate([
				-Math.cos(logo.getRotation()[1])*0.1,
				0,
				Math.sin(logo.getRotation()[1])*0.1
			]);
		}
	}

	var interactiveKeyDown = function() {
		return keys.leftArrowIsDown() || 
			keys.upArrowIsDown() || 
			keys.rightArrowIsDown() || 
			keys.downArrowIsDown() || 
			keys.spaceBarIsDown();
	}

	canvas.onSetup = function() {
		keys.addEventListener(canvas);

	    logo = new Logo(canvas, 1, 0.05, 1);
	    logo.translate([0, 0, -4]);
	    logo.getGraphic().onTap = function(event) {
	    	logo.jump();
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
		if(!showGraphic) {
			return;
		}
		handleKeys();
		if(!interactiveKeyDown()) {
			logo.rotate([0, 0.03, 0]);
		}
		logo.draw();
	};

	canvas.onKeyDown = function(keyCode, event) {
		if(!showGraphic) {
			return;
		}
		if(interactiveKeyDown()) {
			event.preventDefault();
		}
		if(keys.spaceBarIsDown()) {
			logo.jump();
		}
	};

	canvas.start();

}
