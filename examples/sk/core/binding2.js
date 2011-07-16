var sk = require(__dirname + '/events');

exports.BindableData = {         
	ignoreIdent:true
	,__construct:function(value)
	{
		this.value = value;  
		this._super();    
		
		if(sk && sk.debugMode)
			sk.reference.count.set(sk.reference.count.get()+1)     
		else
			this.igRef = true;
	}
	,get:function()
	{
		return this.value;
	}
	,set:function(value)
	{                  
		if(this.ignoreIdent && this.value == value)
		return;                
		                                                   

		this.value = value;
		this.change(value);
	}
	,change:function(data,type)
	{                     
		this.emit(type || 'change',data);
	}                   
	,dispose:function()
	{                                     
		if(!this.igRef && sk.debugMode)
		sk.reference.count.set(sk.reference.count.get()-1)
		this._super();
	}
	,toString:function()
	{
		return this.value ? this.value.toString() : null;
	}
	,bind:function(callback,type)
	{                 
		this.addListener((typeof type == 'string') ? type : 'change',callback);       
		
		if(typeof type == 'boolean' && this.value)
		{
			callback(this.value)
		}
	}
	,unbind:function(callback,type)
	{                                                   
		this.removeListener(type || 'change',callback);          
	}
}                                             

sk.BindableData = sk.EventEmitter.extend(sk.BindableData);    
              
/*sk.BindableDataTree =  {  
	__construct:function(value)
	{
		this._super();
		if(value) this.set(value);
	}
	,get:function()
	{
		return this.value;
	}
	,set:function(value)
	{
		var nobj;
		
		if(value instanceof Object)
		{
			nobj = {};
			for(var i in value)
			{
				if(!this[i]) this[i] = new sk.BindableDataTree();
				
				nobj[i] = this[i];
				this[i].set(value[i]);
			}
		}
		this.value = nobj || value;
		this.original = value;

		this.change(value);
	}
} 
                                            


var ArrayCollection = ObjectUtils.extend(Data, {
	__construct:function(data)
	{                   
		this._super(data || []);  
		this.value.collection = this;
		this.hash = {};
		this.count = 0;
	},
	getItemAt:function(index)
	{
		return this.value[index];
	},
	set:function(value)
	{                
		if(value) value.collection = this;
		this._super(value);  
		this.emitChange('reset',0,value);
	}
	,getItemIndex:function(item)
	{
		return this.value.indexOf(item);
	},               
	setItemAt:function(value,index)
	{
		this.value[index] = value;
		this.emitChange('replace',index,value);
	},
	addItem:function(value,index)
	{        
		this.hash[this.count++] = value;
		this.value.splice(index || this.value.length,0,value); 
		this.emitChange('add',index,[value]);
	},
	addItems:function(stack)
	{
		var i = this.value.length;
		this.value = this.value.concat(stack);
		this.value.collection = this;
		this.emitChange('add',i,stack)  
	} 
	,toArray:function()
	{
		return this.value;
	},
	removeItem:function(value)
	{
		var i = this.getItemId(value);
		if(i > -1) delete this.hash[i];
		i = this.value.indexOf(value);
		return this.removeItemAt(i);
	},
	removeItemById:function(id)
	{
		var item = this.hash[id];
		if(item) this.removeItem(item);
	},
	bind:function(callback,type)
	{
		this._super(callback,type || 'collectionChange');
	}
	,unbind:function(callback,type)
	{
		this._super(callback,type || 'collectionChange');
	},
	getItemId:function(value)
	{
		for(var i in this.hash)
		{
			if(this.hash[i]== value) 
			return i;
		}
		return -1;	
	},
	length:function()
	{                  
		return this.value.length;
	},
	removeItemAt:function(index,ignoreEmit)
	{
		if(index == -1)
		return;

		var value = this.value[index];

		this.value.splice(index,1);

		if(!ignoreEmit)
		this.emitChange('remove',index,value);
		return value;
	},
	removeAllItems:function()
	{
		while(this.length() > 0)
		{
			this.removeItemAt(0,true);
		}
		this.emitChange('removeAll')
	},

	emitChange:function(type,index,item)
	{
		this.change({type:type,index:index,item:item},'collectionChange');
	},

	each:function(callback)
	{    
		ArrayUtils.each(this.value,callback);
	}
});   	     

var DOMCollection = ObjectUtils.extend(ArrayCollection, {
	__construct:function(element)
	{
		this.element = element;
		this._super();
	},
	getItemAt:function(index)
	{
		return this.element.childNodes[index];
	},
	getItemIndex:function(item)
	{
		return this.element.childNodes.indexOf(item);
	},
	setItemAt:function(item,index)
	{
		var item = this.getItemAt(index);
		this.element.replaceChild(child,item);
	},
	length:function()
	{
		return this.element.childNodes.length;
	},
	toArray:function()
	{
		return this.childNodes;
	},
	addItem:function(item,index)
	{
		if(index == undefined || index >= this.length())
		{
			this.element.appendChild(item);
		}
		else
		{
			var sibling = this.getItemAt(index);
			this.element.insertBefore(item,sibling);
		} 

		this.emitChange('add',index,[item])

	},
	addItems:function(stack)
	{
		var i = this.element.childNodes.length,
		s = this;
		
		ArrayUtils.each(stack,function(child)
		{
			s.elements.appendChild(child);    
		}
	);

	this.emitChange('add',i,stack)  
	} ,
	removeItem:function(item)
	{
		this.element.removeChild(item);
	},
	removeItemAt:function(index)
	{
		var item = this.getItemAt(index);
		this.removeItem(item);
	},
	removeAllItems:function()
	{
		while(this.length() > 0)
		{
			this.removeItemAt(0);
		}

		this.emitChange('removeAll')
	},
	forEach:function(callback)
	{                          
		ArrayUtils.each(this.element.childNodes,callback);
		// this.element.childNodes.each(callback);
	}

});



var Repeater = ObjectUtils.extend({}, {
	__construct:function(source,factory,target)
	{
		this.factory = factory;
		this.target = target;
		this.setSource(source);    
		
	},
	getSource:function()
	{
		return this.source;
	},
	setSource:function(source)
	{
		var s = this;
		function addItems(items,index)
		{
			if(!s.target || !items) return;
			
			var frag = document.createDocumentFragment();
			for(var i = 0, n = items.length; i < n; i++)
				frag.appendChild(s.factory(items[i],i+(index||0)));

			s.target.addItem(frag,index);
		}


		function onSourceChange(data)
		{                 
			switch(data.type)
			{
				case 'add':       
					addItems(data.item,data.index);     
				break;
				case 'remove':    
					s.target.removeItemAt(data.index);     
				break;
				case 'removeAll': 
					s.target.removeAllItems();   
				break;
				case 'replace':   
					if(s.target) s.target.setItemAt(data.item,data.index);    
				break;	
			}          
			                       
			if(s.onchange) s.onchange();

		} 

		this.dispose = function()
		{
			if(s.source) s.source.unbind(onSourceChange,'collectionChange');
		} 

		this.dispose();
		this.source = source;
		s.target.removeAllItems();
		addItems(source.toArray(),0);
		source.bind(onSourceChange,'collectionChange');
	}
});*/