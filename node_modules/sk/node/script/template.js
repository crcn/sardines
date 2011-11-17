//compiles code based on a base javascript template, or set of templates.


function compile(template,args)
{                                                               
	
	var output = {},
	tplStr = template.toString().
			 replace(/function\s+\w+/,' var func = function');
                       
	for(var i in args)
	{
		tplStr = tplStr.replace(new RegExp('\\$'+i,'ig'),args[i]);               
	}      	                    
	
	eval(tplStr);
	      
	                              
    return func;
}   



exports.compile = compile;