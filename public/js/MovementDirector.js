function MovementDirector(movingObject) {
	this._movingObject = movingObject;

	this._amJumping = false;
	this._jumpDir = 0;
	this._jumpHeight = 0.2; // default

	this._movementSpeed = 1; // default
}

MovementDirector.prototype.reset = function() {
    this._amJumping = false;
    this._jumpDir = 0;

    this._movingObject.setXPosition(0);
    this._movingObject.setYPosition(0);
    this._movingObject.setZPosition(0);

    this._movingObject.setXRotation(0);
    this._movingObject.setYRotation(0);
    this._movingObject.setZRotation(0);
}

MovementDirector.prototype.jump = function() {
	if(!this._amJumping) {
		this._amJumping = true;
		this._jumpDir = this._jumpHeight;
	}
}

MovementDirector.prototype.update = function() {
    if(this._jumpDir > -this._jumpHeight) {
        this._jumpDir -= 0.01*this._movementSpeed;
        this._movingObject.translateY(this._jumpDir*this._movementSpeed);
    }
    else {
        this._jumpDir = -this._jumpHeight;
    }
	if(this._movingObject.getYPosition() <= 0) {
		this._movingObject.setYPosition(0);
		this._amJumping = false;
	}
}

MovementDirector.prototype.moveForward = function() {
    this._movingObject.translateX(
    	Math.cos(this._movingObject.getYRotation())*0.1*this._movementSpeed
    );
    this._movingObject.translateZ(
    	-Math.sin(this._movingObject.getYRotation())*0.1*this._movementSpeed
    );
}

MovementDirector.prototype.moveBackward = function() {
    this._movingObject.translateX(
    	-Math.cos(this._movingObject.getYRotation())*0.1*this._movementSpeed
    );
    this._movingObject.translateZ(
    	Math.sin(this._movingObject.getYRotation())*0.1*this._movementSpeed
    );
}

MovementDirector.prototype.turnLeft = function() {
    this.pitchForward();
}

MovementDirector.prototype.turnRight = function() {
    this.pitchBackward();
}

MovementDirector.prototype.rollForward = function() {
    this._movingObject.rotateX(-0.03*this._movementSpeed);
}

MovementDirector.prototype.rollBackward = function() {
    this._movingObject.rotateX(0.03*this._movementSpeed);
}

MovementDirector.prototype.pitchForward = function() {
    this._movingObject.rotateY(0.03*this._movementSpeed);
}

MovementDirector.prototype.pitchBackward = function() {
    this._movingObject.rotateY(-0.03*this._movementSpeed);
}

MovementDirector.prototype.yawForward = function() {
    this._movingObject.rotateZ(-0.03*this._movementSpeed);
}

MovementDirector.prototype.yawBackward = function() {
    this._movingObject.rotateZ(0.03*this._movementSpeed);
}

MovementDirector.prototype.rotateTowardInitialRoll = function() {
    if(Math.abs(this._movingObject.getXRotation()) >= 0.03*this._movementSpeed) {
        this._movingObject.rotateX(
        	-0.03*Math.sign(this._movingObject.getXRotation()*this._movementSpeed)
        );
    }
    else {
        this._movingObject.setXRotation(0);
    }
}

MovementDirector.prototype.rotateTowardInitialPitch = function() {
    // y-axis rotation
    if(Math.abs(this._movingObject.getYRotation()) >= 0.03*this._movementSpeed) {
        this._movingObject.rotateY(
        	-0.03*Math.sign(this._movingObject.getYRotation()*this._movementSpeed)
        );
    }
    else {
        this._movingObject.setYRotation(0);
    }
}

MovementDirector.prototype.rotateTowardInitialYaw = function() {
    // z-axis rotation
    if(Math.abs(this._movingObject.getZRotation()) >= 0.03*this._movementSpeed) {
        this._movingObject.rotateZ(
			-0.03*Math.sign(this._movingObject.getZRotation()*this._movementSpeed)
        );
    }
    else {
        this._movingObject.setZRotation(0);
    }
}
