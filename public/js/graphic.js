var body_onload = function() {

	var keys = [];
	for(var i = 0; i < 128; i++) {
		keys.push(false);
	}
	var am_jumping = false;
	var jump_dir = 0;

	var me = new Object();

	me.pos_x = 0;
	me.pos_y = 0;
	me.pos_z = 0;

	me.orientation = 0;

	me.color_r = 1;
	me.color_g = 1;
	me.color_b = 1;

	// Create 3D canvas
	var canvas = new GLCanvas("graphic-canvas");
	var logo = new GLObject(canvas);

	canvas.onSetup = function() {
		var object_maker = new GLObjectMaker(canvas);
		object_maker.identity();
		object_maker.translate([0, 0, 0]);
	    object_maker.box(0.25, 0.25, 0.25);
	    //object_maker.box(0.1, 0.1, 0.1);
	    logo = object_maker.flush();

	    var material = new GLMaterial(canvas);
	    material.setAmbientColor([0.2, 0.2, 0.2]);
	    material.setDiffuseColor([1, 1, 1]);
	    material.setSpecularColor([0.8, 0.8, 0.8]);
	    material.setSpecularExponent(2);
	    logo.setMaterial(material);
	    logo.setTexture("js/img/white_square.png");

		canvas.setBackgroundColor(0, 0, 0, 0);
		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) {
			canvas.getCamera().oneFingerRotate(
				event,
				{ radius: 2, type: 'polar' }
			);
		};
		canvas.useRedCyanProjector();
	};

	canvas.onDraw = function() {
		interact();
		if(!interactiveKeyDown()) {
			//me.orientation += 0.01;
		}

		var gl = canvas.getGL();
		var cam = canvas.getCamera();

		/*cam.translate([0, 0, -10]);
		cam.rotateX(1);*/
		cam.translate([0, 0, -2]);
		cam.pushMatrix();
		cam.translate([me.pos_x, me.pos_y, me.pos_z]);
		cam.rotateY(me.orientation);
		logo.getShader().setColorMask([
			me.color_r,
			me.color_g,
			me.color_b,
			1
		]);
		logo.updateShader();
		logo.draw();
		cam.popMatrix();
	};

	canvas.onKeyDown = function(keyCode, event) {
		keys[keyCode] = true;
		if(interactiveKeyDown()) {
			event.preventDefault();
		}
		if(keys[32]) {
			if(!am_jumping) {
				am_jumping = true;
				jump_dir = 0.2;
			}
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
			me.orientation += 0.03;
		}
		if(keys[38]) {
		    // Up Arrow Key
			me.pos_x += Math.cos(me.orientation)*0.1;
			me.pos_z -= Math.sin(me.orientation)*0.1;
		}
		if(keys[39]) {
		    // Right Arrow Key
			me.orientation -= 0.03;
		}
		if(keys[40]) {
		    // Down Arrow Key
			me.pos_x -= Math.cos(me.orientation)*0.1;
			me.pos_z += Math.sin(me.orientation)*0.1;
		}

		jump_dir -= 0.01;
		me.pos_y += jump_dir;
		if(me.pos_y <= 0) {
		   me.pos_y = 0;
		   am_jumping = false;
		}
	}

	canvas.start();

}
