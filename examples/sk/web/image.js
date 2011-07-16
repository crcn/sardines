//!require sk

sk.image = 
{
	preload:function(src,callback)
	{
		if(!src) return callback(null);
		                           
		var img = new Image();
		          
		document.body.appendChild(img);  
		
		function onload()
		{                  
    		$(img).css({display:'block'});  
			
   
			callback(img);
			
			if(img.parentNode == document.body)
			{
				img.parentNode.removeChild(img);
			}
		}
            
        $(img).css({display:'none'});
        $(img).load(onload).attr('src',src/*+"?"+Math.random()*/);
		
		/*img.src = src; 
		$(img).css({display:'none'});   
		
		
		
		var timer = sk.smart.interval(function()
		{               
			           
			if($(img).width() > 0)
			{                       
				$(img).css({display:'block'});
				callback(img);
				// img.setAttribute('style','display:block;'); 
				
				if(img.parentNode == document.body)
				{
					img.parentNode.removeChild(img)
				}  
				
				
				timer.stop();
			}
		},200);*/   
	}         
	
	,_resizedImageUrls:{}                                                  
	,_resizeIndex:0    
	,_resizeServiceFactories:[  
	function(url,width,height)
	{
		return 'http://www.resizer.co?img='+url+(width ? '&w='+width : '')+(height ? '&h='+height : '') 
	}
	,
	function(url,width,height)
	{
		return 'http://images.weserv.nl/?url='+url.replace('http://','')+(width ? '&w='+width : '')+(height ? '&h='+height : '') 
	}
	]
	
	//uses a list of services which can resize images. Round-robin approach
	,resizedUrl:function(url,width,height)                                              
	{
		if(this._resizedImageUrls[url]) return this._resizedImageUrls[url];   
		var getResizeUrl = this._resizeServiceFactories[(this._resizeIndex++)%this._resizeServiceFactories.length];    
		
		console.log(getResizeUrl(url,width,height))
		return this._resizedImageUrls[url] = getResizeUrl(url,width,height);
	}
}              

