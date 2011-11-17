require('./sk');

function getFrequency(values)
{  
	if(values.length < 2) return 0;
	
	//sort from least to highest since we're going backwards
	values.sort(function(a,b)
	{
		return a-b;
	})
	
	//taken from: http://home.ubalt.edu/ntsbarsh/Business-stat/otherapplets/Outlier.htm
	//check out: http://www.itl.nist.gov/div898/handbook/prc/section1/prc16.htm
	//http://home.comcast.net/~mark.paulk/papers/p2009a.pdf

	var E = values.length-1,
	NX    = E, //we need to substract one since we're looking at everything inbetween the numbers
	SUMX  = 0.0,
	xval  = new Array(),
	lastNum = values[E-1];
	
	for(var i = E-1; i--;)
	{
		var num = values[i];
		SUMX += (xval[i] = lastNum - num);
		lastNum = num;
	}	
	E--;

	var meanX = SUMX/NX,
	VX = 0.0;
	//calculate the variance
	for(i = 0; i < E; i++)
	VX += Math.pow(xval[i]-meanX,2);
	
	var VX1 = VX/NX,
	stdX = Math.sqrt(VX1),
	zxval = new Array(E);
	
	//standardize
	for(i = 0; i < E; i++)
	zxval[i] = (xval[i] - meanX) / stdX;
	

	//find the outliers, and skip them
	var sum = 0,
	n = 0;
	for(i = 0; i < E; i++)
	{
		//skip the outliers
		if((zxval[i] > -2.5) && (zxval[i] < 2.5))
		{
			sum += xval[i];
			n++;
		}
	}
	return (sum/n) || 0;
}

function getAverage(numbers,n)
{
	//use: getAverage(getTotal(numbers),numbers.length);
	if(n) return numbers/n;
	
	
	return getTOtal(numbers)/numbers.length;
}

function getTotal(numbers)
{
	var total = 0;
	
	for(var i = numbers.length; i--;)
	{
		total += numbers[i];
	}
	return total;
}


exports.getFrequency = getFrequency;
exports.getAverage = getAverage;
exports.getTotal = getTotal;
