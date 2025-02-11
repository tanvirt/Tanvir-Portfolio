function MovementDirector(movingObject) {
	this._movingObject = movingObject;

	this._amJumping = false;
	this._jumpDir = 0;
	this._jumpHeight = 0.2; // default

	this._movementSpeed = 1; // default

    this._translationSpeed = 1;
    this._rotationSpeed = 1;

	this._translationDelta = 0.1;
	this._rotationDelta = 0.03;
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

MovementDirector.prototype.setJumpHeight = function(height) {
    if(height >= 0) {
    	this._jumpHeight = height;
    }
}

MovementDirector.prototype.setTranslationSpeed = function(speed) {
    if(speed >= 0) {
        this._translationSpeed = speed;
    }
}

MovementDirector.prototype.setRotationSpeed = function(speed) {
    if(speed >= 0) {
        this._rotationSpeed = speed;
    }
}

MovementDirector.prototype.jump = function() {
	if(!this._amJumping) {
		this._amJumping = true;
		this._jumpDir = this._jumpHeight;
	}
}

MovementDirector.prototype.update = function() {
    if(this._jumpDir > -this._jumpHeight) {
        this._jumpDir -= 0.01*this._translationSpeed;
        this._movingObject.translateY(this._jumpDir*this._translationSpeed);
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
    	Math.cos(this._movingObject.getYRotation())*this._translationDelta*this._translationSpeed
    );
    this._movingObject.translateZ(
    	-Math.sin(this._movingObject.getYRotation())*this._translationDelta*this._translationSpeed
    );
}

MovementDirector.prototype.moveBackward = function() {
    this._movingObject.translateX(
    	-Math.cos(this._movingObject.getYRotation())*this._translationDelta*this._translationSpeed
    );
    this._movingObject.translateZ(
    	Math.sin(this._movingObject.getYRotation())*this._translationDelta*this._translationSpeed
    );
}

MovementDirector.prototype.turnLeft = function() {
    this.pitchForward();
}

MovementDirector.prototype.turnRight = function() {
    this.pitchBackward();
}

MovementDirector.prototype.rollForward = function() {
    this._movingObject.rotateX(-this._rotationDelta*this._rotationSpeed);
}

MovementDirector.prototype.rollBackward = function() {
    this._movingObject.rotateX(this._rotationDelta*this._rotationSpeed);
}

MovementDirector.prototype.pitchForward = function() {
    this._movingObject.rotateY(this._rotationDelta*this._rotationSpeed);
}

MovementDirector.prototype.pitchBackward = function() {
    this._movingObject.rotateY(-this._rotationDelta*this._rotationSpeed);
}

MovementDirector.prototype.yawForward = function() {
    this._movingObject.rotateZ(-this._rotationDelta*this._rotationSpeed);
}

MovementDirector.prototype.yawBackward = function() {
    this._movingObject.rotateZ(this._rotationDelta*this._rotationSpeed);
}

MovementDirector.prototype.rotateTowardInitialRoll = function() {
    if(Math.abs(this._movingObject.getXRotation()) >= this._rotationDelta*this._rotationSpeed) {
        this._movingObject.rotateX(
        	-this._rotationDelta*Math.sign(this._movingObject.getXRotation())
        );
    }
    else {
        this._movingObject.setXRotation(0);
    }
}

MovementDirector.prototype.rotateTowardInitialPitch = function() {
    if(Math.abs(this._movingObject.getYRotation()) >= this._rotationDelta*this._rotationSpeed) {
        this._movingObject.rotateY(
        	-this._rotationDelta*Math.sign(this._movingObject.getYRotation())
        );
    }
    else {
        this._movingObject.setYRotation(0);
    }
}

MovementDirector.prototype.rotateTowardInitialYaw = function() {
    if(Math.abs(this._movingObject.getZRotation()) >= this._rotationDelta*this._rotationSpeed) {
        this._movingObject.rotateZ(
			-this._rotationDelta*Math.sign(this._movingObject.getZRotation())
        );
    }
    else {
        this._movingObject.setZRotation(0);
    }
}
