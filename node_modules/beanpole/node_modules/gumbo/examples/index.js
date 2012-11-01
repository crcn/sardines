var gumbo = require('../lib/index'),
col = gumbo.db({ async: false, persist: { 'fs': __dirname + '/data/' } }).collection('google');


for(var i = 100; i--;)
{
    col.insert({ name: 'craig', age: i }, function(){});
}



col.findOne({ name: 'craig', age: {$gt: 90 } }, function(err, item)
{
console.log(item);
});

gumbo.db().collection('google').find({ name: 'craig' }, function()
{
});