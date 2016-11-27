function SpeechRecognition() {}

SpeechRecognition.init = function() {
	if(annyang) {
		SpeechKITT.annyang();
		SpeechKITT.setStylesheet("vendor/speechkitt/themes/flat-turquoise.css");
		SpeechKITT.render();
	}
}

SpeechRecognition.addCommand = function(command) {
	if(annyang) {
		annyang.addCommands(command);
	}
}
