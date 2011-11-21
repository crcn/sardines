Array.prototype.forEach = function(callback) {
	for(var i = this.length; i--;) {
		callback(this[i], i);
	}
}