function FaceTracker(elementId) {
	var video = document.getElementById(elementId);

	this._elementId = elementId;

	this._videoWidth = video.width;
	this._videoHeight = video.height;

	this._faceWidth = 0;
	this._faceHeight = 0;

	this._position = [0, 0];
	this._positionMagnitude = [0, 0];

	this._tracker = new tracking.ObjectTracker('face');
	this._trackerTask = null;

	this._init();
}

FaceTracker.prototype._init = function() {
	this._tracker.setInitialScale(4);
	this._tracker.setStepSize(2);
	this._tracker.setEdgesDensity(0.1);

	this._setOnTrackEvent();
}

FaceTracker.prototype.start = function() {
	if(this._trackerTask) {
		this._trackerTask.start();
	}
	else {
		this._trackerTask = tracking.track(
			'#' + this._elementId,
			this._tracker,
			{ camera: true }
		);
	}
}

FaceTracker.prototype.stop = function() {
	if(this._trackerTask) {
		this._trackerTask.stop();
	}
}

FaceTracker.prototype._updatePositionMagnitude = function() {
	this._updateXPositionMagnitude();
	this._updateYPositionMagnitude();
}

FaceTracker.prototype._updateXPositionMagnitude = function() {
	var minimum = this._faceWidth/2;
	var maximum = this._videoWidth - this._faceWidth/2;

	var distance = maximum - minimum;
	var faceDistance = this.getXPosition() - minimum;
	var magnitude = faceDistance/distance;

	this._positionMagnitude[0] = this._getValueFromNewRange(magnitude, 0, 1, -1, 1);
}

FaceTracker.prototype._updateYPositionMagnitude = function() {
	var minimum = this._faceHeight/2;
	var maximum = this._videoHeight - this._faceHeight/2;

	var distance = maximum - minimum;
	var faceDistance = this.getYPosition() - minimum;
	var magnitude = faceDistance/distance;

	this._positionMagnitude[1] = -this._getValueFromNewRange(magnitude, 0, 1, -1, 1);
}

FaceTracker.prototype.getVideoWidth = function() { return this._videoWidth; }
FaceTracker.prototype.getVideoHeight = function() { return this._videoHeight; }

FaceTracker.prototype.getFaceWidth = function() { return this._faceWidth; }
FaceTracker.prototype.getFaceHeight = function() { return this._faceWidth; }

FaceTracker.prototype.getXPosition = function() { return this._position[0]; }
FaceTracker.prototype.getYPosition = function() { return this._position[1]; }

FaceTracker.prototype.getXPositionMagnitude = function() { return this._positionMagnitude[0]; }
FaceTracker.prototype.getYPositionMagnitude = function() { return this._positionMagnitude[1]; }

FaceTracker.prototype._setOnTrackEvent = function() {
	var self = this;

	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	this._tracker.on('track', function(event) {
		context.clearRect(0, 0, canvas.width, canvas.height);

		event.data.forEach(function(rect) {
			//console.log([rect.x, rect.y, rect.width, rect.height]);

			self._faceWidth = rect.width;
			self._faceHeight = rect.height;
			self._position = [
				rect.x + rect.width/2,
				rect.y + rect.height/2
			];
			self._updatePositionMagnitude();

			context.strokeStyle = '#a64ceb';
			context.strokeRect(rect.x, rect.y, rect.width, rect.height);
			context.font = '11px Helvetica';
			context.fillStyle = "#fff";
			context.fillText('x: ' + self.getXPositionMagnitude().toFixed(2), rect.x + rect.width + 5, rect.y + 11);
			context.fillText('y: ' + self.getYPositionMagnitude().toFixed(2), rect.x + rect.width + 5, rect.y + 22);
		});
	});
}

FaceTracker.prototype._getValueFromNewRange = function(value, oldMin, oldMax, newMin, newMax) {
	var oldRange = oldMax - oldMin; 
	var newRange = newMax - newMin;
	var newValue = (((value - oldMin)*newRange)/oldRange) + newMin;

	return newValue;
}
