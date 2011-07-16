//!require sk,../../third-party/json2

sk.cookies = {
	set:function(name,value,expires)
	{
		document.cookie = name + "=" + escape(JSON.stringify({v:value})) + "; path=/" + ((expires == null) ? "" : "; expires=" + expires.toGMTString());
	}
	,get:function(name)
	{
		var dc = document.cookie;	
		var cname = name + "=";	

		if (dc.length > 0) 
		{	
			begin = dc.indexOf(cname); 
			if (begin != -1) 
			{ 
				begin += cname.length; 
				end = dc.indexOf(";",begin);
				if (end == -1) end = dc.length;
				return JSON.parse(unescape(dc.substring(begin, end))).v;
			} 
		}	
		return null;
	}    
	,remove:function(name)
	{                            
		sk.cookies.set(name,false,new Date(0));  
	}
}
