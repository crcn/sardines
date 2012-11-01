var Mongo = require('../db/mongo').Mongo,
	smart = require('../../core/smart').smart,
	math = require('../../core/math'), 
	getFrequency = math.getFrequency,
	getAverage = math.getAverage,
	getTotal = math.getTotal;


var sdb = new Mongo('statistics');


/*

tp = type
v = value
i = index
cf = count frequency
rf  = record frequency
sum = total
avg = average
ca = createdAt
pc = percent       
gt = growth trend by N / hour

*/

// exports.collection = 

var StatCollection = function(name,parent)
{
	
	var self = this,
		frequencies = [
			{type:'hour'}
			,{type:'day'}
			,{type:'month'}
			,{type:'year'}
		],
		children = {};
					
	
	//this collection name
	var collectionName = this.collectionName = (parent.collectionName ? parent.collectionName+'.' : '')+'collection.'+name.replace(/\s+/g,''),
	
	//the raw records which are to be dumped in detailed, and summary after reduction
	c_recordings = sdb.collection(collectionName+'.records'),
	
	//statistics on a time-based level. used for fine tuning the server and prioritizing actions at different times of the days
	c_horizontal = sdb.collection(collectionName+'.horizontal');
	
	//general analytics, and statistics on an hourly, daily, and monthly time-base
	c_vertical = sdb.collection(collectionName+'.vertical'),
	                                                        
	//combined child statistics. Example would be "total likes", and "total likes for each service"
	c_children = sdb.collection(collectionName+'.children');
	
	this.recordFrequency = 1000*60*10; // every N minutes
	
	
	//records an action
	this.record = function(value, total)
	{
		
		//we're not doing anything with this now
		return;
		
		
		if(value)
		c_recordings.insert({v:value.toString(),sum:total || 1,ca:new Date().getTime()/1000},function(err,item){});    
		return this;
	}
	
	
	//the current statistic for the hour
	this.current =
	{
		hour:_findHorStatPartial('hour')
		,day:_findHorStatPartial('day')
		,month:_findHorStatPartial('month')
		,year:_findHorStatPartial('year')
	}
	
	//returns the rang
	this.horizontal =
	{
		hourly:_findHorStatPartial('hour')
		,daily:_findHorStatPartial('day')
		,monthly:_findHorStatPartial('month')
		,yearly:_findHorStatPartial('year')
	}
	
	
	function _findCurrentHorStatPartial(type)
	{
		return function(key,callback)
		{
			findCurrentHorizontalStatistic(type,key,callback);
		}
	}
	
	function _findHorStatPartial(type)
	{
		return function(key,callback)
		{
			findHorizontalStatistics(type,key,callback);
		}
	}
	
	
	//the collection
	this.child = function(name)
	{        
		return children[name] || (children[name] = new StatCollection(name,this));
	}
	
	
	function getNextTime(type)
	{
		return getCurrentTime(type,1);
	}
	
	function getCurrentTime(type,offset)
	{
		offset = offset || 0;

		var now = new Date(),
			index = 0;
			
		now.setSeconds(0,0);
		
		switch(type)
		{
			case 'hour':
			now.setHours(now.getHours()+offset,0,0);
			index = now.getHours();
			break;
			case 'day':
			now.setHours(0,0,0);
			now.setDate(now.getDate()+offset);
			index = now.getDate();
			break;
			case 'month':
			now.setHours(0,0,0);
			now.setMonth(now.getMonth()+offset,0);
			index = now.getMonth();
			break;
			case 'year':
			now.setHours(0,0,0);
			now.setFullYear(now.getFullYear()+offset,0,0);
			index= now.getYear();
			break;
		}
		return {time:now.getTime(),index:index};
	}
	
	
	function findCurrentHorizontalStatistic(type,value,callback)
	{
		var time = getNextTime(type);
		
		c_horizontal.findOne({tp:type,i:time.index,v:value.toString()},function(err,item)
		{
			callback(item);
		});
	}
	
	function findHorizontalStatistics(type,value,callback)
	{
		c_horizontal.findOne({tp:type,v:value.toString()},function(err,cursor)
		{
			cursor.toArray(function(err,stack)
			{
				callback(stack);
			})
		})
	}
	
	function getStatCalculations(rawStatistics)
	{
		var stats = [],
			grandTotal = 0;
		
		for(var value in rawStatistics)
		{
			var st = rawStatistics[value],
			                                 
				counts = st.counts,
				
				//the creations collection containing when items were recorded hourly, daily, monthly, yearly
				creations = st.creations,
				
				//the frequency between the count items, removing outliers
				countFrequency = getFrequency(counts),
				
				//the frequency between how often an item is recorded
				recordFrequency = getFrequency(creations)*1000,
				
				//the total count given for the item
				total = getTotal(counts),
				
				//the average count
				average = total/counts.length;
				
			grandTotal += total;
			
			stats.push({v:value
				,rf:recordFrequency || st.rf
				,cf:countFrequency || st.cf
				,sum:total
				,avg:average})
		}
		
		for(var i = stats.length; i--;)
		{
			var stat = stats[i];
			
			//percent of pie for given item in the entire collection
			stat.pc = total/grandTotal;
		}
		
		return stats;
	}
	
	function findVerticalStatistics(collection,search,ops,callback)
	{
		if(!callback)
		{
			callback = ops;
			ops = {};
		}
		
		var rawStatistics = {};
		
		collection.find(search,ops,function(err,cursor)
		{
			cursor.each(function(err,item)
			{

				//no item? we're done here.
				if(!item) return callback(rawStatistics);

				//get the raw statistics collection
				var stats = rawStatistics[item.v] || (rawStatistics[item.v] = {counts:[],creations:[]});
				
				//then add the little bugger
				stats.counts.push(item.sum);
				stats.creations.push(item.ca);
				
				//shouldn't be needed unless there's only on erecord. 
				if(item.rf) stats.rf = item.rf;
				if(item.cf) stats.cf = item.cf;
			})
		})
	}
	
	
	frequencies.forEach(function(frequency,index)
	{
		//the previous frequency is required for the next reduction
		var previousFrequency = index ? frequencies[index-1] : null,
			frequencyType = frequency.type;
		
		function reduceDetailed()
		{
			timeoutReduction();
			
			var searchPrevious = {},
			
				//the collection we're gonna reduce
				reduceCollection,
				
				//NEXT hour,day,month,year
				nextTime = getNextTime(frequencyType),
				
				//THIS hour,day,month,year
				currentTime = getCurrentTime(frequencyType).time;
				
			
			
			//first item? reduce the recorded items.
			if(!index)
			{
				reduceCollection = c_recordings;
				
				//only dump the collection if the items are older than the current hour AND, this is the first index, meaning
				//we're pulling live stuff
				c_recordings.remove({ca:{$lt:currentTime/1000}},function(){});
			}
			else
			{
				
				//look to reduce the previous item year > month > day > hour
				searchPrevious.tp = previousFrequency.type;
				
				//look for items after the current date
				searchPrevious.ca = {$gt:currentTime/1000};
				
				//set the reduction to the summary of everything
				reduceCollection = c_vertical;
			}
			
			//calculates statistics based on the time of day, and averages based on all days combined
			//starting from the beginning
			function calculateHorizontalStatistics(rawStatistics)
			{
				
				//calculate the horizontal statistics
				var stats = getStatCalculations(rawStatistics);
				
				stats.forEach(function(stat)
				{
					c_horizontal.update({tp:frequencyType,v:stat.v,i:nextTime.index},{$set:stat},{upsert:true},function()
					{
						//done
					});
				});
				
			}
			
			
			//calculates data based on the previous set day -> hours summary
			function calculateVerticalStatistics(rawStatistics)
			{
				var stats = getStatCalculations(rawStatistics);
				
				var i = 0;
				stats.forEach(function(stat)
				{
					stat.i = nextTime.index;
					
					//let's update the statistics with the new shit
					c_vertical.update({ca:nextTime.time/1000,tp:frequencyType,v:stat.v},{$set:stat},{upsert:true},function()
					{
						
						//let's calculate the frequency on the given time of day
						findVerticalStatistics(c_vertical,{tp:frequencyType,i:nextTime.index},{limit:10,sort:[['ca',-1]]},calculateHorizontalStatistics);
					})
				})
			}
			
			findVerticalStatistics(reduceCollection,searchPrevious,calculateVerticalStatistics);
		}
		
		
				
		function timeoutReduction()
		{
			return;
			//timeout again
			smart.timeout(reduceDetailed,Math.max(self.recordFrequency,index*3600));
		}
		
		
		//slow down the reduction the older it is. 1 year / 4 hours to reduction, or w/e
	});
}


exports.collection = function(name)
{
	return new StatCollection(name,{});
}