var http = require('http'),
	Url = require('url');

exports.request = function(req, res, to)
{	
	var ops = {
		host: to.host,
		port: to.port,
		path: req.url,
		method: req.method,
		headers: req.headers
	};
		
	
	var pReq = http.request(ops, function (response)
	{
		res.writeHead(response.statusCode, response.headers);
		
		response.on('data', function(data)
		{
			res.write(data);
		});
		response.on('end', function(data)
		{
			res.end(data);
		});
	});
	
	pReq.on('error', function(e)
	{ 
		// console.log(e)
		res.writeHead(501);
		res.end('An internal server error has occurred.');
	});
	
	if(req.method.match(/POST|PUT/g))
	{
		req.on('data', function(data)
		{ 
			pReq.write(data);
		})
		
		req.on('end', function()
		{
			pReq.end();
		})
	}
	else
	{
		pReq.end();
	}
}