var body_onload = function() {

	var canvas = new GLCanvas("graphic-canvas");
	var keys = new Keys();
	var logo = null;
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

	var reset = function() {
		canvas.useRegularProjector();
		logo.reset();
		logo.translate([0, 0, -4]);
		logo.getGraphic().setDrawModeTriangles();
	}

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
		if(keys.wIsDown()) {
			logo.rotate([-0.03, 0, 0]);
		}
		if(keys.aIsDown()) {
			logo.rotate([0, 0, 0.03]);
		}
		if(keys.sIsDown()) {
			logo.rotate([0.03, 0, 0]);
		}
		if(keys.dIsDown()) {
			logo.rotate([0, 0, -0.03]);
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
		updateCanvasVisibility();
		if(canvasNotVisible()) {
			return;
		}
		handleKeys();
		if(!interactiveKeyDown()) {
			rotateLogoPositivePitch();
			rotateLogoToStartingRoll();
			rotateLogoToStartingYaw();
		}
		logo.draw();
	};

	var rotateLogoPositivePitch = function() {
		// y-axis rotation
		logo.rotate([0, 0.03, 0]);
	}

	var rotateLogoToStartingRoll = function() {
		// x-axis rotation
		if(Math.abs(logo.getRotation()[0]) >= 0.03) {
			logo.rotate([
				-0.03*Math.sign(logo.getRotation()[0]),
				0,
				0
			]);
		}
		else {
			logo.setRotation([
				0,
				logo.getRotation()[1],
				logo.getRotation()[2]
			]);
		}
	}

	var rotateLogoToStartingYaw = function() {
		// z-axis rotation
		if(Math.abs(logo.getRotation()[2]) >= 0.03) {
			logo.rotate([
				0,
				0,
				-0.03*Math.sign(logo.getRotation()[2])
			]);
		}
		else {
			logo.setRotation([
				logo.getRotation()[0],
				logo.getRotation()[1],
				0
			]);
		}
	}

	canvas.onKeyDown = function(keyCode, event) {
		if(canvasNotVisible()) {
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
