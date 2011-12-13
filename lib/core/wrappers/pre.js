Array.prototype.forEach = function(callback) {
	for(var i = 0, n = this.length; i < n; i++) {
		callback(this[i], i);
	}
}