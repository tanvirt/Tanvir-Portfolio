function Keys() {
	this._pressed = [];
	this._listeners = [];
	this._init();
}

Keys.prototype._init = function() {
	var self = this;

	for(var i = 0; i < 128; i++) {
		this._pressed.push(false);
	}

	document.addEventListener("keydown", function(event) {
		self._onDown(event.keyCode, event)},
		false
	);

	document.addEventListener("keyup", function(event) {
		self._onUp(event.keyCode, event)},
		false
	);
}

Keys.prototype.addEventListener = function(eventListener) {
	if(this._listeners.indexOf(eventListener) >= 0) {
		this._listeners.push(eventListener);
	}
}

Keys.prototype.isDown = function(keyCode) {
	return this._pressed[keyCode];
}

Keys.prototype.spaceBarIsDown = function() {
	return this.isDown(32); 
}

Keys.prototype.leftArrowIsDown = function() {
	return this.isDown(37); 
}

Keys.prototype.upArrowIsDown = function() {
	return this.isDown(38); 
}

Keys.prototype.rightArrowIsDown = function() {
	return this.isDown(39); 
}

Keys.prototype.downArrowIsDown = function() {
	return this.isDown(40); 
}

Keys.prototype._onDown = function(keyCode, event) {
	this._pressed[keyCode] = true;
	for(i in this._listeners) {
		this._listeners[i].onKeyDown(keyCode, event);
	}
}

Keys.prototype._onUp = function(keyCode, event) {
	this._pressed[keyCode] = false;
	for(i in this._listeners) {
		this._listeners[i].onKeyUp(keyCode, event);
	}
}
