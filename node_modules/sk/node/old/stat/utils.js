
var record = function()
{
	var start = new Date().getTime();
	
	return {
		stop:function()
		{
			return new Date().getTime()-start;
		}
	}
}

exports.record = record;


