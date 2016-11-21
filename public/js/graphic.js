var body_onload = function() {

	var graphicToggle = false;

	var keys = [];
	for(var i = 0; i < 128; i++) {
		keys.push(false);
	}

	var canvas = new GLCanvas("graphic-canvas");
	var gl = canvas.getGL();
	var cam = canvas.getCamera();

	var logo = null;

	canvas.onSetup = function() {
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
		interact();
		logo.updatePosition();
		if(!interactiveKeyDown()) {
			logo.rotate([0, 0.03, 0]);
		}

		/*cam.translate([0, 0, -10]);
		cam.rotateX(1);*/
		cam.translate([0, 0, -2]);
		logo.draw();
	};

	canvas.onKeyDown = function(keyCode, event) {
		keys[keyCode] = true;
		if(interactiveKeyDown()) {
			event.preventDefault();
		}
		if(keys[32]) {
			logo.jump();
		}
	};

	canvas.onKeyUp = function(keyCode, event) {
		keys[keyCode] = false;
	};

	var interactiveKeyDown = function() {
		return keys[37] || keys[38] || keys[39] || keys[40] || keys[32];
	}

	var interact = function() {
		if(keys[37]) {
	    	// Left Arrow Key
			logo.rotate([0, 0.03, 0]);
		}
		if(keys[38]) {
		    // Up Arrow Key
			logo.translate([
				Math.cos(logo.getRotation()[1])*0.1,
				0,
				-Math.sin(logo.getRotation()[1])*0.1
			]);
		}
		if(keys[39]) {
		    // Right Arrow Key
			logo.rotate([0, -0.03, 0]);
		}
		if(keys[40]) {
		    // Down Arrow Key
			logo.translate([
				-Math.cos(logo.getRotation()[1])*0.1,
				0,
				Math.sin(logo.getRotation()[1])*0.1
			]);
		}
	}

	canvas.start();

}
