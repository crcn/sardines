
var fs = require('fs'),
	path = require('path');
	 
Buffer = require('buffer').Buffer;

var references = [];

function clone(target,shallow,isDeep,name)
{            

	var copy,i;

                         

	if(!target)
	{
		return target;
	}                

	if(isArray(target))
	{
		copy = [];

		for(i in target)
		{
			copy.push(shallow && isDeep ? target[i] : clone(target[i],shallow,true,i));
		} 
		return copy;
	}                           
	else
	if(isObject(target) && (i = references.indexOf(target)) == -1)
	{       
		references.length+1;  
		references.push(target);

		var clazz = target.constructor;

		copy = new clazz();
                            
		for(var i in target)
		{        

			//this is a small safe-guard against circular references
			if(target == target[i])
			continue; 

			var val = target[i];

			/*if(val != null)
			{
			if(isFunction(val.clone))
			{
			val = target[i].clone();
			}
			else
			if(val.clone === true)
			{
			val = clone()
			}
			}
			else*/
			if((!shallow || !isDeep) && isObject(val))
			{

				val = clone(val,shallow,true,i);

				if(val === false)
				{
					throw new Error("circular reference detected starting from property \""+i+"\".");
				}
			}



			copy[i] = val;    
		}

		references.splice(i,1);
	}
	else
	if(i > 0)
	{
		return false;
	}
	else
	{
		copy = target;
	}     


	return copy;                    
}    

function copyTo(from,target,skipWrapFunction)
{
	for(var property in from)
	{                      

		var toValue = target[property],
		copy;

		if(toValue == undefined) 
		{                   
			copy = clone(from[property],true,true,property);   
		}     
		else
		if(!skipWrapFunction && isFunction(toValue))
		{

			//taken from http://ejohn.org/blog/simple-javascript-inheritance/
			function copyFunction(name,func)
			{
				return function()
				{                      
					var tmp = this._super;
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = from[name];
					var ret = func.apply(this,arguments);
					this._super = tmp;

					return ret;
				}
			}
			copy = copyFunction(property,toValue);


		}    
		else
		{ 
			copy = toValue;//target[property];
		}            

		target[property] = copy;
	}    

	return target;
}  

function setConstructor(target,skipWrapper)
{                     
	/*var func = function()
	{
	this.self = this;        



this.__construct2.apply(this,arguments);

}*/    

var func = function()
{
	if(target.__construct)
	{
		target.__construct.apply(this,arguments);
	}
}
func.prototype = target;
return func;

/*if(true)
{                          
func = tc;
}
else
{    
target.__construct = func;
target.__construct2 = tc;
}

func.prototype = target;*/   

// return func;
}



//returns an object with any of the options given
function or(stack,lookFor)
{

	for(var i in stack)
	{
		if(lookFor.indexOf(i) > -1)
		{
			var obj = {};
			obj[i] = stack[i];
			return obj;
		}
	}

	return null;
}

function first(stack)
{
	for(var i in stack)
	return stack[i];
}

function firstIndex(stack)
{
	for(var i in stack)
	return i;
}


function extend(parent,child)
{
	var c = clone(parent.prototype || parent);



	copyTo(c,child,false);

	//the parent is a function because we need to break out of the prototype
	//for subclassing to work, otherwise all subclasses share the same STATIC property
	//when calling this.prototype.varName
	/*child.__parent = function()
	{

//we set the parent once if it's been called
if(!this.$parent)
{                              

//we need to copy the current data to the parent so                       
var parentClass = setConstructor(copyTo(this,c),true);  
this.$parent = new parentClass();//copyTo(this,new c());
// this.$parent.self = this;                                     
}                   

return this.$parent;
}*/ 




return setConstructor(child);
}


function streamFile(request, fp, rootDir, ext)
{  

	fp = unescape(fp || request.uri);

	var ext = ext || request.fileExtension; 
	var fileName = (rootDir || '')+'/'+fp+'.'+ext;  
	
	// fileName = unescape(fp);      
	

	fs.stat(fileName,function(err,stat)
	{
		if(err)
		{           
			request.statusCode = 404;
			request.end("404 file not found");
			return;
		}
		
		request.headers['Content-Length'] = stat.size;
		

		fs.createReadStream(fileName,{flags: 'r', 
		encoding: 'binary', 
		mode: 0666,
		bufferSize: 4 * 1024})


		.addListener("data", function(chunk){
			request.send(chunk, 'binary');
		})
		.addListener("end", function(chunk){
			//  emitter.emit("success", statCode);
		})
		.addListener("close",function() {
			request.end();
		})
		.addListener("error", function (e) {
			//emitter.emit("error", 500, e);
		});
	});                                    
}




function isArray(target)
{
	return target.constructor.toString().indexOf("Array") > -1;
} 

function isObject(target)
{
	return typeof(target) == 'object';
}

function isFunction(target)
{
	return typeof(target) == 'function';
}


var mimes = 
{
	acx:"application/internet-property-stream",
	ai:"application/postscript",
	aif:"audio/x-aiff",
	aifc:"audio/x-aiff",
	aiff:"audio/x-aiff",
	asf:"video/x-ms-asf",
	asr:"video/x-ms-asf",
	asx:"video/x-ms-asf",
	au:"audio/basic",
	avi:"video/x-msvideo",
	axs:"application/olescript",
	bas:"text/plain",
	bcpio:"application/x-bcpio",
	bin:"application/octet-stream",
	bmp:"image/bmp",
	c:"text/plain",
	cat:"application/vnd.ms-pkiseccat",
	cdf:"application/x-cdf",
	cer:"application/x-x509-ca-cert",
	class:"application/octet-stream",
	clp:"application/x-msclip",
	cmx:"image/x-cmx",
	cod:"image/cis-cod",
	cpio:"application/x-cpio",
	crd:"application/x-mscardfile",
	crl:"application/pkix-crl",
	crt:"application/x-x509-ca-cert",
	csh:"application/x-csh",
	css:"text/css",
	dcr:"application/x-director",
	der:"application/x-x509-ca-cert",
	dir:"application/x-director",
	dll:"application/x-msdownload",
	dms:"application/octet-stream",
	doc:"application/msword",
	dot:"application/msword",
	dvi:"application/x-dvi",
	dxr:"application/x-director",
	eps:"application/postscript",
	etx:"text/x-setext",
	evy:"application/envoy",
	exe:"application/octet-stream",
	fif:"application/fractals",
	flr:"x-world/x-vrml",
	gif:"image/gif",
	gtar:"application/x-gtar",
	gz:"application/x-gzip",
	h:"text/plain",
	hdf:"application/x-hdf",
	hlp:"application/winhlp",
	hqx:"application/mac-binhex40",
	hta:"application/hta",
	htc:"text/x-component",
	htm:"text/html",    
	leaf:'text/html',
	html:"text/html",
	htt:"text/webviewhtml",
	ico:"image/x-icon",
	ief:"image/ief",
	iii:"application/x-iphone",
	ins:"application/x-internet-signup",
	isp:"application/x-internet-signup",
	jfif:"image/pipeg",
	jpe:"image/jpeg",
	jpeg:"image/jpeg",
	jpg:"image/jpeg",
	js:"application/x-javascript",
	json:"application/json",
	latex:"application/x-latex",
	lha:"application/octet-stream",
	lsf:"video/x-la-asf",
	lsx:"video/x-la-asf",
	lzh:"application/octet-stream",
	m13:"application/x-msmediaview",
	m14:"application/x-msmediaview",
	m3u:"audio/x-mpegurl",
	man:"application/x-troff-man",
	mdb:"application/x-msaccess",
	me:"application/x-troff-me",
	mht:"message/rfc822",
	mhtml:"message/rfc822",
	mid:"audio/mid",
	mny:"application/x-msmoney",
	mov:"video/quicktime",
	movie:"video/x-sgi-movie",
	mp2:"video/mpeg",
	mp3:"audio/mpeg",
	mpa:"video/mpeg",
	mpe:"video/mpeg",
	mpeg:"video/mpeg",
	mpg:"video/mpeg",
	mpp:"application/vnd.ms-project",
	mpv2:"video/mpeg",
	ms:"application/x-troff-ms",
	mvb:"application/x-msmediaview",
	nws:"message/rfc822",
	oda:"application/oda",
	p10:"application/pkcs10",
	p12:"application/x-pkcs12",
	p7b:"application/x-pkcs7-certificates",
	p7c:"application/x-pkcs7-mime",
	p7m:"application/x-pkcs7-mime",
	p7r:"application/x-pkcs7-certreqresp",
	p7s:"application/x-pkcs7-signature",
	pbm:"image/x-portable-bitmap",
	pdf:"application/pdf",
	pfx:"application/x-pkcs12",
	pgm:"image/x-portable-graymap",
	pko:"application/ynd.ms-pkipko",
	pma:"application/x-perfmon",
	pmc:"application/x-perfmon",
	pml:"application/x-perfmon",
	pmr:"application/x-perfmon",
	pmw:"application/x-perfmon",
	pnm:"image/x-portable-anymap",
	pot:"application/vnd.ms-powerpoint",
	ppm:"image/x-portable-pixmap",
	pps:"application/vnd.ms-powerpoint",
	ppt:"application/vnd.ms-powerpoint",
	prf:"application/pics-rules",
	ps:"application/postscript",
	pub:"application/x-mspublisher",
	qt:"video/quicktime",
	ra:"audio/x-pn-realaudio",
	ram:"audio/x-pn-realaudio",
	ras:"image/x-cmu-raster",
	rgb:"image/x-rgb",
	rmi:"audio/mid",
	roff:"application/x-troff",
	rtf:"application/rtf",
	rtx:"text/richtext",
	rss:"application/rss+xml",
	scd:"application/x-msschedule",
	sct:"text/scriptlet",
	setpay:"application/set-payment-initiation",
	setreg:"application/set-registration-initiation",
	sh:"application/x-sh",
	shar:"application/x-shar",
	sit:"application/x-stuffit",
	snd:"audio/basic",
	spc:"application/x-pkcs7-certificates",
	spl:"application/futuresplash",
	src:"application/x-wais-source",
	sst:"application/vnd.ms-pkicertstore",
	stl:"application/vnd.ms-pkistl",
	stm:"text/html",
	svg:"image/svg+xml",
	sv4cpio:"application/x-sv4cpio",
	sv4crc:"application/x-sv4crc",
	t:"application/x-troff",
	tar:"application/x-tar",
	tcl:"application/x-tcl",
	tex:"application/x-tex",
	texi:"application/x-texinfo",
	texinfo:"application/x-texinfo",
	tgz:"application/x-compressed",
	tif:"image/tiff",
	tiff:"image/tiff",
	tr:"application/x-troff",
	trm:"application/x-msterminal",
	tsv:"text/tab-separated-values",
	txt:"text/plain",
	uls:"text/iuls",
	ustar:"application/x-ustar",
	vcf:"text/x-vcard",
	vrml:"x-world/x-vrml",
	wav:"audio/x-wav",
	wcm:"application/vnd.ms-works",
	wdb:"application/vnd.ms-works",
	wks:"application/vnd.ms-works",
	wmf:"application/x-msmetafile",
	wps:"application/vnd.ms-works",
	wri:"application/x-mswrite",  
	wrl:"x-world/x-vrml",
	wrz:"x-world/x-vrml",
	xaf:"x-world/x-vrml",
	xbm:"image/x-xbitmap",
	xla:"application/vnd.ms-excel",
	xlc:"application/vnd.ms-excel",
	xlm:"application/vnd.ms-excel",
	xls:"application/vnd.ms-excel",
	xlt:"application/vnd.ms-excel",
	xlw:"application/vnd.ms-excel",
	xml:"text/xml",
	xof:"x-world/x-vrml",
	xpm:"image/x-xpixmap",
	swf:"application/x-shockwave-flash",
	xwd:"image/x-xwindowdump",
	z:"application/x-compress",
	zip:"application/zip"
};

function getMime(type) 
{
	return mimes[type] || 'application/octet-stream';
}


var base64 = {
	encode: function(str) {
		return (new Buffer(String(str))).toString('base64');
	},
	decode: function(str) {
		return (new Buffer(String(str), 'base64')).toString('utf8');
	}
}



function uid()
{
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+', // base64 alphabet
	ret = '';

	for (var bits=24; bits > 0; --bits){
		ret += chars[0x3E & (Math.floor(Math.random() * 0x100000000))];
	}
	return ret;
}            
function prettyDate(diff)
{                       
	diff /= 1000;
	                                            
	var day_diff = Math.floor(diff / 86400)
	
	return day_diff == 0 && (
		diff < 60 && "now" ||
		diff < 120 && "1 minute" ||
		diff < 3600 &&  Math.floor(diff / 60)  + " minutes" ||
		diff < 7200 && "1 hours" ||
		diff < 86400 &&  Math.floor(diff / 3600)  + " hours") ||
		day_diff == 1 && "Tomorrow" ||
		day_diff < 7 && day_diff + " days" ||
		day_diff < 31 &&  Math.ceil(day_diff / 7)  + " weeks" ||  
		day_diff < 365 && Math.ceil(day_diff / 30) + " months" ||
		Math.floor(day_diff / 365) + " years"
}

function ouid(target)
{
	do
	{
		var id = uid();  
	}
	while(target[id])
	return id;
}      



function mkdir_r(root,dir,callback)
{       
	if(!dir)
	{
		callback = dir instanceof Function ? dur : null;
		dir = root;
		root = '/';
	}
	
	dir = dir instanceof Array ? dir : dir.split('/');  
	root = root || '/';
	                       
	            
	var p = root;
	
	for(var i = 0, n = dir.length; i < n; i++)
	{            
		p += '/'+dir[i]  
		
		if(!path.existsSync(p)) fs.mkdirSync(p,0777);
	}
	
	if(callback) callback();
}


function readFile_r(dirOrFile, ignoreRead, callback)
	{
		if(!callback)
		{
			callback = ignoreRead;
			ignoreRead = undefined;
		}
		
		var stat = fs.statSync(dirOrFile);
		
		if(stat.isFile())
		{
			callback(dirOrFile, ignoreRead || fs.readFileSync(dirOrFile));
		}
		else
		{
			utils.eachDirFile(dirOrFile, function(dir)
			{
				utils.readFiler(dir, callback);
			})
		}
	};
	
function deleteKeys(keys,target)
{
	keys.forEach(function(key)
	{
		delete target[key];
	})
}


function copy(from,to)
{
	for(var i in from) to[i] = from[i];
}

function arrayToObject(target)
{
	var obj = {};
	for(var i = target.length; i--;)
	{
		var item = target[i]
		obj[item] = 1;
	}
	return obj;
}


function lazy(callback,ttl)
{
	var timeout;
	return function()
	{
		var args = arguments;
		
		clearTimeout(timeout);
		timeout = setTimeout(function()
		{
			callback.apply(null,args);
		},ttl)
	}
}

function unicodeEscape(str)
{
	var buffer = '';
	
	for(var i = 0, n = str.length; i < n; i++)
	{
		var c = str.charCodeAt(i);
		
		if((c >> 7) > 0)
		{
			buffer += '\\u' + 
			(c >> 12 & 0xF) +
			(c >> 8 & 0xF) +
			(c >> 4 & 0xF) +
			(c & 0xF);
		}
		else
		{
			buffer += str[i];
		}
	}
	
	return buffer;
}

function unicodeUnescape(str)
{
	var buffer = '';
	
	for(var i = 0, n = str.length; i < n; i++)
	{
		var c = str.charCodeAt(i);
		
		if((c >> 7) > 0)
		{
			buffer += '\\u' + 
			(c >> 12 & 0xF) +
			(c >> 8 & 0xF) +
			(c >> 4 & 0xF) +
			(c & 0xF);
		}
		else
		{
			buffer += str[i];
		}
	}
	
	return buffer;
}

function unicodeUnescape(str)
{
	str = str.replace(/\\+u\w{4}/g,function(str)
	{
		return String.fromCharCode(parseInt(str.replace('\\u',''),16));
	});

	return str;
}

exports.unicodeEscape = unicodeEscape;
exports.unicodeUnescape = unicodeUnescape;
exports.readFile_r = readFile_r;
exports.arrayToObject = arrayToObject;
exports.lazy = lazy;
exports.copy = copy;
exports.deleteKeys = deleteKeys;
exports.prettyDate = prettyDate;
exports.mkdir_r = mkdir_r;
exports.ouid = ouid;
exports.uid = uid;
exports.base64 = base64;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.streamFile = streamFile;
exports.getMime = getMime;
exports.clone  = clone;
exports.extend = extend;   
exports.copyTo = copyTo;
exports.first = first;
exports.firstIndex = firstIndex;
exports.or = or;