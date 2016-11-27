function DeviceOrientation() {
	this._xRotation = 0;
	this._yRotation = 0;
	this._zRotation = 0;

	this._init();
}

DeviceOrientation.prototype._init = function() {
	this._setOnDeviceOrientationEvent();
}

DeviceOrientation.prototype.getXRotation = function() { return this._xRotation; }
DeviceOrientation.prototype.getYRotation = function() { return this._yRotation; }
DeviceOrientation.prototype.getZRotation = function() { return this._zRotation; }

DeviceOrientation.prototype._setOnDeviceOrientationEvent = function() {
	var self = this;
	window.ondeviceorientation = function(event) {
		var alpha = Math.round(event.alpha);
		var beta = Math.round(event.beta);
		var gamma = Math.round(event.gamma);

		self._setXRotation(gamma);
		self._setYRotation(alpha, gamma);
		self._setZRotation(beta, gamma);

		document.getElementById("xRotation").innerHTML = "xRotation: " + this._xRotation;
		document.getElementById("yRotation").innerHTML = "yRotation: " + this._yRotation;
		document.getElementById("zRotation").innerHTML = "zRotation: " + this._zRotation;
	}
}

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

DeviceOrientation.prototype._getValueFromNewRange = function(value, oldMin, oldMax, newMin, newMax) {
	var oldRange = oldMax - oldMin; 
	var newRange = newMax - newMin;
	var newValue = (((value - oldMin)*newRange)/oldRange) + newMin;

	return newValue;
}

DeviceOrientation.prototype._toDegrees = function(radians) {
	return radians*(180/Math.PI);
}

DeviceOrientation.prototype._toRadians = function(degrees) {
	return degrees*(Math.PI/180);
}
