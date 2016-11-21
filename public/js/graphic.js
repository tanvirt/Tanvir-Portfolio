var body_onload = function() {

	var graphicSelected = false;

	var keys = [];
	for(var i = 0; i < 128; i++) {
		keys.push(false);
	}
	var am_jumping = false;
	var jump_dir = 0;

	var me = new Object();

	me.pos_x = 0;
	me.pos_y = 0;
	me.pos_z = -2;

	me.orientation = 0;
	//me.orientation = Math.PI/4;

	me.color_r = 1;
	me.color_g = 1;
	me.color_b = 1;

	// Create 3D canvas
	var canvas = new GLCanvas("graphic-canvas");
	var logo = new GLObject(canvas);

	var appendLetter = function(object_maker, size, thickness, translation, rotation) {
		object_maker.translate(translation);
		object_maker.rotateX(rotation[0]);
		object_maker.rotateY(rotation[1]);
	    object_maker.rotateZ(rotation[2]);

	    var delta = size/2 - thickness/2;

	    // horizontal line
	    object_maker.translate([0, delta, 0]);
	    object_maker.box(size*0.75, thickness, thickness);
	    object_maker.translate([0, -delta, 0]);

	    // vertical line
	    object_maker.box(thickness, size, thickness);

	    object_maker.rotateX(-rotation[0]);
		object_maker.rotateY(-rotation[1]);
	    object_maker.rotateZ(-rotation[2]);
	    object_maker.translate([
	    	-translation[0],
	    	-translation[1],
	    	-translation[2]
	    ]);
	}

	var appendSquare = function(object_maker, size, thickness, translation, rotation) {
		object_maker.translate(translation);
		object_maker.rotateX(rotation[0]);
		object_maker.rotateY(rotation[1]);
	    object_maker.rotateZ(rotation[2]);

	    var delta = size/2 - thickness/2;

	    // top line
	    object_maker.translate([0, delta, 0]);
	    object_maker.box(size, thickness, thickness);
	    object_maker.translate([0, -delta, 0]);

	    /*// bottom line
	    object_maker.translate([0, -delta, 0]);
	    object_maker.box(size, thickness, thickness);
	    object_maker.translate([0, delta, 0]);*/

	    // right line
	    object_maker.translate([delta, 0, 0]);
	    object_maker.box(thickness, size, thickness);
	    object_maker.translate([-delta, 0, 0]);

	    // left line
	    object_maker.translate([-delta, 0, 0]);
	    object_maker.box(thickness, size, thickness);
	    object_maker.translate([delta, 0, 0]);

	    object_maker.rotateX(-rotation[0]);
		object_maker.rotateY(-rotation[1]);
	    object_maker.rotateZ(-rotation[2]);
	    object_maker.translate([
	    	-translation[0],
	    	-translation[1],
	    	-translation[2]
	    ]);
	}

	var appendLine = function(object_maker, size, thickness, translation, rotation) {
		object_maker.translate(translation);
		object_maker.rotateX(rotation[0]);
		object_maker.rotateY(rotation[1]);
	    object_maker.rotateZ(rotation[2]);

	    var delta = size/2 - thickness/2;

	    // horizontal line
	    object_maker.box(size, thickness, thickness);

	    object_maker.rotateX(-rotation[0]);
		object_maker.rotateY(-rotation[1]);
	    object_maker.rotateZ(-rotation[2]);
	    object_maker.translate([
	    	-translation[0],
	    	-translation[1],
	    	-translation[2]
	    ]);
	}

	canvas.onSetup = function() {
		var object_maker = new GLObjectMaker(canvas);
		object_maker.identity();

		// top letter
		appendLetter(
	    	object_maker,
	    	0.5,
	    	0.05,
	    	[-0.5, 0.5, 0],
	    	[0, 0, 0]
	    );

	    // top square
	    appendSquare(
	    	object_maker,
	    	1,
	    	0.05,
	    	[-0.5, 0.5, 0],
	    	[0, 0, Math.PI/4]
	    );

	    // center Line
	    appendLine(
	    	object_maker,
	    	2.125,
	    	0.05,
	    	[0, 0, 0],
	    	[0, 0, Math.PI/4]
	    );

	    // bottom letter
	    appendLetter(
	    	object_maker,
	    	0.5,
	    	0.05,
	    	[0.5, -0.5, 0],
	    	[0, 0, 0]
	    );

	    // bottom square
	    appendSquare(
	    	object_maker,
	    	1,
	    	0.05,
	    	[0.5, -0.5, 0],
	    	[0, 0, -3*Math.PI/4]
	    );

	    logo = object_maker.flush();

	    var material = new GLMaterial(canvas);
	    material.setAmbientColor([0.2, 0.2, 0.2]);
	    material.setDiffuseColor([1, 1, 1]);
	    material.setSpecularColor([0.8, 0.8, 0.8]);
	    material.setSpecularExponent(2);
	    logo.setMaterial(material);
	    logo.setTexture("js/img/white_square.png");

	    logo.onTap = function(event) {
	    	if(graphicSelected) {
	    		graphicSelected = false;
	    		canvas.setBackgroundColor(0, 0, 0, 0);
	    		canvas.useRegularProjector();
	    	}
	    	else {
	    		graphicSelected = true;
	    		canvas.setBackgroundColor(0, 0, 0, 0.75);
	    		canvas.useRedCyanProjector();
	    		//logo.setDrawModeLines();
	    	}
	    }

		canvas.setBackgroundColor(0, 0, 0, 0);
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
