var lazyCallback = require('sk/core/lazy').callback,
nodefs = require('node-fs'),
fs = require('fs'),
ini = require('ini'),
Structr = require('structr');

function flatten(config, key, settings)
{
	for(var property in config)
	{
		var value = config[property],
		pk = key + ':' + property;
		
		if(typeof value == 'object')
		{
			flatten(value, pk, settings);
		}
		else
		{
			settings.push(config);
			config._id = key;
			break;
		}
	}
}


function readIni(source)
{
	var config = ini.parse(source);
	
	var flattened = [];
	
	for(var property in config)
	{
		flatten(config[property], property, flattened);
	}
	
	return flattened;
}

function stringifyIni(settings)
{
	var tree = {};
	
	for(var i = settings.length; i--;)
	{
		var setting = Structr.copy(settings[i]),
		_path = setting._id.split(':');
		
		delete setting._id;
		
		var currTree = tree, pathName;
		
		for(var j = 0, jn = _path.length; j < jn; j++)
		{
			pathName = _path[j];
			
			if(!currTree[pathName]) currTree[pathName] = {};
			
			currTree = currTree[pathName];
		}
		
		Structr.copy(setting, currTree);
	}
	
	
	return ini.stringify(tree);
}


exports.db = function(db, outputDir)
{

    try
    {
        nodefs.mkdirSync(outputDir, 0755, true);
    }
    catch(e)
    {
    }
    
    db.addListener('collection', function(collection)
    {
	
		var fileName = collection.fileName || collection.name + '.ini';
	
        var output = outputDir + '/'+ fileName;
        
        
        var saveNow = function()
        {

            fs.writeFileSync(output, stringifyIni(collection.objects()));
        }
        
        try
        {
            collection.objects(readIni(fs.readFileSync(output,'utf8')));
        }
        catch(e)
        {
        }
        
        var save = lazyCallback(saveNow, 50);
        
        collection.addListener("insert", save);
        collection.addListener("remove", save);
        collection.addListener("update", save);
        //collection.addListener("findOne", save);
    });
}