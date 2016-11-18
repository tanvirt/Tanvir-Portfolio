function my_application() {

	var canvas = new GLCanvas("my_canvas");
	var gl = canvas.getGL();
	var camera = canvas.getCamera();

	var logo = new GLObject(canvas);

	var animation = new Animation();
	animation.addKeyFrame(0, { rotation : 0 });
	animation.addKeyFrame(1, { rotation : 0.25 });
	animation.addKeyFrame(2, { rotation : 0.5 });
	animation.addKeyFrame(3, { rotation : 0.75 });
	animation.addKeyFrame(4, { rotation : 1 });
	animation.setLoop(true);
	animation.whenNewFrame().then(function(frame){
		//console.log('Time: '+ frame.time + ' rotation:' + frame.data.rotation);
		logo.rotateY(0.1);
	});

	canvas.onSetup = function() {
		var object_maker = new GLObjectMaker(canvas);
		object_maker.identity();
	    object_maker.translate([0, 0, 1.5]);
	    object_maker.box(0.25, 0.25, 0.25);
	    logo = object_maker.flush();

	    var material = new GLMaterial(canvas);
	    material.setAmbientColor([0.2, 0.2, 0.2]);
	    material.setDiffuseColor([1, 1, 1]);
	    material.setSpecularColor([0.8, 0.8, 0.8]);
	    material.setSpecularExponent(2);
	    logo.setMaterial(material);
	    logo.setTexture("js/img/plainWhiteSquare.png");

		canvas.setBackgroundColor(0, 0, 0, 1);
		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) { 
			canvas.getCamera().oneFingerRotate(event, { radius : 0.5, type : 'polar' }); 
		};
		canvas.useRedCyanProjector();

		animation.play();
	};

	canvas.onDraw = function() {
		camera.translate([0, 0, -2]);

		logo.updateShader();
		logo.draw();
	};

	canvas.start();

}
