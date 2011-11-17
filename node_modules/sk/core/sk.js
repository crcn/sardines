
//IE
if(!Array.prototype.indexOf)
{      
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
}
//Spice Kit! Let's make 'em plugabble babby.

if(this.window && !window.console)
{                         
	var console = {log:function(){}}  
}
    
//le NAMESPACE
var	sk = { };
