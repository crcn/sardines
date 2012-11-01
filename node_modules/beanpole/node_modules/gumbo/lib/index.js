var Database = require('./core/database');

exports.db = function(ops)
{
	return new Database(ops);
}