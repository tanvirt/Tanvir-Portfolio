var body_onload = function() {

	var canvas = new GLCanvas("graphic-canvas");
	var camera = canvas.getCamera();
	var keys = new Keys();
	var logo = null;
	var graphicToggle = false;

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
		
	    logo = new Logo(canvas);
	    logo.getGraphic().onTap = function(event) {
	    	logo.jump();
	    	if(graphicToggle) {
	    		canvas.useRegularProjector();
	    		logo.getGraphic().setDrawModeTriangles();
	    	}
	    	else {
	    		canvas.useRedCyanProjector();
	    		//logo.getGraphic().setDrawModeLines();
	    	}
	    	graphicToggle = !graphicToggle;
	    }

		canvas.setBackgroundColor(0, 0, 0, 0.75);
		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) {
			canvas.getCamera().oneFingerRotate(
				event,
				{ radius: 2, type: 'polar' }
			);
		};
	};

	canvas.onDraw = function() {
		handleKeys();
		logo.updatePosition();
		if(!interactiveKeyDown()) {
			logo.rotate([0, 0.03, 0]);
		}

		/*camera.translate([0, 0, -10]);
		camera.rotateX(1);*/
		camera.translate([0, 0, -2]);
		logo.draw();
	};
 
	canvas.onKeyDown = function(keyCode, event) {
		if(interactiveKeyDown()) {
			event.preventDefault();
		}
		if(keys.spaceBarIsDown()) {
			logo.jump();
		}
	};

	canvas.start();

}
