function my_application() {

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
	var canvas = new GLCanvas("my_canvas");
	var logo = new GLObject(canvas);

	var animation = new Animation();
	animation.addKeyFrame(0, { rotation : 0 });
	animation.addKeyFrame(1, { rotation : 0.5 });
	animation.addKeyFrame(2, { rotation : 1 });
	animation.addKeyFrame(3, { rotation : 0.5 });
	animation.addKeyFrame(4, { rotation : 0 });
	animation.setLoop(true);
	animation.whenNewFrame().then(function(frame) {
		//console.log('Time: '+ frame.time + ' rotation:' + frame.data.rotation);
	});

	canvas.onSetup = function() {
		var object_maker = new GLObjectMaker(canvas);

		object_maker.identity();
		object_maker.translate([0, 0, 0]);
	    object_maker.box(1, 1, 1);
	    logo = object_maker.flush();

	    var material = new GLMaterial(canvas);
	    material.setAmbientColor([0.2, 0.2, 0.2]);
	    material.setDiffuseColor([1, 1, 1]);
	    material.setSpecularColor([0.8, 0.8, 0.8]);
	    material.setSpecularExponent(2);
	    logo.setMaterial(material);
	    logo.setTexture("js/img/plainWhiteSquare.png");

		//logo.getShader().setLightingDirection([-0.5, 1, 1.5]);
		canvas.setBackgroundColor(0, 0, 0, 1);
		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) {
			canvas.getCamera().oneFingerRotate(event, 
				{ radius:2, type:'polar' }
			);
		};

		canvas.useRedCyanProjector();

		animation.play();
	};

	canvas.onDraw = function() {
		do_interaction();

		var gl = canvas.getGL();
		var cam = canvas.getCamera();

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

	canvas.onKeyDown = function(keyCode) {
	keys[keyCode] = true; 
		if(keys[32]) {
			if(!am_jumping) {
				am_jumping = true;
				jump_dir = 0.2;
			}
		}
	};

	canvas.onKeyUp = function(keyCode) {
		keys[keyCode] = false;
	};

	function do_interaction() {
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
