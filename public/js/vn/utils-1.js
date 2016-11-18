function ResourceManager(canvas)
{
	this.canvas=canvas;
	this.textures={};
	this.textures_url={};
	this.sounds={};
	this.sounds_url={};
	this.objects={};
	this.materials={};
}

ResourceManager.prototype.addTexture=function(name,t)
{
	if(typeof t==='string')
	{
		/*if(typeof this.textures_url[t]!=='undefined')
		{
			if(typeof this.textures[name]!=='undefined' && this.textures[name]==this.textures_url[t])
				return this.textures_url[t];
		}
		else*/
		{
			var i=null;
			if(typeof this.textures[name]!=='undefined')
			{
				i=this.textures[name];
			}
			else
			{
				i=new GLTexture(this.canvas);
				this.textures[name]=i;
			}
			i.load(t);
			this.textures_url[t]=i;
				
			return i;
		}
	}
	else
	{
		this.textures[name]=t;
		return t;
	}
};

ResourceManager.prototype.addSound=function(name,s)
{
	if(typeof s==='string')
	{
		if(typeof this.sounds_url[t]!=='undefined')
		{
			return this.sounds_url[t];
		}
		else
		{
			var i=new Audio(s);
			this.sounds_url[t]=i;
			this.sounds[name]=i;
			return i;
		}
	}
	else
	{
		this.sounds[name]=s;
		return s;
	}
};

ResourceManager.prototype.addMaterial=function(name,m)
{
	if(typeof m==='undefined')
	{
		var m=new GLMaterial(this.canvas);
		this.materials[name]=m;
		return m;
	}
	else
	{
		this.materials[name]=m;
		return m;

	}
};

ResourceManager.prototype.addObject=function(name,o)
{
	if(typeof o==='undefined')
	{
		var o=new GLObject(this.canvas);
		this.objects[name]=o;
		return o;
	}
	else
	{
		this.objects[name]=o;
		return o;
	}
};