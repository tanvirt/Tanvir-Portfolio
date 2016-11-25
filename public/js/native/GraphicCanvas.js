function GraphicCanvas(elementId) {
	this._canvas = new GLCanvas(elementId);
	this._keys = new Keys();
	this._logo = null;
	this._logoMovement = null;
	this._projectorToggle = false;
	this._showGraphic = false;
	this._showLogo = false;

	this._init();
}

GraphicCanvas.prototype._init = function() {
	this._addEventHandlers();
	this._setCanvasEvents();
}

GraphicCanvas.prototype.render = function() {
	this._canvas.start();
}

GraphicCanvas.prototype._reset = function() {
	this._canvas.useRegularProjector();
	this._resetLogo();
}

GraphicCanvas.prototype._resetLogo = function() {
	this._logoMovement.reset();
	this._logo.reset();
	this._logo.translateZ(-4);
	this._logo.getGraphic().setDrawModeTriangles();
}

GraphicCanvas.prototype._addEventHandlers = function() {
	this._addToggleGraphicEventHandler();
	this._addResetGraphicEventHandler();
	this._addJumpLogoEventHandler();
	this._addViewRedCyanEventHandler();
}

GraphicCanvas.prototype._setCanvasEvents = function() {
	this._setCanvasSetupEvent();
	this._setCanvasDrawEvent();
	this._setCanvasKeyDownEvent();
}

GraphicCanvas.prototype._addToggleGraphicEventHandler = function() {
	var self = this;

	EventDispatcher.addEventHandler("toggleGraphic", function(event) {
		self._showGraphic = event.getData().showGraphic;
		self._showLogo = self._showGraphic;
	});
}

GraphicCanvas.prototype._addResetGraphicEventHandler = function() {
	var self = this;

	EventDispatcher.addEventHandler("resetGraphic", function(event) {
		/*if(self._logo.getXPosition() != 0 || self._logo.getYPosition() != 0 || self._logo.getZPosition() == 0) {
			self._reset();
		}*/
		self._reset();
	});
}

GraphicCanvas.prototype._addJumpLogoEventHandler = function() {
	var self = this;

	EventDispatcher.addEventHandler("jumpLogo", function(event) {
		self._logoMovement.jump();
	});
}

GraphicCanvas.prototype._addViewRedCyanEventHandler = function() {
	var self = this;

	EventDispatcher.addEventHandler("viewRedCyan", function(event) {
		self._logoMovement.jump();
		if(self._projectorToggle) {
    		self._canvas.useRegularProjector();
    	}
    	else {
    		self._canvas.useRedCyanProjector();
    	}
    	self._projectorToggle = !self._projectorToggle;
	});
}

GraphicCanvas.prototype._setCanvasSetupEvent = function() {
	var self = this;

	this._canvas.onSetup = function() {
		self._keys.addEventListener(self._canvas);
		self._createLogo();

		self._canvas.setBackgroundColor(0, 0, 0, 0.75);
		//self._canvas.setBackgroundColor(0, 0.05, 0.16, 0.95);

		self._canvas.setLoadingStatus(false);
		self._setCanvasDragEvent();
	};
}

GraphicCanvas.prototype._createLogo = function() {
	var self = this;

	this._logo = new Logo(self._canvas, 1, 0.05);
    this._logoMovement = new MovementDirector(this._logo);
    this._logo.translateZ(-4);
    this._logo.getGraphic().onTap = function(event) {
    	self._logoMovement.jump();
    }
}

GraphicCanvas.prototype._setCanvasDragEvent = function() {
	var self = this;

	this._canvas.onDrag = function(event) {
		self._canvas.getCamera().oneFingerRotate(
			event,
			{ radius: 2, type: 'polar' }
		);
	};
}

GraphicCanvas.prototype._setCanvasDrawEvent = function() {
	var self = this;

	this._canvas.onDraw = function() {
		self._updateCanvasVisibility();
		if(self._canvasNotVisible()) {
			return;
		}
		self._handleKeys();
		if(!self._interactiveKeyDown()) {
			self._logoMovement.pitchForward();
			self._logoMovement.rotateTowardInitialRoll();
			self._logoMovement.rotateTowardInitialYaw();
		}
		self._logoMovement.update();
		self._logo.draw();
	};
}

GraphicCanvas.prototype._setCanvasKeyDownEvent = function() {
	var self = this;

	this._canvas.onKeyDown = function(keyCode, event) {
		if(self._canvasNotVisible()) {
			return;
		}
		if(self._interactiveKeyDown()) {
			event.preventDefault();
		}
		if(self._keys.spaceBarIsDown()) {
			self._logoMovement.jump();
		}
	};
}

GraphicCanvas.prototype._handleKeys = function() {
	if(this._keys.leftArrowIsDown()) {
		this._logoMovement.turnLeft();
	}
	if(this._keys.rightArrowIsDown()) {
		this._logoMovement.turnRight();
	}
	if(this._keys.upArrowIsDown()) {
		this._logoMovement.moveForward();
	}
	if(this._keys.downArrowIsDown()) {
		this._logoMovement.moveBackward();
	}
	if(this._keys.wIsDown()) {
		this._logoMovement.rollForward();
	}
	if(this._keys.aIsDown()) {
		this._logoMovement.yawBackward();
	}
	if(this._keys.sIsDown()) {
		this._logoMovement.rollBackward();
	}
	if(this._keys.dIsDown()) {
		this._logoMovement.yawForward();
	}
}

GraphicCanvas.prototype._interactiveKeyDown = function() {
	return this._keys.leftArrowIsDown() || 
		this._keys.upArrowIsDown() || 
		this._keys.rightArrowIsDown() || 
		this._keys.downArrowIsDown() || 
		this._keys.spaceBarIsDown() ||
		this._keys.wIsDown() ||
		this._keys.aIsDown() ||
		this._keys.sIsDown() ||
		this._keys.dIsDown();
}

GraphicCanvas.prototype._updateCanvasVisibility = function() {
	if(this._showGraphic && this._showLogo && !isVisibleInViewport(this._canvas.getDiv())) {
		this._showLogo = false;
		this._reset();
	}
	else if(this._showGraphic && !this._showLogo && isVisibleInViewport(this._canvas.getDiv())) {
		this._showLogo = true;
	}
}

GraphicCanvas.prototype._canvasNotVisible = function() {
	return !this._showGraphic || !this._showLogo;
}
