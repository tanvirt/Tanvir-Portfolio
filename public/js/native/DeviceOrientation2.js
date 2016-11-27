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

		self._setSmoothXRotation();
		self._setSmoothYRotation();
		self._setSmoothZRotation();
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
	this._xRotation = -1*this._toRadians(angle);
}

DeviceOrientation.prototype._setYRotation = function(alpha, gamma) {
	var angle = 0;
	if(Math.sign(gamma) >= 0) {
		angle = alpha - 180;
	}
	else {
		angle = alpha;
	}
	this._yRotation = -1*this._toRadians(angle);
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
	this._zRotation = -1*this._toRadians(angle);
}

DeviceOrientation.prototype._setSmoothXRotation = function() {
	if(Math.abs(this._xRotation - this._smoothXRotation) < 6) {
		this._smoothXRotation = (1 - this._smoothingWeight)*this._smoothXRotation +
				this._smoothingWeight*this._xRotation;
	}
	else {
		this._smoothXRotation = this._xRotation;
	}
}

DeviceOrientation.prototype._setSmoothYRotation = function() {
	if(Math.abs(this._yRotation - this._smoothYRotation) < 6) {
		this._smoothYRotation = (1 - this._smoothingWeight)*this._smoothYRotation +
				this._smoothingWeight*this._yRotation;
	}
	else {
		this._smoothYRotation = this._yRotation;

		/*var targetRotation = 0;
		if(this._yRotation > this._smoothYRotation) {
			// yRot = 2pi, smoothYRot = 0
			// moving left to right
			// pretend yRot = 0

			if(this._smoothYRotation < 0.03) {
				this._smoothYRotation = 2*Math.PI;
				return;
			}

			targetRotation = 0;
		}
		else {
			// yRot = 0, smoothYRot = 2pi
			// moving right to left
			// pretend yRot = 2pi

			if(2*Math.PI - this._smoothYRotation < 0.03) {
				this._smoothYRotation = 0;
				return;
			}

			targetRotation = 2*Math.PI;
		}

		this._smoothYRotation = (1 - this._smoothingWeight)*this._smoothYRotation +
				this._smoothingWeight*targetRotation;*/
	}
}

DeviceOrientation.prototype._setSmoothZRotation = function() {
	if(Math.abs(this._zRotation - this._smoothZRotation) < 6) {
		this._smoothZRotation = (1 - this._smoothingWeight)*this._smoothZRotation +
				this._smoothingWeight*this._zRotation;
	}
	else {
		this._smoothZRotation = this._zRotation;
	}
}

DeviceOrientation.prototype._toDegrees = function(radians) {
	return radians*(180/Math.PI);
}

DeviceOrientation.prototype._toRadians = function(degrees) {
	return degrees*(Math.PI/180);
}
