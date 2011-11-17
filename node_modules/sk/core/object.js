require('./sk');

exports.object = {

	references:[]
	//methods-----------------------------------------------------------------------------------------------

	,clone:function(target,shallow,isDeep,name)
	{                          
		var copy,i;
		if(!target)
		{
			return target;
		}          
		if(target instanceof Array)
		{
			copy = [];

			for(i in target)
			{
				copy.push(shallow && isDeep ? target[i] : this.clone(target[i],shallow,true,i));
			} 
			return copy;
		}                           
		else
		if(typeof(target) == 'object' && (i = this.references.indexOf(target)) == -1)
		{       

			this.references.push(target);

			var clazz = target.constructor;

			copy = new clazz();

			for(var i in target)
			{        

				//this is a small safe-guard against circular references
				if(target == target[i])
				continue; 

				var val = target[i];

				if((!shallow || !isDeep) && typeof(target) == 'object')
				{

					val = this.clone(val,shallow,true,i);

					if(val === false)
					{
						throw new Error("circular reference detected starting from property \""+i+"\".");
					}
				}
				copy[i] = val;    
			}

			this.references.splice(i,1);
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


	,copyTo:function(from,target,override)
	{
		for(var property in from)
		{                      

			var toValue = target[property],
			copy;

			if(toValue == undefined || override) 
			{                   
				copy = this.clone(from[property],true,true,property);   
			}     
			else
			{	
				copy = toValue;
			}            

			target[property] = copy;
		}    

		return target;
	}
	,forEach:function(array,callback,isArray)
	{   
		if(!array)
		return;

		if(array instanceof Array || isArray)
		{            
			for(var i = 0, n = array.length; i < n; i++)
			callback(array[i],i);
		}
		else
		if(array instanceof Object)
		{
			for(var i in array)
			callback(array[i],i);
		}
	}

}