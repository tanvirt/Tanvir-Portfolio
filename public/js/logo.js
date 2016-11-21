function Logo(canvas) {
	this._canvas = canvas;

	this._amJumping = false;
	this._jumpDir = 0;

	this._position = [0, 0, -2];
	this._rotation = [0, 0, 0];
	this._color = [1, 1, 1, 1];

	this._graphic = this._createGraphic();
}

Logo.prototype.getRotation = function() {
	return this._rotation;
}

Logo.prototype.getGraphic = function() {
	return this._graphic;
}

Logo.prototype.rotate = function(rotation) {
	this._rotation[0] += rotation[0];
	this._rotation[1] += rotation[1];
	this._rotation[2] += rotation[2];
}

Logo.prototype.translate = function(translation) {
	this._position[0] += translation[0];
	this._position[1] += translation[1];
	this._position[2] += translation[2];
}

Logo.prototype.draw = function() {
	var camera = this._canvas.getCamera();

	camera.pushMatrix();
	camera.translate(this._position);
	camera.rotateY(this._rotation[1]);
	this._graphic.getShader().setColorMask(this._color);
	this._graphic.updateShader();
	this._graphic.draw();
	camera.popMatrix();
}

Logo.prototype.jump = function() {
	if(!this._amJumping) {
		this._amJumping = true;
		this._jumpDir = 0.2;
	}
}

Logo.prototype.updatePosition = function() {
	this._jumpDir -= 0.01;
	this._position[1] += this._jumpDir;
	if(this._position[1] <= 0) {
	   this._position[1] = 0;
	   this._amJumping = false;
	}
}

Logo.prototype._createGraphic = function() {
	var object_maker = new GLObjectMaker(this._canvas);
	object_maker.identity();
	this._appendObject(
		object_maker, 
		1,
		0.05,
		[0, 0, 0],
		[0, 0, 0],
		this._appendLogo.bind(this)
	)
    var graphic = object_maker.flush();

    var material = new GLMaterial(this._canvas);
    material.setAmbientColor([0.2, 0.2, 0.2]);
    material.setDiffuseColor([1, 1, 1]);
    material.setSpecularColor([0.8, 0.8, 0.8]);
    material.setSpecularExponent(2);
    graphic.setMaterial(material);
    graphic.setTexture("js/img/white_square.png");
    //this._graphic.setVideoTexture("js/img/abstract_light_hd.mp4");

    return graphic;
}

Logo.prototype._appendObject = function(object_maker, size, thickness, translation, rotation, callback) {
    object_maker.translate(translation);
    object_maker.rotateX(rotation[0]);
    object_maker.rotateY(rotation[1]);
    object_maker.rotateZ(rotation[2]);

    callback(object_maker, size, thickness);

    object_maker.rotateX(-rotation[0]);
    object_maker.rotateY(-rotation[1]);
    object_maker.rotateZ(-rotation[2]);
    object_maker.translate([
        -translation[0],
        -translation[1],
        -translation[2]
    ]);
}

Logo.prototype._appendLogo = function(object_maker, size, thickness) {
    this._appendTopLetter(object_maker, size, thickness);
    this._appendTopSquare(object_maker, size, thickness);
    this._appendCenterLine(object_maker, size, thickness);
    this._appendBottomLetter(object_maker, size, thickness);
    this._appendBottomSquare(object_maker, size, thickness);
}

Logo.prototype._appendLetter = function(object_maker, size, thickness) {
    var delta = size/2 - thickness/2;

    // horizontal line
    object_maker.translate([0, delta, 0]);
    object_maker.box(size*0.75, thickness, thickness);
    object_maker.translate([0, -delta, 0]);

    // vertical line
    object_maker.box(thickness, size, thickness);
}

Logo.prototype._appendSquare = function(object_maker, size, thickness) {
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
}

Logo.prototype._appendLine = function(object_maker, size, thickness) {
    // horizontal line
    object_maker.box(size, thickness, thickness);
}

Logo.prototype._appendTopLetter = function(object_maker, size, thickness) {
	this._appendObject(
    	object_maker,
    	size/2,
    	thickness,
    	[-Math.sqrt(0.5)/2, Math.sqrt(0.5)/2, 0],
    	[0, 0, 0],
    	this._appendLetter
    );
}

Logo.prototype._appendTopSquare = function(object_maker, size, thickness) {
	this._appendObject(
    	object_maker,
    	size,
		thickness,
    	[-Math.sqrt(size/2)/2, Math.sqrt(size/2)/2, 0],
    	[0, 0, Math.PI/4],
	    this._appendSquare
    );
}

Logo.prototype._appendCenterLine = function(object_maker, size, thickness) {
	this._appendObject(
    	object_maker,
    	size*2.25,
		thickness,
    	[0, 0, 0],
    	[0, 0, Math.PI/4],
	    this._appendLine
    );
}

Logo.prototype._appendBottomLetter = function(object_maker, size, thickness) {
	this._appendObject(
    	object_maker,
    	size/2,
    	thickness,
    	[Math.sqrt(size/2)/2, -Math.sqrt(size/2)/2, 0],
    	[0, 0, 0],
    	this._appendLetter
    );
}

Logo.prototype._appendBottomSquare = function(object_maker, size, thickness) {
	this._appendObject(
    	object_maker,
    	size,
		thickness,
    	[Math.sqrt(size/2)/2, -Math.sqrt(size/2)/2, 0],
    	[0, 0, -3*Math.PI/4],
	    this._appendSquare
    );
}
