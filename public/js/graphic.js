function my_application() {

	var canvas = new GLCanvas("my_canvas");
	var cube = new GLObject(canvas);

	canvas.onSetup = function() {
		var object_maker = new GLObjectMaker(canvas);
		object_maker.identity();
	    object_maker.box(1, 1, 1);
	    object_maker.translate([0.3, 0.3, 0]);
	    object_maker.sphere(12, 1, 1, 1);
	    object_maker.cylinderX(8, 1.5, 0.2, 0.2);
	    cube = object_maker.flush();

	    var mat = new GLMaterial(canvas);
	    mat.setAmbientColor([0.2, 0.2, 0.2]);
	    mat.setDiffuseColor([1, 1, 1]);
	    mat.setSpecularColor([0.8, 0.8, 0.8]);
	    mat.setSpecularExponent(2);
	    cube.setMaterial(mat);
	    cube.setTexture("http://www.visineat.com/js/img/textures/wood_tile2.jpg");

		cube.getShader().setLightingDirection([-0.5, 1, 1.5]);
		canvas.setBackgroundColor(0, 0, 0, 0);
		canvas.setLoadingStatus(false);
		canvas.onDrag = function(event) { 
			canvas.getCamera().oneFingerRotate(event, { radius : 2, type : 'polar' }); 
		};
	};

	canvas.onDraw = function() {
		var gl = canvas.getGL();
		var cam = canvas.getCamera();
		cam.translate([0, 0, -10]);

		cube.updateShader();
		cube.draw();
	};

	canvas.start();

}
