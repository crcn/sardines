var stdin,
    argQueue = [],       
    callbackQueue = [],          
	initialized = false, 
	printedTip = false,
    EventEmitter = require('events').EventEmitter,
	sys = require('sys'),       
	TypeUtils = require('../utils'),
	fs = require('fs');    
 	



//TRUE if we print  > for input
exports.printTip = false;     
exports.execute = execute;
exports.start = start;
exports.stop  = stop;
exports.on    = on;
exports.next = next;    
exports.noArgs = noArgs;
exports.executeArgv = executeArgv;
exports.args = argQueue;      

var argHandlers = {},
	currentArg;
	
try {
	require('tty').setRawMode(true);
}catch(e)
{
	
}
//starts up the command line interface
function start()
{         
	if(initialized)
		return;
	
	initialized = true;
	stdin = process.openStdin();
    stdin.setEncoding('utf8');    

	var buffer = '',
		history = [],
		historyCursor = 0,
		cursorPosition = 0;

	function spliceStdout(from,to)
	{
		buffer = buffer.substr(0,from)+buffer.substr(to,buffer.length);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(buffer);
		process.stdout.cursorTo(from);
	}
	
	var stdinHandlers = {
		enter: {
			callback: function() {
				
			    //matches: "some \" argument here.", my, arg
			    var args = buffer.match(/((["'])([^\\](?!\2)|\\.|\w)+\2|[^\s"']+)/ig);
			           
			    //no args
			    if(!args)
					return;
			
			    //we iterate through the arguments to make sure there isn't any crap we don't
			    // want such as "qoutes"
			    for(var i = 0, n = args.length; i < n; i++)
			    {                               
				    var arg = args[i];
				                                             
				    //remove qoutes if they're present
					if(arg.substr(1).match(/['"]/))
					{   
						
						//strip slashes                         
						//arg = arg.replace(/\\("|')/igs,function($0){ return $0; });
						
						args[i] = arg.substr(1,arg.length-2);
					}
			    }       
				process.stdout.write('\n');         
			      
			    execute(args);  
				
				
				if(history[history.length-1] != buffer) history.push(buffer);
				
				if(history.length > 200) history.shift();
				
				historyCursor = history.length-1;
				
				buffer = '';
				
			}
		},
		up: {
			callback: function()
			{
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				
				historyCursor = Math.min(historyCursor,history.length-1);
				if(historyCursor < 0) return;
				
				process.stdout.write(buffer = history[historyCursor--]);
			}
		},
		down: {
			callback: function()
			{
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				historyCursor = Math.max(historyCursor,0);
				if(historyCursor >= history.length) return;
				
				process.stdout.write(buffer = history[historyCursor++]);
			}
		},
		backspace: {
			callback: function()
			{
				spliceStdout(cursorPosition-1,cursorPosition);
				cursorPosition--;
			}
		},
		'delete': {
			callback: function()
			{
				spliceStdout(cursorPosition,cursorPosition+1);
			}
		},
		left: {
			callback: function()
			{	
				process.stdout.moveCursor(-1);
				cursorPosition = Math.max(0,cursorPosition-1);
			}
		},
		right: {
			callback: function()
			{	
				process.stdout.moveCursor(1);
				cursorPosition = Math.min(buffer.length,cursorPosition+1);
			}
		},
		c: {
			ctrl: 1,
			callback: function()
			{
				if(exports.onExit) exports.onExit();
				
				process.exit();
			}
		}
	}
	
	
	
	stdin.on('keypress', function(chunk, key)
	{
		var handler = key ? stdinHandlers[key.name] : false,
			misMods = !handler;
		
		
		if(handler)
		for(var modifier in key)
		{
			if(modifier == 'name') continue;
			
			misMods = misMods || !!(handler[modifier]) != !!(key[modifier]);
		}	
		
		
		if(!misMods)
		{
			handler.callback();
		}
		else
		if(chunk)
		{
			buffer += chunk;
			cursorPosition = buffer.length;
			process.stdout.write(chunk);
		}
	});  
}      

                         
//adds additional 
function execute(args)
{                         
	exports.args = args.concat(exports.args);
	                                    
	//handle the args once we've added them
	next();             
} 

//stops the cli
function stop()
{
	process.exit();
} 
  
//listens for an argument 
function on(type, autoNext, callback)
{                         
	if(!callback)
	{                 
		callback = autoNext;
		autoNext = true;    
	}                             
	
	
	/*if(!initialized)
	{
		start();
	} */ 
	
	if(!(type instanceof Array))
	{
		type = [type];                                       
	} 
	
	for(var i in type)
	{                                                       
		argHandlers[type[i]] = {callback:callback,autoNext:autoNext};
	}   
	
	if(!callbackQueue.length)
	{
		next();
	}    
}           

function noArgs(callback)
{
	if(exports.args.length == 0)
	{
		callback();
	}
}              

//handles the next argument in the queue
function next(callbacks)
{                        
	if(callbacks)
	{                     
		if(typeof callbacks == 'function')
		{
			callbacks = {$all:callbacks};
		}                            

		if(exports.args.length > 0)
		{              
			var arg = exports.args.shift();
			
			var callback = callbacks[arg] || callbacks.$all;
			                      
			if(callback)
			{
				callback(arg);  
			}
			else
			{                      
				
				//maybe it doesn't belong... unshift, and move to the next item
				exports.args.unshift(arg);   
				next();
			}
		}
		else 
		if(callbacks.default)
		{                                         
			callbacks.default();
		}
		else
		{
			callbackQueue.push(callbacks);    
		}   
	}
	else
	{
     	//callbacks in queue. this happens AFTER a command. e.g: -start http-server
		if(callbackQueue.length && exports.args.length)
		{                                             
			var callback = callbackQueue.shift();
			next(callback);
			// callback(exports.args.shift());    
		}                                               

		//emit all the arguments
		if(exports.args.length > 0)
		{               
			var handler = argHandlers[exports.args[0]];
			                                        
			if(handler)
			{     
				exports.args.shift();                                        
				handler.callback(); 				
				if(handler.autoNext) next();
			}       
		}
	}
	
	start();
} 

exports.openHelp = function(filePath)
{
	var helpTxt = fs.readFileSync(filePath,'utf8'),
				coloredText;
			
			//colored text
			while(coloredText = helpTxt.match(/<(.*?)>([\w\W]*?)<\/\1>/))
			{
				var colorAttrs = coloredText[1].split(' '),
					text = coloredText[2];
					
				colorAttrs.forEach(function (attr)
				{
					text = text[attr];
				});
					
				helpTxt = helpTxt.replace(coloredText[0],text);
			}
			
	console.log(helpTxt);
}


exports.confirm = function(message, yesCallback, noCallback)
{
	process.stdout.write(message + ' (y/n): ');
	
	next(function(answer)
	{
		if (answer == 'y' || answer == 'yes') {
			yesCallback();
		}else
		if(noCallback) 
		{
			noCallback();
		}
	})	
}

function executeArgv()
{
	process.argv.shift();
	process.argv.shift();
	execute(process.argv);
}             