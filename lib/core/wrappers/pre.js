
if(!Array.prototype.forEach) Array.prototype.forEach = function(callback) {
	for(var i = 0, n = this.length; i < n; i++) {
		callback(this[i], i);
	}
}

if(!Object.keys) Object.keys = function(obj) {
	var keys = [];
	for(var key in obj) {
		keys.push(key);
	}
	return keys;
}


if(!Date.now) Date.now = function() {
	return new Date().getTime();
}


if(!Array.isArray) Array.isArray = function(target) {
	return target instanceof Array;
}

