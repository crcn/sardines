var sk = require('./struct');

exports.Janitor = sk.Structr({
	
	/**
	 */
	
	'__construct': function()
	{
		this.dispose();
	},
	
	/**
	 * adds an item which can be disposed of later
	 */
	
	'addDisposable': function()
	{
		var args = arguments[0] instanceof Array ? arguments[0] : arguments;
		
		for(var i = args.length; i--;)
		{
			var target = args[i];
			
//			console.log(target)
			if(target && target['dispose'])
			{
				this.disposables.push(target);
			}
		}
	},
	
	/**
	 * disposes all disposables
	 */
	
	'dispose': function()
	{
		if(this.disposables)
		for(var i = this.disposables.length; i--;)
		{
			this.disposables[i].dispose();
		}
		
		this.disposables = [];
	}
});
