exports.array = 
{
	indexOf: function(stack, item)
	{
		if(stack.indexOf) return stack.indexOf(item);
		
		for(var i = stack.length; i--;)
		{
			if(stack[i] == item) return i;
		}
	}
}
