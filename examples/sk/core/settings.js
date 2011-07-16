/**
 * reads the properties as metadata and saves / gets accordingly using cookies. MMmmmm cookies...
 */
 
sk.SettingManager = {
	serializables: {},
    'apply': function(target, directory)
    {
        if(!directory) directory = '';
        
        var props = Bindable.apply(target, null, 'setting').properties;
        
        for(var i = props.length; i--;)
        {
            var prop = props[i],
                v = target[prop];
                
            var stored = sk.cookies.get(directory+'/'+prop);      
            
            this.watch(target, prop, directory);
			
            if(stored)
            {
				var newValue = stored.data;
				
				if(stored.type)
				{
					var clazz = sk.SettingManager.serializables[stored.type];
					
					if(clazz)
					{
						newValue = new clazz();
						newValue.fromJSON(stored.data, target)
					}
					else
					{
						console.warn('remote class ' + stored.type + ' does not exist.');
					}	
				}
				
                v(newValue);
            }
        }
    },
    'watch': function(target, property, directory)
    {                                   
        target[property].subscribe(function(data)
        {                
			var v = { data: data };
			if (data) 
			{	
				var remoteName = data.__proto__.remoteName;
				v.type = remoteName;
			}
			
            sk.cookies.set(directory+'/'+property, v);
        });
    }
}



sk.Serializable = function(remoteName, target)
{
	var clazz = sk.SettingManager.serializables[remoteName] = Structr(target);
	clazz.prototype.remoteName = remoteName;
	return clazz;
}



