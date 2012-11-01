Vine -  JSON Message builder           
============================

What's this?
------------

Just a small utility to help build consistent JSON messages, usually for API's.

Why?
----

Consistency. It's also cleaner, and easier to maintain. 


Where should I use this?
------------------------

	- API
	- nice replacement for callback(err, result);

Code Usage:
-----------


```javascript

var vine = require('vine');


var data = vine.message('hello %s %s','craig','condon').

error('this is an error').

warning('this is a warning').

//time to cache this response
ttl(5).

//result data = success
result({data:'and this is some data'});


console.log(data.data); 

/* output:


	{ message: 'hello craig condon',
	  errors: [ { message: 'this is an error' } ],
	  warnings: [ { message: 'this is a warning' } ],
	  ttl: 5,
	  result: { data: 'and this is some data' } }
	
*/

```

	
To Do: 
------

- code != clean
	