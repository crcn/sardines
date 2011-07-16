require('./sk');

exports.str = {
	elipsis: function(str, maxChars, maxWords)
	{
		if(str.length > maxChars)
		{
			var shorter = str

			if(maxWords)
			{     
				var words = shorter.split(' ');

				if(words.length > maxWords)
				{
					shorter = words.splice(0, maxWords).join(' ') + '...';
				} 
			}  
			else
			{
            	shorter = shorter.substr(0, maxChars) + '...';
			}      
			
			return shorter;
		}

		return str;
	},
	capitalizeFirstLetter: function(str)
	{
		return str.substr(0,1).toUpperCase() + str.slice(1);
	} 
}