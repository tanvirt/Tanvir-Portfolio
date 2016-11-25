function GraphicCanvas(elementId) {
	this.canvas = new GLCanvas(elementId);
	this.keys = new Keys();
	this.logo = null;
	this.logoMovement = null;
	this.projectorToggle = false;
	this.showGraphic = false;
	this.showLogo = false;

	this._init();
}

GraphicCanvas.prototype._init = function() {
	this.addEventHandlers();
	this.setCanvasEvents();

	this.canvas.start();
}

GraphicCanvas.prototype.addEventHandlers = function() {
	var self = this;

	EventDispatcher.addEventHandler("toggleGraphic", function(event) {
		self.showGraphic = event.getData().showGraphic;
		self.showLogo = self.showGraphic;
	});

	EventDispatcher.addEventHandler("resetGraphic", function(event) {
		self.reset();
	});

	EventDispatcher.addEventHandler("clickJump", function(event) {
		self.logoMovement.jump();
	});

	EventDispatcher.addEventHandler("viewRedCyan", function(event) {
		self.logoMovement.jump();
		if(self.projectorToggle) {
    		self.canvas.useRegularProjector();
    	}
    	else {
    		self.canvas.useRedCyanProjector();
    	}
    	self.projectorToggle = !self.projectorToggle;
	});
}

GraphicCanvas.prototype.setCanvasEvents = function() {
	var self = this;

	this.canvas.onSetup = function() {
		self.keys.addEventListener(self.canvas);

	    self.logo = new Logo(self.canvas, 1, 0.05);
	    self.logoMovement = new MovementDirector(self.logo);
	    self.logo.translateZ(-4);
	    self.logo.getGraphic().onTap = function(event) {
	    	self.logoMovement.jump();
	    }

		self.canvas.setBackgroundColor(0, 0, 0, 0.75);
		//self.canvas.setBackgroundColor(0, 0.05, 0.16, 0.95);

		self.canvas.setLoadingStatus(false);
		self.canvas.onDrag = function(event) {
			self.canvas.getCamera().oneFingerRotate(
				event,
				{ radius: 2, type: 'polar' }
			);
		};
	};

	this.canvas.onDraw = function() {
		self.updateCanvasVisibility();
		if(self.canvasNotVisible()) {
			return;
		}
		self.handleKeys();
		if(!self.interactiveKeyDown()) {
			self.logoMovement.pitchForward();
			self.logoMovement.rotateTowardInitialRoll();
			self.logoMovement.rotateTowardInitialYaw();
		}
		self.logoMovement.update();
		self.logo.draw();
	};

	this.canvas.onKeyDown = function(keyCode, event) {
		if(self.canvasNotVisible()) {
			return;
		}
		if(self.interactiveKeyDown()) {
			event.preventDefault();
		}
		if(self.keys.spaceBarIsDown()) {
			self.logoMovement.jump();
		}
	};
}

GraphicCanvas.prototype.reset = function() {
	this.canvas.useRegularProjector();
	this.logoMovement.reset();
	this.logo.reset();
	this.logo.translateZ(-4);
	this.logo.getGraphic().setDrawModeTriangles();
}

GraphicCanvas.prototype.handleKeys = function() {
	if(this.keys.leftArrowIsDown()) {
		this.logoMovement.turnLeft();
	}
	if(this.keys.rightArrowIsDown()) {
		this.logoMovement.turnRight();
	}
	if(this.keys.upArrowIsDown()) {
		this.logoMovement.moveForward();
	}
	if(this.keys.downArrowIsDown()) {
		this.logoMovement.moveBackward();
	}
	if(this.keys.wIsDown()) {
		this.logoMovement.rollForward();
	}
	if(this.keys.aIsDown()) {
		this.logoMovement.yawBackward();
	}
	if(this.keys.sIsDown()) {
		this.logoMovement.rollBackward();
	}
	if(this.keys.dIsDown()) {
		this.logoMovement.yawForward();
	}
}

GraphicCanvas.prototype.interactiveKeyDown = function() {
	return this.keys.leftArrowIsDown() || 
		this.keys.upArrowIsDown() || 
		this.keys.rightArrowIsDown() || 
		this.keys.downArrowIsDown() || 
		this.keys.spaceBarIsDown() ||
		this.keys.wIsDown() ||
		this.keys.aIsDown() ||
		this.keys.sIsDown() ||
		this.keys.dIsDown();
}

GraphicCanvas.prototype.updateCanvasVisibility = function() {
	if(this.showGraphic && this.showLogo && !isVisibleInViewport(this.canvas.getDiv())) {
		this.showLogo = false;
		this.reset();
	}
	else if(this.showGraphic && !this.showLogo && isVisibleInViewport(this.canvas.getDiv())) {
		this.showLogo = true;
	}
}

GraphicCanvas.prototype.canvasNotVisible = function() {
	return !this.showGraphic || !this.showLogo;
}
