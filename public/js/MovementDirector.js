function MovementDirector(movingObject) {
	this._movingObject = movingObject;

	this._amJumping = false;
	this._jumpDir = 0;
}

MovementDirector.prototype.reset = function() {
    this._amJumping = false;
    this._jumpDir = 0;

    this._movingObject.setPosition([0, 0, 0]);
    this._movingObject.setRotation([0, 0, 0]);

    // TODO: reset camera
}

MovementDirector.prototype.jump = function() {
	if(!this._amJumping) {
		this._amJumping = true;
		this._jumpDir = this._movingObject.getJumpHeight();
	}
}

MovementDirector.prototype.update = function() {
    if(this._jumpDir > -this._movingObject.getJumpHeight()) {
        this._jumpDir -= 0.01*this._movingObject.getMovementSpeed();
        this._movingObject.setPosition([
        	this._movingObject.getPosition()[0],
        	this._movingObject.getPosition()[1] + this._jumpDir*this._movingObject.getMovementSpeed(),
        	this._movingObject.getPosition()[2]
        ]);
    }
    else {
        this._jumpDir = -this._movingObject.getJumpHeight();
    }
	if(this._movingObject.getPosition()[1] <= 0) {
		this._movingObject.setPosition([
			this._movingObject.getPosition()[0],
			0,
			this._movingObject.getPosition()[2]
		]);
		this._amJumping = false;
	}
}

MovementDirector.prototype.moveForward = function() {
    this._movingObject.translate([
        Math.cos(this._movingObject.getRotation()[1])*0.1*this._movingObject.getMovementSpeed(),
        0,
        -Math.sin(this._movingObject.getRotation()[1])*0.1*this._movingObject.getMovementSpeed()
    ]);
}

MovementDirector.prototype.moveBackward = function() {
    this._movingObject.translate([
        -Math.cos(this._movingObject.getRotation()[1])*0.1*this._movingObject.getMovementSpeed(),
        0,
        Math.sin(this._movingObject.getRotation()[1])*0.1*this._movingObject.getMovementSpeed()
    ]);
}

MovementDirector.prototype.turnLeft = function() {
    this.pitchForward();
}

MovementDirector.prototype.turnRight = function() {
    this.pitchBackward();
}

MovementDirector.prototype.rollForward = function() {
    // x-axis rotation
    this._movingObject.rotate([
    	-0.03*this._movingObject.getMovementSpeed(),
    	0,
    	0
    ]);
}

MovementDirector.prototype.rollBackward = function() {
    // x-axis rotation
    this._movingObject.rotate([
    	0.03*this._movingObject.getMovementSpeed(),
    	0,
    	0
    ]);
}

MovementDirector.prototype.pitchForward = function() {
    // y-axis rotation
    this._movingObject.rotate([
    	0,
    	0.03*this._movingObject.getMovementSpeed(),
    	0
    ]);
}

MovementDirector.prototype.pitchBackward = function() {
    // y-axis rotation
    this._movingObject.rotate([
    	0,
    	-0.03*this._movingObject.getMovementSpeed(),
    	0
    ]);
}

MovementDirector.prototype.yawForward = function() {
    // z-axis rotation
    this._movingObject.rotate([
    	0,
    	0,
    	-0.03*this._movingObject.getMovementSpeed()
    ]);
}

MovementDirector.prototype.yawBackward = function() {
    // z-axis rotation
    this._movingObject.rotate([
    	0,
    	0,
    	0.03*this._movingObject.getMovementSpeed()
    ]);
}

MovementDirector.prototype.rotateTowardInitialRoll = function() {
    // x-axis rotation
    if(Math.abs(this._movingObject.getRotation()[0]) >= 0.03*this._movingObject.getMovementSpeed()) {
        this._movingObject.rotate([
            -0.03*Math.sign(this._movingObject.getRotation()[0]*this._movingObject.getMovementSpeed()),
            0,
            0
        ]);
    }
    else {
        this._movingObject.setRotation([
            0,
            this._movingObject.getRotation()[1],
            this._movingObject.getRotation()[2]
        ]);
    }
}

MovementDirector.prototype.rotateTowardInitialPitch = function() {
    // y-axis rotation
    if(Math.abs(this._movingObject.getRotation()[1]) >= 0.03*this._movingObject.getMovementSpeed()) {
        this._movingObject.rotate([
        	0,
            -0.03*Math.sign(this._movingObject.getRotation()[1]*this._movingObject.getMovementSpeed()),
            0
        ]);
    }
    else {
        this._movingObject.setRotation([
            this._movingObject.getRotation()[0],
            0,
            this._movingObject.getRotation()[2]
        ]);
    }
}

MovementDirector.prototype.rotateTowardInitialYaw = function() {
    // z-axis rotation
    if(Math.abs(this._movingObject.getRotation()[2]) >= 0.03*this._movingObject.getMovementSpeed()) {
        this._movingObject.rotate([
            0,
            0,
            -0.03*Math.sign(this._movingObject.getRotation()[2]*this._movingObject.getMovementSpeed())
        ]);
    }
    else {
        this._movingObject.setRotation([
            this._movingObject.getRotation()[0],
            this._movingObject.getRotation()[1],
            0
        ]);
    }
}
