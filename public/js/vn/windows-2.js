/* V1.1
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
 * This class creates and controls a window system. The window manager operates inside a given div container. You can easily create and handle window elements using the createWindow() method.<br><br>
 * <b>Example:</b><br><font style="font-family:Courier">
 * var wm=new WindowManager('my_div');<br>
 * var win=wm.createWindow({left:100,top:100,width:400,height:300});<br>
 * win.setTitle('My window');<br>
 * var window_div=win.getContentDiv();<br></font>
 * @param div A div element or the id of a div element in which the window manager will operate.
 */
function WindowManager(div)
{
	this.version='2.0';
	this.app=null;
	
	if(typeof div=='string')
		this.div_container=document.getElementById(div);
	else this.div_container=div;
	vn.set(this.div_container.style,{touchAction:'none',overflow:'hidden'});
	
	this._bkg_p=new VNPromise(this);
	this.selected_window=null;
	this._x_mem=0;
	this._y_mem=0;
	this.zIndex=0;
	this.windows=new Array();
	this.buttons=new Array();
	
	//block_div
	this.block_div=document.createElement('div');
	this.div_container.appendChild(this.block_div);
	vn.set(this.block_div.style,{position:'absolute',
	right:'0px',
	bottom:'0px',
	left:'0px',
	top:'0px',
	touchAction:'none',
	overflow:'hidden',
	backgroundColor:'rgba(0,0,0,0.5)',
	display:'none',
	pointerEvents:'auto'});
	
	this.touch_operated=false;
	
	var self=this;
	this.block_div.addEventListener('mousedown',function(event){if(self.touch_operated)return;event.stopPropagation();event.preventDefault();self.blockclick();},false);
	this.block_div.addEventListener('touchstart',function(event){self.touch_operated=true;event.stopPropagation();event.preventDefault();self.blockclick();},false);
	
	this.default_style={
		title:{
			background:'linear-gradient(to bottom, rgba(65,116,225,0.6) 5%, rgba(73,73,98,0.6) 100%)',
			backgroundFocused:'linear-gradient(to bottom, rgba(65,116,225,0.8) 5%, rgba(73,73,98,0.8) 100%)',	
			fontColor:'rgb(255,255,255)',
			fontFamily:'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif',
			fontWeight:'700',
			fontSize:'14px',
			textShadow:'-1px -1px 0px #5b6178',
			width:25,
			radius:5,
			textAlign:'center',
			left:0,
			right:0,
			borderWidth:1,
			borderStyle:'solid #3d3d53',
			borderFocused:'solid #3d3d53'
			},
		icon:{
			close:'url("'+vn.hosturl+'js/img/close_window-1.0.png")',
			closeRight:2,
			minimize:'url("'+vn.hosturl+'js/img/minimize_window-1.0.png")',
			minimizeRight:52,
			unminimize:'url("'+vn.hosturl+'js/img/expand_window-1.0.png")',
			maximize:'url("'+vn.hosturl+'js/img/expand_window-1.0.png")',
			unmaximize:'url("'+vn.hosturl+'js/img/minimize_window-1.0.png")',
			maximizeRight:27,
			iconLeft:2,
			icon:'url("'+vn.hosturl+'logo/VNlogo256.png")',
			hasIcon:false
			},
		border:{
			backgroundLeft:'rgba(128,128,128,0.5)',
			backgroundRight:'rgba(128,128,128,0.5)',
			backgroundBottom:'rgba(128,128,128,0.5)',
			backgroundLeftFocused:'rgba(128,128,128,0.5)',
			backgroundRightFocused:'rgba(128,128,128,0.5)',
			backgroundBottomFocused:'rgba(128,128,128,0.5)',
			width:5,
			invisibleWidth:10,
			radius:0
			}
	};
	
	this.setStyle();
	
	
	this.default_button_backgroundColor='rgb(255,255,255)';
	this.default_button_pressedColor='rgba(160,0,0,0.5)';
	this.default_button_fontColor='rgb(128,128,128)';
	
	this.div_container.addEventListener('mousedown',function(e)
	{
		e.preventDefault();
		e.stopPropagation();
		self.setSelectedWindow(null);
		self._bkg_p.callThen();
	}	,false);
	
	this.div_container.addEventListener('touchstart',function(e)
	{
		e.preventDefault();
		e.stopPropagation();
		self.setSelectedWindow(null);
		self._bkg_p.callThen();
	}	,false);
	
	window.addEventListener('resize', function(){self.updateSize();});
	
	
	this.setPresetStyle('vn');
	//this.setStyle({icon:{icon:'url("'+vn.hosturl+'js/img/bar_icon_512.png")'}});
	
	//var w=this.createConsole(10,10,200,200);
	//w.block();
	//this.blockWindow(w,true);
	//w.whenClosed().then(function(win){win.println('ok');/*win.cancelClosing();*/});
	//w.whenDestroyed().then(function(win){console.log('ok');});
	//w.whenResized().then(function(win){console.log('max');});
	
	//w.whenUnMinimized().then(function(v){v.println('ok');return true;});
	//w.setCanMaximize(true);
	//w.setCanMinimize(true);
	
	//var w=this.createWindow({width:600,height:400,title:'My Window!'});
	
	//var w=this.inputWindow({label:'age',value:'35'});

};

/** 
 * This function returns a Promise that is triggered when the user clicks within the area of this WindowManager but outside of any window.
 * @return VNPromise The promise that is returned.
 */
WindowManager.prototype.whenNoWindowClicked=function(){return this._bkg_p;};

/**
 * This method sets a new window style to the window manager. The new style will be applied to the new windows that will be created from this manager. Example: setStyle({title:{width:30,radius:6,textAlign:'center',fontSize:'14px'},border:{width:4,radius:0}});
 * @param style An object with window style properties.
 */
WindowManager.prototype.setStyle=function(style)
{
	if(style&&style.icon)
	{
		if(style.icon.closeRight)style.icon.closeLeft=0;
		else if(style.icon.closeLeft)style.icon.closeRight=0;
		
		if(style.icon.minimizeRight)style.icon.minimizeLeft=0;
		else if(style.icon.minimizeLeft)style.icon.minimizeRight=0;
		
		if(style.icon.maximizeRight)style.icon.maximizeLeft=0;
		else if(style.icon.maximizeLeft)style.icon.maximizeRight=0;
	}
	this.new_style=style||{};
	var d=this.current_style||this.default_style;
	for(i in d)
	{
		this.new_style[i]=this.new_style[i]||{};
		vn.default(this.new_style[i],d[i]);
	}
	this.current_style=this.new_style;
	
};
/**
This method applies a preset window style to the window manager. The new style will be applied to the new windows that will be created from this manager.
@param name A string with the preset name such as: 'winxp', 'win95', 'win10', and 'mac'.
*/
WindowManager.prototype.setPresetStyle=function(name)
{
if(name=='vn')
	this.setStyle({title:{width:40,radius:15,textAlign:'left',left:50,
    background:'linear-gradient(to top, rgba(0,0,0,0.3) 0%,rgba(0,0,255,0.3) 70%)',
	backgroundFocused:'linear-gradient(to top,rgb(150,150,255) 0%,rgba(0,0,255,0.5) 60%,rgba(100,100,255,0.5) 70%)',
	fontColor:'rgb(255,255,255)',
	fontFamily:'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif',
	fontWeight:'200',
	fontSize:'16px',
	textShadow:'0px 0px 14px #0000FF',
	borderWidth:2,
	borderStyle:'solid rgb(200,200,255)',
	borderStyleFocused:'solid rgb(0,0,255)'},
	border:{backgroundRight:'rgb(200,200,255)',backgroundBottom:'rgb(200,200,255)',backgroundLeft:'rgb(200,200,255)',
	backgroundRightFocused:'rgb(0,0,255)',backgroundBottomFocused:'rgb(0,0,255)',backgroundLeftFocused:'rgb(0,0,255)',
	width:2,radius:0},
	icon:{closeRight:2,maximizeRight:45,minimizeRight:88,iconLeft:6,
	close:'url("'+vn.hosturl+'js/img/close_vn.png")',
	minimize:'url("'+vn.hosturl+'js/img/minimize_vn.png")',
	unminimize:'url("'+vn.hosturl+'js/img/unminimize_vn.png")',
	maximize:'url("'+vn.hosturl+'js/img/maximize_vn.png")',
	unmaximize:'url("'+vn.hosturl+'js/img/unminimize_vn.png")',
	icon:'url("'+vn.hosturl+'js/img/VNlogo256.png")',hasIcon:true}});
else if(name=='winxp')
	this.setStyle({title:{width:30,radius:6,textAlign:'left',left:32,background:'linear-gradient(to bottom, rgb(152,178,232) 0%,rgb(126,162,228) 5%, rgb(123,151,224) 50%, rgb(126,157,229) 90%, rgb(122,147,223) 100%)',
	backgroundFocused:'linear-gradient(to bottom, rgb(61,149,255) 0%,rgb(1,108,254) 5%, rgb(0,85,234) 50%, rgb(0,96,249) 90%, rgb(1,67,207) 100%)',
	fontColor:'rgb(255,255,255)',
	fontFamily:'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif',
	fontWeight:'700',
	fontSize:'14px',
	textShadow:'-1px -1px 0px #5b6178'},
	border:{backgroundRight:'linear-gradient(to right, rgb(123,151,224), rgb(152,178,232))',
	backgroundBottom:' linear-gradient(to bottom, rgb(123,151,224), rgb(152,178,232))',
	backgroundLeft:' linear-gradient(to left, rgb(123,151,224), rgb(152,178,232))',
	backgroundRightFocused:'linear-gradient(to right, rgb(0,72,241), rgb(0,19,140))',
	backgroundBottomFocused:' linear-gradient(to bottom, rgb(0,72,241), rgb(0,19,140))',
	backgroundLeftFocused:' linear-gradient(to left, rgb(0,72,241), rgb(0,19,140))',
	width:4,radius:0},
	icon:{closeRight:2,maximizeRight:27,minimizeRight:52,iconLeft:2,close:'url("'+vn.hosturl+'js/img/close_winxp.png")',
	minimize:'url("'+vn.hosturl+'js/img/minimize_winxp.png")',
	unminimize:'url("'+vn.hosturl+'js/img/minimize_winxp.png")',
	maximize:'url("'+vn.hosturl+'js/img/maximize_winxp.png")',
	unmaximize:'url("'+vn.hosturl+'js/img/unmaximize_winxp.png")',
	icon:'url("'+vn.hosturl+'js/img/icon_winxp.png")',hasIcon:true}});
else if(name=='win10')
	this.setStyle({title:{width:40,radius:0,textAlign:'left',left:42,background:'rgba(255,255,255,0.8)',
	backgroundFocused:'rgb(255,255,255)',
	fontColor:'rgb(0,0,0)',
	fontFamily:'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif',
	fontWeight:'400',
	fontSize:'14px',
	textShadow:'none'	
	},border:{backgroundRight:'rgb(24,131,215)',backgroundBottom:'rgb(24,131,215)',backgroundLeft:'rgb(24,131,215)',width:1,radius:0},
	icon:{closeRight:12,maximizeRight:62,minimizeRight:112,iconLeft:2,close:'url("'+vn.hosturl+'js/img/close_win10.png")',
	minimize:'url("'+vn.hosturl+'js/img/minimize_win10.png")',
	unminimize:'url("'+vn.hosturl+'js/img/minimize_win10.png")',
	maximize:'url("'+vn.hosturl+'js/img/maximize_win10.png")',
	unmaximize:'url("'+vn.hosturl+'js/img/unmaximize_win10.png")',
	icon:'url("'+vn.hosturl+'js/img/icon_win10.png")',hasIcon:true}});
else if(name=='win95')
	this.setStyle({title:{width:25,radius:0,textAlign:'left',left:42,background:'rgb(128,128,128)',
	backgroundFocused:'rgb(0,0,128)',
	fontColor:'rgb(255,255,255)',
	fontFamily:'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif',
	fontWeight:'700',
	fontSize:'14px',
	textShadow:'none'	
	},border:{
		backgroundRight:'linear-gradient(to right, rgb(255,255,255), rgb(0,0,0))',
		backgroundBottom:' linear-gradient(to bottom, rgb(255,255,255), rgb(0,0,0))',
		backgroundLeft:' linear-gradient(to left, rgb(0,0,0), rgb(255,255,255))',
		backgroundRightFocused:'linear-gradient(to right, rgb(255,255,255), rgb(0,0,0))',
		backgroundBottomFocused:' linear-gradient(to bottom, rgb(255,255,255), rgb(0,0,0))',
		backgroundLeftFocused:' linear-gradient(to left, rgb(0,0,0), rgb(255,255,255))',
		width:5,radius:0},
	icon:{closeRight:4,maximizeRight:29,minimizeRight:54,iconLeft:4,close:'url("'+vn.hosturl+'js/img/close_win95.png")',
	minimize:'url("'+vn.hosturl+'js/img/minimize_win95.png")',
	unminimize:'url("'+vn.hosturl+'js/img/minimize_win95.png")',
	maximize:'url("'+vn.hosturl+'js/img/maximize_win95.png")',
	unmaximize:'url("'+vn.hosturl+'js/img/unmaximize_win95.png")',
	icon:'url("'+vn.hosturl+'js/img/icon_win95.png")',hasIcon:true}});
else if(name=='mac')
	this.setStyle({title:{width:25,radius:5,textAlign:'center',left:4,backgroundFocused:'linear-gradient(to bottom, rgb(214,214,214) 0%, rgb(188,188,188) 100%)',
	background:'linear-gradient(to bottom, rgba(235,235,235,0.8) 0%, rgba(194,194,194,0.8) 100%)',
	fontColor:'rgb(64,64,64)',
	fontFamily:'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif',
	fontWeight:'200',
	fontSize:'14px',
	textShadow:'-1px 1px 0px #aaaaaa'},
	border:{
		backgroundRight:'rgb(140,140,140)',
		backgroundBottom:'rgb(140,140,140)',
		backgroundLeft:'rgb(140,140,140)',
		backgroundRightFocused:'rgb(140,140,140)',
		backgroundBottomFocused:'rgb(140,140,140)',
		backgroundLeftFocused:'rgb(140,140,140)',
		width:1,radius:0},
	icon:{closeLeft:12,maximizeLeft:62,minimizeLeft:37,iconRight:2,close:'url("'+vn.hosturl+'js/img/close_mac.png")',
	minimize:'url("'+vn.hosturl+'js/img/minimize_mac.png")',
	unminimize:'url("'+vn.hosturl+'js/img/minimize_mac.png")',
	maximize:'url("'+vn.hosturl+'js/img/maximize_mac.png")',
	unmaximize:'url("'+vn.hosturl+'js/img/maximize_mac.png")',
	hasIcon:false}});
};

/**
 * This method notifies the windows manager that the container div changed its size. It must be called whenever you resize the container div besides when resizing the window of the browser.
 */
WindowManager.prototype.updateSize=function()
{
	for(var i=0;i<this.windows.length;i++)
	{
		this.windows[i].setPosition(this.windows[i].left,this.windows[i].top);
	}
};

WindowManager.prototype.deleteWindow=function(w)
{
	var found=-1;
	for(var i=0;i<this.windows.length && found==-1;i++)
	{
		if(this.windows[i]==w)found=i;
	}
	if(found!=-1)
		this.windows.splice(found,1);
};

/**
 * This method returns the width of the div container in pixels.
 * @return int The width in pixels.
 */
WindowManager.prototype.getWidth=function()
{
	return parseInt(this.div_container.clientWidth);
};

/**
 * This method returns the height of the div container in pixels.
 * @return int The height in pixels.
 */
WindowManager.prototype.getHeight=function()
{
	return parseInt(this.div_container.clientHeight);
};

/**
 * This method returns the size of the div container in pixels.
 * @return Array An Array of size 2 that contains the width and height in pixels.
 */
WindowManager.prototype.getSize=function()
{
	return [this.getWidth(), this.getHeight()];
};

WindowManager.prototype.blockWindow=function(w,closeonclick)
{
	this.zIndex+=1;
	this.block_div.style.zIndex=this.zIndex;
	this.block_div.style.display='block';
	if(w.isSelected())w.setOnTop();
	this.setSelectedWindow(w);
	var self=this;
	if(closeonclick)
	{
		w.whenDestroyed().then(function(){self.unblock();});
		this.blockclick=function(){w.close();};
	}
	else 
	{
		w.whenDestroyed().then(function(){self.unblock();});
		this.blockclick=function(){};
	}
};

WindowManager.prototype.unblock=function()
{
	this.block_div.style.display='none';
};

WindowManager.prototype.blockclick=function(){};

/**
 * This method creates a new window at the specified position and size in the input options.
 * @param options An object with the initial properties of the window such as: left, top, width, height, title. Example: var w=manager.createWindow({left:100,top:50,width:600,height:400,title:'My Window!'});
 * @return VNWindow The window that was created.
 */
WindowManager.prototype.createWindow=function(options,y,w,h)
{
	var opt=null;
	if(typeof y!=='undefined')
		opt={left:options,top:y,width:w,height:h};
	else opt=options;
	
	var w_=new VNWindow(this,opt);
	return w_;
};

/**
 * This method creates a new info window with the specified size and title. The info window, is centered, blocks the other windows, and closes if you click outside the window.
 * @param w The width of the window in pixels.
 * @param h The height of the window in pixels.
 * @param title The title of the window.
 * @return VNWindow The window that was created.
 */
WindowManager.prototype.infoWindow=function(w,h,title)
{
	 var w_=this.createWindow(0,0,w,h);
	 w_.setCanClose(true);
	 w_.setCanMinimize(false);
	 w_.setCanMaximize(false);
	 w_.setTitle(title);
	 w_.block(true);
     w_.center();
	 return w_;
};

WindowManager.prototype.inputWindow=function(options,h,title,label,value)
{
	var opt=null;
	if(typeof h!=='undefined')
		opt={width:options,height:h,title:title,label:label,value:value};
	else opt=options;
	
	var w=new VNInputWindow(this,opt)
	return w;
};

function VNOpenFileWindow(wm,options)
{
	var opt=options||{};
	//vn.default(opt,{left:0,top:0,width:400,height:200});
	VNWindow.call(this,wm,opt);
	
	this.promise=new VNPromise(this);
	this.files=[];
	var self=this;
	
	this.setCanClose(true);
	wm.blockWindow(this,false);
    
	var dv=this.getContentDiv();
	var d=document.createElement('div');
	dv.appendChild(d);
	dv.style.backgroundColor='rgba(128,128,128,0.8)';
	d.style.top='10px';
	d.style.width='100%';
	d.style.position='absolute';
	d.style.touchAction='none';
	
	
	var dnd=document.createElement('div');
	dnd.style.position='absolute';
	dnd.style.width='100px';
	dnd.style.height='100px';
	dnd.style.top='5px';
	dnd.style.left='5px';
	dnd.style.backgroundColor='rgb(255,255,255)';
	dnd.style.border='2px';
	dnd.style.borderStyle='dashed';
	dv.appendChild(dnd);
	
	
	var button=document.createElement('div');
	button.style.background='url("'+vn.hosturl+'js/img/upload_icon.png")';
	button.style.backgroundSize='cover';
	button.style.overflow='hidden';
	button.style.width='50px';
	button.style.height='50px';
	button.style.left='30px'
	button.style.top='27px';
	button.style.position='absolute';
	button.style.cursor='pointer';
	dnd.appendChild(button);
	
	var inp=document.createElement('input');
	inp.type='file';
	inp.name='upload';
	inp.multiple='1';
	inp.style.display='block';
    inp.style.opacity='0';
    inp.style.overflow='hidden';
	inp.style.width='50px';
	inp.style.height='50px';
	inp.style.cursor='pointer';
	inp.onchange=function(){dnd.style.background = 'rgb(116,116,225)';self.files = event.target.files;self.promise.callThen();};
	button.appendChild(inp);
	
	var text=document.createElement('div');
	text.style.position='absolute';
	text.style.top='5px';
	text.style.left='114px';
	text.style.width='281px';
	text.style.height='104px';
	text.style.textAlign='center';
	text.style.lineHeight='14px';
	text.style.verticalAlign='middle';	
	text.style.fontFamily='Arial';
	text.style.color='rgb(255,255,255)';
	text.style.textShadow='-1px -1px 0px #5b6178';
	text.style.fontWeight='bold';
	text.style.fontSize='14px';
	text.style.textDecoration='none';
	text.innerHTML=opt.text;
	dv.appendChild(text);
	
	var decoration_width=this.getWidth()-parseInt(dv.clientWidth);
	var decoration_height=this.getHeight()-parseInt(dv.clientHeight);
	this.setSize(decoration_width+400,decoration_height+114);
	this.center();
	
	dnd.ondragleave=function(event){this.style.background = 'rgb(255,255,255)';button.style.background='url("'+vn.hosturl+'js/img/upload_icon.png")';button.style.backgroundSize='cover';
	};
	dnd.ondragover = function (event) { event.dataTransfer.dropEffect='copy'; this.style.background = 'rgb(116,116,225)'; button.style.background='url("'+vn.hosturl+'js/img/upload_icon_inverted.png")';button.style.backgroundSize='cover';
	 event.stopPropagation();return false; };
	dnd.ondragend = function () {  return false; };
	dnd.ondrop = function (event) {
		event.preventDefault && event.preventDefault();
		self.files = event.dataTransfer.files;
		self.promise.callThen();
		return false;
	};
	
}

VNOpenFileWindow.prototype.whenOpenFile=function()
{
	return this.promise;
}

vn.extend(VNWindow,VNOpenFileWindow);

WindowManager.prototype.openFileWindow=function(title,txt,onOpen)
{
	var w=new VNOpenFileWindow(this,{title:title,text:txt});
	w.whenOpenFile().then(onOpen);
	return w;
};

WindowManager.prototype.uploadFileWindow=function(title,txt,url,onStart,onFinish)
{
	var w=this.openFileWindow(title,txt,function(files){
	
		onStart(files);
	
		var file=files[0];
		if ('name' in file) var fileName = file.name;else var fileName = file.fileName;
        if ('size' in file) var fileSize = file.size;else var fileSize = file.fileSize;
			
	
		var boundary="visineat-----------------------" + (new Date).getTime();
	var CRLF = "\r\n";
	var SEPARATOR="--"+boundary+CRLF;
	var END="--"+boundary+"--"+CRLF;
	
	var message=SEPARATOR+'Content-Disposition: form-data; name="'+"field"+'"'+CRLF+CRLF+"value"+CRLF;
		message+=SEPARATOR+'Content-Disposition: form-data; name="file"; filename="'+fileName+'"'+CRLF;
		message+="Content-Type: application/octet-stream"+CRLF+CRLF;
		//data
	var	message2=CRLF+END;
	
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4) {
		w.close();
		onFinish(xmlhttp);
        }
    };
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
	
	var reader = new FileReader();
	reader.onload = function(e) {
		var data=new Uint8Array(e.target.result);
		var ui8a=new Uint8Array(message.length+data.length+message2.length);
		for (var i = message.length-1; i>=0 ; i--) ui8a[i] = (message.charCodeAt(i) & 0xff);
		ui8a.set(data,message.length);
		var offset=message.length+data.length;
		for (var i = message2.length-1; i>=0 ; i--) ui8a[i+offset] = (message2.charCodeAt(i) & 0xff);
		var d=w.getContentDiv();
		while (d.hasChildNodes()) d.removeChild(d.lastChild);
		
		var dnd=document.createElement('div');
		dnd.style.width='100px';
		dnd.style.height='100px';
		dnd.style.margin='5px auto 0px';
		dnd.style.background='url("'+vn.hosturl+'js/img/loading.gif")';
		dnd.style.backgroundSize='cover';
		dnd.style.overflow='hidden';
		d.appendChild(dnd);
		
		
		xmlhttp.send(ui8a);
	};
	reader.readAsArrayBuffer(file);
	
	
	
	});
	
};

/**
 * This method creates a new console window at the specified position and size. The console window can printout text in a black and white console screen.
 * @param x The x-coordinate of the upper left corner of the window.
 * @param y The y-coordinate of the upper left corner of the window.
 * @param w The width of the window in pixels.
 * @param h The height of the window in pixels.
 * @return VNConsoleWindow The console window that was created.
 */
WindowManager.prototype.createConsole=function(options,y,w,h)
{
	var opt=null;
	if(typeof y!=='undefined')
		opt={left:options,top:y,width:w,height:h};
	else opt=options;
	
	var w=new VNConsoleWindow(this,opt)
	return w;
};

/**
 * This method creates a new browser window at the specified position and size. The browser window contains an iframe that shows another website.
 * @param x The x-coordinate of the upper left corner of the window.
 * @param y The y-coordinate of the upper left corner of the window.
 * @param w The width of the window in pixels.
 * @param h The height of the window in pixels.
 * @param url The url of a website.
 * @return VNWindow The window that was created.
 */
WindowManager.prototype.createBrowser=function(x,y,w,h,url)
{
	var w_=this.createWindow(x,y,w,h);
	var from=0;
	if(url.indexOf('http://www.')==0)
		from=11;
	else if(url.indexOf('http://')==0)
		from=7;
		
	w_.setTitle(url.substring(from));
	var i=document.createElement('iframe');
	i.style.width='100%';
	i.style.height='100%';
	i.src=url;
	w_.iframe=i;
	w_.getContentDiv().appendChild(i);
	
	return w_;
};

/**
 * This method creates a new window with icons of apps. The window, is as large as the container of the WindowManage, it is centered, blocks the other windows, and closes if you click outside the window.
 * @param title The title of the window.
 * @return VNAppMenuWindow The window that was created.
 */
WindowManager.prototype.createIconMenuWindow=function(title)
{
	return new VNAppMenuWindow(this,title);
};

/**
 * This method installs a web app under the control of this WindowManager. The web app is given as a path to a folder that contains main.js and icon.png, which will be loaded later only when necessary.
 * @param path The path of the web app.
 * @param title An optional title of the web app.
 * @return VNApp The app object that was created.
 */
WindowManager.prototype.installApp=function(path,title)
{
	return new VNApp(this,path,title);
};

WindowManager.prototype.createDesktopButton=function(x,y,w,h)
{
	var b_=new VNButton(this,x,y,w,h);
	this.buttons[this.buttons.length]=b_;
	return b_;
};

WindowManager.prototype.createWindowToggleButton=function(x,y,w,h,win)
{
 var b=this.createDesktopButton(x,y,w,h);
 b.setIsToggleButton(true);
 b.w=win;
 win.hide();
 win.whenClosed().then(function(win){b.setToggleState(false);win.hide();win.cancelClosing();});
 b.onclick=function(bt)
 {
	if(bt.isPressed())
	{
		bt.w.show();
	}
	else bt.w.hide();
 };
 return b;
};

/**
 * Returns the currently selected/focused window.
 * @return VNWindow The selected window.
 */
WindowManager.prototype.getSelectedWindow=function(){return this.selected_window;};

/**
 * Sets the focus to a particular window.
 * @param w The VNWindow to be selected/focused.
 */
WindowManager.prototype.setSelectedWindow=function(w)
{
	if(this.selected_window==w) return;
	
	if(this.selected_window!=null)
	{
		this.selected_window.setSelected(false);
		this.selected_window=null;
	}
	
	if(w!=null)
	{
		if(!w.isSelected()) w.setSelected(true);
		this.selected_window=w;
		this.selected_window.setOnTop();
	}
};

/**
 * This method sets an optional main app object in order to be accessible from all windows controlled by the WindowManager object.
 * @param app The object of your main web app.
 */
WindowManager.prototype.setMainApp=function(app){this.app=app;};

/**
 * This method returns your main app object, which was previously set using the setMainApp().
 * @return Object The object of your main web app.
 */
WindowManager.prototype.getMainApp=function(){return this.app;};

/**
 * This class creates and handles a window. You can easily modify the content of a window using the getContentDiv() method.<br><br>
 * <b>Example:</b><br><font style="font-family:Courier">
 * var win=new VNWindow(wm,100,100,400,300);<br>
 * win.setTitle('My window');<br>
 * var window_div=win.getContentDiv();<br></font>
 * @param manager The WindowManager object that controls the window system.
 * @param x The x-coordinate of the upper left corner of the window.
 * @param y The y-coordinate of the upper left corner of the window.
 * @param w The width of the window in pixels.
 * @param h The height of the window in pixels.
 */
function VNWindow(manager,options)
{
	var opt=options||{};
	manager._y_mem+=manager.current_style.title.width;
	if(manager._y_mem>manager.div_container.clientHeight/2)
		manager._y_mem=0;
	
	manager._x_mem+=manager.current_style.title.width;
	if(manager._x_mem>manager.div_container.clientWidth/2)
		manager._x_mem=0;
	
	vn.default(opt,{left:manager._x_mem,top:manager._y_mem,width:400,height:200,title:''});
	this.manager=manager;
	this.current_style=JSON.parse(JSON.stringify(this.manager.current_style));
	
	this.div_container=this.manager.div_container;
	
	this._minimize_p=new VNPromise(this);
	this._unminimize_p=new VNPromise(this);
	this._maximize_p=new VNPromise(this);
	this._unmaximize_p=new VNPromise(this);
	this._close_p=new VNPromise(this);
	this._destroy_p=new VNPromise(this);
	this._icon_p=new VNPromise(this);
	this._focus_p=new VNPromise(this);
	this._unfocus_p=new VNPromise(this);
	this._resize_p=new VNPromise(this);
	
	this._cancel_closing=false;
	
	this.border_size=this.current_style.border.width+this.current_style.border.invisibleWidth;
	this.visible_border_size=this.current_style.border.width;
	this.title_size=this.current_style.title.width;
	
	this.width=opt.width;
	if(this.width<(this.border_size+this.title_size)*2)this.width=(this.border_size+this.title_size)*2;
	if(this.width>parseInt(this.div_container.clientWidth))this.width=parseInt(this.div_container.clientWidth);
		
	this.height=opt.height;
	if(this.height<this.border_size+this.title_size+this.border_size-this.visible_border_size)this.height=this.border_size+this.title_size+this.border_size-this.visible_border_size;
	if(this.height>parseInt(this.div_container.clientHeight))this.height=parseInt(this.div_container.clientHeight);
	
	this.left=opt.left;
	if(this.left+this.width>parseInt(this.div_container.clientWidth))this.left=Math.max(parseInt(this.div_container.clientWidth)-this.width,0);
	
	this.top=opt.top;
	if(this.top+this.height>parseInt(this.div_container.clientHeight))this.top=Math.max(parseInt(this.div_container.clientHeight)-this.height,0);
	
	
	this.title=opt.title;
	this.is_selected=false;
	this.is_movable=true;
	this.is_resizableX=true;
	this.is_resizableY=true;
	this.is_closable=true;
	this.is_minimizable=true;
	this.is_minimized=false;
	this.is_maximizable=true;
	this.is_maximized=false;
	this.has_icon=false;
	
	//window_div
	this.window_div=document.createElement('div');
	this.div_container.appendChild(this.window_div);
	vn.set(this.window_div.style,{position:'absolute',
	width:this.width+'px',
	height:this.height+'px',
	left:this.left+'px',
	top:this.top+'px',
	borderRadius:''+this.current_style.title.radius+'px '+this.current_style.title.radius+'px '+this.current_style.border.radius+'px '+this.current_style.border.radius+'px',
	touchAction:'none',
	overflow:'hidden',
	boxSizing:'content-box',
	pointerEvents:'auto'});
	
	//shadow_top_div
	this.shadow_top_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_top_div);
	vn.set(this.shadow_top_div.style,{position:'absolute',
	height:(this.border_size-this.visible_border_size+this.current_style.title.radius)+'px',
	left:(this.border_size-this.visible_border_size)+'px',
	right:(this.border_size-this.visible_border_size)+'px',
	top:'0px',
	touchAction:'none',
	background:'linear-gradient(to top, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)50%, rgba(0,0,0,0)100%)',
	boxSizing:'content-box'});
	
	//shadow_top_left_div
	this.shadow_top_left_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_top_left_div);
	vn.set(this.shadow_top_left_div.style,{position:'absolute',
	width:(this.border_size-this.visible_border_size)+'px',
	height:(this.border_size-this.visible_border_size+this.current_style.title.radius)+'px',
	left:'0px',
	top:'0px',
	touchAction:'none',
	background:'linear-gradient(to top left, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)25%, rgba(0,0,0,0)50%)',
	boxSizing:'content-box'});
	
	//shadow_top_right_div
	this.shadow_top_right_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_top_right_div);
	vn.set(this.shadow_top_right_div.style,{position:'absolute',
	width:(this.border_size-this.visible_border_size)+'px',
	height:(this.border_size-this.visible_border_size+this.current_style.title.radius)+'px',
	right:'0px',
	top:'0px',
	touchAction:'none',
	background:'linear-gradient(to top right, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)25%, rgba(0,0,0,0)50%)',
	boxSizing:'content-box'});
	
	//shadow_bottom_div
	this.shadow_bottom_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_bottom_div);
	vn.set(this.shadow_bottom_div.style,{position:'absolute',
	height:(this.border_size-this.visible_border_size+this.current_style.border.radius)+'px',
	left:(this.border_size-this.visible_border_size)+'px',
	right:(this.border_size-this.visible_border_size)+'px',
	bottom:'0px',
	touchAction:'none',
	background:'linear-gradient(to bottom, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)50%, rgba(0,0,0,0)100%)',
	boxSizing:'content-box'});
	
	//shadow_bottom_left_div
	this.shadow_bottom_left_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_bottom_left_div);
	vn.set(this.shadow_bottom_left_div.style,{position:'absolute',
	width:(this.border_size-this.visible_border_size)+'px',
	height:(this.border_size-this.visible_border_size+this.current_style.border.radius)+'px',
	left:'0px',
	bottom:'0px',
	touchAction:'none',
	background:'linear-gradient(to bottom left, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)25%, rgba(0,0,0,0)50%)',
	boxSizing:'content-box'});
	
	//shadow_bottom_right_div
	this.shadow_bottom_right_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_bottom_right_div);
	vn.set(this.shadow_bottom_right_div.style,{position:'absolute',
	width:(this.border_size-this.visible_border_size)+'px',
	height:(this.border_size-this.visible_border_size+this.current_style.border.radius)+'px',
	right:'0px',
	bottom:'0px',
	touchAction:'none',
	background:'linear-gradient(to bottom right, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)25%, rgba(0,0,0,0)50%)',
	boxSizing:'content-box'});
	
	//shadow_left_div
	this.shadow_left_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_left_div);
	vn.set(this.shadow_left_div.style,{position:'absolute',
	width:(this.border_size-this.visible_border_size)+'px',
	top:(this.border_size-this.visible_border_size+this.current_style.title.radius)+'px',
	bottom:(this.border_size-this.visible_border_size+this.current_style.border.radius)+'px',
	left:'0px',
	touchAction:'none',
	background:'linear-gradient(to left, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)50%, rgba(0,0,0,0)100%)',
	boxSizing:'content-box'});
	
	//shadow_right_div
	this.shadow_right_div=document.createElement('div');
	this.window_div.appendChild(this.shadow_right_div);
	vn.set(this.shadow_right_div.style,{position:'absolute',
	width:(this.border_size-this.visible_border_size)+'px',
	top:(this.border_size-this.visible_border_size+this.current_style.title.radius)+'px',
	bottom:(this.border_size-this.visible_border_size+this.current_style.border.radius)+'px',
	right:'0px',
	touchAction:'none',
	background:'linear-gradient(to right, rgba(0,0,0,0.3)0%,rgba(0,0,0,0.1)50%, rgba(0,0,0,0)100%)',
	boxSizing:'content-box'});
	
	//border_top_div
	this.border_top_div=document.createElement('div');
	this.window_div.appendChild(this.border_top_div);
	vn.set(this.border_top_div.style,{position:'absolute',
	width:this.width+'px',//(this.width-this.border_size*4)+'px',
	height:(this.border_size-this.visible_border_size)+'px',
	left:'0px',//(this.border_size*2)+'px',
	top:'0px',
	touchAction:'none',
	//background:'linear-gradient(to top, rgba(0,0,0,0.2), rgba(0,0,0,0))',
	cursor:'ns-resize',
	boxSizing:'content-box'});
	
	//border_top_left_div
	this.border_top_left_div=document.createElement('div');
	this.window_div.appendChild(this.border_top_left_div);
	
	vn.set(this.border_top_left_div.style,{position:'absolute',
	width:(this.border_size*2)+'px',
	height:(this.border_size*2)+'px',
	left:'0px',
	top:'0px',
	touchAction:'none',
	cursor:'nw-resize',
	boxSizing:'content-box'});
	
	//border_top_right_div
	this.border_top_right_div=document.createElement('div');
	this.window_div.appendChild(this.border_top_right_div);
	vn.set(this.border_top_right_div.style,{position:'absolute',
	width:(this.border_size*2)+'px',
	height:(this.border_size*2)+'px',
	left:(this.width-this.border_size*2)+'px',
	top:'0px',
	touchAction:'none',
	cursor:'ne-resize',
	boxSizing:'content-box'});
	
	//title_div
	this.title_div=document.createElement('div');
	this.window_div.appendChild(this.title_div);
	vn.set(this.title_div.style,{position:'absolute',
	//width:(this.width-2*(this.border_size-this.visible_border_size)-2)+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	left:(this.border_size-this.visible_border_size)+'px',
	right:(this.border_size-this.visible_border_size)+'px',
	top:(this.border_size-this.visible_border_size)+'px',
	borderRadius:''+this.current_style.title.radius+'px '+this.current_style.title.radius+'px 0px 0px',
	border:this.current_style.title.borderWidth+'px '+this.current_style.title.borderStyle,
	touchAction:'none',
	/*background:'-webkit-gradient(linear, left top, left bottom, color-stop(0.05, '+this.current_style.title.backgroundColor+'), color-stop(1, '+this.current_style.title.backgroundColor2+'))',
	background:'-moz-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)',
	background:'-webkit-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)',
	background:'-o-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)',
	background:'-ms-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)',
	background:'linear-gradient(to bottom, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)',*/
	background:this.current_style.title.background,
	boxSizing:'content-box'});
	
	//title_text_div
	this.title_text_div=document.createElement('div');
	this.title_div.appendChild(this.title_text_div);
	vn.set(this.title_text_div.style,{position:'absolute',
	right:this.current_style.title.right+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	left:this.current_style.title.left+'px',
	top:'0px',
	touchAction:'none',
	textAlign:this.current_style.title.textAlign,
	lineHeight:(this.title_size-this.current_style.title.borderWidth)+'px',
	verticalAlign:'middle',
	fontFamily:'Arial',//'"Segoe UI Light","Segoe UI","Segoe WP Light","Segoe WP","Segoe UI Latin Light",HelveticaNeue,Helvetica,Tahoma,ArialUnicodeMS,sans-serif';
	color:this.current_style.title.fontColor,
	textShadow:this.current_style.title.textShadow,
	fontWeight:this.current_style.title.fontWeight,//'bold',//'700';
	fontSize:this.current_style.title.fontSize,
	textDecoration:'none',
	overflow:'hidden',
	boxSizing:'content-box'});
	this.title_text_div.innerHTML=this.title;
	
	//title_cover_div
	this.title_cover_div=document.createElement('div');
	this.title_div.appendChild(this.title_cover_div);
	vn.set(this.title_cover_div.style,{position:'absolute',
	width:(this.width-2*(this.border_size-this.visible_border_size+this.current_style.title.borderWidth))+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	left:'0px',
	top:'0px',
	borderRadius:''+this.current_style.title.radius+'px '+this.current_style.title.radius+'px 0px 0px',
	touchAction:'none',
	boxSizing:'content-box'});
	
	//close_div
	this.close_div=document.createElement('div');
	this.title_cover_div.appendChild(this.close_div);
	vn.set(this.close_div.style,{position:'absolute',
	width:(this.title_size-this.current_style.title.borderWidth)+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	top:'1px',
	backgroundImage:this.current_style.icon.close,
	backgroundSize:'contain',
	backgroundRepeat:'no-repeat',
	//borderRadius:close_rad+'px',
	//borderWidth:'2px',
	//borderStyle:'solid',
	//borderColor:'rgb(255,255,255)',
	touchAction:'none',
	cursor:'pointer',
	boxSizing:'content-box'});
	
	if(this.current_style.icon.closeRight)this.close_div.style.right=this.current_style.icon.closeRight+'px';
	else if(this.current_style.icon.closeLeft)this.close_div.style.left=this.current_style.icon.closeLeft+'px';
	
	//minimize_div
	this.minimize_div=document.createElement('div');
	this.title_cover_div.appendChild(this.minimize_div);
	vn.set(this.minimize_div.style,{position:'absolute',
	width:(this.title_size-this.current_style.title.borderWidth)+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	top:'1px',
	backgroundImage:this.current_style.icon.minimize,
	backgroundSize:'contain',
	backgroundRepeat:'no-repeat',
	//borderRadius:close_rad+'px',
	//borderWidth:'2px',
	//borderStyle:'solid',
	//borderColor:'rgb(255,255,255)',
	touchAction:'none',
	//display:'none',
	cursor:'pointer',
	boxSizing:'content-box'});
	
	if(this.current_style.icon.minimizeRight)this.minimize_div.style.right=this.current_style.icon.minimizeRight+'px';
	else if(this.current_style.icon.minimizeLeft)this.minimize_div.style.left=this.current_style.icon.minimizeLeft+'px';
	
	//maximize_div
	this.maximize_div=document.createElement('div');
	this.title_cover_div.appendChild(this.maximize_div);
	vn.set(this.maximize_div.style,{position:'absolute',
	width:(this.title_size-this.current_style.title.borderWidth)+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	top:'1px',
	backgroundImage:this.current_style.icon.maximize,
	backgroundSize:'contain',
	backgroundRepeat:'no-repeat',
	//borderRadius:close_rad+'px',
	//borderWidth:'2px',
	//borderStyle:'solid',
	//borderColor:'rgb(255,255,255)',
	touchAction:'none',
	//display:'none',
	cursor:'pointer',
	boxSizing:'content-box'});
	
	var iconurl=null;
	if(opt.icon)iconurl='url("'+opt.icon+'")';
		
	if(this.current_style.icon.maximizeRight)this.maximize_div.style.right=this.current_style.icon.maximizeRight+'px';
	else if(this.current_style.icon.maximizeLeft)this.maximize_div.style.left=this.current_style.icon.maximizeLeft+'px';
	//icon_div
	this.icon_div=document.createElement('div');
	this.title_cover_div.appendChild(this.icon_div);
	vn.set(this.icon_div.style,{position:'absolute',
	width:(this.title_size-this.current_style.title.borderWidth)+'px',
	height:(this.title_size-this.current_style.title.borderWidth)+'px',
	top:'1px',
	backgroundImage:iconurl||this.current_style.icon.icon,
	backgroundSize:'contain',
	backgroundRepeat:'no-repeat',
	//borderRadius:close_rad+'px',
	//borderWidth:'2px',
	//borderStyle:'solid',
	//borderColor:'rgb(255,255,255)',
	touchAction:'none',
	display:'none',
	//cursor:'pointer',
	boxSizing:'content-box'});
	
	if(this.current_style.icon.hasIcon) this.setHasIcon(true);
	
	if(this.current_style.icon.iconRight)this.icon_div.style.right=this.current_style.icon.iconRight+'px';
	else if(this.current_style.icon.iconLeft)this.icon_div.style.left=this.current_style.icon.iconLeft+'px';
	
	//visible_border_left_div
	this.visible_border_left_div=document.createElement('div');
	this.window_div.appendChild(this.visible_border_left_div);
	vn.set(this.visible_border_left_div.style,{position:'absolute',
	width:this.visible_border_size+'px',
	height:(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px',
	left:(this.border_size-this.visible_border_size)+'px',
	top:(this.title_size+this.border_size-this.visible_border_size)+'px',
	background:this.current_style.border.backgroundLeft,
	touchAction:'none',
	boxSizing:'content-box'});
	
	//border_left_div
	this.border_left_div=document.createElement('div');
	this.window_div.appendChild(this.border_left_div);
	vn.set(this.border_left_div.style,{position:'absolute',
	width:this.border_size+'px',
	height:(this.height-this.title_size-this.border_size*2-(this.border_size-this.visible_border_size))+'px',
	left:'0px',
	top:(this.title_size+this.border_size-this.visible_border_size)+'px',
	touchAction:'none',
	cursor:'ew-resize',
	boxSizing:'content-box'});
	
	//visible_border_right_div
	this.visible_border_right_div=document.createElement('div');
	this.window_div.appendChild(this.visible_border_right_div);
	vn.set(this.visible_border_right_div.style,{position:'absolute',
	width:this.visible_border_size+'px',
	height:(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px',
	left:(this.width-this.border_size)+'px',
	top:(this.title_size+this.border_size-this.visible_border_size)+'px',
	background:this.current_style.border.backgroundRight,
	touchAction:'none',
	boxSizing:'content-box'});
	
	//border_right_div
	this.border_right_div=document.createElement('div');
	this.window_div.appendChild(this.border_right_div);
	vn.set(this.border_right_div.style,{position:'absolute',
	width:this.border_size+'px',
	height:(this.height-this.title_size-this.border_size*2-(this.border_size-this.visible_border_size))+'px',
	left:(this.width-this.border_size)+'px',
	top:(this.title_size+this.border_size-this.visible_border_size)+'px',
	touchAction:'none',
	cursor:'ew-resize',
	boxSizing:'content-box'});
	
	//visible_border_bottom_div
	this.visible_border_bottom_div=document.createElement('div');
	this.window_div.appendChild(this.visible_border_bottom_div);
	vn.set(this.visible_border_bottom_div.style,{position:'absolute',
	width:(this.width-(this.border_size-this.visible_border_size)*2)+'px',
	height:this.visible_border_size+'px',
	left:(this.border_size-this.visible_border_size)+'px',
	top:(this.height-this.border_size)+'px',
	background:this.current_style.border.backgroundBottom,
	touchAction:'none',
	borderRadius:'0px 0px '+this.current_style.border.radius+'px '+this.current_style.border.radius+'px',
	boxSizing:'content-box'});
	
	//border_bottom_div
	this.border_bottom_div=document.createElement('div');
	this.window_div.appendChild(this.border_bottom_div);
	vn.set(this.border_bottom_div.style,{position:'absolute',
	width:(this.width-this.border_size*4)+'px',
	height:this.border_size+'px',
	left:(this.border_size*2)+'px',
	top:(this.height-this.border_size)+'px',
	touchAction:'none',
	cursor:'ns-resize',
	boxSizing:'content-box'});
	
	//border_bottom_left_div
	this.border_bottom_left_div=document.createElement('div');
	this.window_div.appendChild(this.border_bottom_left_div);
	vn.set(this.border_bottom_left_div.style,{position:'absolute',
	width:(this.border_size*2)+'px',
	height:(this.border_size*2)+'px',
	left:'0px',
	top:(this.height-this.border_size*2)+'px',
	touchAction:'none',
	cursor:'sw-resize',
	boxSizing:'content-box'});
	
	//border_bottom_right_div
	this.border_bottom_right_div=document.createElement('div');
	this.window_div.appendChild(this.border_bottom_right_div);
	vn.set(this.border_bottom_right_div.style,{position:'absolute',
	width:(this.border_size*2)+'px',
	height:(this.border_size*2)+'px',
	left:(this.width-this.border_size*2)+'px',
	top:(this.height-this.border_size*2)+'px',
	touchAction:'none',
	cursor:'se-resize',
	boxSizing:'content-box'});
	
	//content_div
	this.content_div=document.createElement('div');
	this.window_div.appendChild(this.content_div);
	vn.set(this.content_div.style,{position:'absolute',
	//width:(this.width-this.border_size*2)+'px',
	//height:(this.height-this.border_size-this.title_size-(this.border_size-this.visible_border_size))+'px',
	left:this.border_size+'px',
	right:this.border_size+'px',
	bottom:this.border_size+'px',
	top:(this.title_size+this.border_size-this.visible_border_size)+'px',
	backgroundColor:'rgb(255,255,255)',
	overflowX:'hidden',
	overflowY:'hidden',
	boxSizing:'content-box'});
	
	this.offset_x=0;
	this.offset_y=0;
	this.memory_x=0;
	this.memory_y=0;
	this.memory_width=0;
	this.memory_height=0;
	//this.is_moving=false;
	//this.is_resizing=false;
	this.resizing_border_id=0;
	this.touch_operated=false;
 
	var self=this;	
	
	//title_div events:
	this.title_mousemove_event=function(event){event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY; self.handleTitleMouseMove(x,y);};
	this.title_touchmove_event=function(event){event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;}self.handleTitleMouseMove(x,y);};
	this.title_mouseup_event=function(event){self.handleTitleMouseUp();};
	
	
	this.title_div.addEventListener('mousedown',function(event){
		if(self.touch_operated)return;
		if(event.target==self.close_div){event.preventDefault();event.stopPropagation();self.close();return;}
		else if(event.target==self.minimize_div){event.preventDefault();self.minmax();return;}
		else if(event.target==self.maximize_div){event.preventDefault();event.stopPropagation();self.toggleMaximize();return;}
		else if(event.target==self.icon_div){event.preventDefault();event.stopPropagation();self.setSelected(true);self._icon_p.callThen();return;}
		event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY;
		self.handleTitleMouseDown(x,y);},false);
	this.title_div.addEventListener('touchstart',function(event){self.touch_operated=true;
		if(event.target==self.close_div){event.preventDefault();event.stopPropagation();self.close();return;}
		else if(event.target==self.minimize_div){event.preventDefault();self.minmax();return;}
		else if(event.target==self.maximize_div){event.preventDefault();event.stopPropagation();self.toggleMaximize();return;}
		else if(event.target==self.icon_div){event.preventDefault();event.stopPropagation();self.setSelected(true);self._icon_p.callThen();return;}
		event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;} /*self.handleTitleMouseMove(x,y);*/self.handleTitleMouseDown(x,y);},false);
	
	
	//border divs events:
	this.border_mousemove_event=function(event){event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY; self.handleBorderMouseMove(x,y);};
	this.border_touchmove_event=function(event){event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;}self.handleBorderMouseMove(x,y);};
	this.border_mouseup_event=function(event){self.handleBorderMouseUp();};
	
	
	
	this.window_div.addEventListener('mousedown',function(event){event.stopPropagation();self.setSelected(true);if(!self.isBorder(event.target))return;if(self.touch_operated)return;self.resizing_border_id=self.getBorderId(event.target);event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY;self.handleBorderMouseDown(x,y);},false);
	this.window_div.addEventListener('touchstart',function(event){event.stopPropagation();self.setSelected(true);if(!self.isBorder(event.target))return;self.touch_operated=true;self.resizing_border_id=self.getBorderId(event.target);event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;} /*self.handleBorderMouseMove(x,y);*/self.handleBorderMouseDown(x,y);},false);
	
	this.setSelected(true);
	this.manager.windows[this.manager.windows.length]=this;
};

VNWindow.prototype.getWindowManager=function(){return this.manager;};

VNWindow.prototype.isBorder=function(div)
{
	if(div==this.border_left_div||div==this.border_right_div||div==this.border_bottom_div||div==this.border_bottom_left_div||div==this.border_bottom_right_div||div==this.border_top_div||div==this.border_top_left_div||div==this.border_top_right_div)
		return true;
	else
		return false;
};

VNWindow.prototype.getBorderId=function(div)
{
	if(div==this.border_left_div)
		return 1;
	else if(div==this.border_right_div)
		return 2;
	else if(div==this.border_bottom_div)
		return 3;	
	else if(div==this.border_bottom_left_div)
		return 4;
	else if(div==this.border_bottom_right_div)
		return 5;
	else if(div==this.border_top_div)
		return 6;	
	else if(div==this.border_top_left_div)
		return 7;
	else if(div==this.border_top_right_div)
		return 8;
	else
		return 0;
};

/**
 * Returns the div element inside the window.
 * @return Element The div element in which you can place the contents of this window.
 */
VNWindow.prototype.getContentDiv=function(){return this.content_div;};

/** 
 * Applies to the content div a pre-set style with black semi-transparent background and white Arial fonts. 
 */
VNWindow.prototype.applyBlackTransparentPreset=function()
{
	this.content_div.style.backgroundColor='rgba(0,0,0,0.4)';
	this.content_div.style.color='rgb(255,255,255)';
	this.content_div.style.fontFamily='Arial';
};


/** 
 * Sets this window on top of the others.
 */
VNWindow.prototype.setOnTop=function()
{
	this.manager.zIndex+=1;
	this.window_div.style.zIndex=this.manager.zIndex;
};

/** 
 * Returns a boolean that indicates if this window is movable.
 * @return boolean 
 */
VNWindow.prototype.canMove=function(){return this.is_movable;};
/** 
 * Sets if this window is movable.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setCanMove=function(flag){this.is_movable=flag;};
/** 
 * Returns a boolean that indicates if this window is resizable.
 * @return boolean 
 */
VNWindow.prototype.canResize=function(){return this.is_resizableX || this.is_resizableY;};
/** 
 * Returns a boolean that indicates if this window is resizable along X.
 * @return boolean 
 */
VNWindow.prototype.canResizeX=function(){return this.is_resizableX;};
/** 
 * Returns a boolean that indicates if this window is resizable along Y.
 * @return boolean 
 */
VNWindow.prototype.canResizeY=function(){return this.is_resizableY;};
/** 
 * Sets if this window is resizable along X.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setCanResizeX=function(flag){this.setCanResize(flag,this.is_resizableY);};
/** 
 * Sets if this window is resizable along Y.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setCanResizeY=function(flag){this.setCanResize(this.is_resizableX,flag);};
/** 
 * Sets if this window is resizable.
 * @param flagx A boolean flag that indicates if the window is resizable along x.
 * @param flagy A boolean flag that indicates if the window is resizable along y. (Optional argument) If this argument is missing then it takes the value of the first argument.
 */
VNWindow.prototype.setCanResize=function(flagx,flagy)
{
	this.is_resizableX=flagx;
	if(typeof flagy !=='undefined')
		this.is_resizableY=flagy;
	else
		this.is_resizableY=flagx;
		
	if(this.is_resizableX && this.is_resizableY)
	{
		this.border_left_div.style.cursor='ew-resize';
		this.border_right_div.style.cursor='ew-resize';
		this.border_bottom_div.style.cursor='ns-resize';
		this.border_bottom_left_div.style.cursor='sw-resize';
		this.border_bottom_right_div.style.cursor='se-resize';
		this.border_top_div.style.cursor='ns-resize';
		this.border_top_left_div.style.cursor='nw-resize';
		this.border_top_right_div.style.cursor='ne-resize';
	}
	else if(this.is_resizableX)
	{
		this.border_left_div.style.cursor='ew-resize';
		this.border_right_div.style.cursor='ew-resize';
		this.border_bottom_div.style.cursor='auto';
		this.border_bottom_left_div.style.cursor='ew-resize';
		this.border_bottom_right_div.style.cursor='ew-resize';
		this.border_top_div.style.cursor='auto';
		this.border_top_left_div.style.cursor='ew-resize';
		this.border_top_right_div.style.cursor='ew-resize';
	}
	else if(this.is_resizableY)
	{
		this.border_left_div.style.cursor='auto';
		this.border_right_div.style.cursor='auto';
		this.border_bottom_div.style.cursor='ns-resize';
		this.border_bottom_left_div.style.cursor='ns-resize';
		this.border_bottom_right_div.style.cursor='ns-resize';
		this.border_top_div.style.cursor='ns-resize';
		this.border_top_left_div.style.cursor='ns-resize';
		this.border_top_right_div.style.cursor='ns-resize';
	}
	else
	{
		this.border_left_div.style.cursor='auto';
		this.border_right_div.style.cursor='auto';
		this.border_bottom_div.style.cursor='auto';
		this.border_bottom_left_div.style.cursor='auto';
		this.border_bottom_right_div.style.cursor='auto';
		this.border_top_div.style.cursor='auto';
		this.border_top_left_div.style.cursor='auto';
		this.border_top_right_div.style.cursor='auto';
	}
};

/** 
 * Returns a boolean that indicates if this window can be closed.
 * @return boolean 
 */
VNWindow.prototype.canClose=function(){return this.is_closable;};
/** 
 * Sets if this window can be closed.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setCanClose=function(flag)
{
	this.is_closable=flag;
	if(this.is_closable)
		this.close_div.style.display='block';
	else this.close_div.style.display='none';
};
/** 
 * Toggles the minimize/maximize state of the window
 */
VNWindow.prototype.minmax=function()
{
	this.setSelected(true);
	if(this.is_minimized)
		this.unMinimize();
	else
		this.minimize();
};

/** 
 * Minimizes the window.
 */
VNWindow.prototype.minimize=function()
{
	this.is_minimized=true;
	this.minimize_div.style.backgroundImage=this.current_style.icon.unminimize;
	this.window_div.style.height=(this.title_size+this.border_size-this.visible_border_size)+'px';
	this._minimize_p.callThen();
};

/** 
 * A callback function that is called when a window is minimized. It is initially empty.
 */
VNWindow.prototype.whenMinimized=function(){return this._minimize_p;};

/** 
 * Returns a boolean that indicates if this window can be minimized.
 * @return boolean 
 */
VNWindow.prototype.canMinimize=function(){return this.is_minimizable;};
/** 
 * Sets if this window can be minimized.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setCanMinimize=function(flag)
{
	this.is_minimizable=flag;
	if(this.is_minimizable)
		this.minimize_div.style.display='block';
	else
	{
		this.is_minimized=false;
		this.minimize_div.style.backgroundImage=this.current_style.icon.minimize;
		this.window_div.style.height=this.height+'px';
		this.minimize_div.style.display='none';
	}
};

/** 
 * Returns a boolean that indicates if this window is minimized.
 * @return boolean 
 */
VNWindow.prototype.isMinimized=function(){return this.is_minimized;};

/** 
 * Expands the window.
 */
VNWindow.prototype.unMinimize=function()
{
	this.is_minimized=false;
	this.minimize_div.style.backgroundImage=this.current_style.icon.minimize;
	this.window_div.style.height=this.height+'px';
	this._unminimize_p.callThen();
};

/** 
 * A callback function that is called when a window is expanded. It is initially empty.
 */
VNWindow.prototype.whenUnMinimized=function(){return this._unminimize_p;};

/** 
 * Toggles the maximize/unmaximize state of the window
 */
VNWindow.prototype.toggleMaximize=function()
{
	this.setSelected(true);
	if(this.is_maximized)
		this.unMaximize();
	else
		this.maximize();
};

/** 
 * Maximizes the window.
 */
VNWindow.prototype.maximize=function()
{
	this.is_maximized=true;
	this._max_mem={p:this.getPosition(),s:this.getSize()};
	this.maximize_div.style.backgroundImage=this.current_style.icon.unmaximize;
	this.setPosition(this.visible_border_size-this.border_size,this.visible_border_size-this.border_size);
	this.setSize(this.manager.getWidth()+2*(this.border_size-this.visible_border_size),this.manager.getHeight()+2*(this.border_size-this.visible_border_size),true);
	this._maximize_p.callThen();
};

/** 
 * A callback function that is called when a window is maximized. It is initially empty.
 */
VNWindow.prototype.whenMaximized=function(){return this._maximize_p;};

/** 
 * Returns a boolean that indicates if this window can be maximized.
 * @return boolean 
 */
VNWindow.prototype.canMaximize=function(){return this.is_maximizable;};
/** 
 * Sets if this window can be maximized.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setCanMaximize=function(flag)
{
	this.is_maximizable=flag;
	if(this.is_maximizable)
		this.maximize_div.style.display='block';
	else
	{
		this.is_maximized=false;
		this.maximize_div.style.backgroundImage=this.current_style.icon.maximize;
		this.window_div.style.height=this.height+'px';
		this.maximize_div.style.display='none';
	}
};

/** 
 * Returns a boolean that indicates if this window is maximized.
 * @return boolean 
 */
VNWindow.prototype.isMaximized=function(){return this.is_maximized;};

/** 
 * Returns the window to normal size.
 */
VNWindow.prototype.unMaximize=function()
{
	this.is_maximized=false;
	this.maximize_div.style.backgroundImage=this.current_style.icon.maximize;
	this.setSize(this._max_mem.s[0],this._max_mem.s[1],true);
	this.setPosition(this._max_mem.p[0],this._max_mem.p[1]);
	
	this._unmaximize_p.callThen();
};

/** 
 * A callback function that is called when a window returns from maximized. It is initially empty.
 */
VNWindow.prototype.whenUnMaximized=function(){return this._unmaximize_p;};

/** 
 * Returns a boolean that indicates if this window has an icon.
 * @return boolean 
 */
VNWindow.prototype.hasIcon=function(){return this.has_icon;};
/** 
 * Sets if this window has icon.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setHasIcon=function(flag)
{
	this.has_icon=flag;
	if(this.has_icon)
		this.icon_div.style.display='block';
	else
		this.icon_div.style.display='none';
};
/** 
 * Sets the icon of this window.
 * @param url A string with the location of the image.
 */
VNWindow.prototype.setIcon=function(url)
{
	this.setHasIcon(true);
	this.icon_div.style.backgroundImage="url('"+url+"')";
	
};
/** 
 * A callback function that is called when the window icon is clicked. It is initially empty.
 */
VNWindow.prototype.whenIconClicked=function(){return this._icon_p;};

/** 
 * Hides the window.
 */
VNWindow.prototype.hide=function()
{
	this.window_div.style.display='none';
};

/** 
 * Shows the window.
 */
VNWindow.prototype.show=function()
{
	this.window_div.style.display='block';
};

/** 
 * Sets if this window has a scroll bar along x.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setScrollerX=function(flag)
{
	if(flag)
		this.content_div.style.overflowX='scroll';
	else
		this.content_div.style.overflowX='hidden';
};

/** 
 * Sets if this window has a scroll bar along y.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setScrollerY=function(flag)
{
	if(flag)
		this.content_div.style.overflowY='scroll';
	else
		this.content_div.style.overflowY='hidden';
};

VNWindow.prototype.cancelClosing=function()
{
	this._cancel_closing=true;
};

/** 
 * Closes this window.
 */
VNWindow.prototype.close=function()
{
	this._close_p.callThen();
	if(this._cancel_closing)
	{
		this._cancel_closing=false;
		return false;
	}
	else {this.destroy();return true;}	
};

/** 
 * A callback function that is called when a window is closed. It is initially empty.
 * @return boolean Your function should return true if you allow the window to close, or false otherwise.
 */
VNWindow.prototype.whenClosed=function(){return this._close_p;};

VNWindow.prototype.whenDestroyed=function(){return this._destroy_p;};

/** 
 * Destroys this window immediately bypassing the closing process. The onclose callback will not be called.
 */
VNWindow.prototype.destroy=function()
{
	this._destroy_p.callThen();
	
	if(this.manager.getSelectedWindow()==this)
		this.manager.setSelectedWindow(null);
	
	this.manager.deleteWindow(this);
	
	this.div_container.removeChild(this.window_div);
};

/** 
 * A callback function that is called when the window is selected. It is initially empty.
 */
VNWindow.prototype.whenFocused=function(){return this._focus_p;};

VNWindow.prototype.whenUnFocused=function(){return this._unfocus_p;};

/** 
 * Sets if this window is focused.
 * @param flag A boolean flag.
 */
VNWindow.prototype.setSelected=function(flag)
{
	if(this.is_selected==flag) return;
	
	if(flag) this._focus_p.callThen();
	else this._unfocus_p.callThen();
	
	this.is_selected=flag;
	if(this.is_selected)
	{
		/*this.title_div.style.background='-webkit-gradient(linear, left top, left bottom, color-stop(0.05, '+this.current_style.title.selectedColor+'), color-stop(1, '+this.current_style.title.selectedColor2+'))';
		this.title_div.style.background='-moz-linear-gradient(top, '+this.current_style.title.selectedColor+' 5%, '+this.current_style.title.selectedColor2+' 100%)';
		this.title_div.style.background='-webkit-linear-gradient(top, '+this.current_style.title.selectedColor+' 5%, '+this.current_style.title.selectedColor2+' 100%)';
		this.title_div.style.background='-o-linear-gradient(top, '+this.current_style.title.selectedColor+' 5%, '+this.current_style.title.selectedColor2+' 100%)';
		this.title_div.style.background='-ms-linear-gradient(top, '+this.current_style.title.selectedColor+' 5%, '+this.current_style.title.selctedColor2+' 100%)';*/
		this.title_div.style.background=this.current_style.title.backgroundFocused;
		this.title_div.style.border=this.current_style.title.borderWidth+'px '+this.current_style.title.borderStyleFocused;
		this.visible_border_left_div.style.background=this.current_style.border.backgroundLeftFocused;
		this.visible_border_right_div.style.background=this.current_style.border.backgroundRightFocused;
		this.visible_border_bottom_div.style.background=this.current_style.border.backgroundBottomFocused;
	
	}
	else
	{
		/*this.title_div.style.background='-webkit-gradient(linear, left top, left bottom, color-stop(0.05, '+this.current_style.title.backgroundColor+'), color-stop(1, '+this.current_style.title.backgroundColor2+'))';
		this.title_div.style.background='-moz-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)';
		this.title_div.style.background='-webkit-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)';
		this.title_div.style.background='-o-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)';
		this.title_div.style.background='-ms-linear-gradient(top, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)';*/
		this.title_div.style.background=this.current_style.title.background;//'linear-gradient(to bottom, '+this.current_style.title.backgroundColor+' 5%, '+this.current_style.title.backgroundColor2+' 100%)';
		this.title_div.style.border=this.current_style.title.borderWidth+'px '+this.current_style.title.borderStyle;
		this.visible_border_left_div.style.background=this.current_style.border.backgroundLeft;
		this.visible_border_right_div.style.background=this.current_style.border.backgroundRight;
		this.visible_border_bottom_div.style.background=this.current_style.border.backgroundBottom;
	
	}	
	if(this.is_selected && this.manager!=null)
		this.manager.setSelectedWindow(this);
};

/** 
 * Returns a boolean that indicates if the window is selected/focused.
 * @return boolean.
 */
VNWindow.prototype.isSelected=function(){return this.is_selected;};

/** 
 * Sets the title of the window.
 * @param title A string that contains the title.
 */
VNWindow.prototype.setTitle=function(title)
{
	this.title=title;
	this.title_text_div.innerHTML=this.title;
};

/** 
 * Returns the current title of the window.
 * @return string The title of the window.
 */
VNWindow.prototype.getTitle=function(){return this.title;};

/** 
 * Sets the position of this window.
 * @param x The x-coordinate of the upper left corner of the window.
 * @param y The y-coordinate of the upper left corner of the window.
 */
VNWindow.prototype.setPosition=function(x,y)
{
	this.left=x;
	if(this.left+this.width>parseInt(this.div_container.clientWidth))this.left=Math.max(parseInt(this.div_container.clientWidth)-this.width,0);
	
	this.top=y;
	if(this.top+this.height>parseInt(this.div_container.clientHeight))this.top=Math.max(parseInt(this.div_container.clientHeight)-this.height,0);
	
	
	this.window_div.style.left=this.left+'px';
	this.window_div.style.top=this.top+'px';
};

/** 
 * Returns the position of the window.
 * @return Array An Array of size 2 with the x and y coordinates of the window.
 */
VNWindow.prototype.getPosition=function(){return [this.left,this.top];};

/** 
 * Sets the size of this window.
 * @param w The width of the window in pixels.
 * @param h The height of the window in pixels.
 */
VNWindow.prototype.setSize=function(w,h,a)
{
	this.width=w;
	if(a){}
	else
	{
	if(this.width<Math.max((this.border_size+this.title_size)*2,200))this.width=Math.max((this.border_size+this.title_size)*2,200);
	if(this.width>parseInt(this.div_container.clientWidth))this.width=parseInt(this.div_container.clientWidth);
	}
	
	this.height=h;
	if(a){}
	else
	{
	if(this.height<this.border_size+this.title_size+this.border_size-this.visible_border_size)this.height=this.border_size+this.title_size+this.border_size-this.visible_border_size;
	if(this.height>parseInt(this.div_container.clientHeight))this.height=parseInt(this.div_container.clientHeight);
	}
	this.window_div.style.width=this.width+'px';
	this.window_div.style.height=this.height+'px';
	
	this.border_top_div.style.width=(this.width-4*this.border_size)+'px';
	this.border_top_right_div.style.left=(this.width-this.border_size*2)+'px';
	this.title_cover_div.style.width=(this.width-2*(this.border_size-this.visible_border_size+this.current_style.title.borderWidth))+'px';
	this.border_left_div.style.height=(this.height-this.border_size*2-this.title_size-(this.border_size-this.visible_border_size))+'px';
	this.visible_border_left_div.style.height=(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px';
	this.border_right_div.style.height=(this.height-this.border_size*2-this.title_size-(this.border_size-this.visible_border_size))+'px';
	this.border_right_div.style.left=(this.width-this.border_size)+'px';
	this.visible_border_right_div.style.height=(this.height-this.title_size-this.border_size-(this.border_size-this.visible_border_size))+'px';
	this.visible_border_right_div.style.left=(this.width-this.border_size)+'px';
	this.border_bottom_div.style.width=(this.width-4*this.border_size)+'px';
	this.border_bottom_div.style.top=(this.height-this.border_size)+'px';
	this.visible_border_bottom_div.style.width=(this.width-(this.border_size-this.visible_border_size)*2)+'px';
	this.visible_border_bottom_div.style.top=(this.height-this.border_size)+'px';
	this.border_bottom_left_div.style.top=(this.height-this.border_size*2)+'px';
	this.border_bottom_right_div.style.top=(this.height-this.border_size*2)+'px';
	this.border_bottom_right_div.style.left=(this.width-this.border_size*2)+'px';
	
	this._resize_p.callThen();
};

/** 
 * A callback function that is called when the window is resized. It is initially empty.
 */
VNWindow.prototype.whenResized=function(){return this._resize_p;};

/** 
 * Returns the size of the window.
 * @return Array An Array of size 2 with the width and height of the window in pixels.
 */
VNWindow.prototype.getSize=function(){return [this.width,this.height];};
/** 
 * Returns the width of the window in pixels.
 * @return int The width of the window in pixels.
 */
VNWindow.prototype.getWidth=function(){return this.width;};
/** 
 * Returns the height of the window in pixels.
 * @return int The height of the window in pixels.
 */
VNWindow.prototype.getHeight=function(){return this.height;};

/** 
 * Centers the window inside the area of the window manager.
 */
VNWindow.prototype.center=function()
{
	this.setPosition(Math.floor((this.manager.getWidth()-this.width)/2),Math.floor((this.manager.getHeight()-this.height)/2));
};

VNWindow.prototype.handleTitleMouseUp=function()
{
	//this.is_moving=false;
	if(this.touch_operated)
	{
		document.removeEventListener('touchmove',this.title_touchmove_event,false);
		document.removeEventListener('touchend',this.title_mouseup_event,false);
	}
	else
	{
		document.removeEventListener('mousemove',this.title_mousemove_event,false);
		document.removeEventListener('mouseup',this.title_mouseup_event,false);
	}
	this.title_cover_div.style.cursor='auto';
};

VNWindow.prototype.handleTitleMouseDown=function(x,y)
{
	//this.setSelected(true);
	if(!this.is_movable)return;
	this.title_cover_div.style.cursor='move';
	//this.is_moving=true;
	if(this.touch_operated)
	{
		document.addEventListener('touchmove',this.title_touchmove_event,false);
		document.addEventListener('touchend',this.title_mouseup_event,false);
	}
	else
	{
		document.addEventListener('mousemove',this.title_mousemove_event,false);
		document.addEventListener('mouseup',this.title_mouseup_event,false);
	}
	this.offset_x=x[0]-parseInt(this.window_div.style.left);
	this.offset_y=y[0]-parseInt(this.window_div.style.top);
};

VNWindow.prototype.handleTitleMouseMove=function(x,y)
{
	//if(this.is_moving)
	{
		this.left=x[0]-this.offset_x;
		this.top=y[0]-this.offset_y;
		this.window_div.style.left=this.left+'px';
		this.window_div.style.top=this.top+'px';		
	}
};

VNWindow.prototype.handleBorderMouseUp=function()
{
	//this.is_resizing=false;
	this.resizing_border_id=0;
	if(this.touch_operated)
	{
		document.removeEventListener('touchmove',this.border_touchmove_event,false);
		document.removeEventListener('touchend',this.border_mouseup_event,false);
	}
	else
	{
		document.removeEventListener('mousemove',this.border_mousemove_event,false);
		document.removeEventListener('mouseup',this.border_mouseup_event,false);
	}
};

VNWindow.prototype.handleBorderMouseDown=function(x,y)
{
	if(!this.is_resizableX && !this.is_resizableY) return;
	else if(!this.is_resizableX && (this.resizing_border_id==1 || this.resizing_border_id==2))return;
	else if(!this.is_resizableY && (this.resizing_border_id==3 || this.resizing_border_id==6))return;
	this.memory_x=x[0];
	this.memory_y=y[0];
	this.memory_width=this.width;
	this.memory_height=this.height;
	//this.is_resizing=true;
	this.offset_x=x[0]-parseInt(this.window_div.style.left);
	this.offset_y=y[0]-parseInt(this.window_div.style.top);
	if(this.touch_operated)
	{
		document.addEventListener('touchmove',this.border_touchmove_event,false);
		document.addEventListener('touchend',this.border_mouseup_event,false);
	}
	else
	{
		document.addEventListener('mousemove',this.border_mousemove_event,false);
		document.addEventListener('mouseup',this.border_mouseup_event,false);
	}
};

VNWindow.prototype.handleBorderMouseMove=function(x,y)
{
	//if(this.is_resizing)
	{
		if(this.resizing_border_id==1)
		{
			var w=this.width;
			this.setSize(this.memory_width-x[0]+this.memory_x,this.memory_height);
			if(w!=this.width) this.window_div.style.left=(x[0]-this.offset_x)+'px';
		}
		else if(this.resizing_border_id==2)
		{
			this.setSize(this.memory_width+x[0]-this.memory_x,this.memory_height);
		}
		else if(this.resizing_border_id==3)
		{
			this.setSize(this.memory_width,this.memory_height+y[0]-this.memory_y);
		}
		else if(this.resizing_border_id==4)
		{
			if(!this.is_resizableX) x[0]=this.memory_x;
			if(!this.is_resizableY) y[0]=this.memory_y;
			var w=this.width;
			this.setSize(this.memory_width-x[0]+this.memory_x,this.memory_height+y[0]-this.memory_y);
			if(w!=this.width) this.window_div.style.left=(x[0]-this.offset_x)+'px';
		}
		else if(this.resizing_border_id==5)
		{
			if(!this.is_resizableX) x[0]=this.memory_x;
			if(!this.is_resizableY) y[0]=this.memory_y;
			this.setSize(this.memory_width+x[0]-this.memory_x,this.memory_height+y[0]-this.memory_y);
		}
		else if(this.resizing_border_id==6)
		{
			var h=this.height;
			this.setSize(this.memory_width,this.memory_height-y[0]+this.memory_y);
			if(h!=this.height) this.window_div.style.top=(y[0]-this.offset_y)+'px';
		}
		else if(this.resizing_border_id==7)
		{
			if(!this.is_resizableX) x[0]=this.memory_x;
			if(!this.is_resizableY) y[0]=this.memory_y;
			var h=this.height;
			var w=this.width;
			this.setSize(this.memory_width-x[0]+this.memory_x,this.memory_height-y[0]+this.memory_y);
			if(h!=this.height) this.window_div.style.top=(y[0]-this.offset_y)+'px';
			if(w!=this.width) this.window_div.style.left=(x[0]-this.offset_x)+'px';
		}
		else if(this.resizing_border_id==8)
		{
			if(!this.is_resizableX) x[0]=this.memory_x;
			if(!this.is_resizableY) y[0]=this.memory_y;
			var h=this.height;
			this.setSize(this.memory_width+x[0]-this.memory_x,this.memory_height-y[0]+this.memory_y);
			if(h!=this.height) this.window_div.style.top=(y[0]-this.offset_y)+'px';
		}
	}
};

/**
This method sets this window on the top and blocks all other windows.
$param closeonclick A boolean parameter that if is true, when you click outside of this window will trigger window.close() method.
*/
VNWindow.prototype.block=function(closeonclick)
{
	this.manager.blockWindow(this,closeonclick);
};

/**
 * This class creates and handles a console window. You can print to the console using the println method.<br><br>
 * <b>Example:</b><br><font style="font-family:Courier">
 * var c=new VNConsoleWindow(div);<br>
 * c.println('Hello World!');<br></font>
 * @param div_container The div Element that will contain the console.
 * @param wind The VNWindow object that contains the console. (Optional argument)
 */
function VNConsoleWindow(wm,options)
{
	var opt=options||{};
	vn.default(opt,{title:'Console '+wm.version});
	VNWindow.call(this,wm,opt);
	
	this.commandPromise=new VNPromise();
	
	this.setScrollerY(true);
	
	this.div_c=this.getContentDiv();
	vn.set(this.div_c.style,{backgroundColor:'rgb(0,0,0)',cursor:'text'});
	
	this.text_container=document.createElement('div');
	this.text_container.style.fontFamily='"Courier New", Courier, monospace';
	this.text_container.style.fontSize='14px';
	this.text_container.style.color='rgb(255,255,255)';
	this.div_c.appendChild(this.text_container);
	

	this.text_input=document.createElement('input');
	this.text_input.style.height='18px';
	
	this.text_input.style.width='100%';
	this.text_input.style.padding='0px';
	this.text_input.style.border='0px';
	this.text_input.style.fontFamily='"Courier New", Courier, monospace';
	this.text_input.style.fontSize='14px';
	this.text_input.style.color='rgb(255,255,255)';
	this.text_input.style.backgroundColor='rgb(0,0,0)';
	this.text_input.style.outline='none';
	this.text_input.style.webkitAppearance='none';
	this.text_input.setAttribute( "autocomplete", "off" );
	this.text_input.setAttribute( "autocorrect", "off" );
	this.text_input.setAttribute( "autocapitalize", "off" );
	this.text_input.setAttribute( "spellcheck", "false" );
	this.text_input.value='> ';
	var self=this;
	this.text_input.onkeydown=function(e){return self.handlekeydown(e);};
	this.div_c.appendChild(this.text_input);
	
	this.div_c.onclick=function(e){if(e.target==self.div_c)self.text_input.focus();};
	
	this.console_lines=null;
	this.echo_in_console=false;
	this.last_command_typed=new Array();
	this.last_command_index=0;
	this.print_commands=true;
	this.init();
}

VNConsoleWindow.prototype.getCaretPosition=function() 
{

  // Initialize
  var iCaretPos = 0;

  // IE Support
  if (document.selection) {

    // To get cursor position, get empty selection range
    var oSel = document.selection.createRange();

    // Move selection start to 0 position
    oSel.moveStart('character', -this.text_input.value.length);

    // The caret position is selection length
    iCaretPos = oSel.text.length;
  }

  // Firefox support
  else if (this.text_input.selectionStart || this.text_input.selectionStart == '0')
    iCaretPos = this.text_input.selectionStart;

  // Return results
  return iCaretPos;
};

VNConsoleWindow.prototype.focus=function()
{
	/*if(this.getCaretPosition()<2)
	{
		if(this.text_input.createTextRange) {
			this.text_input.focus();
			var range = this.text_input.createTextRange();
            range.move('character', 2);
            range.select();
	    }
        else {
            if(this.text_input.selectionStart) {
                this.text_input.focus();
                this.text_input.setSelectionRange(2, 2);
	        }
            else
                this.text_input.focus();
        }
	}
	else*/ this.text_input.focus();
};

VNConsoleWindow.prototype.handlekeydown=function(e)
{
	if(this.getCaretPosition()<2)
		return false;
	
	if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
	if (keyCode == '13'){//enter
		if(this.print_commands)this.println(this.text_input.value);
		this.div_c.scrollTop = this.div_c.scrollHeight;
		this.last_command_typed.push(this.text_input.value.substring(2));
		this.last_command_index=0;
		this.commandPromise.setObject(this.last_command_typed[this.last_command_typed.length-1]);
		this.commandPromise.callThen();
		//if(!this.onCommandEntered(this.last_command_typed[this.last_command_typed.length-1]))
			//this.error('Unknown command: '+this.last_command_typed[this.last_command_typed.length-1]);
		this.text_input.value='> ';
		this.div_c.scrollTop = this.div_c.scrollHeight;
		return false;
	}
	else if(keyCode == '38'){//up
		if(this.last_command_typed.length==0) return false;
		this.last_command_index+=1;
		if(this.last_command_typed.length<this.last_command_index)this.last_command_index=this.last_command_typed.length;
		this.text_input.value='> '+this.last_command_typed[this.last_command_typed.length-this.last_command_index];
		return false;
	}
	else if(keyCode == '40'){//down
		if(this.last_command_typed.length==0) return false;
		this.last_command_index-=1;
		if(this.last_command_index<=0){this.last_command_index=0; this.text_input.value='> ';return false;}
		this.text_input.value='> '+this.last_command_typed[this.last_command_typed.length-this.last_command_index];
		return false;
	}
	else if(keyCode == '37'){//left
		if(this.getCaretPosition()<3)return false;
	}
	else if(keyCode == '8'){//back space
		if(this.getCaretPosition()<3)return false;
	}
	else if(keyCode == '8'){//back space
    	if(this.text_input.value.length==2)
			return false;
	}
};


/**
 * Enables or disables the command prompt. The default value is true.
 * @param flag A boolean that contains the desired status.
 */
VNConsoleWindow.prototype.setPromptEnabled=function(flag){if(flag){this.text_input.style.display='block';this.text_input.focus();}else this.text_input.style.display='none';};

/** 
 * This function returns a Promise that is activated when a new line is entered in the console.
 * @return VNPromise The promise that is returned.
 */
VNConsoleWindow.prototype.whenCommandEntered=function(){return this.commandPromise;};

/**
 * Enables or disables the printing of entered commands. The default value is true.
 * @param flag A boolean that contains the desired status.
 */
VNConsoleWindow.prototype.setPrintCommandsEntered=function(flag){this.print_commands=flag;};

/**
 * Enables/disables the echo of the println messages to the JavaScript console.
 * @param flag boolean 
 */
VNConsoleWindow.prototype.setEchoInConsole=function(flag){this.echo_in_console=flag;};

/**
 * Executes a command as if it was typed. This causes the whenCommandEntered promise to be called.
 * @param command A string with the command to be executed. 
 */
VNConsoleWindow.prototype.exec=function(command){this.commandPromise.setObject(command);this.commandPromise.callThen();};

/**
 * Prints the given text in the console and then brakes the line.
 * @param txt The text to be printed.
 */
VNConsoleWindow.prototype.println=function(txt)
{
	this.text_container.innerHTML+=txt+"<br>";
	this.div_c.scrollTop = this.div_c.scrollHeight;
	//this.div_container.scrollTop = this.div_container.scrollHeight;
};

/**
 * Prints the given error message in the console and then brakes the line.
 * @param txt The text to be printed as an error message.
 */
VNConsoleWindow.prototype.error=function(txt)
{
	this.text_container.innerHTML+='<span style="color:rgb(255,128,128);"> ERROR> '+txt+'</span><br>';
	this.div_c.scrollTop = this.div_c.scrollHeight;
};

/**
 * Clears the console window.
 */
VNConsoleWindow.prototype.clear=function()
{
	this.text_container.innerHTML="";
};

VNConsoleWindow.prototype.init=function()
{
	var self=this;
	window.addEventListener('error', function(e) { 
		  self.error(e.message+' '+e.filename.substring(e.filename.lastIndexOf('/')+1)+' '+e.lineno+' '+e.colno);
		  console.log(e);
		  return true;
		}, false);
	
	
	var d=''+new Date();
	var i=d.indexOf('GMT');
	if(i>-1) d=d.substring(0,i-1);
	this.println(d);
	this.println('---- Console started ----');
};
	
vn.extend(VNWindow,VNConsoleWindow);

function VNInputWindow(wm,options)
{
	var opt=options||{};
	vn.default(opt,{label:'Input:',value:'',height:150,placeholder:''});
	VNWindow.call(this,wm,opt);
	
	this.setCanResize(false);
	this.setCanMinimize(false);
	this.setCanMaximize(false);
	 this.block(true);
     this.center();
	 
	var div=this.getContentDiv();
	div.style.backgroundColor='rgba(0,0,0,0.4)';
	
	var d=document.createElement('div');
	d.style.top='10px';
	d.style.bottom='10px';
	d.style.left='10px';
	d.style.right='10px';
	d.style.position='absolute';
	div.appendChild(d);
	
	var l=document.createElement('div');
	l.style.float='left';
	l.style.width='100%';
	l.style.position='relative';
	l.style.color='rgb(255,255,255)';
	//l.style.textAlign='center';
	l.style.lineHeight='22px';
	l.style.verticalAlign='middle';	
	l.style.fontFamily='Arial';
	l.style.color='rgb(255,255,255)';
	l.style.textShadow='-1px -1px 0px #5b6178';
	//l.style.fontWeight='bold';
	l.style.fontSize='18px';
	l.style.textDecoration='none';
	l.style.touchAction='none';
	l.style.overflow='hidden';
	l.innerHTML=opt.label;
	d.appendChild(l);
	
	var text_input=document.createElement('input');
	text_input.style.float='left';
	text_input.style.height='22px';
	text_input.style.width='100%';
	text_input.style.padding='0px';
	text_input.style.border='0px'; 
	text_input.style.borderRadius='4px';
	text_input.style.fontFamily='Arial';
	text_input.style.fontSize='18px';
	text_input.style.color='rgb(0,0,0)';
	text_input.style.backgroundColor='rgb(255,255,255)';
	text_input.style.outline='none';
	text_input.style.webkitAppearance='none';
	text_input.setAttribute( "autocomplete", "off" );
	text_input.setAttribute( "autocorrect", "off" );
	text_input.setAttribute( "autocapitalize", "off" );
	text_input.setAttribute( "spellcheck", "false" );
	text_input.value=opt.value;
	text_input.placeholder=opt.placeholder;
	var self=this;
	text_input.onkeydown=function(e){
		if (!e) e = window.event;
		var keyCode = e.keyCode || e.which;
		if (keyCode == '13'){//enter
			self.close();
			return false;
		}
	};
	d.appendChild(text_input);
	
	 this.whenDestroyed().then(function(w){wm.unblock();});
	
	text_input.focus();
	
	this.text_input=text_input;
}

VNInputWindow.prototype.getValue=function()
{
	return this.text_input.value;
};

vn.extend(VNWindow,VNInputWindow);

function VNButton(manager,x,y,w,h)
{
	this.manager=manager;
	this.div_container=this.manager.div_container;
	
	this.width=w;
	this.height=h;
	
	this.left=x;
	this.top=y;
	this.label='';
		
	this.is_toggle_button=false;
	this.toggle_state=false;
	
	//shadow_div
	this.shadow_div=document.createElement('div');
	this.div_container.appendChild(this.shadow_div);
	this.shadow_div.style.position='absolute';
	this.shadow_div.style.width=(this.width+1)+'px';
	this.shadow_div.style.height=(this.height+1)+'px';
	this.shadow_div.style.left=(this.left+2)+'px';
	this.shadow_div.style.top=(this.top+2)+'px';
	var rad=Math.min(Math.floor(this.width/2),Math.floor(this.height/2));
	this.shadow_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.shadow_div.style.touchAction='none';
	this.shadow_div.style.overflow='hidden';
	this.shadow_div.style.backgroundColor='rgba(128,128,128,0.5)';
	this.shadow_div.style.zIndex=0;
	
	//button_div
	this.button_div=document.createElement('div');
	this.div_container.appendChild(this.button_div);
	this.button_div.style.position='absolute';
	this.button_div.style.width=this.width+'px';
	this.button_div.style.height=this.height+'px';
	this.button_div.style.left=this.left+'px';
	this.button_div.style.top=this.top+'px';
	this.button_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.button_div.style.touchAction='none';
	this.button_div.style.overflow='hidden';
	this.button_div.style.backgroundColor=this.manager.default_button_backgroundColor;
	this.shadow_div.style.zIndex=0;
	
		//text_div
	this.text_div=document.createElement('div');
	this.button_div.appendChild(this.text_div);
	this.text_div.style.position='absolute';
	this.text_div.style.width=this.width+'px';
	this.text_div.style.height=this.height+'px';
	this.text_div.style.left='0px';
	this.text_div.style.top='0px';
	this.text_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.text_div.style.touchAction='none';
	this.text_div.style.textAlign='center';
	this.text_div.style.lineHeight=this.height+'px';
	this.text_div.style.verticalAlign='middle';
	this.text_div.style.fontFamily=this.manager.default_button_fontFamily;
	this.text_div.style.color=this.manager.default_button_fontColor;
	this.text_div.style.fontWeight=this.manager.default_button_fontWeight;
	this.text_div.style.fontSize=Math.floor(this.height/2)+'px';
	
	//cover_div
	this.cover_div=document.createElement('div');
	this.button_div.appendChild(this.cover_div);
	this.cover_div.style.position='absolute';
	this.cover_div.style.width=this.width+'px';
	this.cover_div.style.height=this.height+'px';
	this.cover_div.style.left='0px';
	this.cover_div.style.top='0px';
	this.cover_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.cover_div.style.touchAction='none';
	
	this.touch_operated=false;
	var self=this;	
	
	this.cover_div.addEventListener('mousedown',function(event){if(this.touch_operated)return;event.preventDefault();self.click();},false);
	this.cover_div.addEventListener('touchstart',function(event){this.touch_operated=true;event.preventDefault();self.click();},false);
};

VNButton.prototype.isToggleButton=function(){return this.is_toggle_button;};

VNButton.prototype.setPosition=function(x,y)
{
	this.left=x;
	this.top=y;
	this.button_div.style.left=this.left+'px';
	this.button_div.style.top=this.top+'px';
	this.shadow_div.style.left=(this.left+2)+'px';
	this.shadow_div.style.top=(this.top+2)+'px';
};

VNButton.prototype.setImage=function(value)
{
	this.button_div.style.backgroundImage=value;
	this.button_div.style.backgroundSize='cover';
};

VNButton.prototype.square=function()
{
	this.shadow_div.style.borderRadius='0px 0px 0px 0px';
	this.button_div.style.borderRadius='0px 0px 0px 0px';
	this.text_div.style.borderRadius='0px 0px 0px 0px';
	this.cover_div.style.borderRadius='0px 0px 0px 0px';
};

VNButton.prototype.round=function()
{
	var rad=Math.min(Math.floor(this.width/2),Math.floor(this.height/2));
	this.shadow_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.button_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.text_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
	this.cover_div.style.borderRadius=rad+'px '+rad+'px '+rad+'px '+rad+'px';
};

VNButton.prototype.setIsToggleButton=function(flag)
{
	this.is_toggle_button=flag;
	this.toggle_state=false;
	this.cover_div.style.backgroundColor='';
};

VNButton.prototype.isPressed=function(){return this.toggle_state;};


VNButton.prototype.setToggleState=function(flag)
{
	if(this.is_toggle_button)
	{
		if(!flag)
		{
			this.toggle_state=false;
			this.cover_div.style.backgroundColor='';
		}
		else
		{
			this.toggle_state=true;
			this.cover_div.style.backgroundColor=this.manager.default_button_pressedColor;
		}
	}
}

VNButton.prototype.click=function()
{
	if(this.is_toggle_button)
	{
		if(this.toggle_state)
		{
			this.toggle_state=false;
			this.cover_div.style.backgroundColor='';
		}
		else
		{
			this.toggle_state=true;
			this.cover_div.style.backgroundColor=this.manager.default_button_pressedColor;
		}
	}
	else this.cover_div.style.backgroundColor=this.manager.default_button_pressedColor;
	this.onclick(this);
	var self=this;
	if(!this.is_toggle_button) setTimeout(function(){self.cover_div.style.backgroundColor='';}, 200);
};

VNButton.prototype.onclick=function(b){};

VNButton.prototype.setLabel=function(label)
{
	this.label=label;
	this.text_div.innerHTML=this.label;
};

/**
 * This class implements a web app. The web app is given as a path to a folder that contains main.js and icon.png, which will be loaded later only when necessary.<br><br>
 * <b>Example:</b><br><font style="font-family:Courier">
 * var wm=new WindowManager('my_div');<br>
 * var app=wm.installApp('http://www.visineat.com/js/apps/system_info/','System Info');<br>
 * app.start(function(app){new SystemInfoApp(app);});<br></font>
 * @param wm The WindowManager that will control this app.
 * @param path The path of the web app.
 * @param title An optional title of the web app.
 */
function VNApp(wm,path,title)
{
	this.wm=wm;
	this.title=title;
	this.path=path;
	this.src=this.path+'main.js';
	this.icon=this.path+'icon.png';
	if(typeof this.wm.apps !== 'undefined'){}
	else{this.wm.apps=new Object();}
}
/** 
 * This method sets the path of the folder that contains the web app.
 * @param url The path of the web app.
 */
VNApp.prototype.setPath=function(url){this.path=url;this.src=this.path+'main.js';this.icon=this.path+'icon.png';};
/** 
 * This method sets the icon of the web app.
 * @param url The path of the image.
 */
VNApp.prototype.setIcon=function(url){this.icon=url;};
/** 
 * This method sets the url of the main JavaScript of the web app.
 * @param url The path of the JavaScript file.
 */
VNApp.prototype.setSrc=function(url){this.src=url;};
/** 
 * This method returns the WindowManager object that controls this app.
 * @return WindowManager The WindowManager object.
 */
VNApp.prototype.getWindowManager=function(){return this.wm;};
/**
 * This method returns your main app object, which was previously set using the WindowManager.setMainApp().
 * @return Object The object of your main web app.
 */
VNApp.prototype.getMainApp=function(){return this.wm.getMainApp();};
/**
 * This method starts the web app. If this is the first time that the app runs, it first downloads the corresponding JavaScript file and then calls the given callback function.
 * @param onLoad The callback function that will be called in order to start your web app. 
 */
VNApp.prototype.start=function(onLoad)
{
  if(typeof this.wm.apps[this.src]!=='undefined')
  {
	onLoad(this);
	return;
  }
  
  var self=this;
  var s,
      r,
      t;
  r = false;
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.onload = s.onreadystatechange = function() {
    if ( !r && (!this.readyState || this.readyState == 'complete') )
    {
	  self.wm.apps[self.src]=new Object();
      r = true;
      onLoad(self);
    }
  };
  s.src = this.src;
  t = document.getElementsByTagName('script')[0];
  t.parentNode.insertBefore(s, t);
};

/**
 * This class creates a window with web app icons.<br><br>
 * <b>Example:</b><br><font style="font-family:Courier">
 * var wm=new WindowManager('my_div');<br>
 * var menu=wm.createIconMenuWindow('App Menu');<br>
 * menu.addIcon('demo_icon.png','Demo App',function(){start_demo();});<br>
 * menu.addApp('http://www.visineat.com/js/apps/system_info/','System Info',function(app){new SystemInfoApp(app);});<br></font>
 * @param window_manager The WindowManager object that controls this window.
 * @param title The title of the window to be created.
 */
function VNAppMenuWindow(window_manager,title)
{
	this.wm=window_manager;
	var appwin=window_manager.createWindow(0,0,window_manager.getWidth()-40,window_manager.getHeight()-40);
	window_manager.blockWindow(appwin,true);
	appwin.setTitle(title);
	appwin.setCanResize(false);
	appwin.setCanMove(false);
	appwin.setScrollerY(true);
	this.win=appwin;
	this.div_container=appwin.getContentDiv();
	this.div_container.style.backgroundColor='rgba(0,0,0,0.4)';
	
	var decoration_width=appwin.getWidth()-parseInt(this.div_container.clientWidth);
	var rem=(appwin.getWidth()-decoration_width)%120;
	appwin.setSize(appwin.getWidth()-rem,appwin.getHeight());
	appwin.center();
	this.win=appwin;
}
/**
 * Returns the window object of the VNAppMenuWindow.
 * @return VNWindow
 */
VNAppMenuWindow.prototype.getWindow=function(){return this.win;};
/** 
 * This method returns the WindowManager object that controls this app.
 * @return WindowManager The WindowManager object.
 */
VNAppMenuWindow.prototype.getWindowManager=function(){return this.wm;};
/** 
 * This adds a new icon to the VNAppMenuWindow using the given image and label.
 * @param icon_url The URL of the image
 * @param label The label of the icon.
 * @param onstart The callback function that will be called when the user clicks the icon.
 * @return VNAppMenuItem The object that was created.
 */
VNAppMenuWindow.prototype.addIcon=function(icon_url,label,onstart)
{
	var a=new VNAppMenuItem(this,icon_url,label);
	if(typeof onstart !== 'undefined') a.onStart=onstart;
	return a;
};
/** 
 * This adds a new web app to the VNAppMenuWindow using the given path and label.
 * @param path The path to the folder that contains the web app, including the main.js and icon.png 
 * @param label The title of the web app.
 * @param onstart The callback function that will be called when the user starts the web app.
 * @return VNApp The VNApp object that was created.
 */
VNAppMenuWindow.prototype.addApp=function(path,label,onstart)
{
	var a=this.getWindowManager().installApp(path,label);
	var b=new VNAppMenuItem(this,path+'icon.png',label);
	if(typeof onstart !== 'undefined') b.onStart=function(){a.start(onstart);};
	return a;
};

function VNAppMenuItem(app_menu,icon_url,label)
{
	this.app_menu=app_menu;
	var d=document.createElement('div');
	d.style.float='left';
	d.style.width='120px';
	d.style.height='120px';
	this.div_container=d;
	app_menu.div_container.appendChild(this.div_container);
	this.icon_url=icon_url;
	d=document.createElement('div');
	d.style.position='absolute';
	d.style.width='70px';
	d.style.height='70px';
	d.style.backgroundColor='rgba(0,0,0,0.1)';
	d.style.backgroundImage='url('+icon_url+')';
	d.style.backgroundSize='contain';
	d.style.backgroundRepeat='no-repeat';
	d.style.borderRadius='10px';
	d.style.margin='25px';
	d.style.cursor='pointer';
	this.div_container.appendChild(d);
	this.image_div=d;
	var self=this;
	this.image_div.addEventListener('click',function(event){event.stopPropagation();self.app_menu.win.close();self.onStart(self);},false);
	
	d=document.createElement('div');
	d.style.top='0px';
	d.style.left='0px';
	d.style.width='110px';
	d.style.touchAction='none';
	d.style.textAlign='center';
	d.style.lineHeight='12px';
	d.style.verticalAlign='middle';	
	d.style.fontFamily='Arial';
	d.style.color='rgb(255,255,255)';
	d.style.textShadow='-1px -1px 0px #5b6178';
	d.style.fontWeight='bold';
	d.style.fontSize='12px';
	d.style.textDecoration='none';
	d.style.margin='95px 5px 5px 5px';
	d.innerHTML=label;
	this.div_container.appendChild(d);
	this.label_div=d;
}

VNAppMenuItem.prototype.onStart=function(){};