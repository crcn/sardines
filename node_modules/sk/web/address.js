//!require sk

sk.address = 
{           
	//clean addresses separated by /
	clean:{}
	
	//dirty addresses - get vars
	,dirty:{} 
	             
	
	,parsed:false 
	
	,location:
	{
		path:[]
		,data:{}
	} 
	           
	//current callbacks executed. 
	,current:{}                
	
	,on:function(addr,callback)
	{               
		if(addr instanceof Array)
		{   
			var callback;
			for(var i = addr.length; i--;)
			{
				callback = sk.address.on(addr[i],callback);
			}                                
			return callback;
		}                  
		
		if(!sk.address.parsed)
		{    
			sk.address.parsed = true;                  
			var loc		   = window.location.toString();               
			sk.address.location.data = sk.address.split.dirty(loc);
			sk.address.location.path = sk.address.split.clean(loc); 
			
			
			function onHashChange()
			{             
				if(window.location.hash != sk.address.location.hash)
				{     
					// alert(window.location.hash+" - "+sk.address.location.hash)          
					console.error('window change hash:'+window.location.hash+" old hash: "+sk.address.location.hash);                             
					sk.address.redirect(window.location.hash);
				} 
			}  
			                            
			if('onhashchange' in window)
			{
				window.onhashchange = onHashChange;       
			}                                      
			else
			{
				setInterval(onHashChange,100);  
			}  
			
		}              

		var dirty = sk.address.split.dirty(addr),
		path = sk.address.split.clean(addr),
		dir;    
		                              

		var route = sk.address.clean,
		params = {},
		dupe = false; 
		                                   
		if(path)
		{
			for(var i = 0, n = path.length; i < n; i++)
			{                         
				dir = path[i]; 

				if(dir.indexOf(':') > -1)
				{       
					params[dir.substr(1)] = i;  

					dir = '$all';
				}

				if(!route[dir]) route[dir] = {};         

				route = route[dir];

			}                      
                     
			if(route.handler) dupe = true;      
			                                 
			
			route.handler = {callback:callback,params:params};                           

		}
		
		var dirtyArrays = [],dirtyParam;

		for(i in dirty)
		{          
			dupe = dupe || sk.address.dirty[i];  
			dirtyParam = dirty[i];  
			                                                                                  
			sk.address.dirty[i] = {callback:callback,param:dirtyParam ? dirtyParam.substr(1) : null};           
		}                            
		           
                               
		if(dupe) console.error('Duplicate route detected for '+addr+'. removing old');
		
		sk.address.redirect({path:sk.address.location.path,data:sk.address.location.data},callback);
		              
		
		//local redirects
		return {    
			dispose:function()
			{           
				alert('sk.address:dispose()')     
				
				route.handler = null;  
				
				for(var i in dirty)
				{                          
					delete sk.address.dirty[i];
				}
				
			}
			,redirect:function(value)
			{                      
				/*for(var i in value)
				{
					
				}   
				
				sk.address.redirect({path:path,data:value}); */
			}
		}
	}
	,redirect:function(addr,onlyCallback)
	{                              
		var data,path,current = {};                         



		if(typeof addr == 'string')
		{                   
			data = sk.address.split.dirty(addr),
			path = sk.address.split.clean(addr);  
		}
		else
		{
			data = addr.data;
			path = addr.path;   
		}              
		
			          
		sk.address.location.path = path = path || sk.address.location.path;                   
		sk.address.location.data = data = data || sk.address.location.data;
		                         
		                                            

		var hashPath = hash = path ? path.join('/') : '',
		hashData = '';  

		for(var i in data) hashData += '&'+i+'='+escape(data[i]);                     
                           
        hash += hashData;                              
                             
                     
		//dirty data is the easiest first
		for(i in data)
		{               
			var dirtyData = sk.address.dirty[i];
			if(!sk.address.current[i] && dirtyData && (!onlyCallback || onlyCallback == dirtyData.callback))
			{
				current[i] = dirtyData; 
				var d = {};
				if(dirtyData.param) 
				{
					d[dirtyData.param] = data[i];                                              
				}
				else
				{
				   d = data[i];
				}       
				                                        
				                                                 
				dirtyData.callback(d);
			}   
		}        
		        
				sk.address.location.hash =  '#'+hash;   
		     
		setTimeout(function()
		{    
			window.location.hash = hash;         
		}
		,1);
		                 
		var route = sk.address.clean,
		handlers = [];


		//clean urls next    
		if(path)
		for(i = 0, n = path.length; i < n; i++)
		{
			var dir = path[i];       
			if(!route[dir] && !route.$all) break;
			route = route[dir] || route.$all; 

			if(route.$all && route.$all.handler)
			{         
				handlers.push(route.$all.handler);                
			} 

		}   	  
		if(route.handler)
		{   
			handlers.push(route.handler); 
		}  
		if(handlers.length)
		{   
			var last = handlers[handlers.length-1];
                                                   
			if(sk.address.current.$path == hashPath) return;
		          	          
		 	sk.address.current.$path = hashPath;
			
			for(i = handlers.length; i--;)
			{               
				var params = handlers[i].params,
				callback = handlers[i].callback,
				data = {};              
                                                       
				
				for(var j in params)
				{                    
					data[j] = path[params[j]];//index
				}                 
                                                                 
				callback(data);
			} 
		} 

	}   
	,split:
	{
		dirty:function(addr)
		{                                              
			var ai = addr.indexOf('&')+1;
			if(!ai) return {};
			
        	var parts = addr.substr(ai).split('&');    
			var data = {};  

			for(var i = parts.length; i--;)
			{
				var vp = parts[i].split('='),
					name = vp[0],
					value = vp.length > 1 ? vp[1] : null;      
					                   

				data[name] = value;
			}                                     
			return data;
		}     
		,clean:function(addr)
		{                                       
			var ai = addr.indexOf('#')+1;   
			                            
			if(!ai) return null;              
			
			var i = addr.search(/[&]/);
			                              
			var url = addr.substr(ai,i > -1 ? i-ai : addr.length),
			    parts = url.split('/');
			                                    
			// alert(url)
			//remove whitespace
			for(var i = parts.length; i--;) if(parts[i] == '') parts.splice(i,1); 
			
			return parts;
		}
	}
	,isDirty:function(addr)
	{
	   return addr.indexOf('&') > -1
	}
}             
