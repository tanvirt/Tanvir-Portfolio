function Event(type, data) {
	this._type = type;
	this._data = data;
}

Event.prototype.getType = function() { return this._type; }
Event.prototype.getData = function() { return this._data; }

function EventDispatcher() {}

EventDispatcher._eventBins = [];

EventDispatcher.dispatch = function(event) {
	var eventType = event.getType();
	if(this._containsEventType(eventType)) {
		var eventBin = EventDispatcher._eventBins[eventType];
		for(var i = 0; i < eventBin.length; i++) {
			eventBin[i](event);
		}
	}
}

EventDispatcher.addEventHandler = function(eventType, eventHandler) {
	if(!this._containsEventType(eventType)) {
		EventDispatcher._eventBins[eventType] = [];
	}
	EventDispatcher._eventBins[eventType].push(eventHandler);
}

EventDispatcher.removeEventHandler = function(eventType, eventHandler) {
	if(this._containsEventType(eventType)) {
		var eventBin = EventDispatcher._eventBins[eventType];
		var index = eventBin.indexOf(eventHandler);
		if(index > -1) {
			eventBin.splice(index, 1);
		}
		if(eventBin.length == 0) {
			delete eventBin;
		}
	}
}

EventDispatcher._containsEventType = function(eventType) {
	return EventDispatcher._eventBins.hasOwnProperty(eventType);
}
