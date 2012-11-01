

//async
exports.eachAsync = function(items, callback)
{
    var i = n = items.length;
    
    
    (function next(item)
    {
        //look for -1
        if(i+1)
        {
            if(callback(items[i], i, n) === false) return;
        }
        else
        {
            callback();
            return;
        }
        
        i--;
        
        process.nextTick(next);
    })();
    
    
}; 


exports.each = function(items, callback)
{
    var i = n = items.length;
        
    for(; i--;)
    {
        if(callback(items[i], i, n) == false) return;
    }
    
    callback();
}