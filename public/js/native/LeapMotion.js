function LeapMotion() {
	this._controller = null;
	this._frame = null;

	this._init();
}

LeapMotion.prototype._init = function() {
	var self = this;

	// Setup Leap loop with frame callback function
	var controllerOptions = {
		enableGestures: true
	};

	this._controller = Leap.loop(controllerOptions, function(frame) {
		EventDispatcher.dispatch(new Event("leapFrame", frame));
	});
}

LeapMotion.prototype.displayData = function() {
	var self = this;

	EventDispatcher.addEventHandler("leapFrame", function(event) {
		self._frame = event.getData();
		var frame = self._frame;

		if(!frame) {
			return;
		}

		var frameString = "Frame ID: " + frame.id  + "<br />"
	        + "Timestamp: " + frame.timestamp + " &micro;s<br />"
	        + "Hands: " + frame.hands.length + "<br />"
	    	+ "Fingers: " + frame.fingers.length + "<br />";

	    document.getElementById("frameData").innerHTML = frameString;

	    // Display Hand object data
		var handString = "";
		if(frame.hands.length > 0) {
			for(var i = 0; i < frame.hands.length; i++) {
				var hand = frame.hands[i];

				handString += "Hand ID: " + hand.id + "<br />";
				handString += "Direction: " + hand.direction + "<br />";
				handString += "Palm normal: " + hand.palmNormal + "<br />";
				handString += "Palm position: " + hand.palmPosition + " mm<br />";
				handString += "Palm velocity: " + hand.palmVelocity + " mm/s<br />";
				handString += "Sphere center: " + hand.sphereCenter + " mm<br />";
				handString += "Sphere radius: " + hand.sphereRadius.toFixed(1) + " mm<br />";
			}
		}

		document.getElementById("handData").innerHTML = handString;

		// Display Pointable (finger) object data
		var pointableString = "";
		if(frame.pointables.length > 0) {
			for(var i = 0; i < frame.pointables.length; i++) {
				var pointable = frame.pointables[i];

				pointableString += "Pointable ID: " + pointable.id + "<br />";
				pointableString += "Belongs to hand with ID: " + pointable.handId + "<br />";
				pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
				pointableString += "Width: "  + pointable.width.toFixed(1) + " mm<br />";
				pointableString += "Direction: " + pointable.direction + "<br />";
				pointableString += "Tip position: " + pointable.tipPosition + " mm<br />";
				pointableString += "Tip velocity: " + pointable.tipVelocity + " mm/s<br /><br />";
			}
		}

		document.getElementById("pointableData").innerHTML = pointableString;
	});
}
