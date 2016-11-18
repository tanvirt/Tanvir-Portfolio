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
 
/**
 * This class is used to process the incoming stream of text from the text editor, and should should be used with VNTextEditor, VNLineEditor, and VNTokenEditor.
 **/
function VNTextEditorTokenizer()
{
  this._key_p=new VNPromise(this);
  this._key_p.allowRecursion(true);
  this._token_p=new VNPromise(this);
  this._line_p=new VNPromise(this);
  this._token2_p=new VNPromise(this);
  this._line2_p=new VNPromise(this);
  this._cancel=false;
}

/**
 * This method cancels a key stroke when used inside the whenKeyDown() callback. 
 **/
VNTextEditorTokenizer.prototype.cancel=function(){this._cancel=true;};

/**
* Returns a promise when the user presses down a key. The promise calls are provided with an input object with the fields: newChar, textBefore, editor, line, token, input, and event.
* @return VNPromise A promise object that is triggered every time the user presses a key. 
 **/
VNTextEditorTokenizer.prototype.whenKeyDown=function(){return this._key_p;};

/**
* Returns a promise when a token is no longer being edited. The promise calls are provided with the VNTokenEditor object of interest.
* @return VNPromise A promise object that is triggered when a token is no longer being edited.
**/
VNTextEditorTokenizer.prototype.whenTokenEditEnds=function(){return this._token_p;};


/**
* Returns a promise when a line is no longer being edited. The promise calls are provided with the VNLineEditor object of interest.
* @return VNPromise A promise object that is triggered when a line is no longer being edited.
**/
VNTextEditorTokenizer.prototype.whenLineEditEnds=function(){return this._line_p;};

/**
* Returns a promise when a token starts to be in edit mode. The promise calls are provided with the VNTokenEditor object of interest.
* @return VNPromise A promise object that is triggered when a token starts to be in edit mode. 
*/
VNTextEditorTokenizer.prototype.whenTokenEditStarts=function(){return this._token2_p;};

/**
 * Returns a promise when a line starts to be in edit mode. The promise calls are provided with the VNLineEditor object of interest.
 * @return VNPromise A promise object that is triggered when a line starts to be in edit mode. 
 **/
VNTextEditorTokenizer.prototype.whenLineEditStarts=function(){return this._line2_p;};

/**
 * This class creates and controls a text editor.  
 * The text editor will take in user input, and allow the user to view and modify the text.  
 * Upon the creation of an instance, it will initialize the first line of the text editor and apply preset styles to its div container. 
 **/
function VNTextEditor()
{
  this.default_height=20;
  //CREATE THE TEXT AREA
  this.text_input=document.createElement('input');
  vn.set(this.text_input.style,{position:'inline',verticalAlign:'middle',height:this.default_height+'px',lineHeight:this.default_height+'px',padding:'0px',border:'0px',fontFamily:'"Courier New", Courier, monospace',fontSize:'14px',width:'150px',outline:'none',boxSizing:'content-box',background:'rgb(240,240,255)',webkitAppearance:'none'});
  this.text_input.setAttribute( "autocomplete", "off" );
  this.text_input.setAttribute( "autocorrect", "off" );
  this.text_input.setAttribute( "autocapitalize", "off" );
  this.text_input.setAttribute( "spellcheck", "false" );
  var self=this;
  this.text_input.addEventListener('keydown',function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if(self.control_keys[keyCode])
      self.text_input.style.width=(9*(self.text_input.value.length+1))+'px';
    else self.text_input.style.width=(9*(self.text_input.value.length+2))+'px';
  },false);
  
  
  this.tokenizer=new VNTextEditorTokenizer();

  this.tokenizer.whenKeyDown().then(function(e){
    //console.log(e.newChar);
    if (e.newChar == "Enter"){//enter
      e.token.breakLine();
    }
    else if(e.newChar ==32 || e.newChar == "Tab"){//space
      var part2="";
      if(e.input.selectionStart<e.input.value.length)
      {
        part2=e.input.value.substring(e.input.selectionStart,e.input.value.length);
        if(e.input.selectionStart>0)
          e.input.value=e.input.value.substring(0,e.input.selectionStart);
        else {e.input.value='';}
      }
      var t=e.line.insertTokenAt(e.token.order+1);
      if(part2.length>0)
      {
        t.setText(part2);
        t.switchToEditView();
        e.input.selectionStart=0;
        e.input.selectionEnd=0;
      }
      else t.switchToEditView();
      self.tokenizer.cancel();
    }
    else if(e.newChar == "ArrowUp")//up
    {
      e.line.editPreviousLine();
    }
    else if(e.newChar == "ArrowDown")//down
    {
      e.line.editNextLine();
    }
    else if(e.newChar == "PageUp")//page up
    {
      e.line.editPrevious20Line();
    }
    else if(e.newChar == "PageDown")//page down
    {
      e.line.editNext20Line();
    }
    else if(e.newChar == "ArrowRight") //right
    {
      if(e.input.selectionStart==e.input.value.length)
      {
        e.token.editNextToken();
        self.tokenizer.cancel();
      }
    }
    else if(e.newChar=="ArrowLeft")//left
    {
      if(e.input.selectionStart==0)
      {
        e.token.editPreviousToken();
        self.tokenizer.cancel();
      }
    }
  });
  
  this.div_container=null;
  this.editing_line=null;
  this.lines=new Array();
  this.init();
  this.control_keys={'8':"Backspace",'9':"Tab",'10':"Enter",'13':"Enter",'33':"PageUp",'34':"PageDown",'37':"ArrowLeft",'38':"ArrowUp",'39':"ArrowRight",'40':"ArrowDown"};
}

/**
 * Returns the input HTML element of the text editor. 
 * This element is placed inside the current token being edited. 
 * @return Element The input HTML element of the text editor.  
 **/
VNTextEditor.prototype.getInput=function()
{
  return this.text_input;
};


VNTextEditor.prototype.onchange=function(e)
{

};

VNTextEditor.prototype.onkeydown=function(e)
{
  var keyCode = e.newChar;
  var t=this.tokenizer;
  t._cancel=false;
  var p=t.whenKeyDown();
  p.setObject(e);
  
    if (keyCode == "Enter"){//enter
      /*if(this.text_input.value.length==0)//allow blank lines
      {
        this.editor.createLineAt(this.getOrder()+1);
      return false;
      } 
      else*/
      {
        p.callThen();
      if(t._cancel)return false;
      }
    
    }
  else if (keyCode == "Tab"){//tab
    e.event.preventDefault();
      p.callThen();
    if(t._cancel)return false;
    }
    else if(keyCode == "Backspace"){//back space
      if(e.input.selectionStart==0)
      {
      if(e.token.order==1)//first token in a line
      {
        e.line.removeBreak();
      }
      else
      {
        var t=e.token.getPreviousToken();
        var txt=e.token.getText();
        e.line.removeTokenAt(e.token.order);
        t.switchToEditView();
        var txt1=t.getText();
        t.setText(txt1+txt);
        e.input.selectionStart=txt1.length;
        e.input.selectionEnd=txt1.length;
      }
      
            return false;
      }
    else
    {
      p.callThen();
      if(t._cancel)return false;
    }
    }
  else if(keyCode == "ArrowRight") //right
  {
    p.callThen();
    if(t._cancel)return false;
  }
  else if(keyCode=="ArrowLeft")//left
  {
    p.callThen();
    if(t._cancel)return false;
  }
    else if(keyCode == "ArrowUp"){//up
      if(e.line.order>1)
      {
        if(e.input.value.length==0)//allow to move up without typing a new token
          {
          e.line.editPreviousLine();
          } 
      else
      {
        p.callThen();
      }
      return false;
      }
    }
    else if(keyCode == "ArrowDown"){//down
      if(e.line.order<e.editor.lines.length)
      {
        if(e.input.value.length==0)//allow to move down without typing a new token
          {
          e.line.editNextLine();
          } 
      else
      {
        p.callThen();
      }
      return false;
      }
    }
    else if(keyCode == "PageUp"){//page up
      if(e.line.order>1)
      {
        if(e.input.value.length==0)//allow to move up without typing a new token
          {
          e.line.editPrevious20Line();
          } 
        else
      {
        p.callThen();
      }
      return false;
      }
    }
    else if(keyCode == "PageDown"){//page down
      if(e.line.order<e.editor.lines.length)
      {
        if(e.input.value.length==0)//allow to move down without typing a new token
          {
          e.line.editNext20Line();
          } 
        else
      {
        p.callThen();
      }
      return false;
      }
    }
    else
    {
    p.callThen();
    if(t._cancel)return false;
    }
};

/**
 * This method simulates the pressing of a sequence of keys, and adds the respective characters to the text editor.
 * @param text A string with the text to be typed. 
 **/
VNTextEditor.prototype.type=function(text)
{
  for(var i=0;i<text.length;i++)
  {
    this.typeChar(text.charCodeAt(i));
  }
};

/**
 * This method simulates the pressing of a key, and adds the respective character to the text editor.
 * @param charCode An integer that represents a character in Unicode. 
 **/
VNTextEditor.prototype.typeChar=function(charCode)
{
  var mem=this.getTokenizer()._cancel;
  
  if(this.editing_line==null)
    this.lines[this.lines.length-1].switchToEditView();
  var inp=this.getInput();
  inp.selectionStart=inp.value.length;
  inp.selectionEnd=inp.value.length;
  var v=this.onkeydown({event:null, newChar:charCode, textBefore:inp.value, editor:this, line:this.editing_line, token:this.editing_line.editing_token,input:inp});
  if(v===false){}else 
  {
    this.editing_line.editing_token.setText(inp.value+String.fromCharCode(charCode));
  }
  this.getTokenizer()._cancel=mem;
};

/**
 * Sets the tokenizer. 
 * @param t A VNTextEditorTokenizer object that keeps track of the incoming stream of text.
 **/
VNTextEditor.prototype.setTokenizer=function(t){this.tokenizer=t;};

/**
 * Returns the text editor's tokenizer.
 * @return VNTextEditorTokenizer A VNTextEditorTokenizer object that keeps track of the incoming stream of text.
 **/
VNTextEditor.prototype.getTokenizer=function(){return this.tokenizer;};

VNTextEditor.prototype.init=function()
{
  this.div_container=document.createElement('div');
  this.div_container.style.position='absolute';
  this.div_container.style.left='0px';
  this.div_container.style.top='0px';
  this.div_container.style.width='100%';
  this.div_container.style.bottom='0px';
  this.div_container.style.backgroundColor='rgb(255,255,255)';
  this.div_container.style.overflowX='hidden';
  this.div_container.style.overflowY='scroll';
  this.div_container.style.cursor='text';
  
  this.line_nums=document.createElement('div');
  vn.set(this.line_nums.style,{position:'absolute',top:'0px',left:'0px',width:'50px',height:'100%',background:'rgb(220,220,220)'});
  this.div_container.appendChild(this.line_nums);
  
  this.line_container=document.createElement('div');
  vn.set(this.line_container.style,{position:'relative',width:'100%',height:'auto',backgroundColor:'rgb(255,255,255)'});
  this.div_container.appendChild(this.line_container);
  this.lines[0]=new VNLineEditor(this);
  this.lines[0].switchToEditView();
  
  var self=this;
  this.div_container.onclick=function(e){if(e.target==self.div_container)self.onOutsideClick(e);};
};

/**
 * Creates a new line in the text editor, in respect to the given order. The order of the first line is 1.
 * @param order An integer specifying the position of the new line. 
 * @return VNLineEditor The VNLineEditor object that was added. 
 **/
VNTextEditor.prototype.createLineAt=function(order)
{
  //WE WANT TO CREATE A NEW LINE AFTER EXISTING LINE s.
  //FIND s:
  var s=this.lines[order-2];
  
  //MOVE THE ELEMENTS IN THE ARRAY
  for(var i=this.lines.length-1;i>order-2;i--)
  {
    this.lines[i].setOrder(i+2);
    this.lines[i+1]=this.lines[i];
  }
  
  var ns=new VNLineEditor(this);
  ns.setOrder(order);
  this.lines[order-1]=ns;
  
  this.line_container.insertBefore(ns.div_container,s.div_container.nextSibling);
  return ns;
};

/**
 * Removes the line at the given order.
 * @param order An integer specifying the position of a line to be removed. 
 **/
VNTextEditor.prototype.removeLineAt=function(order)
{
  //you are not allowed to remove the first line of the text
  if(order<=1 || order>this.lines.length) return;
  
  //FIND s:
  var s=this.lines[order-1];
  
  //MOVE THE ELEMENTS IN THE ARRAY
  for(var i=order-1;i<this.lines.length-1;i++)
  {
    this.lines[i+1].setOrder(i+1);
    this.lines[i]=this.lines[i+1];
  }
  this.lines.pop();
  
  this.line_container.removeChild(s.div_container);
  
  var ns=this.lines[order-2];
  ns.switchToEditView();
};

/**
* Returns the last line in the text editor. 
* @return VNLineEditor The VNLineEditor object that represents the last line in the text editor. 
**/
VNTextEditor.prototype.getLastLine=function()
{
  return this.lines[this.lines.length-1];
};

/**
 * Returns the div that contains the text editor.  
 * @return Element The div element that contains the text editor.  
**/
VNTextEditor.prototype.getDiv=function(){return this.div_container;};

/**
* Returns the line that is currently in edit mode. 
* @return VNLineEditor The VNLineEditor object that is in edit mode. 
**/
VNTextEditor.prototype.getEditingLine=function()
{return this.editing_line;};

/**
 * Returns the width of the text editor. 
 * @return number An integer value of the text editor's width, in pixels. 
 **/ 
VNTextEditor.prototype.getWidth=function()
{
  return this.div_container.clientWidth;
};

/**
 * Returns the height of the text editor.
 * @return number An integer value of the text editor's height ,in pixels.  
 **/
VNTextEditor.prototype.getHeight=function()
{
  return this.div_container.clientHeight;
};

VNTextEditor.prototype.onOutsideClick=function(e)
{
  this.getLastLine().switchToEditView();
};

/**
 * This class represents a line in the text editor, and should be used with the VNTextEditor class.
 @param text_editor A VNTextEditor object.
 **/
function VNLineEditor(text_editor)
{
  this.text_editor=text_editor;
  this.div_container=null;
  this.left_ident=null;
  this.token_container=null;
  this.edit_mode=false;
  this.default_height=20;
  this.order=1;
  this.tokens=new Array();
  this.editing_token=null;
  this.init();
}

/**
 * This method creates a new line after the current line. 
 * It will then update the new line to be in edit mode. 
 * If there was text after the cursor position of the text input HTML element, the text following the break will be moved to the next line. 
 * @param position An integer specifying the position of where the break was inserted. 
 **/
VNLineEditor.prototype.breakAt=function(position)
{
  var txt=this.text_editor;
  var pos=position;
  var t=null;
  var part2="";
  if(position<=this.tokens.length)t=this.tokens[position-1];
  if(t && t.isInEditMode())
  {
    var input=txt.getInput();
    if(t.getText().length==0)pos=pos-1;
    else if(input.selectionStart<input.value.length)
    {
      part2=input.value.substring(input.selectionStart,input.value.length);
      if(input.selectionStart>0)
        input.value=input.value.substring(0,input.selectionStart);
      else {input.value='';pos=pos-1;}
    }
    t.switchToRigidView();
  }
  var l=txt.createLineAt(this.order+1);
  var nt=l.appendToken();
  if(part2.length>0)
  {
    nt.setText(part2);
  }
  for(var i=pos;i<this.tokens.length;i++)
  {
    l.appendToken().setText(this.tokens[i].text);
  }
  for(var i=this.tokens.length-1;i>=pos;i--)
  {
    this.removeTokenAt(i+1);
  }
  nt.switchToEditView();
  input.selectionStart=0;
  input.selectionEnd=0;
};

/**
 * This method will remove a break between this line and the previous one, and reposition the remaining lines appropriately. 
 **/
VNLineEditor.prototype.removeBreak=function()
{
  var t=this.tokens[0];
    
  if(this.tokens.length==1)
  {
    var txt=t.getText();
    var l=this.getPreviousLine();
    if(l)
    {
      this.text_editor.removeLineAt(this.getOrder());
      l.editing_token.setText(txt);
      var inp=this.text_editor.getInput();
      inp.selectionStart=0;
      inp.selectionEnd=0;
    }
  }
  else
  {
    if(this.order>1)//not the first line of text
    {
      var l=this.getPreviousLine();
      var txt=this.tokens[0].getText();
      this.editing_token=null;
      l.switchToEditView();
      this.text_editor.removeLineAt(this.getOrder());
      l.editing_token.setText(txt);
      var inp=this.text_editor.getInput();
      inp.selectionStart=0;
      inp.selectionEnd=0;
      
      for(var i=1;i<this.tokens.length;i++)
      {
        l.appendToken().setText(this.tokens[i].getText());
      }
    }
  }
};

/**
 * Removes this line from the text editor.
 */
VNLineEditor.prototype.remove=function()
{
  this.text_editor.removeLineAt(this.order);
};

/**
 * Returns boolean specifying whether or not this line is in edit mode.
 * @return Boolean The edit mode status.
 **/
VNLineEditor.prototype.isInEditMode=function()
{
  return this.edit_mode;
};

/**
 * Returns the token that is in edit mode, from this line.
 * @return VNTokenEditor A VNTokenEditor object that is currently in edit mode. 
 **/
VNLineEditor.prototype.getEditingToken=function()
{return this.editing_token;};

/**
 * Returns the width of the current line.
 * @return number An integer value of the line width, in pixels. 
 **/
VNLineEditor.prototype.getWidth=function()
{ 
  return this.div_container.clientWidth;
};

/**
 * Returns the height of the current line.
 * @return number An integer value of the line height, in pixels. 
 **/
VNLineEditor.prototype.getHeight=function()
{
  return this.div_container.clientHeight;
};

VNLineEditor.prototype.init=function()
{
  this.div_container=document.createElement('div');
  vn.set(this.div_container.style,{width:'100%',height:'auto',cursor:'text',display:'flex',flexDirection:'row',position:'relative',background:'rgb(240,240,240)'});
  this.text_editor.line_container.appendChild(this.div_container);

  this.left_ident=document.createElement('div');
  vn.set(this.left_ident.style,{position:'relative',left:'0px',width:'50px',height:this.default_height+'px',fontFamily:'"Courier New", Courier, monospace',fontSize:'14px',verticalAlign:'middle',lineHeight:this.default_height+'px',
  backgroundColor:'rgb(0,0,255)',color:'rgb(255,255,255)'});
  this.left_ident.innerHTML=this.order+'.';
  this.div_container.appendChild(this.left_ident);
  
  
  this.test=document.createElement('div');
  vn.set(this.test.style,{position:'relative',background:'rgb(240,240,255)',flex:1});
  this.div_container.appendChild(this.test);
  
  //CREATE THE TOKEN AREA
  this.token_container=document.createElement('div');
  vn.set(this.token_container.style,{position:'inline',height:'auto',minHeight:this.default_height+'px',cursor:'text'});
  this.test.appendChild(this.token_container);
  var self=this;
  this.token_container.onclick=function(e){if(e.target==self.token_container)self.onrigidclick(e);};
};

/**
 * Sets a style to the line, if the line is not in edit mode, and overwrites the line's current text with the text given. This does not change the actual text of the tokens, which will appear when the line goes to edit mode.
 * @param style An object with style properties to be set to the div element of this line. 
 * @param text A string that will replace the line's current text.
 * <br><br><b>Example:</b><br><font style="font-family:Courier">
  line.setStyle({color:'#000000',fontStyle:'italic',paddingLeft:'5px',paddingRight:'5px'},"This is line #"+line.getOrder());
  <br></font>
 **/
VNLineEditor.prototype.setStyle=function(style,text)
{
  if(this.edit_mode)return;
  var div=document.createElement('div');
  vn.set(div.style,{position:'inline',height:'auto',minHeight:this.default_height+'px',cursor:'text'});
  vn.set(div.style,style);
  div.innerHTML=text;
  this.test.removeChild(this.test.firstChild);
  this.test.appendChild(div);
  var self=this;
  div.onclick=function(e){if(e.target==div)self.onrigidclick(e);};
};

VNLineEditor.prototype.setOrder=function(order)
{
  this.order=order;
  this.left_ident.innerHTML=this.order+'.';
};

/**
 * Returns the order of the this line, relative all other lines in the text editor. The ordering starts with 1 for the first line of the text.
 * @return int An integer value specifying the line's current position. 

 **/
VNLineEditor.prototype.getOrder=function()
{
  return this.order;
};

/**
 * Returns the text editor that the line belongs to. 
 * @return VNTextEditor The VNTextEditor object that contains the current line.  
 **/
VNLineEditor.prototype.getTextEditor=function(){return this.text_editor;};

/**
 * This method switches the line from rigid view to edit view.
 **/
VNLineEditor.prototype.switchToEditView=function()
{
  if(this.edit_mode)return;
  if(this.getTextEditor().editing_line)
    this.getTextEditor().editing_line.switchToRigidView();
  this.getTextEditor().editing_line=this;
  this.edit_mode=true;
  this.test.removeChild(this.test.firstChild);
  this.test.appendChild(this.token_container);
  
  vn.set(this.left_ident.style,{backgroundColor:'rgb(0,0,255)',color:'rgb(255,255,255)'});
  vn.set(this.test.style,{background:'rgb(240,240,255)'});
  
  
  var self=this;
  this.token_container.onclick=function(e){
    if(e.target==self.token_container)
    {
      self.appendToken().switchToEditView();
    }
    self.getTextEditor().getInput().focus();
    };

  var p=this.getTextEditor().tokenizer.whenLineEditStarts();
  p.setObject(this);
  p.callThen();
  
  this.appendToken().switchToEditView();
};

/**
 * This method switches the line from edit view to rigid view.
 **/
VNLineEditor.prototype.switchToRigidView=function()
{
  if(!this.edit_mode)return;
  if(this.getTextEditor().editing_line!=this)console.log('ERROR!!!! THIS SHOULD NEVER HAPPEN!');
  this.getTextEditor().editing_line=null;
  this.edit_mode=false;
  
  vn.set(this.left_ident.style,{backgroundColor:'',color:'rgb(0,0,0)'});
  vn.set(this.test.style,{background:'rgb(255,255,255)'});
  
  var self=this;
  this.token_container.onclick=function(e){if(e.target==self.token_container)self.onrigidclick(e);};

  if(this.editing_token)
    this.editing_token.switchToRigidView();
  
  var p=this.getTextEditor().tokenizer.whenLineEditEnds();
  p.setObject(this);
  p.callThen();
};

/**
 * Returns the position of the line, relative to the entire application screen.
 * @return Array An Array of size 2 with the x-position as the first element, and y-position as the second element. 
 **/
VNLineEditor.prototype.getPosition=function() 
{
  var el=this.div_container;
  for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
   return [lx,ly-this.text_editor.div_container.scrollTop];
};

/**
 * Returns the next line, relative to the current line. 
 * @return VNLineEditor The VNLineEditor object that represents the next line.  
**/
VNLineEditor.prototype.getNextLine=function()
{
  if(this.text_editor.lines.length>this.order)
    return this.text_editor.lines[this.order];
  else return null;
};

/**
 * Returns the previous line, relative to the current line.  
 * @return VNLineEditor The VNLineEditor object that represents the previous line. 
 **/
VNLineEditor.prototype.getPreviousLine=function()
{
  if(this.order>1)
    return this.text_editor.lines[this.order-2];
  else return null;
};

/**
 * Adds a token to the end of the current line.  
 * @return VNTokenEditor The VNTokenEditor object that was added. 
 **/
VNLineEditor.prototype.appendToken=function()
{
  return this.insertTokenAt(this.tokens.length+1);
};

/**
 * Removes a token from the line.
 * @param order An integer specifying the token's position in the line, where it will be removed. The ordering starts from 1 for the first token in the line.
 * @return VNTokenEditor The VNTokenEditor object that was removed. 
 **/
VNLineEditor.prototype.removeTokenAt=function(order)
{
  if(order<1 || order>this.tokens.length)return;
  var t=this.tokens[order-1];
  if(this.editing_token==t){this.editing_token=null;}
  this.tokens.splice(order-1,1);
  this.token_container.removeChild(t.getDiv());
  
  for(var i=order-1;i<this.tokens.length;i++)
    this.tokens[i].setOrder(i+1);
  return t;
};

/**
 * Inserts a token into the line, and returns the token that was inserted. 
 * @param order An integer specifying what position in the line the token will be inserted. The ordering starts from 1 for the first token in the line.
 * @return VNTokenEditor The VNTokenEditor object that was inserted.  
 **/
VNLineEditor.prototype.insertTokenAt=function(order)
{
  var t=new VNTokenEditor(this);
  this.tokens.splice(order-1,0,t);  
  t.getDiv()
  if(this.tokens.length>order)
    this.token_container.insertBefore(t.getDiv(),this.tokens[order].getDiv());
  else this.token_container.appendChild(t.getDiv());
  
  t.setOrder(order);
  for(var i=order;i<this.tokens.length;i++)
    this.tokens[i].setOrder(i+1);
  return t;
};

/**
 * This method removes the last token in this line.
 * @return VNTokenEditor The VNTokenEditor object that was removed.
 **/
VNLineEditor.prototype.removeLastToken=function()
{
  return this.removeTokenAt(this.tokens.length);
};

/**
 * This method will switch the next line to edit view, and switch the current line to rigid view. 
 **/
VNLineEditor.prototype.editNextLine=function()
{
  if(this.order>=this.text_editor.lines.length) return;
  var s=this.text_editor.lines[this.order];
  s.switchToEditView();
};

/**
 * This method will switch the previous line to edit view, and switch the current line to rigid view. 
 **/
VNLineEditor.prototype.editPreviousLine=function()
{
  if(this.order==1) return;
  var s=this.text_editor.lines[this.order-2];
  s.switchToEditView();
};

/**
 * This method will switch the next 20th line to edit view, and switch the current line to rigid view. 
 **/
VNLineEditor.prototype.editNext20Line=function()
{
  if(this.order>=this.text_editor.lines.length) return;
  var n=this.order+19;
  if(n>=this.text_editor.lines.length) n=this.text_editor.lines.length-1;
  var s=this.text_editor.lines[n];
  s.switchToEditView();
};

/**
 * This method will switch the previous 20th line to edit view, and switch the current line to rigid view. 
 **/
VNLineEditor.prototype.editPrevious20Line=function()
{
  if(this.order==1) return;
  var n=this.order-2-19;
  if(n<0)n=0;
  var s=this.text_editor.lines[n];
  s.switchToEditView();
};

VNLineEditor.prototype.onrigidclick=function(e)
{
  this.switchToEditView();
};

/**
 * This method applies the text editor's tokenizer to the line by triggering the promises whenLineEditStarts and whenLineEditEnds of the tokenizer.
 **/
VNLineEditor.prototype.applyTokenizer=function()
{
  this.test.removeChild(this.test.firstChild);
  this.test.appendChild(this.token_container);
  var t=this.getTextEditor().tokenizer;
  var p=t.whenLineEditStarts();
  p.setObject(this);
  p.callThen();
  p=t.whenLineEditEnds();
  p.setObject(this);
  p.callThen();
};

/**
 * This class creates and modifies a token.  
 * The user is able to modify the token when it is in edit mode.  
 * Note that when a token is not in edit mode, it is in rigid mode. 
 * This method should be used in conjunction with the VNLineEditor and VNTextEditor class. 
 * @param line_editor The line that the token exists in.  
 **/
function VNTokenEditor(line)
{
  this.line=line;
  this.div_container=null;
  this.text_input=null;
  this.space=null;
  this.default_height=20;
  this.text='';
  this.edit_mode=false;
  this.order=1;
  this.init();
}

/**
 * Inserts a new line after the current token. If there was text after the cursor position of the text input HTML element, the text following the break will be moved to the next line. 
 **/
VNTokenEditor.prototype.breakLine=function()
{
  this.line.breakAt(this.order);
};

/**
 * Inserts a token after this token. 
 * @return VNTokenEditor The VNTokenEditor object that was inserted.
 **/
VNTokenEditor.prototype.insertTokenAfter=function()
{
  return this.line.insertTokenAt(this.order+1);
};

/**
 * Inserts the token before this token. 
 * @return VNTokenEditor A VNTokenEditor object that was inserted. 
 **/
VNTokenEditor.prototype.insertTokenBefore=function()
{
  return this.line.insertTokenAt(this.order);
};

/**
 * Returns a boolean to specify if the token is in edit mode. 
 * @return boolean 
 **/
VNTokenEditor.prototype.isInEditMode=function()
{
  return this.edit_mode;
};

/**
 * Returns the text from the current token.
 * @return string The string containing the text from the token.
 **/
VNTokenEditor.prototype.getText=function()
{
  if(this.edit_mode)return this.getTextEditor().getInput().value;
  else return this.text;
};

/**
 * Removes this token from the line it belongs to.
 **/
VNTokenEditor.prototype.remove=function()
{
  this.line.removeTokenAt(this.order);
};

/**
 * Returns true if this token is the last token in a line.
 * @return Boolean A boolean value indicating the result. 
 **/
VNTokenEditor.prototype.isLastTokenInLine=function()
{
  if(this.order==this.line.tokens.length)return true;
  else return false;
};

/**
 * Returns the text editor that the token belongs to. 
 * @return VNTextEditor The VNTextEditor object that the token belongs to. 
 **/
VNTokenEditor.prototype.getTextEditor=function(){return this.line.text_editor;};

VNTokenEditor.prototype.setOrder=function(order)
{
  this.order=order;
};

/**
 * Returns previous token, relative to this token. It returns null if there is no previous token.
 * @return VNTokenEditor The previous VNTokenEditor object, relative to this token.
 **/
VNTokenEditor.prototype.getPreviousToken=function()
{
  if(this.order>1)return this.line.tokens[this.order-2];
  else 
  {
    var t=null;
    var l=this.line.getPreviousLine();
    for(;l!=null&&t==null;)
    {
      if(l.tokens.length>0)return l.tokens[l.tokens.length-1];
      else l=l.getPreviousLine();
    }
    return t;
  }
};

/**
 * Returns next token, relative to this token. It returns null if there is no next token.
 * @return VNTokenEditor The next VNTokenEditor object, relative to this token.
 **/
VNTokenEditor.prototype.getNextToken=function()
{
  if(this.order<this.line.tokens.length)return this.line.tokens[this.order];
  else 
  {
    var t=null;
    var l=this.line.getNextLine();
    for(;l!=null&&t==null;)
    {
      if(l.tokens.length>0)return l.tokens[0];
      else l=l.getNextLine();
    }
    return t;
  }
};

/**
 * Sets the previous token to be in edit mode.
 **/
VNTokenEditor.prototype.editPreviousToken=function()
{
  var t=this.getPreviousToken();
  if(t){
    if(t.line.order==this.line.order)
      t.switchToEditView();
    else this.line.editPreviousLine();
  }
  else this.line.editPreviousLine();
};

/**
 * Sets the next token to be in edit mode. 
 **/
VNTokenEditor.prototype.editNextToken=function()
{
  var t=this.getNextToken();
  if(t){
    if(t.line.order==this.line.order)
      t.switchToEditView();
    else this.line.editNextLine();
  }
  else this.line.editNextLine();
};

/**
 * Sets the current token to be in edit mode.  
 **/
VNTokenEditor.prototype.switchToEditView=function()
{
  if(this.edit_mode)return;
  
  if(!this.line.edit_mode)
    this.line.switchToEditView();
  
  if(this.line.editing_token)
    this.line.editing_token.switchToRigidView();

  this.line.editing_token=this;
  this.edit_mode=true;
  this.div_container.removeChild(this.text_input);
  
  //we recreate the div element in order to reset the style that may have been edited by the tokenizer
  this.text_input=document.createElement('div');
  this.text_input.style.display='inline-block';
  this.text_input.style.verticalAlign='middle';
  this.text_input.style.lineHeight=this.default_height+'px';
  this.text_input.style.fontFamily='"Courier New", Courier, monospace';
  this.text_input.style.fontSize='14px';
  
  var ed=this.getTextEditor()
  var txt=ed.getInput();
  txt.onchange=function(e){
      ed.onchange(e);
    };
  var self=this;
  txt.onkeydown=function(e){//only for control keys
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if(ed.control_keys[keyCode])
		return ed.onkeydown({event:e, newChar:ed.control_keys[keyCode], textBefore:txt.value, editor:ed, line:self.line, token:self,input:txt});
    };
  txt.onkeypress=function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if(e.key && e.key.length==1)
	{
		keyCode=e.key.charCodeAt(0);
		return ed.onkeydown({event:e, newChar:keyCode, textBefore:txt.value, editor:ed, line:self.line, token:self,input:txt});
	}
    };
  //txt.onpaste=txt.onchange;
  txt.oninput=txt.onchange;
  this.setText(this.text);
  this.div_container.insertBefore(txt,this.space);
  txt.focus();
  
  var p=this.getTextEditor().tokenizer.whenTokenEditStarts();
  p.setObject(this);
  p.callThen();
  //console.log('Previous: '+(this.getPreviousToken()?this.getPreviousToken().text:'none')+' Next: '+(this.getNextToken()?this.getNextToken().text:'none'));
};

/**
 * This method applies the text editor's tokenizer to the token by triggering the promises whenTokenEditStarts and whenTokenEditEnds of the tokenizer.
 **/
VNTokenEditor.prototype.applyTokenizer=function()
{
  if(this.edit_mode)return;
  this.div_container.removeChild(this.text_input);
  this.text_input=document.createElement('div');
  this.text_input.style.display='inline-block';
  this.text_input.style.verticalAlign='middle';
  this.text_input.style.lineHeight=this.default_height+'px';
  this.text_input.style.fontFamily='"Courier New", Courier, monospace';
  this.text_input.style.fontSize='14px';
  this.setText(this.text);
  this.div_container.insertBefore(this.text_input,this.space);
  var t=this.getTextEditor().tokenizer;
  var p=t.whenTokenEditStarts();
  p.setObject(this);
  p.callThen();
  p=t.whenTokenEditEnds();
  p.setObject(this);
  p.callThen();
};

/**
 * Sets the token to rigid view. 
 **/
VNTokenEditor.prototype.switchToRigidView=function()
{
  if(!this.edit_mode)return;
  if(this.line.editing_token!=this)console.log('ERROR!!!! THIS SHOULD NEVER HAPPEN!');
  this.line.editing_token=null;
  this.edit_mode=false;
  
  var txt=this.getTextEditor().getInput();
  this.div_container.removeChild(txt);
  
  if(txt.value.length==0)
  {
    this.line.removeTokenAt(this.order);
    return;
  }
  
  this.setText(txt.value);
  this.div_container.insertBefore(this.text_input,this.space);
  
  var p=this.getTextEditor().tokenizer.whenTokenEditEnds();
  p.setObject(this);
  p.callThen();
};

/**
 * Returns the width of the token's div. 
 * @return number The width of the token's div, in pixels. 
 **/
VNTokenEditor.prototype.getWidth=function()
{
  return this.div_container.clientWidth;
};

/**
 * Returns the height of the token's div. 
 * @return number The height of the token's div, in pixels. 
 **/
VNTokenEditor.prototype.getHeight=function()
{
  return this.div_container.clientHeight;
};

/**
 * Sets a style to the token,  and optionally overwrites the token's current text with the text given. This does not change the actual text of the token, which will appear when the token goes to edit mode.
 * @param style An object with the style properties to be set to the div element of this token. 
 * @param text An optional string with the text to be shown on this token. 
**/
VNTokenEditor.prototype.setStyle=function(style,text)
{
  vn.set(this.text_input.style,style);
  if(typeof text!=='undefined')this.text_input.innerHTML=text;
};

VNTokenEditor.prototype.init=function()
{
  this.div_container=document.createElement('div');
  this.div_container.style.display='inline-block';
  this.div_container.style.minHeight=this.default_height+'px';
  this.div_container.style.cursor='auto';
  //this.line.token_container.insertBefore(this.div_container,this.line.text_input);
  
  this.text_input=document.createElement('div');
  this.text_input.style.display='inline-block';
  this.text_input.style.verticalAlign='middle';
  this.text_input.style.lineHeight=this.default_height+'px';
  this.text_input.style.fontFamily='"Courier New", Courier, monospace';
  this.text_input.style.fontSize='14px';
  this.text_input.innerHTML=this.text;
  this.div_container.appendChild(this.text_input);
  
  this.space=document.createElement('div');
  this.space.style.display='inline-block';
  //this.space.style.minWidth='8px';
  this.space.style.verticalAlign='middle';
  this.space.style.minHeight=this.default_height+'px';
  this.space.innerHTML='&nbsp;';
  this.div_container.appendChild(this.space);
  
  var self=this;
  this.div_container.onclick=function(e){
    self.switchToEditView();
    };
};

/**
 * Returns this token's div.
 * @return div A div element holding the current token.  
**/
VNTokenEditor.prototype.getDiv=function(){return this.div_container;};

/**
 * Sets new text to this token.
 * @param text A string to replace the current text in the token. 
**/
VNTokenEditor.prototype.setText=function(text)
{
  this.text=text;
  if(this.edit_mode){
    var input=this.getTextEditor().getInput();
    input.value=text;
    input.style.width=(9*(input.value.length+1))+'px';
  }
  else this.text_input.innerHTML=this.text;
};