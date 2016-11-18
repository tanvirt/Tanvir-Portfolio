/* V1.7
 * Author(s): Angelos Barmpoutis
 * 
 * Copyright (c) 2016, University of Florida Research Foundation, Inc. 
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain this copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce this
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 /**
 * This is the main class of the VN API. One global object of this class is created and accessible under the name "vn". 
 * Therefore, all methods of this class are accessible by "vn.methodname". To run an application with the fully loaded VN API,
 * you need to run it using "vn.run(my_applicaton);", where "my_application" is the main function of your application.
 */
function VisiNeatAPI()
{
	this.libs={};
	this.hostname="www.visineat.com";
	//this.hosturl=(('https:' == document.location.protocol) ? 'https:' : 'http:')+'//'+this.hostname+'/';
	this.hosturl='';//uncomment this line to run it locally from a folder js and subfolder js/vn/
	this.version=1.7;
	this.lib_versions={
	"vn.utils":"1",
	"vn.webgl":"3",
	"vn.windows":"2",
	"vn.gui":"2",
	"vn.server":"2",
	"vn.media":"2",
	"vn.kinect":"1",
	"vn.human-avatar":"1",
	"vn.cloud":"1",
	"vn.file-viewers":"1",
	"vn.text-editor":"1",
	"vn.animation":"1",
	"vn.documentation":"2"
	};
	
	this.lib_index=[
	"vn.utils",
	"vn.webgl",
	"vn.windows",
	"vn.gui",
	"vn.server",
	"vn.media",
	"vn.cloud",
	"vn.animation"
	];
	
	this.progress=new VNProgress();
}

VisiNeatAPI.prototype._init=function()
{
	this.cloud=new VNCloud();
};
/**
 * This method runs asynchronously a given function after having loaded first the core components of the VN API. It can be used in the onload attribute of the html body element.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * &lt;body onload="vn.run(my_application);"&gt;<br></font>
 * @param program A given function, which is typically the main function of an application.
 */
VisiNeatAPI.prototype.run=function(program){var self=this;this.init_p=this.init_p||this._import();this.init_p.then(function(){self._init();program();});};

/**
 * This method imports one or more JS files to your application and returns a promise object that is triggered when the importing process has finished.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * vn.import(["my_library.js","another_script.js"]).then(function(){<br>
 * ...<br>
 * }).catch(function(){<br>
 * ...<br>
 * });<br></font>
 * @param libs A string, or an array of strings with the paths or URLs to the script files.
 * @return VNPromise A promise object that is triggered with the completion of the import process. 
 */
VisiNeatAPI.prototype.import=function(src){return this._import(src,true);};

VisiNeatAPI.prototype._import=function(src,first)
{
	var p=new VNPromise();
	if(typeof src==='undefined')
	{
		if(document.location.hostname==this.hostname)
		{
			vn.progress.oneMoreToDo(this.lib_index.length);
			this._import(this.lib_index).then(function(){p.callThen();}).catch(function(){p.callCatch();});
			return p;
		}
		else 
		{
			vn.progress.oneMoreToDo(this.lib_index.length);
			this._import(this.lib_index).then(function(){p.callThen();}).catch(function(){p.callCatch();});
			return p;
		}
	}
	else
	{
	if(typeof src==='string') 
	{
		if(first)vn.progress.oneMoreToDo();
		this.importSingleScript(src).then(function(){vn.progress.oneMoreDone();p.callThen();}).catch(function(){vn.progress.oneMoreDone();p.callCatch();});
		return p;
	}
	else
	{
		if(src.length==1)
		{
			if(first)vn.progress.oneMoreToDo();
			this.importSingleScript(src[0]).then(function(){vn.progress.oneMoreDone();p.callThen();}).catch(function(){vn.progress.oneMoreDone();p.callCatch();});
		 	return p;
		 }
		else
		{
			if(first)vn.progress.oneMoreToDo(src.length);
			var src1=src[0];
			var src2=[];
			for(var i=1;i<src.length;i++)src2.push(src[i]);
			var self=this;
			this.importSingleScript(src1).then(function(){vn.progress.oneMoreDone();self._import(src2).then(function(){p.callThen();}).catch(function(){p.callCatch();});}).catch(function(){vn.progress.oneMoreDone();self._import(src).then(function(){p.callCatch();}).catch(function(){p.callCatch();});});
			return p;
		}
	}
	}
};

/**
 * This method returns true if a given JS file has been imported to your application. 
 * @param lib A string with the path or URL to a script file.
 * @return Boolean The loading status of this script file. 
 */
VisiNeatAPI.prototype.imported=function(src)
{
  if(typeof this.libs[src]!=='undefined') return true; else return false;
};

VisiNeatAPI.prototype.importSingleLib=function(src)
{
	var s=src;
	if(this.lib_versions[src])s+='-'+this.lib_versions[src];
	return this.importSingleScript(this.hosturl+'js/'+s.replace('.','/')+'.js');
};

VisiNeatAPI.prototype.importSingleScript=function(src)
{
  if(src.indexOf('vn.')==0)
  {
	  return this.importSingleLib(src);
  }

	
  var p=new VNPromise();
   
  if(typeof this.libs[src]!=='undefined')
  {
	p.callThen();
	return p;
  }
  var self=this;
  var s,
      r,
      t;
  r = false;
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.onerror= function(){
	p.callCatch();  
  };
  s.onload = s.onreadystatechange = function() {
	if ( !r && (!document.readyState || document.readyState == 'complete' || document.readyState == 'loaded') )
    {
	  self.libs[src]=new Object();
      r = true;
      p.callThen();
    }
  };
  s.src = src;
  t = document.getElementsByTagName('script')[0];
  t.parentNode.insertBefore(s, t);
  return p;
};

/**
 * This method extends one Class into another by inheriting all the methods of the superclass.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * var ClassA=function(arguments){<br>
 * ...<br>	 
 * };<br>
 * var ClassB=function(arguments){<br>
 * ClassA.call(this,arguments);<br>
 * ...<br>
 * };<br>
 * vn.extend(ClassA,ClassB);<br></font>
 * @param superclass The class to be extended.
 * @param subclass The class that will inherit the methods of the superclass.
 */
VisiNeatAPI.prototype.extend=function(base, sub) {
   var tmp = sub.prototype;
  sub.prototype =Object.create(base.prototype);
  vn.set(sub.prototype,tmp);
  sub.prototype.constructor = sub;
}

/**
 * This method sets the values of specific properties in an object. If the object does not have such properties they will be automatically defined.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * vn.set(my_div.style,{position:'absolute',color:'black'});<br>
 * //The position and color properties of the style object will be updated with these new values.<br></font>
 * @param object The object to be updated.
 * @param properties An object with the properties-values to be updated.
 */
VisiNeatAPI.prototype.set=function(dst,src)
{
	for(v in src)
		dst[v]=src[v];
};

/**
 * This method defines new properties in an object and initializes them with their default values. The properties that already exist in the object will not be modified.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * vn.default(my_div.style,{display:'block',color:'black'});<br>
 * //If the style object does not have the display or color properties, they will be defined and take their default values.<br></font>
 * @param object The object to be updated.
 * @param properties An object with the properties-values to be defined.
 */
VisiNeatAPI.prototype.default=function(dst,src)
{
	for(v in src)
		if(typeof dst[v]==='undefined')dst[v]=src[v];
};

/**
 * This method loads a file using the http request protocol. The request can be send using the "GET" or "POST" methods and can contain 
 * variables as well as file attachments. This method can be used to download static files, send requests to php scripts, upload data to a server etc.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * vn.http("my_script.php",{method:'post',data:{a_variable:'a value', variable2:'value'}}).then(function(request){<br>
 * ...<br>
 * //do something with the response, such as: JSON.parse(request.responseText);<br>
 * }).catch(function(request){<br>
 * ...<br>
 * });<br></font>
 * @param filename A string with the path/URL of the file to be requested.
 * @param options An optional object that may contain the following parameters: "method" with values "get" or "post", "data" with an object that contains the variable parameters to be sent, "files" with an array of binary files to be uploaded as Uint8Array objects.
 * @return VNPromise A promise object that is triggered with the completion of the loading process. 
 */
VisiNeatAPI.prototype.http=function(filename,options)
{
	if(typeof options==="undefined")return vn.getHttp(filename);
	var opt=options||{};
	vn.default(opt,{method:"GET"});
	if(opt.files)
		return vn.postHttpBinary(filename,opt.data,opt.files);
	else if(opt.method.toUpperCase() === "POST")
		return vn.postHttp(filename,opt.data);
	else return vn.getHttp(filename,opt.data);
};

VisiNeatAPI.prototype.load=VisiNeatAPI.prototype.http;

VisiNeatAPI.prototype.postHttp=function(url,data)
{
	var file_request=new XMLHttpRequest();
	var p=new VNPromise(file_request);
	file_request.onreadystatechange=function()
	{
		if (file_request.readyState==4)
		{
			if(file_request.status==200)
				p.callThen();
			else p.callCatch();
		}
	}
	file_request.overrideMimeType("text/plain; charset=x-user-defined");
	file_request.open("POST",url,true);
	file_request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	var msg="";
	if(typeof data!=='undefined')
	{
		var i=0;
		for(v in data)
		{
			if(i==0){msg=v+"="+data[v];i+=1}
			else msg+="&"+v+"="+data[v];
		}
	}
	file_request.send(msg);
	return p;
};

VisiNeatAPI.prototype.postHttpBinary=function(url,data,files)
{
	var file_request=new XMLHttpRequest();
	var p=new VNPromise(file_request);
	file_request.onreadystatechange=function()
	{
		if (file_request.readyState==4)
		{
			if(file_request.status==200)
				p.callThen();
			else p.callCatch();
		}
	}
	file_request.overrideMimeType("text/plain; charset=x-user-defined");
	file_request.open("POST",url,true);
	
	var boundary="visineat-----------------------" + (new Date).getTime();
	var CRLF = "\r\n";
	var SEPARATOR="--"+boundary+CRLF;
	var END="--"+boundary+"--"+CRLF;
	
	var message="";
	if(typeof data!=='undefined')
	{
		var i=0;
		for(v in data)
		{
			message+=SEPARATOR+'Content-Disposition: form-data; name="'+v+'"'+CRLF+CRLF+data[v]+CRLF;
		}
	}
	
	var file_data={};
	if(files)
	{
		if(Array.isArray(files))
		{
			for(var i=0;i<files.length;i++)
			{
				if(files[i] instanceof Uint8Array)
				{
					file_data['file'+i]={filename:'file'+i,data:files[i]};
				}
				else file_data['file'+i]=files[i];
			}
		}
		else
		{
			if(files instanceof Uint8Array)
				file_data['file0']={filename:'file0',data:files};
			else if(files.data)
				file_data['file0']=files;
			else file_data=files;
		}
	}
	
	var file_message={};
	var file_message_length=0;
	for(f in file_data)
	{
		file_message[f]=SEPARATOR+'Content-Disposition: form-data; name="'+f+'"; filename="'+((file_data[f].filename)||f)+'"'+CRLF;
		file_message[f]+="Content-Type: application/octet-stream"+CRLF+CRLF;
		file_message_length+=file_message[f].length;
		file_message_length+=file_data[f].data.length;
		file_message_length+=2;//CRLF
	}
		//data
	
	file_request.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
	
	var bin=new Uint8Array(message.length+file_message_length+END.length);
	for (var i = message.length-1; i>=0 ; i--) bin[i] = (message.charCodeAt(i) & 0xff);
	var offset=message.length;
	for(f in file_data)
	{
		for (var j = file_message[f].length-1; j>=0 ; j--) bin[j+offset] = (file_message[f].charCodeAt(j) & 0xff);
		offset+=file_message[f].length;
		bin.set(file_data[f].data,offset);
		offset+=file_data[f].data.length;
		for (var j = 1; j>=0 ; j--) bin[j+offset] = (CRLF.charCodeAt(j) & 0xff);
		offset+=2;
	}
	for (var i = END.length-1; i>=0 ; i--) bin[i+offset] = (END.charCodeAt(i) & 0xff);
	
	file_request.send(bin);
	return p;
};

VisiNeatAPI.prototype.getHttp=function(url,data)
{
	var file_request=new XMLHttpRequest();
	var p=new VNPromise(file_request);
	file_request.onreadystatechange=function()
	{
		if (file_request.readyState==4)
		{
			if(file_request.status==200)
				p.callThen();
			else p.callCatch();
		}
	}
	file_request.overrideMimeType("text/plain; charset=x-user-defined");
	var msg="";
	if(typeof data!=='undefined')
	{
		var i=0;
		for(v in data)
		{
			if(i==0){msg="?"+v+"="+data[v];i+=1}
			else msg+="&"+v+"="+data[v];
		}
	}
	file_request.open("GET",url+msg,true);
	file_request.send();
	return p;
};

/**
 * This method parses a URI string and returns an object with the variable parameters contained in the URI.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * var params=vn.getURIComponents('http://www.example.com/?a=1&b=2&c=3');<br>
 * //The variable "params" is an object with the parameters a,b,c and their values.<br></font>
 * @param url The URL to be parsed.
 * @return Object An object with the parsed parameters and their values.
 */
VisiNeatAPI.prototype.getURIComponents=function(uri) {
	var qs=uri || document.location.search;
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
}

/**
 * This is class implements a progress counter that can be used to track the progress of multiple asynchronous processes such as the 
 * downloading of multiple files, or the uploading of a file to a server. It uses a simple API with two main methods "oneMoreToDo" and "oneMoreDone"
 * that update the status of the progress accordingly.
 */
function VNProgress()
{
	this.max_value=100;
	this.value=100;
	this.last_time=0;
	this.pr_progress=new VNPromise(this);
	this.pr_done=new VNPromise(this);
}

/**
 * This method declares that there is one more job to be done, i.e. increases the "to do" list of the progress counter.
 * @param jobs An optional argumant with the number of jobs you are setting (if more than one).
 */
VNProgress.prototype.oneMoreToDo=function(jobs)
{
	var n=jobs||1;
	var now=new Date().getTime();	
	if(now-this.last_time>5000)
	{
		this.setProgress(0);
		this.setMaximumProgress(n);
	}
	else
		this.setMaximumProgress(this.max_value+n);
	this.last_time=now;
};

/**
 * This method declares that there is one more job done, i.e. increases the "done" list of the progress counter.
 * @param jobs An optional argumant with the number of jobs you are setting (if more than one).
 */
VNProgress.prototype.oneMoreDone=function(jobs)
{
	var n=jobs||1;
	this.setProgress(this.value+n);
	//this.last_time=new Date().getTime();
};

VNProgress.prototype.getIncrement=function(){return 1/(this.max_value+1);};

/**
 * This method returns the current progress value.
 * @return number The progress value as a real number in the range [0-1].
 */
VNProgress.prototype.getValue=function(){return (this.value+1)/(this.max_value+1);};

VNProgress.prototype.setProgress=function(value)
 {
 	var v=value;
 	if(v>this.max_value) v=this.max_value;
 	else if(v<0)c=0;
 	if(v!=this.value)
 	{
 		this.value=v;
		this.pr_progress.callThen();
		if(this.value==this.max_value)
			this.pr_done.callThen();
 	}
 };
  
VNProgress.prototype.setMaximumProgress=function(value)
 {
	 
 	var v=value;
 	if(v<=0) return;
 	if(v!=this.max_value)
 	{
		
 		if(this.value>v) this.value=v;
 		this.max_value=v;
		this.pr_progress.callThen();
		if(this.value==this.max_value)
			this.pr_done.callThen();
 	}
 };
 
/**
 * This method returns a promise that is triggered when there has been a change in the progress value.
 * @return VNPromise A promise object that is triggered with any change in the progress value. 
 */
 VNProgress.prototype.whenProgress=function(){return this.pr_progress};
 
/**
 * This method returns a promise that is triggered when the progress value goes to 1, i.e. when all jobs have been completed.
 * @return VNPromise A promise object that is triggered with any change in the progress value. 
 */
 VNProgress.prototype.whenDone=function(){return this.pr_done};

/** This class offers a convenient way to handle asynchronous processes by setting two callback functions "then" and "catch" that 
 * will be called when the particular asynchronous process successfully finishes or fails respectively.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * var promise=vn.import("my_library.js");<br>
 * promise.then(function(){<br>
 * ...<br>
 * }).catch(function(){<br>
 * ...<br>
 * });<br></font>
 * @param Object An optional object that will be provided as input argument to the "then" or "catch" callback functions.
 */
 function VNPromise(object)
{
	this.object=object;
	this.do_not_call_twice=false;
	this.thenCallback=[];
	this.catchCallback=[];
	this.thenCalled=false;
	this.catchCalled=false;
	this.allow_recursion=false;//to call a callback from inside the callback using callThen() inside the callback
}

/**
 * With this method you can set if a callback can be called more than one times, or if it should be removed after its first call. The default value is true. 
 * @param flag A Boolean value that corresponds to the desired behaviour of the promise.
 */
VNPromise.prototype.allowMultipleCalls=function(flag)
{
	this.do_not_call_twice=!flag;
};
/**
 * With this method you can set if a callback can be called from inside the callback using callThen(). The default value is false. 
 * @param flag A Boolean value that corresponds to the desired behaviour of the promise.
 */
VNPromise.prototype.allowRecursion=function(flag)
{
	this.allow_recursion=flag;
};
/**
 * This method sets the object to be provided as input argument to the "then" or "catch" callback functions.
 * @param Object An object that will be provided as input argument to the "then" or "catch" callback functions.
 */
VNPromise.prototype.setObject=function(object)
{
	this.object=object;
};

VNPromise.prototype.callAll=function(cb)
{
	var c=cb.slice();//copy the callback array in order to avoid calling new callbacks that will be added from inside the callbacks, i.e. if a callback contains reference to the method then(...) of the same promise.
	//console.log('Call All:'+c.length);
	for(var i=0;i<c.length;i++)
	{
		this.call(cb,c[i]);
	}
};

VNPromise.prototype.call=function(cb,c)
{
	if(!this.allow_recursion)
	{
		var ind=cb.indexOf(c);
		if(ind>-1)cb.splice(ind,1);//remove it from the cb array 
		//Note that it is removed before it is called, so that we avoid an infinite loop due to recursion in the case that the callback containes reference to the method then(...) of the same promise.
	}
	if(c(this.object)||this.do_not_call_twice){
		if(this.allow_recursion)
		{
			var ind=cb.indexOf(c);
			if(ind>-1)cb.splice(ind,1);//remove it from the cb array 
		}
	}//if returns true, this callback is not called anymore.
	else
	{
		if(!this.allow_recursion)cb.push(c);//put it back in the cb array if it returns true.
	}
};

/**
 * This method calls all "then" callbacks that have been set to this promise using the method "then". You can use 
 * this function when an asynchronous process is sucessfully completed.
 */
VNPromise.prototype.callThen=function()
{
	this.thenCalled=true;
	this.callAll(this.thenCallback);
};

/**
 * This method calls all "catch" callbacks that have been set to this promise using the method "catch". You can use 
 * this function when an asynchronous process fails.
 */
VNPromise.prototype.callCatch=function()
{
	this.catchCalled=true;
	this.callAll(this.catchCallback);
	
};

/**
 * This method method resets the promise so that new callbacks will not be called for previously triggered then or catch.
 * You can use this function right after the methods callThen or callCatch.
 */
VNPromise.prototype.reset=function()
{
	this.catchCalled=false;
	this.thenCalled=false;
};

/**
 * With this method you can set a function that will be called when an asynchronous process is succesfully completed. 
 * The callback can be called multiple times if this is the nature of the process, e.g. whenProgress().then(...). If you want to stop a callback
 * from being called again in the future, the callback must return true.
 * @return VNPromise The same promise object is returned in order to define a "catch" callback function after defining a "then" callback.
 */
VNPromise.prototype.then=function(callback)
{
	this.thenCallback.push(callback);
	if(this.thenCalled)
		this.call(this.thenCallback,callback);

	return this;
};

/**
 * With this method you can set a function that will be called when an asynchronous process fails. 
 * The callback can be called multiple times if this is the nature of the process. If you want to stop a callback
 * from being called again in the future, the callback must return true.
 */
VNPromise.prototype.catch=function(callback)
{
	this.catchCallback.push(callback);
	if(this.catchCalled)
		this.call(this.catchCallback,callback);
};
 
var vn=vn||new VisiNeatAPI();

/**
 * This class implements a generic file loader. It can be extended to implement any particular file format reader, by properly processing the loaded data.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
 * var f=new MyFormatFile();<br>
 * //We assume that a class MyFormatFile extends VNFile, and it contains the method "handleLoadedFile" which processes the data.
 * f.load("my_filename").then(function(f){<br>
 * ...<br>
 * }).catch(function(f){<br>
 * ...<br>
 * });<br></font>
 */
function VNFile()
{
	this.filename='';
	this.loaded=false;
	this.failed=false;
}

/**
 * This method will be called when the file is loaded in order to process the data, i.e. read the format etc. It is initially empty. 
 */
VNFile.prototype.handleLoadedFile=function(request){};

/**
 * This method starts the asynchronous loading of a file.
 * @param url A string with the path/URL of the file to be loaded.
 * @return VNPromise A promise object that is triggered when the file is loaded and processed. 
 */
VNFile.prototype.load=function(url)
{
	this.loaded=false;
	this.failed=false;
	this.filename=url;
	var p=new VNPromise(this);
	var self=this;
	vn.progress.oneMoreToDo();
	vn.load(this.filename).then(function(request)
	{
		vn.progress.oneMoreDone();
		self.request=request;
		self.handleLoadedFile(request);
		self.loaded=true;
		p.callThen();
	}).catch(function(request)
	{
		vn.progress.oneMoreDone();
		self.request=request;
		self.failed=true;
		p.callCatch();
	});
	return p;
};

function VNDocsDemo(div_id,title,program,type)
{
	this.div_id=div_id;
	this.title=title;
	this.own_div=null;
	this.program=program;
	this.type=type;
	this.window=null;
}

VNDocsDemo.prototype.run=function()
{
	var self=this;
	vn.run(function(){
		if(vn_demo_wm==null)
		{
			var d=document.getElementById("vn_demo_wm");
			if(d)
			{
				vn_demo_wm=new WindowManager(d);
				vn_demo_wm.zIndex=10000;
				
				//vn_demo_wm.console=vn_demo_wm.createConsole({width:300,height:300});
			}
		}
		var div=document.getElementById(self.div_id);
		div.innerHTML="";
		div.style.backgroundColor='';
		div.style.border='1px dashed';
		self.own_div=document.createElement('div');
		vn.set(self.own_div.style,{width:'100%',height:'100%'});
		div.appendChild(self.own_div);
		var c=null;
		if(self.type=='canvas')
		{
			c=new GLCanvas(self.own_div);
			self.program(c);
		}
		else self.program(self.own_div);
			
		
		var gui=new GUIManager(self.own_div);
		var message_area=gui.createNotificationArea();
		var toolbar=gui.createRetractableToolbar(50,1);
		
	if(self.type=='canvas')
	{
	var projector_menu=new RetractableToolbarButton(toolbar);
	projector_menu.setLabel('Change viewing mode');
		
	var cross_eyes_button=new RetractableToolbarButton(projector_menu);
	cross_eyes_button.setIcon(vn.hosturl+'js/img/crossed_eyes_icon.png');
	cross_eyes_button.setLabel('Crossed eyes');
	
	var parallel_eyes_button=new RetractableToolbarButton(projector_menu);
	parallel_eyes_button.setIcon(vn.hosturl+'js/img/parallel_eyes_icon.png');
	parallel_eyes_button.setLabel('Parallel eyes');
	
	var red_blue_button=new RetractableToolbarButton(projector_menu);
	red_blue_button.setIcon(vn.hosturl+'js/img/red_cyan_icon.png');
	red_blue_button.setLabel('Red/Cyan glasses');
	
	var side_by_side_button=new RetractableToolbarButton(projector_menu);
	side_by_side_button.setIcon(vn.hosturl+'js/img/3dtv_icon.png');
	side_by_side_button.setLabel('3D TV display');
	
	var oculus_button=new RetractableToolbarButton(projector_menu);
	oculus_button.setIcon(vn.hosturl+'js/img/oculus_icon.png');
	oculus_button.setLabel('Oculus head mounted display');
	
	var eyes_button=new RetractableToolbarButton(projector_menu);
	eyes_button.setIcon(vn.hosturl+'js/img/eye_icon.png');
	eyes_button.setLabel('Bare eye vision');
	projector_menu.setSelectedOption(eyes_button);
	
	projector_menu.onSelect=function(opt)
	{
		if(opt==eyes_button)
		{
			c.useRegularProjector();
		}
		else if(opt==oculus_button)
		{
			c.useOculusProjector();
			//self.setFullScreen(true);
		}
		else if(opt==side_by_side_button)
		{
			c.useSideBySideProjector(true,false);
			//self.setFullScreen(true);
		}
		else if(opt==red_blue_button)
		{
			c.useRedCyanProjector();
		}
		else if(opt==parallel_eyes_button)
		{
			c.useSideBySideProjector(false,false);
		}
		else if(opt==cross_eyes_button)
		{
			c.useSideBySideProjector(false,true);
		}
	};
	
	c.onTap=function(e){if(gui.isExpanded())gui.retract();else gui.expand();};
	c.onMove=function(e){	if(!e.mouse_pressed){gui.expand();}};
	c.onDragStart=function(e){gui.retract();};
	c.onDragEnd=function(e){gui.expand();};
	
	}//canvas
	else
	{ 
		self.own_div.addEventListener('touchstart',function(e){if(e.target==self.own_div)e.preventDefault();},false);
		self.own_div.addEventListener('mousemove',function(){gui.expand();},false);
		self.own_div.addEventListener('touchmove',function(){gui.expand();},false);
	}
			
	var button1=new RetractableToolbarButton(toolbar);
		button1.setIcon(vn.hosturl+'js/img/fullscreen_icon.png');
		button1.setLabel('Window mode on/off');
		button1.setLink('');
		button1.onClick=function(b){
			if(self.window)
			{
				self.window.close();
				return;
			}
			
			var w=vn_demo_wm.createWindow(100,100,600,400);
			w.setIcon('/js/img/VNlogo256.png');
			w.setSelected(true);
			w.setTitle(self.title);
			w.getContentDiv().appendChild(self.own_div);
			w.whenDestroyed().then(function(){
				div.appendChild(self.own_div);
				self.window=null;
				});
			self.window=w;
			};
		
		
	});
};

