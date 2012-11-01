var Structr = require('structr'),
cashew = require('cashew'),
sift = require('sift'),
utils = require('./utils'),
Indexes = require('./index'),
EventEmitter = require('sk/core/events').EventEmitter,
Janitor = require('sk/core/garbage').Janitor;
modelFactory = require('./model');



module.exports = EventEmitter.extend({
	
	/**
	 */

	'override __construct': function(db, opsOrName)
	{
		var ops = {};
		
		if(typeof opsOrName == 'string')
		{
			ops.name = opsOrName;
		}
		else
		{
			ops = opsOrName;
		}
		
        this._super();
		this.name = ops.name;
		this.db = db;
		
		//optional
		this.fileName = ops.file;

		this._each = db.async ? utils.eachAsync : utils.each;
        
		this.idGen = cashew.register(ops.name);
		
		
		//model rep for collection - much cleaner
		if(ops.model)
		{
			this.model = modelFactory(this).extend(ops.model);
		}
		

		//the database
		this._objects = [];
		this._indexes = new Indexes();
	},

    /**
     */
     
    'ensureIndex': function(name)
    {
        this._indexes.ensure(name, this._objects);    
    },
    
    /**
     */
     
    'on': function(listeners)
    {
        var jan = new Janitor();
        
        for(var type in listeners)
        {
            jan.addDisposable(this.on(type, listeners[type]));
        };
        
        return jan;
    },
    
    /**
     */
     
    'second on': function(event, callback)
    {
        return this.addListener(event, callback);
    },

	/**
	 */

	'insert': function(objects, callback)
	{
		if(!callback) callback = function(){};
		if(!(objects instanceof Array)) objects = [objects];

		var numInserting = objects.length, self = this,
		inserted = [],
		err;
        

		this._each(objects, function(item, index)
		{
			if(err) return;

			if(!item)
            {
                self.emit('insert', inserted);
                return callback(false, inserted);
            }

			var id = item._id = item._id || self._newId();


			//make sure there's no overlap
			if(!self._indexes.add(item))
			{
				//console.warn('Item ID %s already exists. Cannot insert item.', item._id);
				err = true;
				return callback('Cannot insert');
			}


			self._objects.push(item);
			inserted.push(item);
		});
	},

	/**
	 */

	'remove': function(query, callback)
	{
		if(!callback) callback = function(){};
		var self = this,
		stmt = sift(query),
        removed = [];


		this._each(this._objects, function(item, index)
		{
			if(!item)
            {
                self.emit('remove', removed);
                return callback(false, removed);
            }

			if(stmt.test(item))
			{
				self._indexes.remove(item);
				self._objects.splice(index, 1);
				removed.push(item);
			}
		});	
	},

	/**
	 */

	'update': function(query, update, ops, callback)
	{

		if(typeof ops == 'function')
		{
			callback = ops;
			ops = {};
		}

		if(!callback) callback = function(){};            
		if(!ops) ops = {};
		
		var self = this,
        updates = [];

		this.find(query, function(err, items)
		{
			if(!items || !items.length) 
            {
            	if(ops.upsert)
            	{
            		return self.insert(self._update(query, update), callback);
            	}

                self.emit('update', updates);
                return callback(err, updates);
            }

			self._each(items, function(item, index)
			{

				if(!item)
				{
					self.emit('update', updates);
					return callback(false, updates);
				}

				self._indexes.remove(item);

				var updated = self._update(item, update);


				if(!self._indexes.add(item))
				{
				   // console.warn('Cannot update item because there\'s overlap with an ensured index.');
					return;
				}


				Structr.copy(updated, item, true);

				updates.push(item);
			});
		})	
	},

	/**
	 */

	'_update': function(item, update)
	{
		//need to make sure there's no overlap
		var updated = Structr.copy(item, true);

		if(update.$set)
		{
			Structr.copy(update.$set, updated, true);
		}

		return updated;
	},

	/**
	 */

	'objects': function(value)
	{
		if(!arguments.length) return this._objects;

		this._objects = value || [];
                                   
		//need to store the indexes 
		for(var i = value.length; i--;)
		{
			this._indexes.add(value[i]);
		}
	},

	/**
	 */

	'override emit': function(type, data)
	{
		this._super(type, data);
		this._super('change', data);
	},

	/**
	 */

	'all': function(callback)
	{
		callback(false, this._objects.concat());
	},
    

	/**
	 */

	'find': function(query, ops, callback)
	{
		if(!callback)
		{
			callback = ops;
			ops = {};
		}


		var stmt = sift(query),
		found = [], self = this;

		this._each(this._objects, function(item)
		{
			if(!item)
			{
				if(ops.sort)
				{
					var desc;

					for(var field in ops.sort)
					{
						desc = (ops.sort[field] == 'desc') || (ops.sort[field] == -1);
						 
						found.sort(function(a, b)
						{
							return (a[field] > b[field]) == desc ? -1 : 1;
						});
					}
				}

				return callback(false, found);
			}

			if(stmt.test(item))
			{
				found.push(self._item(item, ops));
			}
		});

	},

	/**
	 */

	'findOne': function(query, ops, callback)
	{
		if(!callback)
		{
			callback = ops;
			ops = {};
		}

		var stmt = sift(query), self = this;

		this._each(this._objects, function(item)
		{
			if(!item) return callback(false, null);

			if(stmt.test(item))
			{
				callback(false, self._item(item, ops));
				return false;
			}
		});	
	},
    

	/**
	 */

	'_item': function(item, ops)
	{
		var copy = { _id: item._id };

		//return only public fields
		if(ops.fields)
		{
			for(var i in ops.fields)
			{
				copy[i] = item[i];
			}
		}
		else
		{
			copy = item;
		}


		return copy;
	},

	/**
	 */

	'_newId': function()
	{
		return this.idGen.uid();
	}
})