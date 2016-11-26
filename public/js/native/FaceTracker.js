function FaceTracker(elementId) {
	var video = document.getElementById(elementId);

	this._videoWidth = video.width;
	this._videoHeight = video.height;

	this._faceWidth = 0;
	this._faceHeight = 0;

	this._position = [0, 0];

	this._tracker = new tracking.ObjectTracker('face');

	this._init();
}

FaceTracker.prototype._init = function() {
	this._tracker.setInitialScale(4);
	this._tracker.setStepSize(2);
	this._tracker.setEdgesDensity(0.1);

	tracking.track('#video', this._tracker, { camera: true });

	this._setOnTrackEvent();
}

FaceTracker.prototype.getVideoWidth = function() { return this._videoWidth; }
FaceTracker.prototype.getVideoHeight = function() { return this._videoHeight; }

FaceTracker.prototype.getFaceWidth = function() { return this._faceWidth; }
FaceTracker.prototype.getFaceHeight = function() { return this._faceWidth; }

FaceTracker.prototype.getXPosition = function() { return this._position[0]; }
FaceTracker.prototype.getYPosition = function() { return this._position[1]; }

FaceTracker.prototype._setOnTrackEvent = function() {
	var self = this;
	this._tracker.on('track', function(event) {
		event.data.forEach(function(rect) {
			console.log([rect.x, rect.y, rect.width, rect.height]);

			self._faceWidth = rect.width;
			self._faceHeight = rect.height;
			self._position = [
				(rect.x + rect.width)/2,
				(rect.y + rect.height)/2
			];
		});
	});
}

var loadFaceTracker = function() {
	var faceTracker = new FaceTracker("video");
}
