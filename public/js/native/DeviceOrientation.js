function DeviceOrientation(camera) {
	this._xRotation = 0;
	this._yRotation = 0;
	this._zRotation = 0;

	this._camera = camera;
}

DeviceOrientation.prototype.startTracking = function() {
	var self = this;
	window.ondeviceorientation = function(event) {
		var alpha = Math.round(event.alpha);
		var beta = Math.round(event.beta);
		var gamma = Math.round(event.gamma);

		self._setXRotation(gamma);
		self._setYRotation(alpha, gamma);
		self._setZRotation(beta, gamma);

		self._camera.reset();
		self._camera.rotateX(self._xRotation);
		self._camera.rotateX(self._xRotation);
		self._camera.rotateX(self._xRotation);
	}
}

DeviceOrientation.prototype.stopTracking = function() {
	window.ondeviceorientation = null;
}

DeviceOrientation.prototype.getXRotation = function() { return this._xRotation; }
DeviceOrientation.prototype.getYRotation = function() { return this._yRotation; }
DeviceOrientation.prototype.getZRotation = function() { return this._zRotation; }

DeviceOrientation.prototype._setXRotation = function(gamma) {
	var angle = 0;
	if(Math.sign(gamma) >= 0) {
		angle = 90 - gamma;
	}
	else {
		angle = -1*(90 + gamma);
	}
	this._xRotation = this._toRadians(angle);
}

DeviceOrientation.prototype._setYRotation = function(alpha, gamma) {
	var angle = 0;
	if(Math.sign(gamma) >= 0) {
		angle = alpha - 180;
	}
	else {
		angle = alpha;
	}
	this._yRotation = this._toRadians(angle);
}

DeviceOrientation.prototype._setZRotation = function(beta, gamma) {
	var angle = 0;
	if(Math.sign(gamma) >= 0) {
		if(Math.sign(beta) >= 0) {
			angle = beta - 180;
		}
		else {
			angle = 180 + beta;
		}
	}
	else {
		angle = -1*beta;
	}
	this._zRotation = this._toRadians(angle);
}

DeviceOrientation.prototype._toDegrees = function(radians) {
	return radians*(180/Math.PI);
}

DeviceOrientation.prototype._toRadians = function(degrees) {
	return degrees*(Math.PI/180);
}
