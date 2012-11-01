var Model = require('malt').models.Model;


module.exports = function(collection)
{
	
	return Model.extend({
		
		/**
		 */
		
		'collection': collection,
		
		/**
		 */
		
		'isNew': function()
		{
			return !this.doc._id;
		},
		
		
		/**
		 * saves the model IF there are updates
		 */
		
		'save': function(callback)
		{
			//no updates
			if(!this._hasUpdates) return;
			
			if(!callback) callback = function(){};
			
			var self = this;
			
			if(!this.isNew())
			{
				collection.update({ _id: this.doc._id }, { $set: this.doc }, { upsert: true }, function(err, response)
				{
					callback(err, self);
				});
			}
			
			//IS new - insert.
			else
			{
				collection.insert(this.doc, function(err, results)
				{
					if(err) return callback(err);
					
					self._id = results[0]._id;
					
					callback(err, self);
				})
			}
 		},

		/**
		 */
		
		'remove': function(callback)
		{
			//must have an identifier to remove from db
			if(this.isNew()) return;
			
			var self = this;
			
			collection.remove({ _id: this.doc._id }, function(err, result)
			{
				if(callback) callback(err, self);
			});
		},
		

		/**
		 * called when any data has changed in the object (by malt)
		 */

		'override _update': function()
		{
			this._super();
			
			this._hasUpdates = true;
		},
		
		/**
		 * finds data based on the query given, and returns the data
		 * as the given model
		 */
		
		'static find': function(query, callback)
		{
			var Model = this;
			
			
			collection.find(query, function(err, results)
			{
				if(!err)
				for(var i = results.length; i--;)
				{
					results[i] = new Model(results[i]);
				}
				
				callback(err, results || []);
			});
		},
		
		/**
		 * finds one result based on the the params given.
		 */
		
		'static findOne': function(query, callback)
		{
			var Model = this;
			
			collection.findOne(query, function(err, result)
			{
				callback(err, err ? null : ( result ? new Model(result) : null));
			})
		}
	});
}

