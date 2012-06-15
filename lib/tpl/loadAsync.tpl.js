(function() {

	var _loadQueue = [], 
	_loadingScripts = false;

	/**
	 * loads a script asynchronously.
	 */

	function loadScriptAsync(path, onload) {
		var script = document.createElement("script");
	    script.type = "text/javascript";
	    script.src = path;
	    script.onload = onload;
	    document.getElementsByTagName('head')[0].appendChild(script);
	}


	/**
	 * loads an entire application 
	 */

	function loadAsync(fullPath, alias) {

		var cwd = _sardines.dirname(alias);


		_loadQueue.push(function() {

			//make sure the module isn't already loaded
			if(_sardines.modules[alias]) {
				return loadNextScript();
			}

			console.log(">> async load %s", fullPath);


			_loadingScripts = true;
			window.module = {
				exports: { }
			};

			window.exports = window.module.exports;


			var __dirname  = window.__dirname  = cwd;
			var __filename = window.__filename = alias;

			window.require = function(path) {
				return _sardines.require(path, cwd);
			}

			loadScriptAsync(fullPath, function() {
				_sardines.modules[alias] = window.module.exports;
				loadNextScript();
			});
		});

		if(!_loadingScripts) {
			_loadQueue.shift()();
		}
	}

	function loadNextScript() {
		var next = _loadQueue.shift();
		if(next) {
			next();
		} else {
			_loadingScripts = false;
		}
	}

	function onLoad(next) {

		_loadQueue.push(function(nx) {
			next();
			nx();
		})
	}


	_sardines.requireAsync = loadAsync;
	_sardines.onAsyncLoad = onLoad;

})();