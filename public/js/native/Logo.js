function Logo(canvas, size, thickness) {
	this._canvas = canvas;

    this._jumpHeight = 0.2;

	this._position = [0, 0, 0];
	this._rotation = [0, 0, 0];
	this._color = [1, 1, 1, 1];

    this._size = size;
    this._thickness = thickness;

    this._object_maker = new GLObjectMaker(this._canvas);
	this._graphic = this._createGraphic();
}

Logo.prototype.reset = function() {
    this._position = [0, 0, 0];
    this._rotation = [0, 0, 0];
    this._color = [1, 1, 1, 1];

    // TODO: reset camera
}

Logo.prototype.getGraphic = function() { return this._graphic; }

Logo.prototype.getXPosition = function() { return this._position[0]; }
Logo.prototype.getYPosition = function() { return this._position[1]; }
Logo.prototype.getZPosition = function() { return this._position[2]; }

Logo.prototype.setXPosition = function(x) { this._position[0] = x; }
Logo.prototype.setYPosition = function(y) { this._position[1] = y; }
Logo.prototype.setZPosition = function(z) { this._position[2] = z; }

Logo.prototype.getXRotation = function() { return this._rotation[0]; }
Logo.prototype.getYRotation = function() { return this._rotation[1]; }
Logo.prototype.getZRotation = function() { return this._rotation[2]; }

Logo.prototype.setXRotation = function(x) { this._rotation[0] = x; }
Logo.prototype.setYRotation = function(y) { this._rotation[1] = y; }
Logo.prototype.setZRotation = function(z) { this._rotation[2] = z; }

Logo.prototype.rotateX = function(x) { this._rotation[0] += x; }
Logo.prototype.rotateY = function(y) { this._rotation[1] += y; }
Logo.prototype.rotateZ = function(z) { this._rotation[2] += z; }

Logo.prototype.translateX = function(x) { this._position[0] += x; }
Logo.prototype.translateY = function(y) { this._position[1] += y; }
Logo.prototype.translateZ = function(z) { this._position[2] += z; }

Logo.prototype.draw = function() {
	var camera = this._canvas.getCamera();

	camera.pushMatrix();
	camera.translate(this._position);
    camera.rotateX(this._rotation[0]);
	camera.rotateY(this._rotation[1]);
    camera.rotateZ(this._rotation[2]);
	this._graphic.getShader().setColorMask(this._color);
	this._graphic.updateShader();
	this._graphic.draw();
	camera.popMatrix();
}

Logo.prototype._createGraphic = function() {
	this._object_maker.identity();
	this._appendObject(
		this._size,
		this._thickness,
		[0, 0, 0],
		[0, 0, 0],
		this._appendLogo.bind(this)
	)
    var graphic = this._object_maker.flush();

    var material = new GLMaterial(this._canvas);
    material.setAmbientColor([0.2, 0.2, 0.2]);
    material.setDiffuseColor([1, 1, 1]);
    material.setSpecularColor([0.8, 0.8, 0.8]);
    material.setSpecularExponent(2);
    graphic.setMaterial(material);
    graphic.setTexture("js/img/white_square.png");

    return graphic;
}

Logo.prototype._appendObject = function(size, thickness, translation, rotation, callback) {
    this._object_maker.translate(translation);
    this._object_maker.rotateX(rotation[0]);
    this._object_maker.rotateY(rotation[1]);
    this._object_maker.rotateZ(rotation[2]);

    callback(size, thickness);

    this._object_maker.rotateX(-rotation[0]);
    this._object_maker.rotateY(-rotation[1]);
    this._object_maker.rotateZ(-rotation[2]);
    this._object_maker.translate([
        -translation[0],
        -translation[1],
        -translation[2]
    ]);
}

Logo.prototype._appendLogo = function(size, thickness) {
    this._appendTopLetter(size, thickness);
    this._appendTopSquare(size, thickness);
    this._appendCenterLine(size, thickness);
    this._appendBottomLetter(size, thickness);
    this._appendBottomSquare(size, thickness);
}

Logo.prototype._appendTopLetter = function(size, thickness) {
    this._appendObject(
        size/2,
        thickness,
        [-Math.sqrt(Math.pow(size, 2)/2)/2, Math.sqrt(Math.pow(size, 2)/2)/2, 0],
        [0, 0, 0],
        this._appendLetter.bind(this)
    );
}

Logo.prototype._appendTopSquare = function(size, thickness) {
    this._appendObject(
        size,
        thickness,
        [-Math.sqrt(Math.pow(size, 2)/2)/2, Math.sqrt(Math.pow(size, 2)/2)/2, 0],
        [0, 0, Math.PI/4],
        this._appendSquare.bind(this)
    );
}

Logo.prototype._appendCenterLine = function(size, thickness) {
    this._appendObject(
        size*2.25,
        thickness,
        [0, 0, 0],
        [0, 0, Math.PI/4],
        this._appendLine.bind(this)
    );
}

Logo.prototype._appendBottomLetter = function(size, thickness) {
    this._appendObject(
        size/2,
        thickness,
        [Math.sqrt(Math.pow(size, 2)/2)/2, -Math.sqrt(Math.pow(size, 2)/2)/2, 0],
        [0, 0, 0],
        this._appendLetter.bind(this)
    );
}

Logo.prototype._appendBottomSquare = function(size, thickness) {
    this._appendObject(
        size,
        thickness,
        [Math.sqrt(Math.pow(size, 2)/2)/2, -Math.sqrt(Math.pow(size, 2)/2)/2, 0],
        [0, 0, -3*Math.PI/4],
        this._appendSquare.bind(this)
    );
}

Logo.prototype._appendLetter = function(size, thickness) {
    var delta = size/2 - thickness/2;

    // horizontal line
    this._object_maker.translate([0, delta, 0]);
    this._object_maker.box(size*0.75, thickness, thickness);
    this._object_maker.translate([0, -delta, 0]);

    // vertical line
    this._object_maker.box(thickness, size, thickness);
}

Logo.prototype._appendSquare = function(size, thickness) {
    var delta = size/2 - thickness/2;

    // top line
    this._object_maker.translate([0, delta, 0]);
    this._object_maker.box(size, thickness, thickness);
    this._object_maker.translate([0, -delta, 0]);

    // right line
    this._object_maker.translate([delta, 0, 0]);
    this._object_maker.box(thickness, size, thickness);
    this._object_maker.translate([-delta, 0, 0]);

    // left line
    this._object_maker.translate([-delta, 0, 0]);
    this._object_maker.box(thickness, size, thickness);
    this._object_maker.translate([delta, 0, 0]);
}

Logo.prototype._appendLine = function(size, thickness) {
    // horizontal line
    this._object_maker.box(size, thickness, thickness);
}
