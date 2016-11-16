window.ondevicemotion = function(event) {
	var ax = event.accelerationIncludingGravity.x
	var ay = event.accelerationIncludingGravity.y
	var az = event.accelerationIncludingGravity.z
	var rotation = event.rotationRate;

	document.getElementById("ax").innerHTML = "ax: " + ax;
	document.getElementById("ay").innerHTML = "ay: " + ay;
	document.getElementById("az").innerHTML = "az: " + az;

	if(rotation != null) {
		var arAlpha = Math.round(rotation.alpha);
		var arBeta = Math.round(rotation.beta);
		var arGamma = Math.round(rotation.gamma);

		document.getElementById("arAlpha").innerHTML = "arAlpha: " + arAlpha;
		document.getElementById("arBeta").innerHTML = "arBeta: " + arBeta;
		document.getElementById("arGamma").innerHTML = "arGamma: " + arGamma;
	}
}

window.ondeviceorientation = function(event) {
	var alpha = Math.round(event.alpha);
	var beta = Math.round(event.beta);
	var gamma = Math.round(event.gamma);

	document.getElementById("alpha").innerHTML = "alpha: " + alpha;
	document.getElementById("beta").innerHTML = "beta: " + beta;
	document.getElementById("gamma").innerHTML = "gamma: " + gamma;
}
