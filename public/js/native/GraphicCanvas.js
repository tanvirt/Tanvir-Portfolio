function GraphicCanvas(elementId) {
	this._canvas = new GLCanvas(elementId);
	this._deviceOrientation = null;
	this._keys = new Keys();
	this._logo = null;
	this._logoMovement = null;
	this._showGraphic = false;
	this._showLogo = false;

	this._inVRView = false;
	this._backgroundSphere = null;

	this._init();
}

GraphicCanvas.prototype._init = function() {
	this._addEventHandlers();
	this._setCanvasEvents();
}

GraphicCanvas.prototype.render = function() {
	this._canvas.start();
}

GraphicCanvas.prototype.reset = function() {
	this._canvas.getCamera().reset();
	this._canvas.setBackgroundColor(0, 0, 0, 0.75);
	this._canvas.useRegularProjector();
	this._exitVRView();
	this._deviceOrientation.stopTracking();
	this._resetLogo();
}

GraphicCanvas.prototype._resetLogo = function() {
	this._logoMovement.setTranslationSpeed(0.5);
	this._logoMovement.setRotationSpeed(1);
	this._logoMovement.reset();
	this._logo.reset();
	this._logo.translateZ(-1);
	this._logo.getGraphic().setDrawModeTriangles();
}

GraphicCanvas.prototype._addEventHandlers = function() {
	this._addToggleGraphicEventHandler();
	this._addJumpLogoEventHandler();
}

GraphicCanvas.prototype._setCanvasEvents = function() {
	this._setCanvasSetupEvent();
	this._setCanvasDrawEvent();
	this._setCanvasKeyDownEvent();
}

GraphicCanvas.prototype.requestFullScreen = function() {
	FullScreen.request(this._canvas.getDiv());
}

GraphicCanvas.prototype._addToggleGraphicEventHandler = function() {
	var self = this;

	EventDispatcher.addEventHandler("toggleGraphic", function(event) {
		self._showGraphic = event.getData().showGraphic;
		self._showLogo = self._showGraphic;
	});
}

GraphicCanvas.prototype._addJumpLogoEventHandler = function() {
	var self = this;

	EventDispatcher.addEventHandler("jumpLogo", function(event) {
		self._logoMovement.jump();
	});
}

GraphicCanvas.prototype.useRegularProjector = function() {
	this._logoMovement.setTranslationSpeed(0.5);
	this._logoMovement.setRotationSpeed(1);
	this._logoMovement.jump();
	this._canvas.setBackgroundColor(0, 0, 0, 0.75);
	this._canvas.useRegularProjector();
	this._exitVRView();
}

GraphicCanvas.prototype.useRedCyanProjector = function() {
	this._logoMovement.setTranslationSpeed(0.25);
	this._logoMovement.setRotationSpeed(0.5);
	this._logoMovement.jump();
	this._canvas.setBackgroundColor(0, 0, 0, 1);
	this._canvas.useRedCyanProjector();
	this._exitVRView();
}

GraphicCanvas.prototype.useVRProjector = function() {
	this._logoMovement.setTranslationSpeed(0.25);
	this._logoMovement.setRotationSpeed(0.5);
	this._logoMovement.jump();
	this._canvas.setBackgroundColor(0, 0, 0, 0.75);
	this._canvas.useOculusProjector();
	this._enterVRView();
}

GraphicCanvas.prototype.useARProjector = function() {
	this._logoMovement.setTranslationSpeed(0.5);
	this._logoMovement.setRotationSpeed(1);
	this._logoMovement.jump();
	this._canvas.setBackgroundColor(0, 0, 0, 0.75);
	this._canvas.useRegularProjector();
	this._exitVRView();
}

GraphicCanvas.prototype._enterVRView = function() {
	this._setVRCanvasDragEvent();
	this._inVRView = true;
	this._deviceOrientation.startTracking();
}

GraphicCanvas.prototype._exitVRView = function() {
	if(this._inVRView) {
		this._setCanvasDragEvent();
		this._inVRView = false;
		this._deviceOrientation.stopTracking();
		//FullScreen.exit();
	}
}

GraphicCanvas.prototype.setDrawModeTriangles = function() {
	this._logoMovement.jump();
	this._logo.getGraphic().setDrawModeTriangles();
}

GraphicCanvas.prototype.setDrawModeLines = function() {
	this._logoMovement.jump();
    this._logo.getGraphic().setDrawModeLines();
}

GraphicCanvas.prototype.setDrawModePoints = function() {
	this._logoMovement.jump();
    this._logo.getGraphic().setDrawModePoints();
}

GraphicCanvas.prototype._setCanvasSetupEvent = function() {
	var self = this;

	this._canvas.onSetup = function() {
		self._keys.addEventListener(self._canvas);
		self._createLogo();
		self._backgroundSphere = new HDRISphere(self._canvas, 35);
		self._backgroundSphere.setTexture("js/img/galaxy_hdri.jpg");

		self._deviceOrientation = new DeviceOrientation(self._canvas.getCamera());

		self._canvas.setBackgroundColor(0, 0, 0, 0.75);
		//self._canvas.setBackgroundColor(0, 0.05, 0.16, 0.95);

		self._canvas.setLoadingStatus(false);
		self._canvas.setWatermark("js/img/watermark.png");
		//self._canvas.hideWatermark();
		self._setCanvasDragEvent();
	};
}

GraphicCanvas.prototype._createLogo = function() {
	var self = this;

	this._logo = new Logo(self._canvas, 0.25, 0.0125);
    this._logoMovement = new MovementDirector(this._logo);
    this._logoMovement.setJumpHeight(0.1);
    this._logo.translateZ(-1);
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

GraphicCanvas.prototype._setVRCanvasDragEvent = function() {
	var self = this;

	this._canvas.onDrag = function(event) {
		self._canvas.getCamera().oneFingerRotate(
			event,
			{ radius: 2, type: 'free' }
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

		if(self._inVRView) {
			if(Device.isPhone()) {
				self._deviceOrientation.update();
			}
			self._backgroundSphere.draw();
		}
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
		this.reset();
	}
	else if(this._showGraphic && !this._showLogo && isVisibleInViewport(this._canvas.getDiv())) {
		this._showLogo = true;
	}
}

GraphicCanvas.prototype._canvasNotVisible = function() {
	return !this._showGraphic || !this._showLogo;
}
