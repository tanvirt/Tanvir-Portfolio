function DeviceOrientation() {
	this._xRotation = 0;
	this._yRotation = 0;
	this._zRotation = 0;

	this._smoothingWeight = 0.2;
	this._smoothXRotation = 0;
	this._smoothYRotation = 0;
	this._smoothZRotation = 0;

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

		document.getElementById("xRotation").innerHTML = "xRotation: " + self._xRotation.toFixed(2);
		document.getElementById("yRotation").innerHTML = "yRotation: " + self._yRotation.toFixed(2);
		document.getElementById("zRotation").innerHTML = "zRotation: " + self._zRotation.toFixed(2);

		self._smoothXRotation = (1 - self._smoothingWeight)*self._smoothXRotation +
			self._smoothingWeight*self._xRotation;
		self._smoothYRotation = (1 - self._smoothingWeight)*self._smoothYRotation +
			self._smoothingWeight*self._yRotation;
		self._smoothZRotation = (1 - self._smoothingWeight)*self._smoothZRotation +
			self._smoothingWeight*self._zRotation;
		document.getElementById("smoothXRotation").innerHTML = "smoothXRotation: " + self._smoothXRotation.toFixed(2);
		document.getElementById("smoothYRotation").innerHTML = "smoothYRotation: " + self._smoothYRotation.toFixed(2);
		document.getElementById("smoothZRotation").innerHTML = "smoothZRotation: " + self._smoothZRotation.toFixed(2);
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
