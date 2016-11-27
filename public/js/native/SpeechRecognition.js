function SpeechRecognition() {
	this._init();
}

SpeechRecognition.prototype._init = function() {
	if(annyang) {
		// Add our commands to annyang
		annyang.addCommands({
			'hello': function() { 
				alert('Hello world!'); 
			}
		});

		// Tell KITT to use annyang
		SpeechKITT.annyang();

		// Define a stylesheet for KITT to use
		SpeechKITT.setStylesheet("vendor/speechkitt/themes/flat-turquoise.css");

		// Render KITT's interface
		SpeechKITT.vroom();
	}
}
