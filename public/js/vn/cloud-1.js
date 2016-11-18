/* V1
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
function VNCloudObject()
{
	this._reset();
}

VNCloudObject.prototype._reset=function()
{
	this.status=0;
	this.ready_promise=new VNPromise(this);
	delete this.info;
};

VNCloudObject.prototype.whenReady=function(){return this.ready_promise;};

VNCloudObject.prototype.getId=function(){if(this.info)return this.info.VN_OID;};

VNCloudObject.prototype.applyDiff=function(diff){
	if(typeof this.info==='undefined')
		this.info={};
	vn.set(this.info,diff);
	for(v in diff)
		if(diff[v]==='') delete this.info[v];
};

/**
This method updates the fields of this object. The fields to be updated should be given in the data input object.
Example: setFields({name:'Angelos', lastname: 'Barmpoutis', score: '50'});
*/
VNCloudObject.prototype.setFields=function(data){
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
		var dat={VN_OID:self.getId()};
			var i=0;
			for(f in data)
			{
				dat['f'+i]=f;
				dat['v'+i]=data[f];
				i+=1;
			}
		vn.http(vn.hosturl+'file/setfield.php',{method:'post',data:dat}).then(function(request){

				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					self.applyDiff(r.VN_DATA.VN_DIFF);
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}
			}).catch(function(request){
				
				p.callCatch();
			});
	});return p;
};

VNCloudObject.prototype.getFields=function(){return this.info;};

VNCloudObject.prototype.rename=function(name){
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/rename.php',{method:'post',data:{VN_OID:self.getId(),VN_NAME:name}}).then(function(request){

				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					self.applyDiff(r.VN_DATA.VN_DIFF);
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}
			}).catch(function(request){
				
				p.callCatch();
			});
	});return p;
};


VNCloudObject.prototype.archive=function()
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/archive.php',{method:'post',data:{VN_OID:self.getId()}}).then(function(request){

				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					self._reset();
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}

			}).catch(function(request){
				
				p.callCatch();
			});
	});return p;
};

VNCloudObject.prototype.upload=function(file,progress)
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(function(){
		
		var buffer=null;
		var sz=0;
		var sent=0;
		var chunk_size=100000;
		var chunk_id=0;
		var t0=new Date().getTime();
		var filename='';
		if(typeof progress==='undefined')progress=new VNProgress();
		
	function upload_chunk()
	{
		if(sent>=buffer.byteLength)
		{
			vn.http(vn.hosturl+"/file/mergeparts.php",{method:'post',data:{VN_OID:self.getId()}}).
			then(function(request){
				var r=JSON.parse(request.responseText);
				if(r.success==false)
				{
					p.setObject(r);
					p.callCatch();
					return;
				}
				else 
				{
					progress.oneMoreDone();
					p.callThen();
				}
			}).catch(function(){p.callCatch();});
		}
		else
		{
			var chunk_file={filename:filename,data:new Uint8Array(buffer,sent,Math.min(chunk_size,buffer.byteLength-sent))};
			var files={};files['part'+chunk_id]=chunk_file;
			vn.http(vn.hosturl+"/file/uploadfilepart.php",{method:'post',data:{VN_OID:self.getId()},files:files}).
			then(function(request){
				progress.oneMoreDone();
				
				
				var r=JSON.parse(request.responseText);
				if(r.success==false)
				{
					p.setObject(r);
					p.callCatch();
					return;
				}
				chunk_id+=1;
				sent+=chunk_size;
				
				var t=Math.round((new Date().getTime()-t0)/1000);
				var rem=Math.floor(Math.max(0,t*(sz-sent)/sent));
				
				//if(rem>=60) c.println(Math.ceil(rem/60)+' min. remaining.');
				//else if(rem>5) c.println(rem+' sec. remaining.');
				//else c.println('Almost done.');
				
				upload_chunk();
			}).
			catch(function(request){
				p.callCatch();
			});
		}
	}//end of upload_chunk() 
		
	if(file instanceof File)
	{
		var reader = new FileReader();
		reader.onload = function(event) {
			buffer=event.target.result;
			sz=buffer.byteLength;
			if ('name' in file)filename=file.name;
			
			progress.oneMoreToDo(Math.ceil(sz/chunk_size)+1);
					
			
			upload_chunk();
		}
		reader.readAsArrayBuffer(file);
	}
	else
	{
		
	}
	
	});return p;
};

//function VNCloudList()
//{
//	VNCloudObject.call(this);
//}

VNCloudObject.prototype.update=function()
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/updatelist.php',{method:'post',data:{VN_LID:self.getId()}}).then(function(request){
			var r=JSON.parse(request.responseText);
			if(r.VN_SUCCESS)
			{
				if(typeof self.info.VN_LIST==='undefined') self.info.VN_LIST=[];
				self.applyDiff(r.VN_DATA.VN_DIFF);
				p.callThen();
			}
			else 
			{
				p.setObject(r);
				p.callCatch();
			}
		}).catch(function(request){		
			p.callCatch();
		});
	});return p;
};

VNCloudObject.prototype.add=function(obj)
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
	obj.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/addtolist.php',{method:'post',data:{VN_OID:obj.getId(),VN_LID:self.getId()}}).then(function(request){
				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					if(typeof self.info.VN_LIST==='undefined') self.info.VN_LIST=[];
					self.info.VN_LIST[obj.getId()]={VN_CLASS:obj.info.VN_CLASS||"",VN_NAME:obj.info.VN_NAME||""};
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}
			}).catch(function(request){		
				p.callCatch();
			});
	});});return p;
};

VNCloudObject.prototype.addById=function(obj_oid)
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/addtolist.php',{method:'post',data:{VN_OID:obj_oid,VN_LID:self.getId()}}).then(function(request){
				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					if(typeof self.info.VN_LIST==='undefined') self.info.VN_LIST=[];
					self.info.VN_LIST[obj_oid]={VN_CLASS:"",VN_NAME:""};
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}
			}).catch(function(request){		
				p.callCatch();
			});
	});return p;
};

VNCloudObject.prototype.remove=function(obj)
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
	obj.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/removefromlist.php',{method:'post',data:{VN_OID:obj.getId(),VN_LID:self.getId()}}).then(function(request){
				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					if(self.info.VN_LIST[obj.getId()])
						delete self.info.VN_LIST[obj.getId()];
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}
			}).catch(function(request){		
				p.callCatch();
			});
	});});return p;
};

VNCloudObject.prototype.removeById=function(obj_oid)
{
	var self=this;
	var p=new VNPromise(this);
	this.whenReady().then(
	function(){
		vn.http(vn.hosturl+'file/removefromlist.php',{method:'post',data:{VN_OID:obj_oid,VN_LID:self.getId()}}).then(function(request){
				var r=JSON.parse(request.responseText);
				if(r.VN_SUCCESS)
				{
					if(self.info.VN_LIST[obj_oid])
						delete self.info.VN_LIST[obj_oid];
					p.callThen();
				}
				else 
				{
					p.setObject(r);
					p.callCatch();
				}
			}).catch(function(request){		
				p.callCatch();
			});
	});return p;
};

//vn.extend(VNCloudObject,VNCloudList);
//VNCloudList.prototype.upload=undefined;

function VNCloudUser()
{
	VNCloudObject.call(this);
	var self=this;
	this.whenReady().then(function(){
		if(self.info && self.info.VN_LIST)
		{
			var l=self.info.VN_LIST;
			for(oid in l)
			{
				if(l[oid].VN_CLASS=='Root')
				{
					self._root_list_oid=oid;
				}
				else if(l[oid].VN_CLASS=='Trash')
				{
					self._trash_bin_oid=oid;
				}
			}
		}
	});
}

VNCloudUser.prototype.createRootList=function()
{
	if(this._root_list)return this._root_list;
	
var o=new VNCloudObject();
var self=this;
this.whenReady().then(
	function(){
	vn.http(vn.hosturl+'file/createroot.php').then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS===false)
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
		else 
		{
			o.applyDiff(r.VN_DATA.VN_DIFF);	
			self._root_list_oid=o.getId();
			self._root_list=o;
			self.applyDiff(r.VN_DATA.VN_DIFF2);
			o.whenReady().callThen();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
	});
	return o;
};

VNCloudUser.prototype.getRootList=function()
{
	if(this._root_list)return this._root_list;
	
var o=new VNCloudObject();
var self=this;
this.whenReady().then(
	function(){
		if(self._root_list_oid)
		{
	vn.http(vn.hosturl+'file/info.php',{method:'post',data:{VN_OID:self._root_list_oid}}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS===false)
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
		else 
		{
			self._root_list=o;
			o.info=r;
			o.whenReady().callThen();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
		}
		else 
		{
			o.whenReady().setObject({VN_SUCCESS:false,VN_DATA:{},VN_COMMENTS:"This user does not have a root list."});
			o.whenReady().callCatch();
		}
	
	});
	return o;
};


VNCloudUser.prototype.createTrashBin=function()
{
	if(this._trash_bin)return this._trash_bin;
	
var o=new VNCloudObject();
var self=this;
this.whenReady().then(
	function(){
	vn.http(vn.hosturl+'file/createbin.php').then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS===false)
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
		else 
		{
			o.applyDiff(r.VN_DATA.VN_DIFF);	
			self._trash_bin_oid=o.getId();
			self._trash_bin=o;
			self.applyDiff(r.VN_DATA.VN_DIFF2);
			o.whenReady().callThen();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
	});
	return o;
};

VNCloudUser.prototype.getTrashBin=function()
{
	if(this._trash_bin)return this._trash_bin;
	
var o=new VNCloudObject();
var self=this;
this.whenReady().then(
	function(){
		if(self._trash_bin_oid)
		{
	vn.http(vn.hosturl+'file/info.php',{method:'post',data:{VN_OID:self._trash_bin_oid}}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS===false)
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
		else 
		{
			self._trash_bin=o;
			o.info=r;
			o.whenReady().callThen();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
		}
		else 
		{
			o.whenReady().setObject({VN_SUCCESS:false,VN_DATA:{},VN_COMMENTS:"This user does not have a trash bin."});
			o.whenReady().callCatch();
		}
	
	});
	return o;
};

vn.extend(VNCloudObject,VNCloudUser);
VNCloudUser.prototype.upload=undefined;

function VNCloud(){
	this._login_p=new VNPromise();
	this._logout_p=new VNPromise();
	this._login_w=null;
}

VNCloud.prototype.newObject=function()
{
	var o=new VNCloudObject();
	vn.http(vn.hosturl+'file/new.php',{method:'post',data:{}}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS)
		{
			o.applyDiff(r.VN_DATA.VN_DIFF);		
			o.whenReady().callThen();
		}
		else 
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
	return o;
};

VNCloud.prototype.getObject=function(oid)
{
	var o=new VNCloudObject();
	vn.http(vn.hosturl+'file/info.php',{method:'post',data:{VN_OID:oid}}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS===false)
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
		else 
		{
			o.info=r;
			o.whenReady().callThen();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
	return o;
};

VNCloud.prototype.newList=function()
{
	var l=new VNCloudObject();
	vn.http(vn.hosturl+'file/newlist.php',{method:'post',data:{}}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS)
		{
			l.applyDiff(r.VN_DATA.VN_DIFF);	
			l.whenReady().callThen();
		}
		else 
		{
			l.whenReady().setObject(r);
			l.whenReady().callCatch();
		}
	}).catch(function(request){		
		l.whenReady().callCatch();
	});
	return l;
};

VNCloud.prototype.getMe=function()
{
	var o=new VNCloudUser();
	vn.http(vn.hosturl+'file/me.php',{method:'get'}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS)
		{
			o.info=r.VN_DATA['VN_INFO'];
			o.whenReady().callThen();
		}
		else 
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
	return o;
};

/*VNCloud.prototype.getList=function(oid)
{
	var o=new VNCloudObject();
	vn.http(vn.hosturl+'file/info.php',{method:'post',data:{VN_OID:oid}}).then(function(request){
		var r=JSON.parse(request.responseText);
		if(r.VN_SUCCESS===false)
		{
			o.whenReady().setObject(r);
			o.whenReady().callCatch();
		}
		else 
		{
			o.info=r;
			o.whenReady().callThen();
		}
	}).catch(function(request){		
		o.whenReady().callCatch();
	});
	return o;
};*/
/**
*@param directly An optional boolean parameter that forces the login window to be open, even if the user is already logged in. By default this parameter is false, which bypasses the window if the user is already logged in.
*/
VNCloud.prototype.login=function(wm,directly)
{
	if(this._login_w)
		return this._login_w;
	
	this._login_w=new VNPromise();
	var p=this._login_w;
	var self=this;
	p.then(function(){self._login_w=null;self._login_p.callThen();}).catch(function(){self._login_w=null;});
	function create_win(w,h,url)
	{
		if(typeof wm=='undefined')return;
		var w_=wm.createWindow(0,0,w,h);
		w_.block(false);
		w_.setCanClose(false);
		w_.setCanMinimize(false);
		w_.setCanMaximize(false);
		w_.setCanResize(false);
		w_.setTitle('Login');
		w_.setIcon(vn.hosturl+'js/img/VNlogo256.png');
		var i=document.createElement('iframe');
		i.style.width='100%';
		i.style.height='100%';
		i.style.border='0px';
		i.src=url;
		w_.iframe=i;
		var d=w_.getContentDiv();
		d.appendChild(i);
		
		var decoration_width=w_.getWidth()-parseInt(d.clientWidth);
		var decoration_height=w_.getHeight()-parseInt(d.clientHeight);
		w_.setSize(w+decoration_width,h+decoration_height);
		w_.center();
		function receiveMessage(evt)
		{
			if(evt.data=='ggl'||evt.data=='fb') {w_.close();window.removeEventListener("message",receiveMessage);p.callThen();}
		}
		
		window.addEventListener("message", receiveMessage, false);
		
	}
	if(directly)
	{
		create_win(330,120,vn.hosturl+'file/login.php');
	}
	else this.renew_authentication().then(function(){p.callThen();}).catch(function(){create_win(330,120,vn.hosturl+'file/login.php');});
	return p;
};

VNCloud.prototype.renew_authentication=function()
{
	var p_out=new VNPromise();
	var p=new VNPromise();
	var catch_count=0;
	p.then(function(){p_out.callThen();}).catch(function(){
	 catch_count+=1;if(catch_count==2)p_out.callCatch();});
	 function fb(){
  vn.import("https://connect.facebook.net/en_US/sdk.js").then(function() {
FB.init({
    appId      : '1776868085935475',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use graph api version 2.5
  });


  FB.getLoginStatus(function(response) {
	statusChangeCallback(response);
  });

  });
	 

 function statusChangeCallback(response) {
	if (response.status === 'connected') {
      
	  vn.http(vn.hosturl+"file/login.php",{method:"post",data:{fb_token:true}}).then(function(request){
		  var r=JSON.parse(request.responseText);
		  if(r.VN_SUCCESS)p.callThen();
		  else p.callCatch();
		  }).catch(function(response){console.log('error');p.callCatch();});
	  
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
	  p.callCatch();
     
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
	 p.callCatch();
    }
  }
	 }
	 
	 function ggl()
	{
		vn.import("https://apis.google.com/js/api.js").then(function(){
			gapi.load('client:auth2', function(){
        
	    if(gapi.auth2.getAuthInstance())
		{
			if(gapi.auth2.getAuthInstance().isSignedIn.get())
				onSignIn(gapi.auth2.getAuthInstance().currentUser.get());
			else p.callCatch();
		}
	    else gapi.auth2.init({
            client_id: '553026211426-ihogu6a3ncrlg2nrgaotdaegmm5u398q.apps.googleusercontent.com',
			scope:'profile email'
        }).then(function () {
	// Listen for sign-in state changes.
    //gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    if(gapi.auth2.getAuthInstance().isSignedIn.get())
		onSignIn(gapi.auth2.getAuthInstance().currentUser.get());
	else p.callCatch();
  
    //signinButton.addEventListener("click", handleSigninClick);
    //signoutButton.addEventListener("click", handleSignoutClick);
  });	
		  });
			
		});
		
		function onSignIn(googleUser) {
        var id_token = googleUser.getAuthResponse().id_token;
		vn.http(vn.hosturl+"file/login.php",{method:"post",data:{id_token:id_token}}).then(function(request){
			var r=JSON.parse(request.responseText);
		  if(r.VN_SUCCESS)p.callThen();
		  else p.callCatch();}).catch(function(response){console.log('error');p.callCatch();});
      };
	}

	
	var me=this.getMe();
	  me.whenReady().then(function(){p.callThen();}).catch(function(e){
		if(e.VN_COMMENTS=='Permission denied.')
		{
			fb();
			ggl();
		}
	});
	 
	 return p_out;
	 
};

VNCloud.prototype.logout=function()
{
	var p_out=new VNPromise();
	var p=new VNPromise();
	var then_count=0;
	var self=this;
	p.then(function(){then_count+=1;if(then_count==3){p_out.callThen();self._logout_p.callThen();}});
	 function fb(){
  vn.import("https://connect.facebook.net/en_US/sdk.js").then(function() {

  FB.init({
    appId      : '1776868085935475',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use graph api version 2.5
  });
  
   FB.getLoginStatus(function(response) {
	 if (response.status === 'connected') FB.logout();
  });
  
  p.callThen();
  
  });
	 }
	 
	 function ggl()
	{
		vn.import("https://apis.google.com/js/api.js").then(function(){
			gapi.load('client:auth2', function(){
        if(gapi.auth2.getAuthInstance())
		{
			gapi.auth2.getAuthInstance().signOut();
			p.callThen();
		}
	    else gapi.auth2.init({
            client_id: '553026211426-ihogu6a3ncrlg2nrgaotdaegmm5u398q.apps.googleusercontent.com',
			scope:'profile email'
        }).then(function () {
	
		gapi.auth2.getAuthInstance().signOut();
		p.callThen();
	
  });	
		  });
			
		});
	}

	vn.http(vn.hosturl+'file/logout.php').then(function(){p.callThen();}).catch(function(){p.callThen();});
	
	 fb();
	 ggl();
	 return p_out;
	 
};

VNCloud.prototype.whenLogin=function(){return this._login_p;};
VNCloud.prototype.whenLogout=function(){return this._logout_p;};

function TreeViewerButton()
{
	this._click_p=new VNPromise(this);
	this.icon_div=document.createElement('div');
	vn.set(this.icon_div.style,{margin:'1px',width:'36px',height:'36px',position:'relative',float:'left',background:'rgb(164,164,164)'});
	
	this.icon_img=document.createElement('div');
	vn.set(this.icon_img.style,{left:'0px',top:'0px',width:'100%',height:'100%',position:'relative',backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center'});
	this.icon_div.appendChild(this.icon_img)
	
	var self=this;
	this.icon_div.addEventListener('click',function(event){self._click_p.callThen();},false);
	this.icon_div.addEventListener('mouseover',function(event){self.icon_div.style.background='radial-gradient(rgb(255,255,0) 50%, rgb(128,128,128) 100%)';},false);
	this.icon_div.addEventListener('mouseout',function(event){self.icon_div.style.background='rgb(164,164,164)';},false);
}

TreeViewerButton.prototype.getDiv=function(){return this.icon_div;};

TreeViewerButton.prototype.setIcon=function(url)
{
	this.icon_img.style.backgroundImage='url("'+url+'")';
};

TreeViewerButton.prototype.whenClicked=function(){return this._click_p;};

function TreeViewer(wm,options)
{
	var opt=options||{};
	vn.default(opt,{title:'Tree Viewer',width:800,height:600});
	VNWindow.call(this,wm,opt);
	var div=this.getContentDiv();
	
	this._file_viewers={};
	
	vn.set(div.style,{display:'flex',flexDirection:'column'});
	
	this.tree_width=250;
	
	this.toolbar=document.createElement('div');
	vn.set(this.toolbar.style,{backgroundColor:'rgb(192,192,192)',height:'38px',position:'absolute',width:'100%',overflow:'hidden'});
	div.appendChild(this.toolbar);
	
	var main=document.createElement('div');
	vn.set(main.style,{width:'100%',top:'38px',bottom:'0px',position:'absolute'});
	div.appendChild(main);
	
	var main2=document.createElement('div');
	vn.set(main2.style,{width:'100%',height:'auto',position:'relative',overflow:'hidden',display:'flex',flexDirection:'row'});
	main.appendChild(main2);
	
	this.left_div=document.createElement('div');
	vn.set(this.left_div.style,{backgroundColor:'rgb(255,255,255)',height:'100%',position:'relative',float:'left',width:this.tree_width+'px',overflow:'hidden'});
	main2.appendChild(this.left_div);
	
	
	this.tree_div=document.createElement('div');
	vn.set(this.tree_div.style,{backgroundColor:'rgb(255,255,255)',top:'0px',bottom:'0px',position:'absolute',float:'left',width:'100%',overflowX:'hidden',overflowY:'scroll'});
	this.left_div.appendChild(this.tree_div);
	
	this.progress_div=document.createElement('div');
	vn.set(this.progress_div.style,{backgroundColor:'rgb(192,192,192)',height:'5px',bottom:'0px',position:'absolute',float:'left',width:'100%',overflow:'hidden',display:'none'});
	this.left_div.appendChild(this.progress_div);
	
	var self=this;
	this.progress=new VNProgress();
	this.progress_bar=new ProgressBar(this.progress_div,5,this.progress);
	this.progress.whenProgress().then(function(){self.progress_div.style.display='block';});
	this.progress.whenDone().then(function(){self.progress_div.style.display='none';});
	
	this.border_div=document.createElement('div');
	vn.set(this.border_div.style,{backgroundColor:'rgb(192,192,192)',height:'100%',position:'relative',float:'left',width:'5px',cursor:'ew-resize'});
	main2.appendChild(this.border_div);
	
	this.main_div=document.createElement('div');
	vn.set(this.main_div.style,{height:'100%',position:'relative',flex:'1 1 0%'});
	main2.appendChild(this.main_div);
	
	this.divider_mousemove_event=function(event){event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY; self.handleDividerMouseMove(x,y);};
	this.divider_touchmove_event=function(event){event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;}self.handleDividerMouseMove(x,y);};
	this.divider_mouseup_event=function(event){self.handleDividerMouseUp();};
	
	
	this.border_div.addEventListener('mousedown',function(event){if(self.touch_operated)return;event.preventDefault();var x=new Array();var y=new Array();x[0]=event.clientX; y[0]=event.clientY;self.handleDividerMouseDown(x,y);},false);
	this.border_div.addEventListener('touchstart',function(event){self.touch_operated=true;event.preventDefault();var x=new Array();var y=new Array();for(var i=0;i<event.targetTouches.length;i++){x[i]=event.targetTouches[i].clientX;y[i]=event.targetTouches[i].clientY;} /*self.handleBorderMouseMove(x,y);*/self.handleDividerMouseDown(x,y);},false);
	
	this.selected_object=null;
	this.root=new FolderObject(this.tree_div);
	this.root.whenSelected().then(function(o){
		self.selected_object=o;
	});
	
	this.whenResized().then(function(){
		var w=self.getContentDiv().clientWidth;
		if(self.tree_width>w-100)self.tree_width=w-100;
		if(self.tree_width<100)self.tree_width=100;
		self.left_div.style.width=self.tree_width+'px';
	});
}
TreeViewer.prototype.getFileViewers=function(){return this._file_viewers;};
TreeViewer.prototype.setFileViewer=function(classname,viewer){this._file_viewers[classname]=viewer};
TreeViewer.prototype.getSelected=function(){return this.selected_object;};
TreeViewer.prototype.getProgress=function(){return this.progress;};
TreeViewer.prototype.getMainDiv=function(){return this.main_div;};
TreeViewer.prototype.getRoot=function(){return this.root;};
TreeViewer.prototype.addButton=function(button)
{
	this.toolbar.appendChild(button.getDiv());
};

TreeViewer.prototype.handleDividerMouseDown=function(x,y)
{
	this.memory_x=x[0];
	this.memory_width=this.tree_width;
	this.offset_x=x[0];
	if(this.touch_operated)
	{
		document.addEventListener('touchmove',this.divider_touchmove_event,false);
		document.addEventListener('touchend',this.divider_mouseup_event,false);
	}
	else
	{
		document.addEventListener('mousemove',this.divider_mousemove_event,false);
		document.addEventListener('mouseup',this.divider_mouseup_event,false);
	}
};

TreeViewer.prototype.handleDividerMouseUp=function()
{
	if(this.touch_operated)
	{
		document.removeEventListener('touchmove',this.divider_touchmove_event,false);
		document.removeEventListener('touchend',this.divider_mouseup_event,false);
	}
	else
	{
		document.removeEventListener('mousemove',this.divider_mousemove_event,false);
		document.removeEventListener('mouseup',this.divider_mouseup_event,false);
	}
};

TreeViewer.prototype.handleDividerMouseMove=function(x,y)
{
	var w=this.getContentDiv().clientWidth;
	this.tree_width=this.memory_width+x[0]-this.offset_x;
	if(this.tree_width<100)this.tree_width=100;
	if(this.tree_width>w-100)this.tree_width=w-100;
	this.left_div.style.width=this.tree_width+'px';
};

vn.extend(VNWindow,TreeViewer);

function CloudFileViewer(wm,options)
{
	var opt=options||{};
	vn.default(opt,{title:'Cloud File Viewer'});
	TreeViewer.call(this,wm,opt);
	this.setIcon(vn.hosturl+'js/img/VNlogo256.png');
	
	var self=this;
	vn.import('vn.file-viewers').then(function()
	{
		self.setFileViewer('Root',UserFileViewer);
		self.setFileViewer('List',ListFileViewer);
	});
	
	this.getRoot().whenExpanded().then(function(folder)
	{
		self.populate(folder);
	});
	
	this.getRoot().whenSelected().then(function(object)
	{
		function update_content()
		{
			var div=self.getMainDiv();
			while (div.firstChild)div.removeChild(div.firstChild);
			div.appendChild(self.getDefaultViewer(object.cloudObject).getDiv());
		}
		
		if(object.isFolder())
		{
			update_content();
			return;//should be already loaded
		}
		if(object.cloudObject)
		{
			update_content();
			return;//already loaded
		}
		object.cloudObject=vn.cloud.getObject(object.oid);
		self.getProgress().oneMoreToDo();
		object.cloudObject.whenReady().then(function(){
			self.getProgress().oneMoreDone();
			update_content();
		}).catch(function(){
			self.getProgress().oneMoreDone();
		});
	});
	
	this.getRoot().whenMoved().then(function(event){
		if(!event.into.isPredecessor(self.getUserRoot())&&event.into!=self.getUserRoot()){event.object.cancelMove(); return;}
		if(!event.object.isPredecessor(self.getUserRoot())){event.object.cancelMove(); return;}
		if(event.object==event.into)return;
		if(event.object.getParent()==event.into)return;//do not change anything on the cloud
		//console.log('Move '+event.object.getId()+' into '+event.into.getId() );
		var s=event.object.getParent();
		self.getProgress().oneMoreToDo(2);
		s.cloudObject.removeById(event.object.oid).then(function(){//request from the server to remove the object from list "s"
			self.getProgress().oneMoreDone();
			if(event.object.cloudObject)//if object.cloudObject has been loaded. This should be always the case for folders.
				event.into.cloudObject.add(event.object.cloudObject).then(function(){//request from the server to add the object to the list "into"
					self.getProgress().oneMoreDone();
					
					
					
				}).catch(function(){
					self.getProgress().oneMoreDone();
					console.log('ERROR');
				});
			else event.into.cloudObject.addById(event.object.getId()).then(function(){
					self.getProgress().oneMoreDone();
				}).catch(function(){
					self.getProgress().oneMoreDone();
					console.log('ERROR');
				});
		}).catch(function(){
			self.getProgress().oneMoreDone();
			console.log('ERROR');
		});
	});
	
	this.getRoot().whenFileDropped().then(function(event){
		var s=event.into;
		if(s.isFolder()==false)s=s.getParent();
		if(s!=self.getUserRoot() && !s.isPredecessor(self.getUserRoot()))return;
		if(s.cloudObject){}else return;//there is no cloudObject? Normally, this "return" should never be called.
		
		function perform_upload(file)
		{	
		var o=vn.cloud.newObject();//We request from the server to create a new object
		self.getProgress().oneMoreToDo(3);
		o.whenReady().then(function(){//when the server creates the object
			self.getProgress().oneMoreDone();
			o.rename(file.name).then(function(){//we request from the server to rename the object
				self.getProgress().oneMoreDone();
				s.cloudObject.add(o).then(function(){//we request from the server to add this file into a particular folder
					self.getProgress().oneMoreDone();
					//we visualy present the result in the client (as divs)
					var f=new FileObject();
					f.cloudObject=o;
					f.setName(o.info.VN_NAME);
					f.oid=o.getId();
					o.clientObject=f;
					s.addLast(f);
					s.expand();
					f.select();

					//We send the binary data from the file to the server
					o.upload(file,self.getProgress()).then(function()
					{
						
					}).catch(function(){
						
					});
					
				}).catch(function(){
					self.getProgress().oneMoreDone();
				});
			}).catch(function(){
				self.getProgress().oneMoreDone(2);
			});
		}).catch(function(){
			self.getProgress().oneMoreDone(3);
			
			//if permission denied prompt login
			
		});	
		}
		
		for(var i=0;i<event.files.length;i++)
		{
			perform_upload(event.files[i]);
		}
	});
	
	var new_file_button=new TreeViewerButton();
	new_file_button.setIcon('/js/img/file-icon.png');
	new_file_button.whenClicked().then(function(){
		
		var s=self.getSelectedDestination();
		
		var w=self.getWindowManager().inputWindow({title:"New File",label:"File Name:",placeholder:"Untitled File",icon:'/js/img/file-icon.png'});
		w.whenClosed().then(function(){
		
		var o=vn.cloud.newObject();
		self.getProgress().oneMoreToDo(3);
		o.whenReady().then(function(){
			self.getProgress().oneMoreDone();
			
			var perform_add=function()
			{
			s.cloudObject.add(o).then(function(){
				self.getProgress().oneMoreDone();
				var f=new FileObject();
				f.cloudObject=o;
				f.setName(o.info.VN_NAME);
				f.oid=o.getId();
				o.clientObject=f;
				s.addLast(f);
				s.expand();
				f.select();
			}).catch(function(){
				self.getProgress().oneMoreDone();
			});
			};
			
			if(w.getValue().length>0)
			{
				o.rename(w.getValue()).then(function(){
					self.getProgress().oneMoreDone();
					perform_add();
				}).catch(function(){
					self.getProgress().oneMoreDone(2);
				});
			}
			else
			{
				self.getProgress().oneMoreDone();
				perform_add();
			}
		}).catch(function(){
			self.getProgress().oneMoreDone(3);
		});
		
		});
	});
	this.addButton(new_file_button);
	
	var new_folder_button=new TreeViewerButton();
	new_folder_button.setIcon('/js/img/folder-closed-icon.png');
	new_folder_button.whenClicked().then(function(){
		
		var s=self.getSelectedDestination();
		
		var w=self.getWindowManager().inputWindow({title:"New Folder",label:"Folder Name:",placeholder:"Untitled Folder",icon:'/js/img/folder-closed-icon.png'});
		w.whenClosed().then(function(){
		
		var o=vn.cloud.newList();
		self.getProgress().oneMoreToDo(3);
		o.whenReady().then(function(){
			self.getProgress().oneMoreDone();
			
			var perform_add=function()
			{
				s.cloudObject.add(o).then(function(){
					self.getProgress().oneMoreDone();
					var f=new FolderObject();
					f.cloudObject=o;
					f.setName(o.info.VN_NAME);
					f.oid=o.getId();
					o.clientObject=f;
					s.addLast(f);
					s.expand();
					f.select();
				}).catch(function(){
					self.getProgress().oneMoreDone();
				});
			};
			
			if(w.getValue().length>0)
			{
				o.rename(w.getValue()).then(function(){
					self.getProgress().oneMoreDone();
					perform_add();
				}).catch(function(){
					self.getProgress().oneMoreDone(2);
				});
			}
			else
			{
				self.getProgress().oneMoreDone();
				perform_add();
			}
		}).catch(function(){
			self.getProgress().oneMoreDone(3);
		});
		
		});
	});
	this.addButton(new_folder_button);
	
	var rename_button=new TreeViewerButton();
	rename_button.setIcon('/js/img/rename-icon.png');
	rename_button.whenClicked().then(function(){
		var s=self.getSelected();
		if(s==null)return;//none selected
		if(!s.isPredecessor(self.getUserRoot()))return;//you cannot rename anything but your files inside your root
		
		var win_title="File";
		var win_icon='/js/img/file-icon.png';
		if(s.isFolder()){win_title="Folder";win_icon='/js/img/folder-closed-icon.png';}
		var w=self.getWindowManager().inputWindow({title:"Rename "+win_title,label:win_title+" Name:",icon:win_icon,value:s.getName()});
		w.whenClosed().then(function(){
			var new_name=w.getValue();
			if(new_name.length==0)return;
			if(new_name==s.getName())return;//name did not change
			
			var o=s.cloudObject||vn.cloud.getObject(s.oid);
			self.getProgress().oneMoreToDo(2);
			o.rename(new_name).then(function(o){
				self.getProgress().oneMoreDone();
				s.setName(o.info.VN_NAME);
				s.getParent().cloudObject.update().then(function(l){
					self.getProgress().oneMoreDone();
				}).catch(function(){
					self.getProgress().oneMoreDone();
				});
			}).catch(function(){
				self.getProgress().oneMoreDone(2);
			});
		});
	});
	this.addButton(rename_button);
	
	var trash_button=new TreeViewerButton();
	trash_button.setIcon('/js/img/trash-full-icon.png');
	trash_button.whenClicked().then(function(){
		var s=self.getSelected();
		if(s==null)return;
		
		if(s.isPredecessor(self.getUserTrash()))
		{
			self.getProgress().oneMoreToDo();
			var p=s.getParent();
		p.cloudObject.removeById(s.oid).then(function(){
			self.getProgress().oneMoreDone();
			p.remove(s);
			}).catch(function(){
			self.getProgress().oneMoreDone();
		});
			return;
		}
		
		if(!s.isPredecessor(self.getUserRoot()))return;
			
		var p=s.getParent();
		self.getProgress().oneMoreToDo();
		p.cloudObject.removeById(s.oid).then(function(){
			self.getProgress().oneMoreDone();
			p.remove(s);

			var t=self.getUserTrash();
			if(typeof t.cloudObject==='undefined')
			{
				t.cloudObject=self.me.createTrashBin();
				t.cloudObject.whenReady().then(function(){self.glue(t,t.cloudObject);});
			}
			t.cloudObject.addById(s.oid).then(function(){
				t.add(s);
			});
			
		}).catch(function(){
			self.getProgress().oneMoreDone();
		});
	});
	this.addButton(trash_button);
	
	
	vn.cloud.whenLogin().then(function(){
		self.logged_in=true;
		self.init();
	});
	vn.cloud.whenLogout().then(function(){self.me=null;self.logged_in=false;self.getRoot().removeAll();});
	
	this.init();
}

CloudFileViewer.prototype.getDefaultViewer=function(cloud_object)
{
	if(cloud_object._viewer)return cloud_object._viewer;
	if(cloud_object.info)
	{
		var viewers=this.getFileViewers()
		if(viewers[cloud_object.info.VN_CLASS])
			cloud_object._viewer=new viewers[cloud_object.info.VN_CLASS](cloud_object);
		else cloud_object._viewer=new DefaultFileViewer(cloud_object);
	}
	return cloud_object._viewer;
};

CloudFileViewer.prototype.prepareFolders=function(me)
{
	this.getRoot().removeAll();
	var ur=new FolderObject();
	var icon=vn.hosturl+'file/'+me.getId()+'/picture.jpg';
	ur.setIcons({open:icon,closed:icon});
	ur.setName(me.info.name);
	ur.expand();
	this.user_root=ur;
	this.getRoot().add(ur);
	
	var trash=new FolderObject();
	trash.setIcons({open:vn.hosturl+'js/img/trash-full-icon.png',closed:vn.hosturl+'js/img/trash-full-icon.png',open_empty:vn.hosturl+'js/img/trash-empty-icon.png',closed_empty:vn.hosturl+'js/img/trash-empty-icon.png'});
	trash.setName('Recycle Bin');
	this.user_trash=trash;
	this.getRoot().add(trash);
	
};
CloudFileViewer.prototype.getSelectedDestination=function()
{
	var s=this.getSelected();
	if(s==null)
	{
		s=this.getUserRoot();
		if(typeof s.cloudObject==='undefined')
		{
			s.cloudObject=this.me.createRootList();
			var self=this;
			s.cloudObject.whenReady().then(function(){self.glue(s,s.cloudObject);});
		}
	}
	if(s.isFolder()==false)s=s.getParent();
	if(s!=this.getUserRoot() && !s.isPredecessor(this.getUserRoot()))
	{
		s=this.getUserRoot();	
	}
	return s;
};

CloudFileViewer.prototype.getUserRoot=function(){return this.user_root;};
CloudFileViewer.prototype.getUserTrash=function(){return this.user_trash;};
CloudFileViewer.prototype.glue=function(client_object,cloud_object)
{
	cloud_object.clientObject=client_object;
	client_object.cloudObject=cloud_object;
	client_object.oid=cloud_object.getId();
};

CloudFileViewer.prototype.init=function()
{
	var self=this;
	var me=vn.cloud.getMe();
	this.logged_in=false;
	me.whenReady().then(function(){self.logged_in=true;
		self.me=me;
	}).catch(function(e){
		self.logged_in=false;
		self.me=null;
		self.promptLogin();
	//if(e.VN_COMMENTS=='Permission denied.')	
	});
	
	var l=me.getRootList();
	l.whenReady().then(function(){
		self.prepareFolders(me);
		var hd=self.getUserRoot();
		self.glue(hd,l);
		if(l.info.VN_LIST)
			for(VN_OID in l.info.VN_LIST)
			{
				if(l.info.VN_LIST[VN_OID].VN_CLASS=='List')
				{
					var f=new FolderObject();
					f.setName(l.info.VN_LIST[VN_OID].VN_NAME);
					f.oid=VN_OID;
					hd.add(f);
				}
				else 
				{
					var f=new FileObject();
					f.setName(l.info.VN_LIST[VN_OID].VN_NAME);
					f.oid=VN_OID;
					hd.add(f);
				}
			}
			self.populate(hd);
			createBin();
		}).catch(function()//This user does not have a root list
		{
			self.prepareFolders(me);
			createBin();
		});
		
		function createBin(){
		var b=me.getTrashBin();
	b.whenReady().then(function(){
		var hd=self.getUserTrash();
		self.glue(hd,b);
		if(b.info.VN_LIST)
			for(VN_OID in b.info.VN_LIST)
			{
				if(b.info.VN_LIST[VN_OID].VN_CLASS=='List')
				{
					var f=new FolderObject();
					f.setName(b.info.VN_LIST[VN_OID].VN_NAME);
					f.oid=VN_OID;
					hd.add(f);
				}
				else 
				{
					var f=new FileObject();
					f.setName(b.info.VN_LIST[VN_OID].VN_NAME);
					f.oid=VN_OID;
					hd.add(f);
				}
			}
			self.populate(hd);
		}).catch(function()//This user does not have a root list
		{
		});
		}
};

CloudFileViewer.prototype.populate=function(folder)
{
	if(!folder.isFolder())return;//This is not a folder
	if(typeof folder.cloudObject==='undefined')return;//This folder has not been loaded yet from the cloud
	
	var self=this;
	var c=folder.getContents();
	for(var i=0;i<c.length;i++)
	{
		if(c[i].isFolder() && typeof c[i].cloudObject==='undefined')
		{
			this.getProgress().oneMoreToDo();
			c[i].cloudObject=vn.cloud.getObject(c[i].oid);
			c[i].cloudObject.clientObject=c[i];
			c[i].cloudObject.whenReady().then(function(o){
				self.getProgress().oneMoreDone();
				o.clientObject.removeAll();
				if(o.info.VN_LIST)
					for(VN_OID in o.info.VN_LIST)
					{
						if(o.info.VN_LIST[VN_OID].VN_CLASS=='List')
						{
							var f=new FolderObject();
							f.setName(o.info.VN_LIST[VN_OID].VN_NAME);
							f.oid=VN_OID;
							o.clientObject.add(f);
						}
						else 
						{
							var f=new FileObject();
							f.setName(o.info.VN_LIST[VN_OID].VN_NAME);
							f.oid=VN_OID;
							o.clientObject.add(f);
						}
					}
			}).catch(function(o){
				self.getProgress().oneMoreDone();
				
			});
		}
	}
			
};

CloudFileViewer.prototype.promptLogin=function()
{
	this.logged_in=false;
	var self=this;
	vn.cloud.login(this.getWindowManager()).then(function(){self.init();});
};
vn.extend(TreeViewer,CloudFileViewer);