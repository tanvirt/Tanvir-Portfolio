function FullScreen() {}

FullScreen.request = function(element) {
	// Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || 
    	element.webkitRequestFullScreen || 
    	element.mozRequestFullScreen || 
    	element.msRequestFullscreen;
    
    if(requestMethod)
        requestMethod.call(element);
    else if(window.ActiveXObject == undefined) { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if(wscript !== null)
            wscript.SendKeys("{F11}");
    }
}

FullScreen.exit = function() {
	// Supports most browsers and their versions.
    var exitMethod = document.exitFullScreen || 
    	document.webkitExitFullscreen || 
    	document.mozCancelFullScreen || 
    	document.msExitFullscreen;

    if(exitMethod)
        requestMethod.call(document);
    else if(window.ActiveXObject == undefined) { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if(wscript !== null)
            wscript.SendKeys("{ESCAPE}");
    }
}
