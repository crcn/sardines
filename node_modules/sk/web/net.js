//!require sk

sk.net = 
{
	//parsed query string data
	parsedData:{}

	//loads data
	,load:function(url,params,callback,method)
	{
		method = method || 'GET';
		
		if(!callback)
		{
			callback = params;
			params = {};
		}  

		var r = new XMLHttpRequest();
		r.onerror = function(err)
		{
			// alert(r.status)
		}
		r.onreadystatechange = function(event)
		{                        
			if(r.readyState == 4)
			{                    
				//alert(r.responseText)
				//if(r.status == 200)
				{                                              
					callback(r.responseText);
				}
				/*else
				{
				// alert(r.status);
				}*/
			}
		}                          

		var qs = this.queryString(params);

		if(qs && method == 'GET')
		{
			url += (url.indexOf('?') > -1 ? '&' : '?')+qs;
		}                                             

		r.open(method || 'GET',url,true);


		// r.setRequestHeader("Content-Type", "application/xml");
		// r.setRequestHeader("Requested-With", "xmlhttprequest");

		if(method == 'POST')
		{
			r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			// r.setRequestHeader("Content-Length", qs.length);
			// r.setRequestHeader("Connection", "close");

		}
		else
		{
			// r.setRequestHeader('Content-Type', 'application/json');
		}

		r.send(qs);                           
	}     

	,queryString:function(obj)
	{
		var qs = [];
		for(var i in obj)
		qs.push(i+"="+escape(obj[i]).replace(/\//g,'%2F'));

		return qs.join("&");
	}
	,post:function(url,params,callback)
	{
		this.load(url,params,callback,'POST');
	}
	,loadJSON:function(url,params,callback)
	{
		this.load(url,params,function(data)
		{
			var d = null;
			try
			{                    
				d = (JSON.parse || JSON.decode)(data);
			}
			catch(e)
			{
			}

			(callback || params)(d);
		})
	}
	,data:function(url)
	{
		url = url || window.location.href;

		if(this.parsedData[url]) return this.parsedData[url];

		var qs = url.split('?').pop(),
		qs = qs.replace(/#.*/,''),
		parts = qs.split('&'),
		data = {},
		v;

		for(var i in parts)
		{
			v = String(parts[i]).split('=');
			data[v[0]] = v.length > 1 ? v[1] : true;
		}

		return this.parsedData[url] = data;
	}
}     
