function my_application() {

	var canvas = new GLCanvas("my_canvas");
	var cube = new GLObject(canvas);

	canvas.onSetup = function() {
		var object_maker = new GLObjectMaker(canvas);
		object_maker.identity();
	    object_maker.translate([0, 0, 1.5]);
	    object_maker.box(0.25, 0.25, 0.25);
	    cube = object_maker.flush();

	    var mat = new GLMaterial(canvas);
	    mat.setAmbientColor([0.2,0.2,0.2]);
	    mat.setDiffuseColor([1,1,1]);
	    mat.setSpecularColor([0.8,0.8,0.8]);
	    mat.setSpecularExponent(2);
	    cube.setMaterial(mat);
	    cube.setTexture("js/img/plainWhiteSquare.png");

		canvas.setBackgroundColor(0, 0, 0, 1);
		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) { 
			canvas.getCamera().oneFingerRotate(event, { radius : 0.5, type : 'polar' }); 
		};
		canvas.useRedCyanProjector();
	};

	canvas.onDraw = function() {
		var gl = canvas.getGL();
		var cam = canvas.getCamera();
		cam.translate([0, 0, -2]);

		cube.updateShader();
		cube.draw();
	};

	canvas.start();

}
