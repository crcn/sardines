var sard = {} 
sard.module0 = {}; 
/*!
 * jQuery JavaScript Library v1.5.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Wed Feb 23 13:55:29 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// (both of which we optimize for)
	quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Check for digits
	rdigit = /\d/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// Has the ready events already been bound?
	readyBound = false,

	// The deferred used on DOM ready
	readyList,

	// Promise methods
	promiseMethods = "then done fail isResolved isRejected promise".split( " " ),

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = "body";
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = (context ? context.ownerDocument || context : document);

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return (context || rootjQuery).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.5.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.done( fn );

		return this;
	},

	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, +i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {
		// A third-party is pushing the ready event forwards
		if ( wait === true ) {
			jQuery.readyWait--;
		}

		// Make sure that the DOM is not already loaded
		if ( !jQuery.readyWait || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).unbind( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyBound ) {
			return;
		}

		readyBound = true;

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent("onreadystatechange", DOMContentLoaded);

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNaN: function( obj ) {
		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Not own constructor property must be Object
		if ( obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw msg;
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test(data.replace(rvalidescape, "@")
			.replace(rvalidtokens, "]")
			.replace(rvalidbraces, "")) ) {

			// Try to use the native JSON parser first
			return window.JSON && window.JSON.parse ?
				window.JSON.parse( data ) :
				(new Function("return " + data))();

		} else {
			jQuery.error( "Invalid JSON: " + data );
		}
	},

	// Cross-browser xml parsing
	// (xml & tmp used internally)
	parseXML: function( data , xml , tmp ) {

		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}

		tmp = xml.documentElement;

		if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
			jQuery.error( "Invalid XML: " + data );
		}

		return xml;
	},

	noop: function() {},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		if ( data && rnotwhite.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement,
				script = document.createElement( "script" );

			if ( jQuery.support.scriptEval() ) {
				script.appendChild( document.createTextNode( data ) );
			} else {
				script.text = data;
			}

			// Use insertBefore instead of appendChild to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction(object);

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type(array);

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array ) {
		if ( array.indexOf ) {
			return array.indexOf( elem );
		}

		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var ret = [], value;

		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			value = callback( elems[ i ], i, arg );

			if ( value != null ) {
				ret[ ret.length ] = value;
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	proxy: function( fn, proxy, thisObject ) {
		if ( arguments.length === 2 ) {
			if ( typeof proxy === "string" ) {
				thisObject = fn;
				fn = thisObject[ proxy ];
				proxy = undefined;

			} else if ( proxy && !jQuery.isFunction( proxy ) ) {
				thisObject = proxy;
				proxy = undefined;
			}
		}

		if ( !proxy && fn ) {
			proxy = function() {
				return fn.apply( thisObject || this, arguments );
			};
		}

		// Set the guid of unique handler to the same of original handler, so it can be removed
		if ( fn ) {
			proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
		}

		// So proxy can be declared as an argument
		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can be optionally by executed if its a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return (new Date()).getTime();
	},

	// Create a simple deferred (one callbacks list)
	_Deferred: function() {
		var // callbacks list
			callbacks = [],
			// stored [ context , args ]
			fired,
			// to avoid firing when already doing so
			firing,
			// flag to know if the deferred has been cancelled
			cancelled,
			// the deferred itself
			deferred  = {

				// done( f1, f2, ...)
				done: function() {
					if ( !cancelled ) {
						var args = arguments,
							i,
							length,
							elem,
							type,
							_fired;
						if ( fired ) {
							_fired = fired;
							fired = 0;
						}
						for ( i = 0, length = args.length; i < length; i++ ) {
							elem = args[ i ];
							type = jQuery.type( elem );
							if ( type === "array" ) {
								deferred.done.apply( deferred, elem );
							} else if ( type === "function" ) {
								callbacks.push( elem );
							}
						}
						if ( _fired ) {
							deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
						}
					}
					return this;
				},

				// resolve with given context and args
				resolveWith: function( context, args ) {
					if ( !cancelled && !fired && !firing ) {
						firing = 1;
						try {
							while( callbacks[ 0 ] ) {
								callbacks.shift().apply( context, args );
							}
						}
						// We have to add a catch block for
						// IE prior to 8 or else the finally
						// block will never get executed
						catch (e) {
							throw e;
						}
						finally {
							fired = [ context, args ];
							firing = 0;
						}
					}
					return this;
				},

				// resolve with this as context and given arguments
				resolve: function() {
					deferred.resolveWith( jQuery.isFunction( this.promise ) ? this.promise() : this, arguments );
					return this;
				},

				// Has this deferred been resolved?
				isResolved: function() {
					return !!( firing || fired );
				},

				// Cancel
				cancel: function() {
					cancelled = 1;
					callbacks = [];
					return this;
				}
			};

		return deferred;
	},

	// Full fledged deferred (two callbacks list)
	Deferred: function( func ) {
		var deferred = jQuery._Deferred(),
			failDeferred = jQuery._Deferred(),
			promise;
		// Add errorDeferred methods, then and promise
		jQuery.extend( deferred, {
			then: function( doneCallbacks, failCallbacks ) {
				deferred.done( doneCallbacks ).fail( failCallbacks );
				return this;
			},
			fail: failDeferred.done,
			rejectWith: failDeferred.resolveWith,
			reject: failDeferred.resolve,
			isRejected: failDeferred.isResolved,
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
			promise: function( obj ) {
				if ( obj == null ) {
					if ( promise ) {
						return promise;
					}
					promise = obj = {};
				}
				var i = promiseMethods.length;
				while( i-- ) {
					obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
				}
				return obj;
			}
		} );
		// Make sure only one callback list will be used
		deferred.done( failDeferred.cancel ).fail( deferred.cancel );
		// Unexpose cancel
		delete deferred.cancel;
		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}
		return deferred;
	},

	// Deferred helper
	when: function( object ) {
		var lastIndex = arguments.length,
			deferred = lastIndex <= 1 && object && jQuery.isFunction( object.promise ) ?
				object :
				jQuery.Deferred(),
			promise = deferred.promise();

		if ( lastIndex > 1 ) {
			var array = slice.call( arguments, 0 ),
				count = lastIndex,
				iCallback = function( index ) {
					return function( value ) {
						array[ index ] = arguments.length > 1 ? slice.call( arguments, 0 ) : value;
						if ( !( --count ) ) {
							deferred.resolveWith( promise, array );
						}
					};
				};
			while( ( lastIndex-- ) ) {
				object = array[ lastIndex ];
				if ( object && jQuery.isFunction( object.promise ) ) {
					object.promise().then( iCallback(lastIndex), deferred.reject );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( promise, array );
			}
		} else if ( deferred !== object ) {
			deferred.resolve( object );
		}
		return promise;
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySubclass( selector, context ) {
			return new jQuerySubclass.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySubclass, this );
		jQuerySubclass.superclass = this;
		jQuerySubclass.fn = jQuerySubclass.prototype = this();
		jQuerySubclass.fn.constructor = jQuerySubclass;
		jQuerySubclass.subclass = this.subclass;
		jQuerySubclass.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySubclass) ) {
				context = jQuerySubclass(context);
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySubclass );
		};
		jQuerySubclass.fn.init.prototype = jQuerySubclass.fn;
		var rootjQuerySubclass = jQuerySubclass(document);
		return jQuerySubclass;
	},

	browser: {}
});

// Create readyList deferred
readyList = jQuery._Deferred();

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

if ( indexOf ) {
	jQuery.inArray = function( elem, array ) {
		return indexOf.call( array, elem );
	};
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

// Expose jQuery to the global object
return jQuery;

})();


(function() {

	jQuery.support = {};

	var div = document.createElement("div");

	div.style.display = "none";
	div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	var all = div.getElementsByTagName("*"),
		a = div.getElementsByTagName("a")[0],
		select = document.createElement("select"),
		opt = select.appendChild( document.createElement("option") ),
		input = div.getElementsByTagName("input")[0];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return;
	}

	jQuery.support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText insted)
		style: /red/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55$/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: input.value === "on",

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Will be defined later
		deleteExpando: true,
		optDisabled: false,
		checkClone: false,
		noCloneEvent: true,
		noCloneChecked: true,
		boxModel: null,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableHiddenOffsets: true
	};

	input.checked = true;
	jQuery.support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as diabled)
	select.disabled = true;
	jQuery.support.optDisabled = !opt.disabled;

	var _scriptEval = null;
	jQuery.support.scriptEval = function() {
		if ( _scriptEval === null ) {
			var root = document.documentElement,
				script = document.createElement("script"),
				id = "script" + jQuery.now();

			try {
				script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
			} catch(e) {}

			root.insertBefore( script, root.firstChild );

			// Make sure that the execution of code works by injecting a script
			// tag with appendChild/createTextNode
			// (IE doesn't support this, fails, and uses .text instead)
			if ( window[ id ] ) {
				_scriptEval = true;
				delete window[ id ];
			} else {
				_scriptEval = false;
			}

			root.removeChild( script );
			// release memory in IE
			root = script = id  = null;
		}

		return _scriptEval;
	};

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;

	} catch(e) {
		jQuery.support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent("onclick", function click() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			jQuery.support.noCloneEvent = false;
			div.detachEvent("onclick", click);
		});
		div.cloneNode(true).fireEvent("onclick");
	}

	div = document.createElement("div");
	div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";

	var fragment = document.createDocumentFragment();
	fragment.appendChild( div.firstChild );

	// WebKit doesn't clone checked state correctly in fragments
	jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

	// Figure out if the W3C box model works as expected
	// document.body must exist before we can do this
	jQuery(function() {
		var div = document.createElement("div"),
			body = document.getElementsByTagName("body")[0];

		// Frameset documents with no body should not run this code
		if ( !body ) {
			return;
		}

		div.style.width = div.style.paddingLeft = "1px";
		body.appendChild( div );
		jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;

		if ( "zoom" in div.style ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			jQuery.support.inlineBlockNeedsLayout = div.offsetWidth === 2;

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			jQuery.support.shrinkWrapBlocks = div.offsetWidth !== 2;
		}

		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		var tds = div.getElementsByTagName("td");

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		jQuery.support.reliableHiddenOffsets = tds[0].offsetHeight === 0;

		tds[0].style.display = "";
		tds[1].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE < 8 fail this test)
		jQuery.support.reliableHiddenOffsets = jQuery.support.reliableHiddenOffsets && tds[0].offsetHeight === 0;
		div.innerHTML = "";

		body.removeChild( div ).style.display = "none";
		div = tds = null;
	});

	// Technique from Juriy Zaytsev
	// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
	var eventSupported = function( eventName ) {
		var el = document.createElement("div");
		eventName = "on" + eventName;

		// We only care about the case where non-standard event systems
		// are used, namely in IE. Short-circuiting here helps us to
		// avoid an eval call (in setAttribute) which can cause CSP
		// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
		if ( !el.attachEvent ) {
			return true;
		}

		var isSupported = (eventName in el);
		if ( !isSupported ) {
			el.setAttribute(eventName, "return;");
			isSupported = typeof el[eventName] === "function";
		}
		el = null;

		return isSupported;
	};

	jQuery.support.submitBubbles = eventSupported("submit");
	jQuery.support.changeBubbles = eventSupported("change");

	// release memory in IE
	div = all = a = null;
})();



var rbrace = /^(?:\{.*\}|\[.*\])$/;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var internalKey = jQuery.expando, getByName = typeof name === "string", thisCache,

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ jQuery.expando ] = id = ++jQuery.uuid;
			} else {
				id = jQuery.expando;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
			} else {
				cache[ id ] = jQuery.extend(cache[ id ], name);
			}
		}

		thisCache = cache[ id ];

		// Internal jQuery data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
		if ( pvt ) {
			if ( !thisCache[ internalKey ] ) {
				thisCache[ internalKey ] = {};
			}

			thisCache = thisCache[ internalKey ];
		}

		if ( data !== undefined ) {
			thisCache[ name ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jQuery.data, as this
		// internal data object is undocumented and subject to change.
		if ( name === "events" && !thisCache[name] ) {
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

		return getByName ? thisCache[ name ] : thisCache;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var internalKey = jQuery.expando, isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {
			var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

			if ( thisCache ) {
				delete thisCache[ name ];

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		var internalCache = cache[ id ][ internalKey ];

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		if ( jQuery.support.deleteExpando || cache != window ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
			cache[ id ] = {};
			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}

			cache[ id ][ internalKey ] = internalCache;

		// Otherwise, we need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		} else if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ jQuery.expando ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( jQuery.expando );
			} else {
				elem[ jQuery.expando ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 ) {
					var attr = this[0].attributes, name;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = name.substr( 5 );
							dataAttr( this[0], name, data[ name ] );
						}
					}
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var $this = jQuery( this ),
					args = [ parts[0], value ];

				$this.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				$this.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		data = elem.getAttribute( "data-" + key );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				!jQuery.isNaN( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




jQuery.extend({
	queue: function( elem, type, data ) {
		if ( !elem ) {
			return;
		}

		type = (type || "fx") + "queue";
		var q = jQuery._data( elem, type );

		// Speed up dequeue by getting out quickly if this is just a lookup
		if ( !data ) {
			return q || [];
		}

		if ( !q || jQuery.isArray(data) ) {
			q = jQuery._data( elem, type, jQuery.makeArray(data) );

		} else {
			q.push( data );
		}

		return q;
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift();

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {
				jQuery.dequeue(elem, type);
			});
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue", true );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function( i ) {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},

	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				jQuery.dequeue( elem, type );
			}, time );
		});
	},

	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	}
});




var rclass = /[\n\t\r]/g,
	rspaces = /\s+/,
	rreturn = /\r/g,
	rspecialurl = /^(?:href|src|style)$/,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rradiocheck = /^(?:radio|checkbox)$/i;

jQuery.props = {
	"for": "htmlFor",
	"class": "className",
	readonly: "readOnly",
	maxlength: "maxLength",
	cellspacing: "cellSpacing",
	rowspan: "rowSpan",
	colspan: "colSpan",
	tabindex: "tabIndex",
	usemap: "useMap",
	frameborder: "frameBorder"
};

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name, fn ) {
		return this.each(function(){
			jQuery.attr( this, name, "" );
			if ( this.nodeType === 1 ) {
				this.removeAttribute( name );
			}
		});
	},

	addClass: function( value ) {
		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.addClass( value.call(this, i, self.attr("class")) );
			});
		}

		if ( value && typeof value === "string" ) {
			var classNames = (value || "").split( rspaces );

			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className ) {
						elem.className = value;

					} else {
						var className = " " + elem.className + " ",
							setClass = elem.className;

						for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
								setClass += " " + classNames[c];
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.removeClass( value.call(this, i, self.attr("class")) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			var classNames = (value || "").split( rspaces );

			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						var className = (" " + elem.className + " ").replace(rclass, " ");
						for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[c] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspaces );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		if ( !arguments.length ) {
			var elem = this[0];

			if ( elem ) {
				if ( jQuery.nodeName( elem, "option" ) ) {
					// attributes.value is undefined in Blackberry 4.7 but
					// uses .value. See #6932
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text;
				}

				// We need to handle select boxes special
				if ( jQuery.nodeName( elem, "select" ) ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";

					// Nothing was selected
					if ( index < 0 ) {
						return null;
					}

					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];

						// Don't return options that are disabled or in a disabled optgroup
						if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
								(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

							// Get the specific value for the option
							value = jQuery(option).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
					if ( one && !values.length && options.length ) {
						return jQuery( options[ index ] ).val();
					}

					return values;
				}

				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				if ( rradiocheck.test( elem.type ) && !jQuery.support.checkOn ) {
					return elem.getAttribute("value") === null ? "on" : elem.value;
				}

				// Everything else, we just grab the value
				return (elem.value || "").replace(rreturn, "");

			}

			return undefined;
		}

		var isFunction = jQuery.isFunction(value);

		return this.each(function(i) {
			var self = jQuery(this), val = value;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call(this, i, self.val());
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray(val) ) {
				val = jQuery.map(val, function (value) {
					return value == null ? "" : value + "";
				});
			}

			if ( jQuery.isArray(val) && rradiocheck.test( this.type ) ) {
				this.checked = jQuery.inArray( self.val(), val ) >= 0;

			} else if ( jQuery.nodeName( this, "select" ) ) {
				var values = jQuery.makeArray(val);

				jQuery( "option", this ).each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					this.selectedIndex = -1;
				}

			} else {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || elem.nodeType === 2 ) {
			return undefined;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery(elem)[name](value);
		}

		var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc( elem ),
			// Whether we are setting (or getting)
			set = value !== undefined;

		// Try to normalize/fix the name
		name = notxml && jQuery.props[ name ] || name;

		// Only do all the following if this is a node (faster for style)
		if ( elem.nodeType === 1 ) {
			// These attributes require special treatment
			var special = rspecialurl.test( name );

			// Safari mis-reports the default selected property of an option
			// Accessing the parent's selectedIndex property fixes it
			if ( name === "selected" && !jQuery.support.optSelected ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					// Make sure that it also works with optgroups, see #5701
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}

			// If applicable, access the attribute via the DOM 0 way
			// 'in' checks fail in Blackberry 4.7 #6931
			if ( (name in elem || elem[ name ] !== undefined) && notxml && !special ) {
				if ( set ) {
					// We can't allow the type property to be changed (since it causes problems in IE)
					if ( name === "type" && rtype.test( elem.nodeName ) && elem.parentNode ) {
						jQuery.error( "type property can't be changed" );
					}

					if ( value === null ) {
						if ( elem.nodeType === 1 ) {
							elem.removeAttribute( name );
						}

					} else {
						elem[ name ] = value;
					}
				}

				// browsers index elements by id/name on forms, give priority to attributes.
				if ( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
					return elem.getAttributeNode( name ).nodeValue;
				}

				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				if ( name === "tabIndex" ) {
					var attributeNode = elem.getAttributeNode( "tabIndex" );

					return attributeNode && attributeNode.specified ?
						attributeNode.value :
						rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							undefined;
				}

				return elem[ name ];
			}

			if ( !jQuery.support.style && notxml && name === "style" ) {
				if ( set ) {
					elem.style.cssText = "" + value;
				}

				return elem.style.cssText;
			}

			if ( set ) {
				// convert the value to a string (all browsers do this but IE) see #1070
				elem.setAttribute( name, "" + value );
			}

			// Ensure that missing attributes return undefined
			// Blackberry 4.7 returns "" from getAttribute #6938
			if ( !elem.attributes[ name ] && (elem.hasAttribute && !elem.hasAttribute( name )) ) {
				return undefined;
			}

			var attr = !jQuery.support.hrefNormalized && notxml && special ?
					// Some attributes require a special call on IE
					elem.getAttribute( name, 2 ) :
					elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}
		// Handle everything which isn't a DOM element node
		if ( set ) {
			elem[ name ] = value;
		}
		return elem[ name ];
	}
});




var rnamespaces = /\.(.*)$/,
	rformElems = /^(?:textarea|input|select)$/i,
	rperiod = /\./g,
	rspace = / /g,
	rescape = /[^\w\s.|`]/g,
	fcleanup = function( nm ) {
		return nm.replace(rescape, "\\$&");
	};

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function( elem, types, handler, data ) {
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// TODO :: Use a try/catch until it's safe to pull this out (likely 1.6)
		// Minor release fix for bug #8018
		try {
			// For whatever reason, IE has trouble passing the window object
			// around, causing it to be cloned in the process
			if ( jQuery.isWindow( elem ) && ( elem !== window && !elem.frameElement ) ) {
				elem = window;
			}
		}
		catch ( e ) {}

		if ( handler === false ) {
			handler = returnFalse;
		} else if ( !handler ) {
			// Fixes bug #7229. Fix recommended by jdalton
			return;
		}

		var handleObjIn, handleObj;

		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure
		var elemData = jQuery._data( elem );

		// If no elemData is found then we must be trying to bind to one of the
		// banned noData elements
		if ( !elemData ) {
			return;
		}

		var events = elemData.events,
			eventHandle = elemData.handle;

		if ( !events ) {
			elemData.events = events = {};
		}

		if ( !eventHandle ) {
			elemData.handle = eventHandle = function() {
				// Handle the second event of a trigger and when
				// an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && !jQuery.event.triggered ?
					jQuery.event.handle.apply( eventHandle.elem, arguments ) :
					undefined;
			};
		}

		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native events in IE.
		eventHandle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = types.split(" ");

		var type, i = 0, namespaces;

		while ( (type = types[ i++ ]) ) {
			handleObj = handleObjIn ?
				jQuery.extend({}, handleObjIn) :
				{ handler: handler, data: data };

			// Namespaced event handlers
			if ( type.indexOf(".") > -1 ) {
				namespaces = type.split(".");
				type = namespaces.shift();
				handleObj.namespace = namespaces.slice(0).sort().join(".");

			} else {
				namespaces = [];
				handleObj.namespace = "";
			}

			handleObj.type = type;
			if ( !handleObj.guid ) {
				handleObj.guid = handler.guid;
			}

			// Get the current list of functions bound to this event
			var handlers = events[ type ],
				special = jQuery.event.special[ type ] || {};

			// Init the event handler queue
			if ( !handlers ) {
				handlers = events[ type ] = [];

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add the function to the element's handler list
			handlers.push( handleObj );

			// Keep track of which events have been used, for global triggering
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, pos ) {
		// don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		if ( handler === false ) {
			handler = returnFalse;
		}

		var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			events = elemData && elemData.events;

		if ( !elemData || !events ) {
			return;
		}

		// types is actually an event object here
		if ( types && types.type ) {
			handler = types.handler;
			types = types.type;
		}

		// Unbind all events for the element
		if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
			types = types || "";

			for ( type in events ) {
				jQuery.event.remove( elem, type + types );
			}

			return;
		}

		// Handle multiple events separated by a space
		// jQuery(...).unbind("mouseover mouseout", fn);
		types = types.split(" ");

		while ( (type = types[ i++ ]) ) {
			origType = type;
			handleObj = null;
			all = type.indexOf(".") < 0;
			namespaces = [];

			if ( !all ) {
				// Namespaced event handlers
				namespaces = type.split(".");
				type = namespaces.shift();

				namespace = new RegExp("(^|\\.)" +
					jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
			}

			eventType = events[ type ];

			if ( !eventType ) {
				continue;
			}

			if ( !handler ) {
				for ( j = 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];

					if ( all || namespace.test( handleObj.namespace ) ) {
						jQuery.event.remove( elem, origType, handleObj.handler, j );
						eventType.splice( j--, 1 );
					}
				}

				continue;
			}

			special = jQuery.event.special[ type ] || {};

			for ( j = pos || 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( handler.guid === handleObj.guid ) {
					// remove the given handler for the given type
					if ( all || namespace.test( handleObj.namespace ) ) {
						if ( pos == null ) {
							eventType.splice( j--, 1 );
						}

						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}

					if ( pos != null ) {
						break;
					}
				}
			}

			// remove generic event handler if no more handlers exist
			if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				ret = null;
				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			var handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			delete elemData.events;
			delete elemData.handle;

			if ( jQuery.isEmptyObject( elemData ) ) {
				jQuery.removeData( elem, undefined, true );
			}
		}
	},

	// bubbling is internal
	trigger: function( event, data, elem /*, bubbling */ ) {
		// Event object or event type
		var type = event.type || event,
			bubbling = arguments[3];

		if ( !bubbling ) {
			event = typeof event === "object" ?
				// jQuery.Event object
				event[ jQuery.expando ] ? event :
				// Object literal
				jQuery.extend( jQuery.Event(type), event ) :
				// Just the event type (string)
				jQuery.Event(type);

			if ( type.indexOf("!") >= 0 ) {
				event.type = type = type.slice(0, -1);
				event.exclusive = true;
			}

			// Handle a global trigger
			if ( !elem ) {
				// Don't bubble custom events when global (to avoid too much overhead)
				event.stopPropagation();

				// Only trigger if we've ever bound an event for it
				if ( jQuery.event.global[ type ] ) {
					// XXX This code smells terrible. event.js should not be directly
					// inspecting the data cache
					jQuery.each( jQuery.cache, function() {
						// internalKey variable is just used to make it easier to find
						// and potentially change this stuff later; currently it just
						// points to jQuery.expando
						var internalKey = jQuery.expando,
							internalCache = this[ internalKey ];
						if ( internalCache && internalCache.events && internalCache.events[ type ] ) {
							jQuery.event.trigger( event, data, internalCache.handle.elem );
						}
					});
				}
			}

			// Handle triggering a single element

			// don't do events on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
				return undefined;
			}

			// Clean up in case it is reused
			event.result = undefined;
			event.target = elem;

			// Clone the incoming data, if any
			data = jQuery.makeArray( data );
			data.unshift( event );
		}

		event.currentTarget = elem;

		// Trigger the event, it is assumed that "handle" is a function
		var handle = jQuery._data( elem, "handle" );

		if ( handle ) {
			handle.apply( elem, data );
		}

		var parent = elem.parentNode || elem.ownerDocument;

		// Trigger an inline bound script
		try {
			if ( !(elem && elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) ) {
				if ( elem[ "on" + type ] && elem[ "on" + type ].apply( elem, data ) === false ) {
					event.result = false;
					event.preventDefault();
				}
			}

		// prevent IE from throwing an error for some elements with some event types, see #3533
		} catch (inlineError) {}

		if ( !event.isPropagationStopped() && parent ) {
			jQuery.event.trigger( event, data, parent, true );

		} else if ( !event.isDefaultPrevented() ) {
			var old,
				target = event.target,
				targetType = type.replace( rnamespaces, "" ),
				isClick = jQuery.nodeName( target, "a" ) && targetType === "click",
				special = jQuery.event.special[ targetType ] || {};

			if ( (!special._default || special._default.call( elem, event ) === false) &&
				!isClick && !(target && target.nodeName && jQuery.noData[target.nodeName.toLowerCase()]) ) {

				try {
					if ( target[ targetType ] ) {
						// Make sure that we don't accidentally re-trigger the onFOO events
						old = target[ "on" + targetType ];

						if ( old ) {
							target[ "on" + targetType ] = null;
						}

						jQuery.event.triggered = true;
						target[ targetType ]();
					}

				// prevent IE from throwing an error for some elements with some event types, see #3533
				} catch (triggerError) {}

				if ( old ) {
					target[ "on" + targetType ] = old;
				}

				jQuery.event.triggered = false;
			}
		}
	},

	handle: function( event ) {
		var all, handlers, namespaces, namespace_re, events,
			namespace_sort = [],
			args = jQuery.makeArray( arguments );

		event = args[0] = jQuery.event.fix( event || window.event );
		event.currentTarget = this;

		// Namespaced event handlers
		all = event.type.indexOf(".") < 0 && !event.exclusive;

		if ( !all ) {
			namespaces = event.type.split(".");
			event.type = namespaces.shift();
			namespace_sort = namespaces.slice(0).sort();
			namespace_re = new RegExp("(^|\\.)" + namespace_sort.join("\\.(?:.*\\.)?") + "(\\.|$)");
		}

		event.namespace = event.namespace || namespace_sort.join(".");

		events = jQuery._data(this, "events");

		handlers = (events || {})[ event.type ];

		if ( events && handlers ) {
			// Clone the handlers to prevent manipulation
			handlers = handlers.slice(0);

			for ( var j = 0, l = handlers.length; j < l; j++ ) {
				var handleObj = handlers[ j ];

				// Filter the functions by class
				if ( all || namespace_re.test( handleObj.namespace ) ) {
					// Pass in a reference to the handler function itself
					// So that we can later remove it
					event.handler = handleObj.handler;
					event.data = handleObj.data;
					event.handleObj = handleObj;

					var ret = handleObj.handler.apply( this, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}

					if ( event.isImmediatePropagationStopped() ) {
						break;
					}
				}
			}
		}

		return event.result;
	},

	props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = jQuery.Event( originalEvent );

		for ( var i = this.props.length, prop; i; ) {
			prop = this.props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target ) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement,
				body = document.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
	},

	// Deprecated, use jQuery.guid instead
	guid: 1E8,

	// Deprecated, use jQuery.proxy instead
	proxy: jQuery.proxy,

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady,
			teardown: jQuery.noop
		},

		live: {
			add: function( handleObj ) {
				jQuery.event.add( this,
					liveConvert( handleObj.origType, handleObj.selector ),
					jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );
			},

			remove: function( handleObj ) {
				jQuery.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
			}
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src ) {
	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
		return new jQuery.Event( src );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function( event ) {
	// Check if mouse(over|out) are still within the same parent element
	var parent = event.relatedTarget;

	// Firefox sometimes assigns relatedTarget a XUL element
	// which we cannot access the parentNode property of
	try {

		// Chrome does something similar, the parentNode property
		// can be accessed but is null.
		if ( parent !== document && !parent.parentNode ) {
			return;
		}
		// Traverse up the tree
		while ( parent && parent !== this ) {
			parent = parent.parentNode;
		}

		if ( parent !== this ) {
			// set the correct event type
			event.type = event.data;

			// handle event if we actually just moused on to a non sub-element
			jQuery.event.handle.apply( this, arguments );
		}

	// assuming we've left the element since we most likely mousedover a xul element
	} catch(e) { }
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
	event.type = event.data;
	jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		setup: function( data ) {
			jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
		},
		teardown: function( data ) {
			jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
		}
	};
});

// submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function( data, namespaces ) {
			if ( this.nodeName && this.nodeName.toLowerCase() !== "form" ) {
				jQuery.event.add(this, "click.specialSubmit", function( e ) {
					var elem = e.target,
						type = elem.type;

					if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
						trigger( "submit", this, arguments );
					}
				});

				jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
					var elem = e.target,
						type = elem.type;

					if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
						trigger( "submit", this, arguments );
					}
				});

			} else {
				return false;
			}
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialSubmit" );
		}
	};

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

	var changeFilters,

	getVal = function( elem ) {
		var type = elem.type, val = elem.value;

		if ( type === "radio" || type === "checkbox" ) {
			val = elem.checked;

		} else if ( type === "select-multiple" ) {
			val = elem.selectedIndex > -1 ?
				jQuery.map( elem.options, function( elem ) {
					return elem.selected;
				}).join("-") :
				"";

		} else if ( elem.nodeName.toLowerCase() === "select" ) {
			val = elem.selectedIndex;
		}

		return val;
	},

	testChange = function testChange( e ) {
		var elem = e.target, data, val;

		if ( !rformElems.test( elem.nodeName ) || elem.readOnly ) {
			return;
		}

		data = jQuery._data( elem, "_change_data" );
		val = getVal(elem);

		// the current data will be also retrieved by beforeactivate
		if ( e.type !== "focusout" || elem.type !== "radio" ) {
			jQuery._data( elem, "_change_data", val );
		}

		if ( data === undefined || val === data ) {
			return;
		}

		if ( data != null || val ) {
			e.type = "change";
			e.liveFired = undefined;
			jQuery.event.trigger( e, arguments[1], elem );
		}
	};

	jQuery.event.special.change = {
		filters: {
			focusout: testChange,

			beforedeactivate: testChange,

			click: function( e ) {
				var elem = e.target, type = elem.type;

				if ( type === "radio" || type === "checkbox" || elem.nodeName.toLowerCase() === "select" ) {
					testChange.call( this, e );
				}
			},

			// Change has to be called before submit
			// Keydown will be called before keypress, which is used in submit-event delegation
			keydown: function( e ) {
				var elem = e.target, type = elem.type;

				if ( (e.keyCode === 13 && elem.nodeName.toLowerCase() !== "textarea") ||
					(e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
					type === "select-multiple" ) {
					testChange.call( this, e );
				}
			},

			// Beforeactivate happens also before the previous element is blurred
			// with this event you can't trigger a change event, but you can store
			// information
			beforeactivate: function( e ) {
				var elem = e.target;
				jQuery._data( elem, "_change_data", getVal(elem) );
			}
		},

		setup: function( data, namespaces ) {
			if ( this.type === "file" ) {
				return false;
			}

			for ( var type in changeFilters ) {
				jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
			}

			return rformElems.test( this.nodeName );
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialChange" );

			return rformElems.test( this.nodeName );
		}
	};

	changeFilters = jQuery.event.special.change.filters;

	// Handle when the input is .focus()'d
	changeFilters.focus = changeFilters.beforeactivate;
}

function trigger( type, elem, args ) {
	// Piggyback on a donor event to simulate a different one.
	// Fake originalEvent to avoid donor's stopPropagation, but if the
	// simulated event prevents default then we do the same on the donor.
	// Don't pass args or remember liveFired; they apply to the donor event.
	var event = jQuery.extend( {}, args[ 0 ] );
	event.type = type;
	event.originalEvent = {};
	event.liveFired = undefined;
	jQuery.event.handle.call( elem, event );
	if ( event.isDefaultPrevented() ) {
		args[ 0 ].preventDefault();
	}
}

// Create "bubbling" focus and blur events
if ( document.addEventListener ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {
		jQuery.event.special[ fix ] = {
			setup: function() {
				this.addEventListener( orig, handler, true );
			},
			teardown: function() {
				this.removeEventListener( orig, handler, true );
			}
		};

		function handler( e ) {
			e = jQuery.event.fix( e );
			e.type = fix;
			return jQuery.event.handle.call( this, e );
		}
	});
}

jQuery.each(["bind", "one"], function( i, name ) {
	jQuery.fn[ name ] = function( type, data, fn ) {
		// Handle object literals
		if ( typeof type === "object" ) {
			for ( var key in type ) {
				this[ name ](key, data, type[key], fn);
			}
			return this;
		}

		if ( jQuery.isFunction( data ) || data === false ) {
			fn = data;
			data = undefined;
		}

		var handler = name === "one" ? jQuery.proxy( fn, function( event ) {
			jQuery( this ).unbind( event, handler );
			return fn.apply( this, arguments );
		}) : fn;

		if ( type === "unload" && name !== "one" ) {
			this.one( type, data, fn );

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.add( this[i], type, handler, data );
			}
		}

		return this;
	};
});

jQuery.fn.extend({
	unbind: function( type, fn ) {
		// Handle object literals
		if ( typeof type === "object" && !type.preventDefault ) {
			for ( var key in type ) {
				this.unbind(key, type[key]);
			}

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.remove( this[i], type, fn );
			}
		}

		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.live( types, data, fn, selector );
	},

	undelegate: function( selector, types, fn ) {
		if ( arguments.length === 0 ) {
				return this.unbind( "live" );

		} else {
			return this.die( types, null, fn, selector );
		}
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},

	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			var event = jQuery.Event( type );
			event.preventDefault();
			event.stopPropagation();
			jQuery.event.trigger( event, data, this[0] );
			return event.result;
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			i = 1;

		// link all the functions, so any of them can unbind this click handler
		while ( i < args.length ) {
			jQuery.proxy( fn, args[ i++ ] );
		}

		return this.click( jQuery.proxy( fn, function( event ) {
			// Figure out which function to execute
			var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
			jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

			// Make sure that clicks stop
			event.preventDefault();

			// and execute the function
			return args[ lastToggle ].apply( this, arguments ) || false;
		}));
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

var liveMap = {
	focus: "focusin",
	blur: "focusout",
	mouseenter: "mouseover",
	mouseleave: "mouseout"
};

jQuery.each(["live", "die"], function( i, name ) {
	jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
		var type, i = 0, match, namespaces, preType,
			selector = origSelector || this.selector,
			context = origSelector ? this : jQuery( this.context );

		if ( typeof types === "object" && !types.preventDefault ) {
			for ( var key in types ) {
				context[ name ]( key, data, types[key], selector );
			}

			return this;
		}

		if ( jQuery.isFunction( data ) ) {
			fn = data;
			data = undefined;
		}

		types = (types || "").split(" ");

		while ( (type = types[ i++ ]) != null ) {
			match = rnamespaces.exec( type );
			namespaces = "";

			if ( match )  {
				namespaces = match[0];
				type = type.replace( rnamespaces, "" );
			}

			if ( type === "hover" ) {
				types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
				continue;
			}

			preType = type;

			if ( type === "focus" || type === "blur" ) {
				types.push( liveMap[ type ] + namespaces );
				type = type + namespaces;

			} else {
				type = (liveMap[ type ] || type) + namespaces;
			}

			if ( name === "live" ) {
				// bind live handler
				for ( var j = 0, l = context.length; j < l; j++ ) {
					jQuery.event.add( context[j], "live." + liveConvert( type, selector ),
						{ data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
				}

			} else {
				// unbind live handler
				context.unbind( "live." + liveConvert( type, selector ), fn );
			}
		}

		return this;
	};
});

function liveHandler( event ) {
	var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
		elems = [],
		selectors = [],
		events = jQuery._data( this, "events" );

	// Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
	if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
		return;
	}

	if ( event.namespace ) {
		namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
	}

	event.liveFired = this;

	var live = events.live.slice(0);

	for ( j = 0; j < live.length; j++ ) {
		handleObj = live[j];

		if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
			selectors.push( handleObj.selector );

		} else {
			live.splice( j--, 1 );
		}
	}

	match = jQuery( event.target ).closest( selectors, event.currentTarget );

	for ( i = 0, l = match.length; i < l; i++ ) {
		close = match[i];

		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
				elem = close.elem;
				related = null;

				// Those two events require additional checking
				if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
					event.type = handleObj.preType;
					related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];
				}

				if ( !related || related !== elem ) {
					elems.push({ elem: elem, handleObj: handleObj, level: close.level });
				}
			}
		}
	}

	for ( i = 0, l = elems.length; i < l; i++ ) {
		match = elems[i];

		if ( maxLevel && match.level > maxLevel ) {
			break;
		}

		event.currentTarget = match.elem;
		event.data = match.handleObj.data;
		event.handleObj = match.handleObj;

		ret = match.handleObj.origHandler.apply( match.elem, arguments );

		if ( ret === false || event.isPropagationStopped() ) {
			maxLevel = match.level;

			if ( ret === false ) {
				stop = false;
			}
			if ( event.isImmediatePropagationStopped() ) {
				break;
			}
		}
	}

	return stop;
}

function liveConvert( type, selector ) {
	return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspace, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}
		
		return arguments.length > 0 ?
			this.bind( name, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}
});


/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return "text" === elem.getAttribute( 'type' );
		},
		radio: function( elem ) {
			return "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return "checkbox" === elem.type;
		},

		file: function( elem ) {
			return "file" === elem.type;
		},
		password: function( elem ) {
			return "password" === elem.type;
		},

		submit: function( elem ) {
			return "submit" === elem.type;
		},

		image: function( elem ) {
			return "image" === elem.type;
		},

		reset: function( elem ) {
			return "reset" === elem.type;
		},

		button: function( elem ) {
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector,
		pseudoWorks = false;

	try {
		// This should fail with an exception
		// Gecko does not error, returns false instead
		matches.call( document.documentElement, "[test!='']:sizzle" );
	
	} catch( pseudoError ) {
		pseudoWorks = true;
	}

	if ( matches ) {
		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						return matches.call( node, expr );
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var ret = this.pushStack( "", "find", selector ),
			length = 0;

		for ( var i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( var n = length; n < ret.length; n++ ) {
					for ( var r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && jQuery.filter( selector, this ).length > 0;
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];

		if ( jQuery.isArray( selectors ) ) {
			var match, selector,
				matches = {},
				level = 1;

			if ( cur && selectors.length ) {
				for ( i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[selector] ) {
						matches[selector] = jQuery.expr.match.POS.test( selector ) ?
							jQuery( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[selector];

						if ( match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match) ) {
							ret.push({ selector: selector, elem: cur, level: level });
						}
					}

					cur = cur.parentNode;
					level++;
				}
			}

			return ret;
		}

		var pos = POS.test( selectors ) ?
			jQuery( selectors, context || this.context ) : null;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique(ret) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		if ( !elem || typeof elem === "string" ) {
			return jQuery.inArray( this[0],
				// If it receives a string, the selector is used
				// If it receives nothing, the siblings are used
				elem ? jQuery( elem ) : this.parent().children() );
		}
		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until ),
			// The variable 'args' was introduced in
			// https://github.com/jquery/jquery/commit/52a0238
			// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
			// http://code.google.com/p/v8/issues/detail?id=1050
			args = slice.call(arguments);

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, args.join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
	});
}




var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnocache = /<(?:script|object|embed|option|style)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append(this);
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		return this.each(function() {
			jQuery( this ).wrapAll( html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery(arguments[0]);
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery(arguments[0]).toArray() );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnocache.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value );
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || (l > 1 && i < lastIndex) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var internalKey = jQuery.expando,
		oldData = jQuery.data( src ),
		curData = jQuery.data( dest, oldData );

	// Switch to use the internal data object, if it exists, for the next
	// stage of data copying
	if ( (oldData = oldData[ internalKey ]) ) {
		var events = oldData.events;
				curData = curData[ internalKey ] = jQuery.extend({}, oldData);

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( var type in events ) {
				for ( var i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
				}
			}
		}
	}
}

function cloneFixAttributes(src, dest) {
	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	var nodeName = dest.nodeName.toLowerCase();

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	dest.clearAttributes();

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	dest.mergeAttributes(src);

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults,
		doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
		args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

		cacheable = true;
		cacheresults = jQuery.fragments[ args[0] ];
		if ( cacheresults ) {
			if ( cacheresults !== 1 ) {
				fragment = cacheresults;
			}
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = (i > 0 ? this.clone(true) : this).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( "getElementsByTagName" in elem ) {
		return elem.getElementsByTagName( "*" );
	
	} else if ( "querySelectorAll" in elem ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var clone = elem.cloneNode(true),
				srcElements,
				destElements,
				i;

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName
			// instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				cloneFixAttributes( srcElements[i], destElements[i] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		// Return the cloned set
		return clone;
},
	clean: function( elems, context, fragment, scripts ) {
		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [];

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" && !rhtml.test( elem ) ) {
				elem = context.createTextNode( elem );

			} else if ( typeof elem === "string" ) {
				// Fix "XHTML"-style tags in all browsers
				elem = elem.replace(rxhtmlTag, "<$1></$2>");

				// Trim whitespace, otherwise indexOf won't work as expected
				var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
					wrap = wrapMap[ tag ] || wrapMap._default,
					depth = wrap[0],
					div = context.createElement("div");

				// Go to html and back, then peel off extra wrappers
				div.innerHTML = wrap[1] + elem + wrap[2];

				// Move to the right depth
				while ( depth-- ) {
					div = div.lastChild;
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !jQuery.support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					var hasBody = rtbody.test(elem),
						tbody = tag === "table" && !hasBody ?
							div.firstChild && div.firstChild.childNodes :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !hasBody ?
								div.childNodes :
								[];

					for ( var j = tbody.length - 1; j >= 0 ; --j ) {
						if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
							tbody[ j ].parentNode.removeChild( tbody[ j ] );
						}
					}

				}

				// IE completely kills leading whitespace when innerHTML is used
				if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
				}

				elem = div.childNodes;
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						ret.splice.apply( ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ] && cache[ id ][ internalKey ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rdashAlpha = /-([a-z])/ig,
	rupper = /([A-Z])/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle,

	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"zIndex": true,
		"fontWeight": true,
		"opacity": true,
		"zoom": true,
		"lineHeight": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			// Make sure that NaN and null values aren't set. See: #7116
			if ( typeof value === "number" && isNaN( value ) || value == null ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( typeof value === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		// Make sure that we're working with the right name
		var ret, origName = jQuery.camelCase( name ),
			hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name, origName );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	},

	camelCase: function( string ) {
		return string.replace( rdashAlpha, fcamelCase );
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					val = getWH( elem, name, extra );

				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				if ( val <= 0 ) {
					val = curCSS( elem, name, name );

					if ( val === "0px" && currentStyle ) {
						val = currentStyle( elem, name, name );
					}

					if ( val != null ) {
						// Should return "auto" instead of 0, use 0 for
						// temporary backwards-compat
						return val === "" || val === "auto" ? "0px" : val;
					}
				}

				if ( val < 0 || val == null ) {
					val = elem.style[ name ];

					// Should return "auto" instead of 0, use 0 for
					// temporary backwards-compat
					return val === "" || val === "auto" ? "0px" : val;
				}

				return typeof val === "string" ? val : val + "px";
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat(value);

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
				(parseFloat(RegExp.$1) / 100) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style;

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// Set the alpha filter to set the opacity
			var opacity = jQuery.isNaN(value) ?
				"" :
				"alpha(opacity=" + value * 100 + ")",
				filter = style.filter || "";

			style.filter = ralpha.test(filter) ?
				filter.replace(ralpha, opacity) :
				style.filter + ' ' + opacity;
		}
	};
}

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, newName, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( !(defaultView = elem.ownerDocument.defaultView) ) {
			return undefined;
		}

		if ( (computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			rsLeft = elem.runtimeStyle && elem.runtimeStyle[ name ],
			style = elem.style;

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
			// Remember the original values
			left = style.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : (ret || 0);
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {
	var which = name === "width" ? cssWidth : cssHeight,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

	if ( extra === "border" ) {
		return val;
	}

	jQuery.each( which, function() {
		if ( !extra ) {
			val -= parseFloat(jQuery.css( elem, "padding" + this )) || 0;
		}

		if ( extra === "margin" ) {
			val += parseFloat(jQuery.css( elem, "margin" + this )) || 0;

		} else {
			val -= parseFloat(jQuery.css( elem, "border" + this + "Width" )) || 0;
		}
	});

	return val;
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /(?:^file|^widget|\-extension):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rucHeaders = /(^|\-)([a-z])/g,
	rucHeadersFunc = function( _, $1, $2 ) {
		return $1 + $2.toUpperCase();
	},
	rurl = /^([\w\+\.\-]+:)\/\/([^\/?#:]*)(?::(\d+))?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts;

// #8138, IE may throw an exception when accessing
// a field from document.location if document.domain has been set
try {
	ajaxLocation = document.location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() );

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

//Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for(; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.bind( o, f );
	};
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
} );

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function ( target, settings ) {
		if ( !settings ) {
			// Only one parameter, we extend ajaxSettings
			settings = target;
			target = jQuery.extend( true, jQuery.ajaxSettings, settings );
		} else {
			// target was provided, we extend into it
			jQuery.extend( true, target, jQuery.ajaxSettings, settings );
		}
		// Flatten fields we don't want deep extended
		for( var field in { context: 1, url: 1 } ) {
			if ( field in settings ) {
				target[ field ] = settings[ field ];
			} else if( field in jQuery.ajaxSettings ) {
				target[ field ] = jQuery.ajaxSettings[ field ];
			}
		}
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		crossDomain: null,
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": "*/*"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery._Deferred(),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						requestHeaders[ name.toLowerCase().replace( rucHeaders, rucHeadersFunc ) ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, statusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status ? 4 : 0;

			var isSuccess,
				success,
				error,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = statusText;

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.done;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( !s.crossDomain ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			requestHeaders[ "Content-Type" ] = s.contentType;
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				requestHeaders[ "If-Modified-Since" ] = jQuery.lastModified[ ifModifiedKey ];
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				requestHeaders[ "If-None-Match" ] = jQuery.etag[ ifModifiedKey ];
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		requestHeaders.Accept = s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
			s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", */*; q=0.01" : "" ) :
			s.accepts[ "*" ];

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( status < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					jQuery.error( e );
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) && obj.length ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// If we see an array here, it is empty and should be treated as an empty
		// object
		if ( jQuery.isArray( obj ) || jQuery.isEmptyObject( obj ) ) {
			add( prefix, "" );

		// Serialize object item.
		} else {
			for ( var name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for( key in s.converters ) {
				if( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|()\?\?()/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var dataIsString = ( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		originalSettings.jsonpCallback ||
		originalSettings.jsonp != null ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				dataIsString && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2",
			cleanUp = function() {
				// Set callback back to previous value
				window[ jsonpCallback ] = previous;
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( previous ) ) {
					window[ jsonpCallback ]( responseContainer[ 0 ] );
				}
			};

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( dataIsString ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Install cleanUp function
		jqXHR.then( cleanUp, cleanUp );

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
} );




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
} );




var // #5280: next active xhr id and list of active xhrs' callbacks
	xhrId = jQuery.now(),
	xhrCallbacks,

	// XHR used to determine supports properties
	testXHR;

// #5280: Internet Explorer will keep connections alive if we don't abort on unload
function xhrOnUnloadAbort() {
	jQuery( window ).unload(function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	});
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Test if we can create an xhr object
testXHR = jQuery.ajaxSettings.xhr();
jQuery.support.ajax = !!testXHR;

// Does this browser support crossDomain XHR requests
jQuery.support.cors = testXHR && ( "withCredentials" in testXHR );

// No need for the temporary xhr anymore
testXHR = undefined;

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// Requested-With header
					// Not set for crossDomain requests with no content
					// (see why at http://trac.dojotoolkit.org/ticket/9486)
					// Won't change header if already provided
					if ( !( s.crossDomain && !s.hasContent ) && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									delete xhrCallbacks[ handle ];
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						// Create the active xhrs callbacks list if needed
						// and attach the unload handler
						if ( !xhrCallbacks ) {
							xhrCallbacks = {};
							xhrOnUnloadAbort();
						}
						// Add to list of active xhrs callbacks
						handle = xhrId++;
						xhr.onreadystatechange = xhrCallbacks[ handle ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	];

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[i];
				display = elem.style.display;

				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
					display = elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( display === "" && jQuery.css( elem, "display" ) === "none" ) {
					jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[i];
				display = elem.style.display;

				if ( display === "" || display === "none" ) {
					elem.style.display = jQuery._data(elem, "olddisplay") || "";
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				var display = jQuery.css( this[i], "display" );

				if ( display !== "none" && !jQuery._data( this[i], "olddisplay" ) ) {
					jQuery._data( this[i], "olddisplay", display );
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				this[i].style.display = "none";
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete );
		}

		return this[ optall.queue === false ? "each" : "queue" ](function() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			var opt = jQuery.extend({}, optall), p,
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				self = this;

			for ( p in prop ) {
				var name = jQuery.camelCase( p );

				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
					p = name;
				}

				if ( prop[p] === "hide" && hidden || prop[p] === "show" && !hidden ) {
					return opt.complete.call(this);
				}

				if ( isElement && ( p === "height" || p === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height
					// animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {
						if ( !jQuery.support.inlineBlockNeedsLayout ) {
							this.style.display = "inline-block";

						} else {
							var display = defaultDisplay(this.nodeName);

							// inline-level elements accept inline-block;
							// block-level elements need to be inline with layout
							if ( display === "inline" ) {
								this.style.display = "inline-block";

							} else {
								this.style.display = "inline";
								this.style.zoom = 1;
							}
						}
					}
				}

				if ( jQuery.isArray( prop[p] ) ) {
					// Create (if needed) and add to specialEasing
					(opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
					prop[p] = prop[p][0];
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			opt.curAnim = jQuery.extend({}, prop);

			jQuery.each( prop, function( name, val ) {
				var e = new jQuery.fx( self, opt, name );

				if ( rfxtypes.test(val) ) {
					e[ val === "toggle" ? hidden ? "show" : "hide" : val ]( prop );

				} else {
					var parts = rfxnum.exec(val),
						start = e.cur();

					if ( parts ) {
						var end = parseFloat( parts[2] ),
							unit = parts[3] || ( jQuery.cssNumber[ name ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( self, name, (end || 1) + unit);
							start = ((end || 1) / e.cur()) * start;
							jQuery.style( self, name, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			});

			// For JS strict compliance
			return true;
		});
	},

	stop: function( clearQueue, gotoEnd ) {
		var timers = jQuery.timers;

		if ( clearQueue ) {
			this.queue([]);
		}

		this.each(function() {
			// go in reverse order so anything added to the queue during the loop is ignored
			for ( var i = timers.length - 1; i >= 0; i-- ) {
				if ( timers[i].elem === this ) {
					if (gotoEnd) {
						// force the next step to be the last
						timers[i](true);
					}

					timers.splice(i, 1);
				}
			}
		});

		// start the next in the queue if the last step wasn't forced
		if ( !gotoEnd ) {
			this.dequeue();
		}

		return this;
	}

});

function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function() {
			if ( opt.queue !== false ) {
				jQuery(this).dequeue();
			}
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		if ( !options.orig ) {
			options.orig = {};
		}
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = jQuery.now();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
		this.now = this.start;
		this.pos = this.state = 0;

		function t( gotoEnd ) {
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval(fx.tick, fx.interval);
		}
	},

	// Simple 'show' function
	show: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any
		// flash of content
		this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var t = jQuery.now(), done = true;

		if ( gotoEnd || t >= this.options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			this.options.curAnim[ this.prop ] = true;

			for ( var i in this.options.curAnim ) {
				if ( this.options.curAnim[i] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( this.options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {
					var elem = this.elem,
						options = this.options;

					jQuery.each( [ "", "X", "Y" ], function (index, value) {
						elem.style[ "overflow" + value ] = options.overflow[index];
					} );
				}

				// Hide the element if the "hide" operation was done
				if ( this.options.hide ) {
					jQuery(this.elem).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( this.options.hide || this.options.show ) {
					for ( var p in this.options.curAnim ) {
						jQuery.style( this.elem, p, this.options.orig[p] );
					}
				}

				// Execute the complete function
				this.options.complete.call( this.elem );
			}

			return false;

		} else {
			var n = t - this.startTime;
			this.state = n / this.options.duration;

			// Perform the easing function, defaults to swing
			var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
			var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
			this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
			this.now = this.start + ((this.end - this.start) * this.pos);

			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timers = jQuery.timers;

		for ( var i = 0; i < timers.length; i++ ) {
			if ( !timers[i]() ) {
				timers.splice(i--, 1);
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

function defaultDisplay( nodeName ) {
	if ( !elemdisplay[ nodeName ] ) {
		var elem = jQuery("<" + nodeName + ">").appendTo("body"),
			display = elem.css("display");

		elem.remove();

		if ( display === "none" || display === "" ) {
			display = "block";
		}

		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = (win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop ),
			scrollLeft = (win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft),
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		jQuery.offset.initialize();

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {
	initialize: function() {
		var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.css(body, "marginTop") ) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

		jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = "fixed";
		checkDiv.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = "";

		innerDiv.style.overflow = "hidden";
		innerDiv.style.position = "relative";

		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		body = container = innerDiv = checkDiv = table = td = null;
		jQuery.offset.initialize = jQuery.noop;
	},

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		jQuery.offset.initialize();

		if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = (position === "absolute" && jQuery.inArray('auto', [curCSSTop, curCSSLeft]) > -1),
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is absolute
		if ( calculatePosition ) {
			curPosition = curElem.position();
		}

		curTop  = calculatePosition ? curPosition.top  : parseInt( curCSSTop,  10 ) || 0;
		curLeft = calculatePosition ? curPosition.left : parseInt( curCSSLeft, 10 ) || 0;

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if (options.top != null) {
			props.top = (options.top - curOffset.top) + curTop;
		}
		if (options.left != null) {
			props.left = (options.left - curOffset.left) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({
	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function(val) {
		var elem = this[0], win;

		if ( !elem ) {
			return null;
		}

		if ( val !== undefined ) {
			// Set the scroll offset
			return this.each(function() {
				win = getWindow( this );

				if ( win ) {
					win.scrollTo(
						!i ? val : jQuery(win).scrollLeft(),
						i ? val : jQuery(win).scrollTop()
					);

				} else {
					this[ method ] = val;
				}
			});
		} else {
			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn["inner" + name] = function() {
		return this[0] ?
			parseFloat( jQuery.css( this[0], type, "padding" ) ) :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn["outer" + name] = function( margin ) {
		return this[0] ?
			parseFloat( jQuery.css( this[0], type, margin ? "margin" : "border" ) ) :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ];
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				elem.document.body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNaN( ret ) ? orig : ret;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});


window.jQuery = window.$ = jQuery;
})(window);
sard.module1 = {}; 
/*
 * jQuery Templating Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem } );
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			// This appears to be a bug in the appendTo, etc. implementation
			// it should be doing .call() instead of .apply(). See #6227
			if ( args[0] && args[0].nodeType ) {
				var dmArgs = jQuery.makeArray( arguments ), argsLength = args.length, i = 0, tmplItem;
				while ( i < argsLength && !(tmplItem = jQuery.data( args[i++], "tmplItem" ))) {}
				if ( argsLength > 1 ) {
					dmArgs[0] = [jQuery.makeArray( args )];
				}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ? 
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl )
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ): 
				(jQuery.template[name] || 
					// If not in map, treat as a selector. (If integrated with core, use quickExpr.exec) 
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null; 
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){_=_.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function). 
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(_,$1,$2);_=[];",
				close: "call=$item.calls();_=call._.concat($item.wrap(call,_));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation. 
				open: "if($notnull_1){_.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){_.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array 
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ? 
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) : 
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}. 
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		var body =		
			"var $=jQuery,call,_=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){_.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Template command not found: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target ); 
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + parens : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" + 
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs ?
								fnargs.replace( /\s*([^\(]+)\s*(\((.*?)\))?/g, function( all, name, parens, params ) {
									params = params ? ("," + params + ")") : (parens ? ")" : "");
									return params ? ("(" + name + ").call($item" + params) : all;
								})
								: (def.$2||"")
							) +
						"_.push('";
				}) +
			"');}return _;";
		return new Function("jQuery","$item", body);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content. 
		options._wrap = build( options, true, 
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode], null, true );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element. 
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) { 
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] = 
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent, null, true ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content, 
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );
sard.module2 = {}; 
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
sard.module3 = {}; 
// Knockout JavaScript library v1.1.2
// (c) 2010 Steven Sanderson - http://knockoutjs.com/
// License: Ms-Pl (http://www.opensource.org/licenses/ms-pl.html)

function a(f){throw f;}var m=true,o=null,p=false,r=window.ko={};r.b=function(f,b){for(var c=f.split("."),d=window,e=0;e<c.length-1;e++)d=d[c[e]];d[c[c.length-1]]=b};r.g=function(f,b,c){f[b]=c};
r.a=new function(){var f=/^(\s|\u00A0)+|(\s|\u00A0)+$/g;return{ba:["authenticity_token",/^__RequestVerificationToken(_.*)?$/],h:function(b,c){for(var d=0,e=b.length;d<e;d++)c(b[d])},i:function(b,c){if(typeof b.indexOf=="function")return b.indexOf(c);for(var d=0,e=b.length;d<e;d++)if(b[d]==c)return d;return-1},xa:function(b,c,d){for(var e=0,g=b.length;e<g;e++)if(c.call(d,b[e]))return b[e];return o},Z:function(b,c){var d=r.a.i(b,c);d>=0&&b.splice(d,1)},Y:function(b){b=b||[];for(var c=[],d=0,e=b.length;d<
e;d++)r.a.i(c,b[d])<0&&c.push(b[d]);return c},K:function(b,c){b=b||[];for(var d=[],e=0,g=b.length;e<g;e++)d.push(c(b[e]));return d},J:function(b,c){b=b||[];for(var d=[],e=0,g=b.length;e<g;e++)c(b[e])&&d.push(b[e]);return d},L:function(b,c){for(var d=0,e=c.length;d<e;d++)b.push(c[d])},aa:function(b){for(;b.firstChild;){r.a.e.N(b.firstChild);b.removeChild(b.firstChild)}},Ua:function(b,c){r.a.aa(b);c&&r.a.h(c,function(d){b.appendChild(d)})},ka:function(b,c){var d=b.nodeType?[b]:b;if(d.length>0){for(var e=
d[0],g=e.parentNode,h=0,i=c.length;h<i;h++)g.insertBefore(c[h],e);h=0;for(i=d.length;h<i;h++){r.a.e.N(d[h]);g.removeChild(d[h])}}},na:function(b,c){if(navigator.userAgent.indexOf("MSIE 6")>=0)b.setAttribute("selected",c);else b.selected=c},Ia:function(b,c){if(!b||b.nodeType!=1)return[];var d=[];b.getAttribute(c)!==o&&d.push(b);for(var e=b.getElementsByTagName("*"),g=0,h=e.length;g<h;g++)e[g].getAttribute(c)!==o&&d.push(e[g]);return d},l:function(b){return(b||"").replace(f,"")},$a:function(b,c){for(var d=
[],e=(b||"").split(c),g=0,h=e.length;g<h;g++){var i=r.a.l(e[g]);i!==""&&d.push(i)}return d},Va:function(b,c){b=b||"";if(c.length>b.length)return p;return b.substring(0,c.length)===c},Ga:function(b,c){if(c===undefined)return(new Function("return "+b))();with(c)return eval("("+b+")")},Ea:function(b,c){if(c.compareDocumentPosition)return(c.compareDocumentPosition(b)&16)==16;for(;b!=o;){if(b==c)return m;b=b.parentNode}return p},A:function(b){return r.a.Ea(b,document)},q:function(b,c,d){if(typeof jQuery!=
"undefined")jQuery(b).bind(c,d);else if(typeof b.addEventListener=="function")b.addEventListener(c,d,p);else if(typeof b.attachEvent!="undefined")b.attachEvent("on"+c,function(e){d.call(b,e)});else a(Error("Browser doesn't support addEventListener or attachEvent"))},qa:function(b,c){if(!(b&&b.nodeType))a(Error("element must be a DOM node when calling triggerEvent"));if(typeof document.createEvent=="function")if(typeof b.dispatchEvent=="function"){var d=document.createEvent(c=="click"?"MouseEvents":
"HTMLEvents");d.initEvent(c,m,m,window,0,0,0,0,0,p,p,p,p,0,b);b.dispatchEvent(d)}else a(Error("The supplied element doesn't support dispatchEvent"));else if(typeof b.fireEvent!="undefined"){if(c=="click")if(b.tagName=="INPUT"&&(b.type.toLowerCase()=="checkbox"||b.type.toLowerCase()=="radio"))b.checked=b.checked!==m;b.fireEvent("on"+c)}else a(Error("Browser doesn't support triggering events"))},d:function(b){return r.C(b)?b():b},Da:function(b,c){return r.a.i((b.className||"").split(/\s+/),c)>=0},Xa:function(b,
c,d){var e=r.a.Da(b,c);if(d&&!e)b.className=(b.className||"")+" "+c;else if(e&&!d){d=(b.className||"").split(/\s+/);e="";for(var g=0;g<d.length;g++)if(d[g]!=c)e+=d[g]+" ";b.className=r.a.l(e)}},Ra:function(b,c){b=r.a.d(b);c=r.a.d(c);for(var d=[],e=b;e<=c;e++)d.push(e);return d},ga:function(b){for(var c=[],d=b.length-1;d>=0;d--)c.push(b[d]);return c},P:/MSIE 6/i.test(navigator.userAgent),La:/MSIE 7/i.test(navigator.userAgent),da:function(b,c){for(var d=r.a.ga(b.getElementsByTagName("INPUT")).concat(r.a.ga(b.getElementsByTagName("TEXTAREA"))),
e=typeof c=="string"?function(i){return i.name===c}:function(i){return c.test(i.name)},g=[],h=d.length-1;h>=0;h--)e(d[h])&&g.push(d[h]);return g},F:function(b){if(typeof b=="string")if(b=r.a.l(b)){if(window.JSON&&window.JSON.parse)return window.JSON.parse(b);return(new Function("return "+b))()}return o},T:function(b){if(typeof JSON=="undefined"||typeof JSON.stringify=="undefined")a(Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js"));
return JSON.stringify(r.a.d(b))},Qa:function(b,c,d){d=d||{};var e=d.params||{},g=d.includeFields||this.ba,h=b;if(typeof b=="object"&&b.tagName=="FORM"){h=b.action;for(var i=g.length-1;i>=0;i--)for(var j=r.a.da(b,g[i]),l=j.length-1;l>=0;l--)e[j[l].name]=j[l].value}c=r.a.d(c);var k=document.createElement("FORM");k.style.display="none";k.action=h;k.method="post";for(var n in c){b=document.createElement("INPUT");b.name=n;b.value=r.a.T(r.a.d(c[n]));k.appendChild(b)}for(n in e){b=document.createElement("INPUT");
b.name=n;b.value=e[n];k.appendChild(b)}document.body.appendChild(k);d.submitter?d.submitter(k):k.submit();setTimeout(function(){k.parentNode.removeChild(k)},0)},e:{Ya:0,w:"__ko__"+(new Date).getTime(),Za:{},t:function(b,c){var d=r.a.e.ca(b,p);return d===undefined?undefined:d[c]},la:function(b,c,d){r.a.e.ca(b,m)[c]=d},ca:function(b,c){var d=b[r.a.e.w];if(!d){if(!c)return;d=b[r.a.e.w]="ko"+r.a.e.Ya++;r.a.e[d]={}}return r.a.e[d]},M:function(b){var c=b[r.a.e.w];if(c){delete r.a.e[c];b[r.a.e.w]=o}},N:function(b){if(!(b.nodeType!=
1&&b.nodeType!=9)){r.a.e.M(b);b=b.getElementsByTagName("*");for(var c=0,d=b.length;c<d;c++)r.a.e.M(b[c])}}}}};r.b("ko.utils",r.a);r.b("ko.utils.arrayForEach",r.a.h);r.b("ko.utils.arrayFirst",r.a.xa);r.b("ko.utils.arrayFilter",r.a.J);r.b("ko.utils.arrayGetDistinctValues",r.a.Y);r.b("ko.utils.arrayIndexOf",r.a.i);r.b("ko.utils.arrayMap",r.a.K);r.b("ko.utils.arrayPushAll",r.a.L);r.b("ko.utils.arrayRemoveItem",r.a.Z);r.b("ko.utils.fieldsIncludedWithJsonPost",r.a.ba);r.b("ko.utils.getFormFields",r.a.da);
r.b("ko.utils.postJson",r.a.Qa);r.b("ko.utils.parseJson",r.a.F);r.b("ko.utils.stringifyJson",r.a.T);r.b("ko.utils.range",r.a.Ra);r.b("ko.utils.triggerEvent",r.a.qa);r.b("ko.utils.unwrapObservable",r.a.d);Function.prototype.bind||(Function.prototype.bind=function(f){var b=this,c=Array.prototype.slice.call(arguments);f=c.shift();return function(){return b.apply(f,c.concat(Array.prototype.slice.call(arguments)))}});
r.j=function(){function f(){return((1+Math.random())*4294967296|0).toString(16).substring(1)}function b(d,e){if(d)if(d.nodeType==8){var g=r.j.ia(d.nodeValue);g!=o&&e.push({Ca:d,Na:g})}else if(d.nodeType==1){g=0;for(var h=d.childNodes,i=h.length;g<i;g++)b(h[g],e)}}var c={};return{R:function(d){if(typeof d!="function")a(Error("You can only pass a function to ko.memoization.memoize()"));var e=f()+f();c[e]=d;return"<!--[ko_memo:"+e+"]--\>"},ra:function(d,e){var g=c[d];if(g===undefined)a(Error("Couldn't find any memo with ID "+
d+". Perhaps it's already been unmemoized."));try{g.apply(o,e||[]);return m}finally{delete c[d]}},sa:function(d,e){var g=[];b(d,g);for(var h=0,i=g.length;h<i;h++){var j=g[h].Ca,l=[j];e&&r.a.L(l,e);r.j.ra(g[h].Na,l);j.nodeValue="";j.parentNode&&j.parentNode.removeChild(j)}},ia:function(d){return(d=d.match(/^\[ko_memo\:(.*?)\]$/))?d[1]:o}}}();r.b("ko.memoization",r.j);r.b("ko.memoization.memoize",r.j.R);r.b("ko.memoization.unmemoize",r.j.ra);r.b("ko.memoization.parseMemoText",r.j.ia);
r.b("ko.memoization.unmemoizeDomNodeAndDescendants",r.j.sa);r.Wa=function(f,b){this.za=f;this.s=b;r.g(this,"dispose",this.s)};r.U=function(){var f=[];this.V=function(b,c){var d=new r.Wa(c?function(){b.call(c)}:b,function(){r.a.Z(f,d)});f.push(d);return d};this.v=function(b){r.a.h(f.slice(0),function(c){c&&c.za(b)})};this.Ja=function(){return f.length};r.g(this,"subscribe",this.V);r.g(this,"notifySubscribers",this.v);r.g(this,"getSubscriptionsCount",this.Ja)};
r.fa=function(f){return typeof f.V=="function"&&typeof f.v=="function"};r.b("ko.subscribable",r.U);r.b("ko.isSubscribable",r.fa);r.z=function(){var f=[];return{ya:function(){f.push([])},end:function(){return f.pop()},ja:function(b){if(!r.fa(b))a("Only subscribable things can act as dependencies");f.length>0&&f[f.length-1].push(b)}}}();
r.p=function(f){function b(){if(arguments.length>0){c=arguments[0];b.v(c);return this}else{r.z.ja(b);return c}}var c=f;b.n=r.p;b.H=function(){b.v(c)};r.U.call(b);r.g(b,"valueHasMutated",b.H);return b};r.C=function(f){if(f===o||f===undefined||f.n===undefined)return p;if(f.n===r.p)return m;return r.C(f.n)};r.D=function(f){if(typeof f=="function"&&f.n===r.p)return m;if(typeof f=="function"&&f.n===r.m&&f.Ka)return m;return p};r.b("ko.observable",r.p);r.b("ko.isObservable",r.C);
r.b("ko.isWriteableObservable",r.D);
r.Pa=function(f){var b=new r.p(f);r.a.h(["pop","push","reverse","shift","sort","splice","unshift"],function(c){b[c]=function(){var d=b();d=d[c].apply(d,arguments);b.H();return d}});r.a.h(["slice"],function(c){b[c]=function(){var d=b();return d[c].apply(d,arguments)}});b.remove=function(c){for(var d=b(),e=[],g=[],h=typeof c=="function"?c:function(k){return k===c},i=0,j=d.length;i<j;i++){var l=d[i];h(l)?g.push(l):e.push(l)}b(e);return g};b.Sa=function(c){if(!c)return[];return b.remove(function(d){return r.a.i(c,
d)>=0})};b.$=function(c){for(var d=b(),e=typeof c=="function"?c:function(h){return h===c},g=d.length-1;g>=0;g--)if(e(d[g]))d[g]._destroy=m;b.H()};b.Ba=function(c){if(!c)return[];return b.$(function(d){return r.a.i(c,d)>=0})};b.indexOf=function(c){var d=b();return r.a.i(d,c)};b.replace=function(c,d){var e=b.indexOf(c);if(e>=0){b()[e]=d;b.H()}};r.g(b,"remove",b.remove);r.g(b,"removeAll",b.Sa);r.g(b,"destroy",b.$);r.g(b,"destroyAll",b.Ba);r.g(b,"indexOf",b.indexOf);return b};
r.b("ko.observableArray",r.Pa);
r.m=function(f,b,c){function d(){r.a.h(i,function(k){k.s()});i=[]}function e(k){d();r.a.h(k,function(n){i.push(n.V(g))})}function g(){if(l&&typeof c.disposeWhen=="function")if(c.disposeWhen()){h.s();return}try{r.z.ya();j=c.owner?c.read.call(c.owner):c.read()}finally{var k=r.a.Y(r.z.end());e(k)}h.v(j);l=m}function h(){if(arguments.length>0)if(typeof c.write==="function"){var k=arguments[0];c.owner?c.write.call(c.owner,k):c.write(k)}else a("Cannot write a value to a dependentObservable unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");else{l||
g();r.z.ja(h);return j}}if(f&&typeof f=="object")c=f;else{c=c||{};c.read=f||c.read;c.owner=b||c.owner}if(typeof c.read!="function")a("Pass a function that returns the value of the dependentObservable");var i=[],j,l=p;h.n=r.m;h.Ha=function(){return i.length};h.Ka=typeof c.write==="function";h.s=function(){d()};r.U.call(h);c.deferEvaluation!==m&&g();r.g(h,"dispose",h.s);r.g(h,"getDependenciesCount",h.Ha);return h};r.m.n=r.p;r.b("ko.dependentObservable",r.m);
(function(){function f(d,e,g){g=g||new c;d=e(d);if(!(typeof d=="object"&&d!==o&&d!==undefined))return d;var h=d instanceof Array?[]:{};g.save(d,h);b(d,function(i){var j=e(d[i]);switch(typeof j){case "boolean":case "number":case "string":case "function":h[i]=j;break;case "object":case "undefined":var l=g.t(j);h[i]=l!==undefined?l:f(j,e,g)}});return h}function b(d,e){if(d instanceof Array)for(var g=0;g<d.length;g++)e(g);else for(g in d)e(g)}function c(){var d=[],e=[];this.save=function(g,h){var i=r.a.i(d,
g);if(i>=0)e[i]=h;else{d.push(g);e.push(h)}};this.t=function(g){g=r.a.i(d,g);return g>=0?e[g]:undefined}}r.pa=function(d){if(arguments.length==0)a(Error("When calling ko.toJS, pass the object you want to convert."));return f(d,function(e){for(var g=0;r.C(e)&&g<10;g++)e=e();return e})};r.toJSON=function(d){d=r.pa(d);return r.a.T(d)}})();r.b("ko.toJS",r.pa);r.b("ko.toJSON",r.toJSON);
r.f={k:function(f){if(f.tagName=="OPTION"){if(f.__ko__hasDomDataOptionValue__===m)return r.a.e.t(f,r.c.options.ha);return f.getAttribute("value")}else return f.tagName=="SELECT"?f.selectedIndex>=0?r.f.k(f.options[f.selectedIndex]):undefined:f.value},I:function(f,b){if(f.tagName=="OPTION")switch(typeof b){case "string":case "number":r.a.e.M(f);"__ko__hasDomDataOptionValue__"in f&&delete f.__ko__hasDomDataOptionValue__;f.value=b;break;default:r.a.e.la(f,r.c.options.ha,b);f.__ko__hasDomDataOptionValue__=
m;f.value=""}else if(f.tagName=="SELECT")for(var c=f.options.length-1;c>=0;c--){if(r.f.k(f.options[c])==b){f.selectedIndex=c;break}}else{if(b===o||b===undefined)b="";f.value=b}}};r.b("ko.selectExtensions",r.f);r.b("ko.selectExtensions.readValue",r.f.k);r.b("ko.selectExtensions.writeValue",r.f.I);
r.o=function(){function f(e,g){return e.replace(b,function(h,i){return g[i]})}var b=/\[ko_token_(\d+)\]/g,c=/^[\_$a-z][\_$a-z0-9]*(\[.*?\])*(\.[\_$a-z][\_$a-z0-9]*(\[.*?\])*)*$/i,d=["true","false"];return{F:function(e){e=r.a.l(e);if(e.length<3)return{};for(var g=[],h=o,i,j=e.charAt(0)=="{"?1:0;j<e.length;j++){var l=e.charAt(j);if(h===o)switch(l){case '"':case "'":case "/":h=j;i=l;break;case "{":h=j;i="}";break;case "[":h=j;i="]"}else if(l==i){l=e.substring(h,j+1);g.push(l);var k="[ko_token_"+(g.length-
1)+"]";e=e.substring(0,h)+k+e.substring(j+1);j-=l.length-k.length;h=o}}h={};e=e.split(",");i=0;for(j=e.length;i<j;i++){k=e[i];var n=k.indexOf(":");if(n>0&&n<k.length-1){l=r.a.l(k.substring(0,n));k=r.a.l(k.substring(n+1));if(l.charAt(0)=="{")l=l.substring(1);if(k.charAt(k.length-1)=="}")k=k.substring(0,k.length-1);l=r.a.l(f(l,g));k=r.a.l(f(k,g));h[l]=k}}return h},O:function(e){var g=r.o.F(e),h=[],i;for(i in g){var j=g[i],l;l=j;l=r.a.i(d,r.a.l(l).toLowerCase())>=0?p:l.match(c)!==o;if(l){h.length>0&&
h.push(", ");h.push(i+" : function(__ko_value) { "+j+" = __ko_value; }")}}if(h.length>0)e=e+", '_ko_property_writers' : { "+h.join("")+" } ";return e}}}();r.b("ko.jsonExpressionRewriting",r.o);r.b("ko.jsonExpressionRewriting.parseJson",r.o.F);r.b("ko.jsonExpressionRewriting.insertPropertyAccessorsIntoJson",r.o.O);r.c={};
r.X=function(f,b,c){function d(i){return function(){return h[i]}}function e(){return h}var g=m,h;new r.m(function(){var i;if(!(i=typeof b=="function"?b():b)){var j=f.getAttribute("data-bind");try{var l=" { "+r.o.O(j)+" } ";i=r.a.Ga(l,c===o?window:c)}catch(k){a(Error("Unable to parse binding attribute.\nMessage: "+k+";\nAttribute value: "+j))}}h=i;if(g)for(var n in h)r.c[n]&&typeof r.c[n].init=="function"&&(0,r.c[n].init)(f,d(n),e,c);for(n in h)r.c[n]&&typeof r.c[n].update=="function"&&(0,r.c[n].update)(f,
d(n),e,c)},o,{disposeWhen:function(){return!r.a.A(f)}});g=p};r.ua=function(f,b){if(b&&b.nodeType==undefined)a(Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node (note: this is a breaking change since KO version 1.05)"));b=b||window.document.body;var c=r.a.Ia(b,"data-bind");r.a.h(c,function(d){r.X(d,o,f)})};r.b("ko.bindingHandlers",r.c);r.b("ko.applyBindings",r.ua);
r.c.click={init:function(f,b,c,d){r.a.q(f,"click",function(e){var g,h=b();try{g=h.call(d)}finally{if(g!==m)if(e.preventDefault)e.preventDefault();else e.returnValue=p}})}};r.c.submit={init:function(f,b,c,d){if(typeof b()!="function")a(Error("The value for a submit binding must be a function to invoke on submit"));r.a.q(f,"submit",function(e){var g,h=b();try{g=h.call(d,f)}finally{if(g!==m)if(e.preventDefault)e.preventDefault();else e.returnValue=p}})}};
r.c.visible={update:function(f,b){var c=r.a.d(b()),d=f.style.display!="none";if(c&&!d)f.style.display="";else if(!c&&d)f.style.display="none"}};r.c.enable={update:function(f,b){var c=r.a.d(b());if(c&&f.disabled)f.removeAttribute("disabled");else if(!c&&!f.disabled)f.disabled=m}};r.c.disable={update:function(f,b){r.c.enable.update(f,function(){return!r.a.d(b())})}};
r.c.value={init:function(f,b,c){var d=c().valueUpdate||"change",e=p;if(r.a.Va(d,"after")){e=m;d=d.substring(5)}var g=e?function(h){setTimeout(h,0)}:function(h){h()};r.a.q(f,d,function(){g(function(){var h=b(),i=r.f.k(f);if(r.D(h))h(i);else{h=c();h._ko_property_writers&&h._ko_property_writers.value&&h._ko_property_writers.value(i)}})})},update:function(f,b){var c=r.a.d(b()),d=r.f.k(f),e=c!=d;if(c===0&&d!==0&&d!=="0")e=m;if(e){d=function(){r.f.I(f,c)};d();f.tagName=="SELECT"&&setTimeout(d,0)}if(f.tagName==
"SELECT"){d=r.f.k(f);d!==c&&r.a.qa(f,"change")}}};
r.c.options={update:function(f,b,c){if(f.tagName!="SELECT")a(Error("options binding applies only to SELECT elements"));var d=r.a.K(r.a.J(f.childNodes,function(k){return k.tagName&&k.tagName=="OPTION"&&k.selected}),function(k){return r.f.k(k)||k.innerText||k.textContent}),e=f.scrollTop,g=r.a.d(b());r.a.aa(f);if(g){var h=c();if(typeof g.length!="number")g=[g];if(h.optionsCaption){var i=document.createElement("OPTION");i.innerHTML=h.optionsCaption;r.f.I(i,undefined);f.appendChild(i)}c=0;for(b=g.length;c<
b;c++){i=document.createElement("OPTION");var j=typeof h.optionsValue=="string"?g[c][h.optionsValue]:g[c],l=typeof h.optionsText=="string"?g[c][h.optionsText]:j;j=r.a.d(j);l=r.a.d(l);r.f.I(i,j);i.innerHTML=l.toString();f.appendChild(i)}g=f.getElementsByTagName("OPTION");c=h=0;for(b=g.length;c<b;c++)if(r.a.i(d,r.f.k(g[c]))>=0){r.a.na(g[c],m);h++}if(e)f.scrollTop=e}}};r.c.options.ha="__ko.bindingHandlers.options.optionValueDomData__";
r.c.selectedOptions={ea:function(f){var b=[];f=f.childNodes;for(var c=0,d=f.length;c<d;c++){var e=f[c];e.tagName=="OPTION"&&e.selected&&b.push(r.f.k(e))}return b},init:function(f,b,c){r.a.q(f,"change",function(){var d=b();if(r.D(d))d(r.c.selectedOptions.ea(this));else{d=c();d._ko_property_writers&&d._ko_property_writers.value&&d._ko_property_writers.value(r.c.selectedOptions.ea(this))}})},update:function(f,b){if(f.tagName!="SELECT")a(Error("values binding applies only to SELECT elements"));var c=
r.a.d(b());if(c&&typeof c.length=="number")for(var d=f.childNodes,e=0,g=d.length;e<g;e++){var h=d[e];h.tagName=="OPTION"&&r.a.na(h,r.a.i(c,r.f.k(h))>=0)}}};r.c.text={update:function(f,b){var c=r.a.d(b());if(c===o||c===undefined)c="";typeof f.innerText=="string"?f.innerText=c:f.textContent=c}};r.c.css={update:function(f,b){var c=r.a.d(b()||{}),d;for(d in c)if(typeof d=="string"){var e=r.a.d(c[d]);r.a.Xa(f,d,e)}}};
r.c.style={update:function(f,b){var c=r.a.d(b()||{}),d;for(d in c)if(typeof d=="string"){var e=r.a.d(c[d]);f.style[d]=e||""}}};r.c.uniqueName={init:function(f,b){if(b()){f.name="ko_unique_"+ ++r.c.uniqueName.Aa;r.a.P&&f.mergeAttributes(document.createElement("<INPUT name='"+f.name+"'/>"),p)}}};r.c.uniqueName.Aa=0;
r.c.checked={init:function(f,b,c){function d(){var e;if(f.type=="checkbox")e=f.checked;else if(f.type=="radio"&&f.checked)e=f.value;else return;var g=b();if(r.D(g))g()!==e&&g(e);else{g=c();g._ko_property_writers&&g._ko_property_writers.checked&&g._ko_property_writers.checked(e)}}r.a.q(f,"change",d);r.a.q(f,"click",d);f.type=="radio"&&!f.name&&r.c.uniqueName.init(f,function(){return m})},update:function(f,b){var c=r.a.d(b());if(f.type=="checkbox")(f.checked=c)&&r.a.P&&f.mergeAttributes(document.createElement("<INPUT type='checkbox' checked='checked' />"),
p);else if(f.type=="radio"){f.checked=f.value==c;if(f.value==c&&(r.a.P||r.a.La))f.mergeAttributes(document.createElement("<INPUT type='radio' checked='checked' />"),p)}}};
r.W=function(){this.renderTemplate=function(){a("Override renderTemplate in your ko.templateEngine subclass")};this.isTemplateRewritten=function(){a("Override isTemplateRewritten in your ko.templateEngine subclass")};this.rewriteTemplate=function(){a("Override rewriteTemplate in your ko.templateEngine subclass")};this.createJavaScriptEvaluatorBlock=function(){a("Override createJavaScriptEvaluatorBlock in your ko.templateEngine subclass")}};r.b("ko.templateEngine",r.W);
r.G=function(){var f=/(<[a-z]+\d*(\s+(?!data-bind=)[a-z0-9]+(=(\"[^\"]*\"|\'[^\']*\'))?)*\s+)data-bind=(["'])([\s\S]*?)\5/g;return{Fa:function(b,c){c.isTemplateRewritten(b)||c.rewriteTemplate(b,function(d){return r.G.Oa(d,c)})},Oa:function(b,c){return b.replace(f,function(d,e,g,h,i,j,l){d=l;d=r.o.O(d);return c.createJavaScriptEvaluatorBlock("ko.templateRewriting.applyMemoizedBindingsToNextSibling(function() {                     return (function() { return { "+d+" } })()                 })")+e})},
va:function(b){return r.j.R(function(c,d){c.nextSibling&&r.X(c.nextSibling,b,d)})}}}();r.b("ko.templateRewriting",r.G);r.b("ko.templateRewriting.applyMemoizedBindingsToNextSibling",r.G.va);
(function(){function f(c,d,e,g,h){var i=r.a.d(g);h=h||{};var j=h.templateEngine||b;r.G.Fa(e,j);e=j.renderTemplate(e,i,h);if(typeof e.length!="number"||e.length>0&&typeof e[0].nodeType!="number")a("Template engine must return an array of DOM nodes");e&&r.a.h(e,function(l){r.j.sa(l,[g])});switch(d){case "replaceChildren":r.a.Ua(c,e);break;case "replaceNode":r.a.ka(c,e);break;case "ignoreTargetNode":break;default:a(Error("Unknown renderMode: "+d))}h.afterRender&&h.afterRender(e,g);return e}var b;r.oa=
function(c){if(c!=undefined&&!(c instanceof r.W))a("templateEngine must inherit from ko.templateEngine");b=c};r.S=function(c,d,e,g,h){e=e||{};if((e.templateEngine||b)==undefined)a("Set a template engine before calling renderTemplate");h=h||"replaceChildren";if(g){var i=g.nodeType?g:g.length>0?g[0]:o;return new r.m(function(){var j=f(g,h,c,d,e);if(h=="replaceNode"){g=j;i=g.nodeType?g:g.length>0?g[0]:o}},o,{disposeWhen:function(){return!i||!r.a.A(i)}})}else return r.j.R(function(j){r.S(c,d,e,j,"replaceNode")})};
r.Ta=function(c,d,e,g){new r.m(function(){var h=r.a.d(d)||[];if(typeof h.length=="undefined")h=[h];h=r.a.J(h,function(i){return e.includeDestroyed||!i._destroy});r.a.ma(g,h,function(i){return f(o,"ignoreTargetNode",c,i,e)},e)},o,{disposeWhen:function(){return!r.a.A(g)}})};r.c.template={update:function(c,d,e,g){d=r.a.d(d());e=typeof d=="string"?d:d.name;if(typeof d.foreach!="undefined")r.Ta(e,d.foreach||[],{afterAdd:d.afterAdd,beforeRemove:d.beforeRemove,includeDestroyed:d.includeDestroyed,afterRender:d.afterRender},
c);else{var h=d.data;r.S(e,typeof h=="undefined"?g:h,{afterRender:d.afterRender},c)}}}})();r.b("ko.setTemplateEngine",r.oa);r.b("ko.renderTemplate",r.S);
r.a.r=function(f,b,c){if(c===undefined)return r.a.r(f,b,1)||r.a.r(f,b,10)||r.a.r(f,b,Number.MAX_VALUE);else{f=f||[];b=b||[];for(var d=f,e=b,g=[],h=0;h<=e.length;h++)g[h]=[];h=0;for(var i=Math.min(d.length,c);h<=i;h++)g[0][h]=h;h=1;for(i=Math.min(e.length,c);h<=i;h++)g[h][0]=h;i=d.length;var j,l=e.length;for(h=1;h<=i;h++){var k=Math.min(l,h+c);for(j=Math.max(1,h-c);j<=k;j++)g[j][h]=d[h-1]===e[j-1]?g[j-1][h-1]:Math.min(g[j-1][h]===undefined?Number.MAX_VALUE:g[j-1][h]+1,g[j][h-1]===undefined?Number.MAX_VALUE:
g[j][h-1]+1)}f=f;b=b;c=f.length;d=b.length;e=[];h=g[d][c];if(h===undefined)g=o;else{for(;c>0||d>0;){i=g[d][c];j=d>0?g[d-1][c]:h+1;l=c>0?g[d][c-1]:h+1;k=d>0&&c>0?g[d-1][c-1]:h+1;if(j===undefined||j<i-1)j=h+1;if(l===undefined||l<i-1)l=h+1;if(k<i-1)k=h+1;if(j<=l&&j<k){e.push({status:"added",value:b[d-1]});d--}else{if(l<j&&l<k)e.push({status:"deleted",value:f[c-1]});else{e.push({status:"retained",value:f[c-1]});d--}c--}}g=e.reverse()}return g}};r.b("ko.utils.compareArrays",r.a.r);
(function(){function f(b,c){var d=[];r.m(function(){var e=b(c)||[];d.length>0&&r.a.ka(d,e);d.splice(0,d.length);r.a.L(d,e)},o,{disposeWhen:function(){return d.length==0||!r.a.A(d[0])}});return d}r.a.ma=function(b,c,d,e){c=c||[];e=e||{};var g=r.a.e.t(b,"setDomNodeChildrenFromArrayMapping_lastMappingResult")===undefined,h=r.a.e.t(b,"setDomNodeChildrenFromArrayMapping_lastMappingResult")||[],i=r.a.K(h,function(s){return s.wa}),j=r.a.r(i,c);c=[];var l=0,k=[];i=[];for(var n=o,q=0,w=j.length;q<w;q++)switch(j[q].status){case "retained":var t=
h[l];c.push(t);if(t.B.length>0)n=t.B[t.B.length-1];l++;break;case "deleted":r.a.h(h[l].B,function(s){k.push({element:s,index:q,value:j[q].value});n=s});l++;break;case "added":t=f(d,j[q].value);c.push({wa:j[q].value,B:t});for(var v=0,x=t.length;v<x;v++){var u=t[v];i.push({element:u,index:q,value:j[q].value});if(n==o)b.firstChild?b.insertBefore(u,b.firstChild):b.appendChild(u);else n.nextSibling?b.insertBefore(u,n.nextSibling):b.appendChild(u);n=u}}r.a.h(k,function(s){r.a.e.N(s.element)});d=p;if(!g){if(e.afterAdd)for(q=
0;q<i.length;q++)e.afterAdd(i[q].element,i[q].index,i[q].value);if(e.beforeRemove){for(q=0;q<k.length;q++)e.beforeRemove(k[q].element,k[q].index,k[q].value);d=m}}d||r.a.h(k,function(s){s.element.parentNode&&s.element.parentNode.removeChild(s.element)});r.a.e.la(b,"setDomNodeChildrenFromArrayMapping_lastMappingResult",c)}})();r.b("ko.utils.setDomNodeChildrenFromArrayMapping",r.a.ma);
r.Q=function(){function f(c){var d=document.getElementById(c);if(d==o)a(Error("Cannot find template with ID="+c));return d}this.u=function(){if(typeof jQuery=="undefined"||!jQuery.tmpl)return 0;if(jQuery.tmpl.tag)return 2;return 1}();var b=RegExp("__ko_apos__","g");this.renderTemplate=function(c,d){if(this.u==0)a(Error("jquery.tmpl not detected.\nTo use KO's default template engine, reference jQuery and jquery.tmpl. See Knockout installation documentation for more details."));if(this.u==1){var e=
'<script type="text/html">'+f(c).text+"<\/script>";e=jQuery.tmpl(e,d)[0].text.replace(b,"'");return jQuery.clean([e],document)}d=[d];e=f(c).text;return jQuery.tmpl(e,d)};this.isTemplateRewritten=function(c){return f(c).Ma===m};this.rewriteTemplate=function(c,d){var e=f(c),g=d(e.text);if(this.u==1){g=r.a.l(g);g=g.replace(/([\s\S]*?)(\${[\s\S]*?}|{{[\=a-z][\s\S]*?}}|$)/g,function(h,i,j){return i.replace(/\'/g,"__ko_apos__")+j})}e.text=g;e.Ma=m};this.createJavaScriptEvaluatorBlock=function(c){if(this.u==
1)return"{{= "+c+"}}";return"{{ko_code ((function() { return "+c+" })()) }}"};this.ta=function(c,d){document.write("<script type='text/html' id='"+c+"'>"+d+"<\/script>")};r.g(this,"addTemplate",this.ta);if(this.u>1)jQuery.tmpl.tag.ko_code={open:"_.push($1 || '');"}};r.Q.prototype=new r.W;r.oa(new r.Q);r.b("ko.jqueryTmplTemplateEngine",r.Q);

sard.module4 = {}; 

//IE
if(!Array.prototype.indexOf)
{      
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
}
//Spice Kit! Let's make 'em plugabble babby.

if(this.window && !window.console)
{                         
	var console = {log:function(){}}  
}
    
//le NAMESPACE
var	sk = { };

sard.module5 = {}; 
var Structr = function (fhClass, parent)
{
	if (!parent) parent = Structr.fh({});

	var that = Structr.extend(parent, fhClass);

	if (!that.__construct)
	{
		that.__construct = function() { };
	}

	that.__construct.prototype = that;

	//allow for easy extending.
	that.__construct.extend = function(child)
	{
		return Structr(child, that);
	};

	//return the constructor
	return that.__construct;
}; 

Structr.copy = function (from, to)
{
	if (!to) to = {};  
	
	var i;

	for(i in from) 
	{
		var fromValue = from[i],
		toValue = to[i],
		newValue;


		if (typeof fromValue == 'object') 
		{

			//if the toValue exists, and the fromValue is the same data type as the TO value, then
			//merge the FROM value with the TO value, instead of replacing it
			if (toValue && fromValue instanceof toValue.constructor)
			{
				newValue = toValue;
			}

			//otherwise replace it, because FROM has priority over TO
			else
			{
				newValue = fromValue instanceof Array ? [] : {};
			}

			// newValue = value instanceof Array ? [] : {};
			Structr.copy(fromValue, newValue);
		}
		else 
		{
			newValue = fromValue;
		}

		to[i] = newValue;
	}

	return to;
};


//returns a method owned by an object
Structr.getMethod = function (that, property)
{
	return function()
	{
		return that[property].apply(that, arguments);
	};
};       

//finds all properties with modifiers
Structr.findProperties = function (target, modifier)
{
	var props = [],
		property;

	for(property in target)
	{
		var v = target[property];

		if (v && v[modifier])
		{
			props.push(property);
		}
	}

	return props;
};

Structr.nArgs = function(func)
{
	var inf = func.toString().replace(/\{[\W\S]+\}/g, '').match(/\w+(?=[,\)])/g);
	return inf ? inf.length :0;
}

Structr.getFuncsByNArgs = function(that, property)
{
	return that.__private['overload::' + property] || (that.__private['overload::' + property] = {});
}

Structr.getOverloadedMethod = function(that, property, nArgs)
{
	var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
	
	return funcsByNArgs[nArgs];
}

Structr.setOverloadedMethod = function(that, property, func, nArgs)
{
	var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
	
	if(func.overloaded) return funcsByNArgs;
	
	funcsByNArgs[nArgs || Structr.nArgs(func)] = func;
	
	return funcsByNArgs;
}

//modifies how properties behave in a class
Structr.modifiers =  {

	/**
	* overrides given method
	*/

	m_override: function (that, property, newMethod)
	{
		var oldMethod = (that.__private && that.__private[property]) || that[property] || function (){},
			parentMethod = oldMethod;
		
		if(oldMethod.overloaded)
		{
			var overloadedMethod = oldMethod,
				nArgs = Structr.nArgs(newMethod);
			parentMethod = Structr.getOverloadedMethod(that, property, nArgs);
		}
		
		//wrap the method so we can access the parent overloaded function
		var wrappedMethod = function ()
		{
			this._super = parentMethod;
			var ret = newMethod.apply(this, arguments);
			delete this._super;
			return ret;
		}
		
		if(oldMethod.overloaded)
		{
			return Structr.modifiers.m_overload(that, property, wrappedMethod, nArgs);
		}
		
		return wrappedMethod;
	},


	/**
	* getter / setter which are physical functions: e.g: test.myName(), and test.myName('craig')
	*/

	m_explicit: function (that, property, gs)
	{
		var pprop = '__'+property;

		//if GS is not defined, then set defaults.
		if (typeof gs != 'object') 
		{
			gs = {};
		}

		if (!gs.get) 
		gs.get = function ()
		{
			return this._value;
		}

		if (!gs.set) 
		gs.set = function (value)
		{
			this._value = value;
		}


		return function (value)
		{
			//getter
			if (!arguments.length) 
			{
				this._value = this[pprop];
				var ret = gs.get.apply(this);
				delete this._value;
				return ret;
			}

			//setter
			else 
			{
				//don't call the gs if the value isn't the same
				if (this[pprop] == value ) 
				return;

				//set the current value to the setter value
				this._value = this[pprop];

				//set
				gs.set.apply(this, [value]);

				//set the new value. this only matters if the setter set it 
				this[pprop] = this._value;
			}
		};
	},

    /**
 	 */

	m_implicit: function (that, property, egs)
	{
		//keep the original function available so we can override it
		that.__private[property] = egs;

		that.__defineGetter__(property, egs);
		that.__defineSetter__(property, egs);
	},
	
	/**
	 */
	
	m_overload: function (that, property, value, nArgs)
	{                    
		var funcsByNArgs = Structr.setOverloadedMethod(that, property, value, nArgs);
				
		var multiFunc = function()
		{          
			var func = funcsByNArgs[arguments.length];
			
			if(func)
			{
				return funcsByNArgs[arguments.length].apply(this, arguments);
			}             
			else
			{
				var expected = [];
				
				for(var sizes in funcsByNArgs)
				{
					expected.push(sizes);
				}
				
				throw new Error('Expected '+expected.join(',')+' parameters, got '+arguments.length+'.');
			}
		}    
		
		multiFunc.overloaded = true;                                          
		
		return multiFunc; 
	}
}               


//extends from one class to another. note: the TO object should be the parent. a copy is returned.
Structr.extend = function (from, to)
{
	if (!to) 
	to = {};

	var that = {
		__private: {

			//contains modifiers for all properties of object
			propertyModifiers: {}
		}
	};

	if (to instanceof Function)  to = to();

	Structr.copy(from, that);

	var usedProperties = {},
	property;


	for(property in to) 
	{
		var value = to[property];


		var propModifiersAr = property.split(' '), //property is at the end of the modifiers. e.g: override bindable testProperty
		propertyName = propModifiersAr.pop(),

		modifierList = that.__private.propertyModifiers[propertyName] || (that.__private.propertyModifiers[propertyName] = []);
                                
             

		if (propModifiersAr.length) 
		{
			var propModifiers = {};
			for(var i = propModifiersAr.length; i--;) 
			{
				var modifier = propModifiersAr[i];

				propModifiers['m_' + propModifiersAr[i]] = 1;

				if (modifierList.indexOf(modifier) == -1)
				{
					modifierList.push(modifier);
				}
			}                   

			//if explicit, or implicit modifiers are set, then we need an explicit modifier first
			if (propModifiers.m_explicit || propModifiers.m_implicit) 
			{
				value = Structr.modifiers.m_explicit(that, propertyName, value);
			}

			if (propModifiers.m_override) 
			{
				value = Structr.modifiers.m_override(that, propertyName, value);
			}

			if (propModifiers.m_implicit) 
			{
				//getter is set, don't continue.
				Structr.modifiers.m_implicit(that, propertyName, value);
				continue;
			}
		}

		for(var j = modifierList.length; j--;)
		{
			value[modifierList[j]] = true;
		}
		
		if(usedProperties[propertyName])
		{                       
			var oldValue = that[propertyName];
			
			//first property will NOT be overloaded, so we need to check it here
			if(!oldValue.overloaded) Structr.modifiers.m_overload(that, propertyName, oldValue, undefined);
			 
			value = Structr.modifiers.m_overload(that, propertyName, value, undefined);
		}	
		
		usedProperties[propertyName] = 1;

		that.__private[propertyName] = that[propertyName] = value;
	}

	//if the parent constructor exists, and the child constructor IS the parent constructor, it means
	//the PARENT constructor was defined, and the  CHILD constructor wasn't, so the parent prop was copied over. We need to create a new function, and 
	//call the parent constructor when the child is instantiated, otherwise it'll be the same class essentially (setting proto)
	if (that.__construct && from.__construct && that.__construct == from.__construct)
	{
		that.__construct = Structr.modifiers.m_override(that, '__construct', function()
		{
			this._super.apply(this, arguments);
		});
	}

     
	var propertyName;
	
	//apply the static props
	for(propertyName in that) 
	{
		var value = that[propertyName];

		//if the value is static, then tack it onto the constructor
		if (value && value['static'])
		{
			that.__construct[propertyName] = value;
			delete that[propertyName];
		}                                                                  
	}



	return that;
}


//really.. this isn't the greatest idea if a LOT of objects
//are being allocated in a short perioud of time. use the closure
//method instead. This is great for objects which are instantiated ONCE, or a couple of times :P.
Structr.fh = function (that)
{
	that = Structr.extend({}, that);

	that.getMethod = function (property)
	{
		return Structr.getMethod(this, property);
	}

	that.extend = function (target)
	{
		return Structr.extend(this, target);
	}

	//copy to target object
	that.copyTo = function (target)
	{
		Structr.copy(this, target);
	}   

	return that;
}

//for the spicekit
if(this.sk) sk.Structr = Structr;

try
{
	sard.module5.Structr = Structr; 
}catch(e)
{
	
}
sard.module6 = {}; 
sard.module4;
var Structr = sard.module5.Structr;

sard.module6.Structr = Structr;
sard.module7 = {}; 
var sk = sard.module6,
Structr = sk.Structr;

sard.module7.EventEmitter = {
	'__construct': function ()
	{                      
		this._listeners = {};
	},
	'addListener': function (type, callback)
	{             
		(this._listeners[type] || (this._listeners[type] = [])).push(callback);       
		var self = this;
		
		return {
			dispose: function ()
			{                                
				self.removeListener(type, callback);
			}
		}
	},
	'hasEventListener': function(type, callback)
	{
		return !!this._listeners[type];
	},
	'getNumListeners': function(type, callback)
	{
		return this.getEventListeners(type).length;
	},
	'removeListener': function (type, callback)
	{
		var lists = this._listeners[type],i,
		   self = this;
		if(!lists) return;  
		if((i = lists.indexOf(callback)) > -1)
		{
			lists.splice(i,1);
			
			if(!lists.length)
			{
				delete self._listeners[type];
			}
		}
	},
	'getEventListeners': function(type)
	{
		return this._listeners[type] || [];
	},
	'removeListeners': function (type)
	{
		delete this._listeners[type];
	},
	'removeAllListeners': function()
	{
		this._listeners = {};
	},
	'dispose': function ()
	{
		this._listeners = { };
	},
	'emit': function ()
	{                 
		var args = [],
			type = arguments[0],
			lists;
			
		for(var i = 1, n = arguments.length; i < n; i++)
		{
			args[i-1] = arguments[i];
		}       
		
		
		if(lists = this._listeners[type])  
		for(var i = lists.length; i--;)
		{                       
			lists[i].apply(this, args);
		}     
	}
}

sard.module7.EventEmitter = Structr(sard.module7.EventEmitter);
sard.module8 = {}; 
var sk = sard.module7;

sard.module8.Queue = {
	running:false,
	runNext:true,
	waiting:false,
	autoStart:false,
	'override __construct':function(autoStart)
	{
		this._super();
		this.autoStart = autoStart;
		this.stack = [];
	}
	,unshift:function(callback)
	{
		this.stack.unshift(callback);

		if(this.autoStart)
		this.start();
	},
	remove:function(callback)
	{
		var i = this.stack.indexOf(callback);
		if(i > -1)
		{
			this.stack.splice(i,1);
			return true;
		}
		return false;
	},
	add:function(callback)
	{
		this.stack.push(callback);

		if(!callback) throw new Error('callbacks cannot be undefined');

		if(this.autoStart)
		this.start();
	},
	start:function(force)
	{                         
		if((this.running || !this.runNext) && !force)
		return false;

		this.autoStart = true;

		if(!this.stack.length)
		{                           
			this.running = false;
			return this.emit('complete');
		}                         

		var callback = this.stack.shift();


		this.emit('cue',callback) 

		this.running = true;

		callback(this);
	},
	stop:function()
	{
		this.runNext = false;
	},
	next:function()
	{
		this.running = false;
		this.start();
	},
	clear:function()
	{
		this.stack = [];
	}             
} 

sard.module8.Queue = sk.EventEmitter.extend(sard.module8.Queue);


//executes items in batches
sard.module8.BatchQueue = sard.module8.Queue.extend({
	'override __construct': function (autoStart, max)
	{ 
		this.numRunning = 0;
		this._super(autoStart);
		this.max = max || 5;   
		var s = this;
 
		this.addListener('cue',function ()
		{                      
			s.numRunning++;
		})
	}
	,'override start':function ()
	{                     
		this._super(this.numRunning < this.max);
	},
	'override next': function ()
	{
		if(this.numRunning > 0)
			this.numRunning--;
		
		this._super();
	}
});


sard.module9 = {}; 
(function($)
{  
	$.fn.gridly = function(ops)
	{

		//the context is the element gridly currently attached to.
		var ctx = this.context,
		self = this,
		ops = ops || {},

		//tells gridly to animate the grid on change / resize
		animate = ops.animate == undefined ? true : ops.animate,
		
		//tells gridly to update on gridly(). useful for false if we're just looking at some stats such as the grid width
		update  = ops.update  == undefined ? true : ops.update,

		//tells gridly to return the controller of the current element
		returnGdly = ops.getController;


		//if gdly is already defined then don't re-execute             
		if(!ctx.gdly)
		{
			var gdly = ctx.gdly = 
			{        
				easing:
				{
					type:'easeOutExpo'
					,duration:200
				}
				,update:function(animate)
				{                 
					      
					//FIRST we need to find the right positions with each cell         
					var cellsToPosition =  gdly.organize.bestFit(); 

					//next up, let's move 'em 
					gdly.positionCells(cellsToPosition,animate ? gdly.animateCell : gdly.moveCell);   
					
					
					//let's trigger an update so anything outside gridly knows when the grid's changed
					$(ctx).trigger('gridly.update');
				}


				//moves the cells to their rightful place         
				,positionCells:function(cellsToPosition,callback)
				{                                             
					for(var i = cellsToPosition.length; i--;)
					{
						var c = cellsToPosition[i],
						cell = c.cell;
						
						var offset = cell.offset();
						
						//let's not move the cell if it's not going anywhere...
						//this doesn't happen ever...
						/*if(offset.left == c.x && offset.top == c.y)
						{	console.log('not going anywhere...')
							continue;
						}*/
						
						cell.css({position:'absolute'});
						callback(c);

					}      
				}
				,animateCell:function(c)
				{           
					//stop all animations
					c.cell.stop();
					
					//animate the position of the grid
					c.cell.animate({left:c.x,top:c.y,opacity:1},gdly.easing.duration,gdly.easing.type)  
				}  
				,moveCell:function(c)
				{
					//useful for devices such as mobile/tablets where animations might not be
					//ideal for ALL cells.
					c.cell.css({left:c.x,top:c.y});
				}


				//calculates where each cell should go, and returns the coordinates
				,organize:
				{     
					keepOrder:function()
					{
						
					}  
					    
					//forces items to fit based on their content length
					,forceFit:function()
					{ 
						
					}
					
					
					//figured out 
					,bestFit:function()
					{                              

						//the child cells
						var children = ctx.childNodes,    

						//the width of the grid
						width = self.innerWidth(),  

						//padding between cells
						padding = ops.padding || 8,

						//start ONLY after the first row has started off!
						columnsFound = false, 

						numColumns = 0,


						//the x position of the current box
						x = 0,

						//make it easy, and faster by evaluating just an array. This also
						//allows us to use DIFFERENT ALGORITHMS for sorting boxes. Also used in edgar.
						cellsToPosition = [];


						//checks to see if the inner cell fits in the outer cell. this is a method for now
						//because it MIGHT change in the future when I debug with different sized cells.
						function fitsInCell(outer,inner)
						{    
							return inner.width <= outer.width;       
							// return inner.x >= outer.x && inner.toX <= outer.toX                                    
						} 

						var useableCells = [];  

						//skip any cells we can't use
						for(var i = 0, n = children.length; i < n; i++)
						{
							var child = children[i];
							
							//no comments, text elements, or nodes which are hidden.
							if((child.nodeType != 1 && child.nodeType != 3)) continue;
							// if() continue;
							
							child = $(child);
							
							if(child.css('display') == 'none') continue;
							useableCells.push(child);
						}
						

						for(var i = 0, n = useableCells.length; i < n; i++)
						{


							var cell = useableCells[i],
							cw = cell.width(),
							ch = cell.height();
							
							console.log()

							if(isNaN(cw)) cw = 0;
							if(isNaN(ch)) ch = 0;


							//okay, now that we've established the FIRST ROW, we can start
							//calculating where the other grid items go. We need to fit it like
							//a puzzle.
							if(x + cw > width)
							{    
								//reset the x position  
								columnsFound = true; 
							} 

							//the cell we're about to evaluate
							var icell = {
								x:x, 
								index:i,
								y:0, 
								width:cw,
								height:ch, 
								toX:x + cw, 
								toY:ch, 
								cell:cell
							}; 

							//NOTE: we push the cell BEFORE we run through the rest of the children because the for
							//loop never gets to this cell ;). Pushing the cell AFTER the following conditional statement
							//wouldn't work.

							cellsToPosition.push(icell)

							if(columnsFound)
							{                  

								var targetCell = null;

								//we want to loop through ALL of the children, starting with the LAST
								//item which should be the furthest down.    
								for(var j = i; j--;)
								{     
									//cell we're currently evaluating against
									var ocell = cellsToPosition[j];

									//skip any filled cells, but find the cell that's needn' some filln', which is of course the 
									//column with the SMALLEST height.     
									if(!ocell.filled && fitsInCell(ocell,icell) && (!targetCell || targetCell.toY > ocell.toY))
									{                              
										targetCell = ocell;                                              
									}
								}   

								//okie dokie. Now we have target column, we need to set the X position of that column       
								icell.x   		= targetCell.x;                                                      

								//set the y of the target column PLUS PADDING OF COURSE!!
								icell.y 	    = targetCell.toY + padding;   

								//now the current cell is open, for use, we need to set the toY so the NEXT cell using it can 
								//be pushed AFTER it.                 
								icell.toY = icell.y + icell.height;                       

								//once the target has a cell AFTER it, we need to make sure it's NEVER USED EVARRRR AGAIN
								targetCell.filled = true;               
							}       
							else
							{     
								//increment X + padding. THis chunk of code only gets executed until the columns are found 
								x += (icell.width || 0) + padding;  

								numColumns++;
							}
						}
                        
                        
 						
						gdly.numColumns = numColumns;
						gdly.width  = x;
           	
                        return cellsToPosition;
					} 
				} 
			};       
			
			function _lazyCallback(callback,duration)
			{
				var timeout;
				
				return function()
				{
					if(timeout) clearTimeout(timeout);
					timeout = setTimeout(callback,duration || 100);
				}
			}
			
			var resizeTimeout;
			               
			
			//tells ally gridly's to update. 
			$(window).bind('gridly.update',_lazyCallback(function()
			{              
				// gdly.easing.duration = 2000;             
				gdly.update(true);          
				// gdly.easing.duration = 200;
			},25))
			
			$(window).resize(_lazyCallback(function()
			{                                    
				gdly.update(animate);
			}));
			
			
		}                               
		
		if(update) ctx.gdly.update(animate);   
		
		return returnGdly ? ctx.gdly : this;
	}
	
	
})(jQuery);






                                                  
sard.module10 = {}; 
//don't burn CPU cycles with lots of intervals/timeouts
sard.module4;

sard.module10.smart = (function(){
    
	//callbacks we're running
	var intervalCallbacks = {};

	function addCallback(callbacks, callback, ms)
	{     
		var cb;
		if(!(cb = callbacks[ms]))
		{                       
			cb = callbacks[ms] = [];
			
			var interval = setInterval(function()
			{                               
				var now = new Date().getTime();      
				                         
				
				for(var i = cb.length; i--;)
				{
					var callback = cb[i];
					if(callback.nextUpdate <= now)
					{
						callback.callback();
						callback.nextUpdate += ms; 
					}
				}                 
				                            
				if(!cb.length)
				{                         
					clearInterval(interval);     
					callbacks[ms] = null;
				}
			},ms)                          
		}                                  
		
		var target = {callback:callback,nextUpdate:new Date().getTime()+ms,interval:ms}; 
		
		cb.push(target);
		
		return {
			stop:function()
			{              
				var i = cb.indexOf(target); 
				if(i > -1) cb.splice(i,1)
			}
			
			//make it a disposable
			,dispose:function()
			{
				this.stop();
			}
		}
	}
	
	this.interval = function(callback, ms)
	{                                          
		return addCallback(intervalCallbacks,callback,ms || 0);     
	}
	
	this.timeout = function(callback, ms)
	{
		var ret =  addCallback(intervalCallbacks,function()
		{
			ret.stop();
		   callback();
		},ms || 0); 
		
		return ret;    
	}
	
	return this;     
	
})()    


sard.module10.smart.Cacher = function(max,name,cacheToDB)
{
	this.max = max || -1;   
	
	var count = 0,
		values = {},
		DUMP_COUNT = 10
	
	var interval = sard.module10.smart.interval(function(now)
	{                                            
		for(var i in values)
		{
			var v = values[i];
			if(v.deleteAt < now)
			{
				delete values[i];
			}
		}
	},1000);
	
	
	this.set = function(key, value, ttl)
	{
		if(this.max && count > this.max)
		{
			var dumped = 0;
			
			//find the item that hasn't been accessed a lot
			/*for(var key in values)
			{
				var k = values[key];
				
				if(k.accessed < )
			}*/
			return;
		};

        values[key] =  { value: value, deleteAt: new Date().getTime() + ttl, ttl: ttl, accessed: 0 };

		return value;
	} 
	
	this.addTime = function(key,ms)
	{
		var v = values[key];
		if(v) v.deleteAt += ms;
	}       
	
	this.reset = function(key)
	{
		var v = values[key];    
		if(v) this.set(key,v.value,v.ttl);
	}
	
	this.getTimeLeft = function(key)
	{
		var v = values[key]; 
		
		if(v)
		{
			var now = new Date().getTime();
			
			if(v.deleteAt < now) 
			{
				delete values[key];
				return 0;
			}
			
			return v.deleteAt-now;
		}
			
		return 0;
	}
	
	this.get = function(key)
	{
		var v = values[key]; 
		
		if(v && this.getTimeLeft(key))
		{
			v.accessed++;
			return v.value;
		}
		return null;
	}
	
	this.dispose = function()
	{
		interval.stop();
		values = {};
	}
	
}
  
sard.module11 = {}; 
var sk = sard.module6;

sard.module11.Janitor = sk.Structr({
	
	/**
	 */
	
	'__construct': function()
	{
		this.dispose();
	},
	
	/**
	 * adds an item which can be disposed of later
	 */
	
	'addDisposable': function()
	{
		var args = arguments[0] instanceof Array ? arguments[0] : arguments;
		
		for(var i = args.length; i--;)
		{
			var target = args[i];
			
//			console.log(target)
			if(target && target['dispose'])
			{
				if(this.disposables.indexOf(target) == -1) this.disposables.push(target);
			}
		}
	},
	
	/**
	 * disposes all disposables
	 */
	
	'dispose': function()
	{
		if(this.disposables)
		for(var i = this.disposables.length; i--;)
		{
			this.disposables[i].dispose();
		}
		
		this.disposables = [];
	}
});

sard.module12 = {}; 
//leaflet is a routing script for the front end that mixes well with knockout.js
//the goal is to provide a framework that uses view classes (html pages) with their corresponding
//view controller to make a clean, easy to use MVC, ahem, MVVM.

var sk = sard.module10,
garbage = sard.module11;


var leaf = new (function()
{ 
	var cacher = new sk.smart.Cacher(50),//cache N pages
		branchAttr = 'data-branch',
		leafClass = 'leaflet',
		self = this;
	
		this.let = {};                  
	this.viewsDirectory = 'views';
	
	this.animation = {
		enter:{
			duration:100
			,to:{opacity:1}
		}
		,exit:{
			duration:100
			,to:{opacity:0}
		}
	}
	
	
	this.init = function(root)
	{                              
		var branch = getNextBranch(root);
		                           
		        
		//load the index controller incase there's any routes specified.
		loadLeaflet(branch, {cwd: '', controllerName: branch.getAttribute(branchAttr)})  
	}
		
	
	this.address = new (function ()
	{
		var cleanRoutes = {},
			dirtyRoutes = {}, 
			routesByCommand = {},
			current = {},
			self = this;
			
		this.data = {};

		this.location = {
				path: [],
				data: {}
			};

		//accepts #search/:keyword
		//?test=data&data
		//#search/:keyword?order=descending
		this.on = function (ops, callback)
		{       
			var addr,
				passThru = false;     
				                  
			if(typeof ops == 'object' && !(ops instanceof Array))
			{
				addr = ops.uri;  
				passThru = ops.passThru; 
			}
			else
			{
				addr = ops;
			}                  
			  
			if(addr instanceof Array)
			{
				var disposables = [],
					janitor = new garbage.Janitor();

				for(var i = addr.length; i--;)
				{
					janitor.addDisposable(self.on({ uri: addr[i], command: ops.command, passThru: ops.passThru }, callback));
				}           
				                                 
				
				return {
					dispose:janitor.dispose
				};
			}

			var loc = split(addr),
			 	path = loc.path, //the cleeean path
				dirty = loc.data; //dirty data


			//start at the ROOT directory
			var route = cleanRoutes,

			//TRUE if a duplicate exists for the route.
			dupe = false; 

			//if a clean path exists, then do shit.
			if(path)
			{

				///cleeeeeean parameters e.g: #search/:keyword
				var params = {};

				//go through the paths and setup the routes
				for(var i = 0; i < path.length; i++)
				{                         
					dir = path[i]; 

					//if the directory has a colon, then it's a parameter
					if(dir.indexOf(':') > -1)
					{       
						//setup the param so it'll be present when the route's executed. we use the index to figure out
						//where the data is in the URI
						params[dir.substr(1)] = i;  

						//set the directory now so that we fetch ALL uris
						dir = '$all';
					}              

					//if the route doesn't exist, make it exist.
					if(!route[dir]) route[dir] = {};         

					//next go one level deeper
					route = route[dir];
				}                      

				//
				if(route.handler) dupe = true; 
				
				var handler = { callback: callback, uri: addr, params: params, currentData: {}, passThru: passThru}    
				
				if(ops.command)
				{             
					var commands;
					                         
					if(!(commands = routesByCommand[ops.command]))
					{
						commands = routesByCommand[ops.command] = [];   
						commands.uris = {};
					} 

					//make sure the URI doesn't exist first.
					if(!commands.uris[handler.uri])
					{  
						commands.uris[handler.uri] = 1;              
						commands.push(handler);  
					}
				}  

				//replace if it exists. 
				route.handler = handler;                           

			}


			for(i in dirty)
			{          

				//check if the route exists, then warn the developer if it does..
				dupe = dupe || dirtyRoutes[i];  

				//the parameter is the value e.g: order=:order. it's this case vs the other way
				//around since the key is what routes can watch for... 
				var dirtyParam = dirty[i];  

				//set the dirty route only if it exists
				dirtyRoutes[i] = {callback:callback,param:dirtyValue ? dirtyValue.substr(1) : null};           
			}                            


			if(dupe) console.error('Duplicate route detected for '+addr+'. removing old');
                 
			

			//give a way for the to be disposed
			return {    
				dispose: function ()
				{   
					if(route.handler) route.handler.disposed = true;
					
					route.handler = null;  

					//delete the route in the dirtyness
					for(var i in dirty)
					{                          
						delete dirtyRoutes[i];
					}

				}
			}
		}
		        
		
		this.reload = function()
		{
			self.redirect();
		}
                                                                                                  
		//force is used for redirecting to a same route which changes when refreshed, such as login pass-thrus 
		this.redirect = function (addr, force)
		{       
			var loc;       
			                       
			                                                             
			if(typeof addr == 'string')
			{                       
				loc = split(addr);
			}
			else
			{
				loc = addr || self.location;
			}              
			 
			var path = loc.path,
				data = loc.data;
				
			
			var oldPath = self.location.path;
			
			//we're about to rebuild the current location, so we need to make sure that nothing's undefined
			self.location.path = path = path || self.location.path;                   
			self.location.data = data = data || self.location.data;

                                 
			//the #hash/path/rebuilt
			var hashPath = hash = path ? path.join('/') : '',
			hashData = [];                       
			
			//copy the existing data
			
			
			if(oldPath && oldPath.join('/') == path.join('/'))
			{
				for(var i in data)
				{
					self.data[i] = data[i];
				}
			}
			else
			{
				self.data = data;
			}
			                                             
			
			//rebuild the hash data so the uri doesn't change
			for(var i in self.data) hashData.push(i+'='+escape(self.data[i])); 
			          
			var routeData = Structr.copy(self.data);                                                    
			                         

	        hash += (hashData.length ? '?'+hashData.join('&') : '');                   

			//set the current hash to the new one so we can check for any changes later on
			self.location.hash =  '#'+hash;   
			                
            //make sure we're not in an iframe. some browsers such as firefox reload the page if the hash
            //is changed here >.>
            if(window.top == window) window.location.hash = hash; 
                                            
			//dirty data is the easiest first
			for(i in data)
			{               
				var dirtyRoute = dirtyRoutes[i];

				//make sure the current route isn't set. we don't want to re-execute a route that hasn't changed...
				if(!current[i] && dirtyRoute)
				{
					//add to the current routes
					current[i] = dirtyRoute; 

					//routes don't HAVE to have parameters. this is perfectly acceptable: &pretty&wait
					if(dirtyRoute.param) 
					{
						routeData[dirtyData.param] = data[i];                                              
					}   


					dirtyRoute.callback(routeData);
				}  
			}        


			var route = cleanRoutes,nextRoute,
			routeHandlers = []; //the callbacks which can handle the route
                
			path = path.concat();     
			                       
                                       
			//clean urls next    
			if(path)
			for(i = 0; i < path.length; i++)
			{
				//the current directory provided in the hash
				var dir = path[i];         
				
                                          
				//if the directory can handle ANYTHING, then we'll make it a pass-thru route
				if(route.$all && route.$all.handler && route.$all.handler.passThru)
				{                              
					var passThru = route.$all.handler.passThru;
					
					if (passThru === true) 
					{
						routeHandlers.push(route.$all.handler);
					}            
					else
					{
						var handler = routesByCommand[passThru];
						
						if(handler) routeHandlers.push(handler[0]);
					}
				}                    
				//if the directory does NOT exist in the registered routes, and the current
				//route CANNOT handle any directory given, then we're boned :(
				if(!(nextRoute = route[dir] || route.$all)) break;
				
				route = nextRoute;
			}             	
				                                          

			//if the final directory has a handler, then pass on the route  
			if(route)
			{                                                
				if(route.handler)
				{              
					//this will happen if the passthru route is at the end, and there's
					//nothing to pass through.
					if(routeHandlers.indexOf(route.handler) == -1) routeHandlers.push(route.handler);       
				}
				else                                             
				
				//if the handler does NOT exist for the given route, then we're at an index. pass it onto the
				//NEXT pass-thru route. The parameter will be undefined.
				if(route.$all && route.$all.handler && route.$all.handler.passThru)
				{               
					routeHandlers.push(route.$all.handler)    
				}
			}                              
			     
			
			                        

			//IF we have stuff to callback, then let's go.
			if(routeHandlers.length)
			{   
				var lastHandler = routeHandlers[routeHandlers.length-1],
					lastHandlerParams = lastHandler.params;
						
				   
				for(var j in lastHandlerParams)
				{    
							//remember how we had that index number set for the param? yeah, it's we map it to the current
							//directory...              
					var paramValue = path[lastHandlerParams[j]];  
	//				if(handler.currentData[j] != paramValue) hasChanged = true;
					routeData[j] = paramValue;
				}                                   
				  
				function execNextRoute(routes)
				{                                                   
					if(!routes.length) return false;       
				                              
					var handler = routes.shift();

					//the parameters  for the handler
//					var params = handler.params,

					//the callback function
					callback = handler.callback;  
					

					var hasChanged = true;window.location.hash != current.$hash;
					                        

					handler.currentData = routeData;
					                      
					//ONLY callback the route if the data has changed this WILL happen for sub-routes and passthrus
					//we ALSO check if the handler is disabled because at this point we're traversing down into additional directories, and any
					//PARENT directory could alter any subs. don't want this if it's replaced part-way....
					if((force || hasChanged) && !handler.disposed)
					{                     
						callback({
							data:routeData
							,next:function()
							{                               
								return execNextRoute(routes);
							}
						});                
						
						return true;
					}   
					
					//if nothing's changed, we still need to continue
					//onto the next items because new leaflets MAY have
					//registered route handlers.
					else
					{
						return execNextRoute(routes);
					}             
				}    
				
				// console.log(execNextRoute)   
				                                       
				execNextRoute(routeHandlers.concat());                               
				
				current.$hash = window.location.hash;     
				
			} 

		}   
		
		
		
		this.getUri = function()
		{                                              
			var args = jQuery.makeArray(arguments);
			var commands = routesByCommand[args.shift()];
			
			if(!commands) 
			{
				return null;
			}
			
			for(var i = commands.length; i--;)
			{
				var cmd = commands[i],
				cArgs = cmd.uri.match(/:\w+/g),
				nArgs = cArgs ? cArgs.length : 0;
				                                       
				                               
				if(args.length == nArgs)
				{    
					var uri = cmd.uri;
					                            
					for(var i = nArgs; i--;)
					{                         
						uri = uri.replace(cArgs[i],args[i]);
					}                                                        
					
					return uri;
				}
			}                  
			return null;
		}  
		              


		function onHashChange()
		{                                                                         
			
			//links should use data-bind provided by knockout
			/*if(false && window.location.hash == '#/')
			{                                                                     
				window.location.hash = self.location.hash;
				return; 
			}*/
			
			if(window.location.hash != self.location.hash)
			{                                  
				self.data = {};           
				
				console.log('window change hash:'+window.location.hash+" old hash: "+self.location.hash);
				self.redirect(window.location.hash,false,true);
			}
		}


		//splits: ?data=dirty&very=dirty
		function splitDirty(addr)
		{                                              
			var ai = addr.search(/[?&]/)+1;
			if(!ai) return {};

	    	var parts = addr.substr(ai).split(/[?&]/);    
			var data = {};  

			for(var i = parts.length; i--;)
			{
				var vp = parts[i].split('='),
					name = vp[0],
					value = vp.length > 1 ? vp[1] : null;      


				data[name] = value;
			}                                     
			return data;
		}

		//splits: clean/very/clean
		function splitClean(addr)
		{                                       
			var ai = addr.indexOf('#')+1;   

			if(!ai) return null;              

			var i = addr.search(/[&?]/);

			var url = addr.substr(ai,i > -1 ? i-ai : addr.length),
			    parts = url.split('/');

			// alert(url)
			//remove whitespace
			for(var i = parts.length; i--;) if(parts[i] == '') parts.splice(i,1); 

			return parts;
		}

		//splits clean & dirty
		function split(addr)
		{
			return {data:splitDirty(addr),path:splitClean(addr)};
		}

		//if the browser has support for it, use the default hash onchange method
		if('onhashchange' in window)
		{
			window.onhashchange = onHashChange;       
		}                                      
		else
		{
			setInterval(onHashChange,100);  
		}

		onHashChange();



		return this;
	});
	      
	
	this.redirect = this.address.redirect;
	this.getUri = this.address.getUri;
	
	//returns all the top leaves from the target, and not their sub-leaves. We don't 
	//want that...
	function getNextBranch(target)
	{                                     
		var children = target.childNodes;
		for(var i = children.length; i--;)
		{
			var child = children[i],
				branch;
			
			if(child.nodeType == 1)
			{
				if(child.getAttribute(branchAttr))
				{
					return child;
				}
				else
				if(branch = getNextBranch(child))
				{
				   return branch;
				}
			}
		}
		
		return null;
	}
	
	function getControllerFunc(target,callback)
	{
		return function()
		{
			return callback.apply(target,arguments);
		}
	}
	
	function getLeafController(dir, name)
	{
		var nsParts = dir.split('/');
		nsParts.push(name);

		var current = leaf.let;   
		
		for(var i = 0; i < nsParts.length; i++)
		{

			var nsPart = nsParts[i];     
			                            
			
			//skip any whitespace
			if(nsPart == '') continue;    
            

			//build the NS up                          	 
			if(!current[nsPart]) current[nsPart] = {};    
			
			current = current[nsPart]; 
			
		}
		
		return current;	
	}
	
	function loadController(dir, controllerName, callback)
	{                 
		if(typeof controllerName == 'function')
		{                  
			callback = controllerName;
			controllerName = dir; 
			dir = '';
		}                             
		         
		var controller = getLeafController(dir, controllerName);
		
		function onControllerLoaded()
		{
			controller = getLeafController(dir, controllerName);    
			                   
			//initialize the view model 
			if(!controller.__initialized && controller.init)
			{
				controller.__initialized = true;
				controller.init();               
			}

			callback(controller);
		}
		
		
		
		//already loaded in? don't load it again.
		if(controller.apply)
		{  
			onControllerLoaded();                    
		}
		else
		{
			  
			//the controller is the javascript that's used for the leaflet. 
			var controller = controllerName + '.ko.js';
                                                   
			//load up the controller before we setup the view. A controller must ALWAYS be present or bad things might happen, such as the callback
			//not actually executing >.>                            
			$.getScript(leaf.viewsDirectory + '/' + dir + controller, function ()
			{
				onControllerLoaded(true);
			});
		}
	}
	
	function replaceController(el,newController)
	{
		if(el.controller) el.controller.janitor.dispose();

		disposeChildBranches(el)

		el.controller = newController;
	}
	
	function disposeChildBranches(el)
	{
		$(el).find('['+branchAttr+']').each(function(index,child)
		{
			if(child.leaf) child.leaf.dispose();
		})
	}
	
	
	function recordDisposables(callback)
	{
		var disposables = [];

		//keep track of the old jquery bindings
		var oldBind = jQuery.fn.bind,
			oldSmartInterval = sk.smart.interval,
			oldInterval = setInterval;


		//let's track all the bindings that go on so we can dispose all of them once the view changes.
		jQuery.fn.bind = function()
		{
			var type = arguments[0],
			callback = arguments[1],
			self = this;

			oldBind.apply(this,arguments);

			disposables.push({
				dispose:function()
				{
					self.unbind(type,callback);
				}
			})
		}

		//now record the disposables
		sk.smart.interval = function()
		{
			var ret = oldSmartInterval.apply(this,arguments);
			return ret;
		}


		//this should trigger the disposables
		callback();

		//revert! revert! revert!
		jQuery.fn.bind = oldBind;
		sk.smart.interval = oldSmartInterval;

		return disposables;
	}
	
	function getAnimation(el)
	{
		//only return the animation if there's a current controller
		return el.controller ? el.controller.animation || leaf.animation : null ;
	}
	
	function transition(element,enter,callback)
	{

		//use either the animation provided by the MVC, or use the default
		var animation = getAnimation(element),
			$el = $(element),
			start = enter  ? 'enter' : 'exit',
			stop   = enter ? 'exit' : 'enter';

		if(animation)
		{
			//stop all animations      
			
			//here for reference, but this DOESN'T WORK when we cache HTML pages and they're loaded instantly. Instead, the 
			//views fade out, then never fade back in
			// $el.stop();

			var from;

			if(animation[start] && animation[start].from)
			{
				from = animation[start].from;
			}
			else
			if(animation[stop].to)
			{
				from = animation[stop].to;
			}

			if(from)
			{                     
				$el.css(from);
			}

			var to = animation[start].to;
                             
			//let's animate
			$el.animate(to,
				animation.enter.duration,
				animation.enter.easing,
				callback);

		}
		else
		if(callback)
		{                              
			callback();
		}
	}
	
	function transitionOut(element,callback)
	{
		transition(element,false,callback);
	}
	
	function transitionIn(element,callback)
	{
		transition(element,true,callback);
	}
	
	function rebuildAnchors(target,path)
	{
		var children = target.childNodes;

		for(var i = children.length; i--;)
		{
			var child = children[i];

			if(child.tagName == 'A')
			{
				var href = child.href,
			    hashLoc  = href.indexOf('#');
			
				if(hashLoc != 0) return;
				
				var hashPart = href.substr(hashLoc,href.length),
				hashPath = hashPart.substr(1);
				
				//if the hash is leading back to just # (index), the append the index view name
				if(hashPart == '#')
				{
					hashPath += path+'/';
				}
				else
				//no root directory specified, so prepend the current working directory
				if(hashPath.substr(0,1) != '/')
				{
					hashPath = path+'/'+hashPath;
				}
				
				
				//remove extra route paths. make 'em look pretty, and then set the modified hash so it's
				//relative to the CWD
				child.href = '#'+hashPath.replace(/\/+/gi,'/'); 
			}
			else

			//do NOT traverse through other leafs JUST DON'T DO IT. Also, don't replace anything that's a template. kthx
			if(child.nodeType == 1 && child.className != leafClass && !child.getAttribute(branchAttr))
			{
				rebuildAnchors(child,path);
			}

		}
	}       
	
	
	//initializes URI routes setup by any given MVC.
	function initRoutes(branch, mc, ops)
	{                        
		var cwd = ops.cwd,
			controllerName = ops.controllerName,
			currentView;
			
		if(mc.routes)
		{                       
			$.each(mc.routes, function(index, route)
			{                                                       
				//we'll use the same type of method used in the backend...
				var request = {

					//the target element making the request
					element:branch    
					
					,viewsDir:leaf.viewsDirectory+'/'+ops.cwd


					//displays a view, and returns the leaflet attached to that view
					,display: function (view, callback)
					{                       
						if(currentView == view)
						{                        
							if(callback) callback(branch.controller);
						}                                
						else
						{  
							currentView = view;

							var path = view.split('/'),
							fileName = path.pop(),      
							pathDir  = cwd+'/'+path.join('/');   

							//let's allow the current element to ease out with style. 
							transitionOut(branch, function ()
							{
								
								//load the current leaflet
								loadLeaflet(branch, {cwd: pathDir, controllerName: fileName}, function ()
								{                           
									                
									if(callback) callback(branch.controller);    
									 
									//let's ease IN with style this time
									transitionIn(branch)
								}); 
							})
						}                              
					}
				}

				var uris = route.uri instanceof Array ? route.uri : [route.uri];
                              
       			
				//let's fix the URI's so they're in their own CWD, unless they have / in the beginning, then it's a root route.
				//Route's in separate directories SHOULD NOT set a root route, because then it can't be navigated to via browser redirect
				for(var i = uris.length; i--;)
				{                                          
					uris[i] = '#' + (uris[i].substr(0,1) != '/' ? cwd + '/' + controllerName +'/' : '') + uris[i]; 
				}                     
                                    
				//next, let's watch when the hash changes, then execute the current route
				var router = leaf.address.on({uri: uris, command: route.command, passThru: route.passThru}, function (req)
				{                 
					for(var i in req) request[i] = req[i];  
					
					route.callback(request);    
				});
				                                 
			})         
			
			leaf.address.reload();              
		}
	}     
	
	function initController(el, ops)
	{
		var mc 	 = el.controller,
			cwd 	 = ops.cwd,
			controllerName = ops.controllerName,
			$el = $(el);                   

		if(mc)
		{         
			//now we setup the janitor script so the view model doesn't have to
			mc.janitor = new garbage.Janitor();

			//you know what this is. but here's a comment anyways
			var disposables = [];

			//while applying the controller to the new DOM object, record the disposables
			//so we aren't requiring the controller to provide a dispose() method for us. Easier
			//to handle mem leaks this way...
			disposables = recordDisposables(function()
			{            
				if(mc.apply) mc.apply(el);
			});
                                                                                         
			//initialize the sub-routes starting with the next branch if it exists (allows for the current view to have static content such as a header or footer)
			if(mc.routes) initRoutes(getNextBranch(el) || el, mc, ops)

			//now add the disposables to the MVC's janitor
			mc.janitor.addDisposable(disposables);    
			mc.janitor.addDisposable(mc);
		}

		//okay, this is getting fucking anoying because I'm really tired, and I need to write out comments
		//to make myself walk through the process. We need to build the anchors based on the CURRENT WORKING DIRECTORY. The anchors 
		//we are rebuilding are in the current BRANCH, so they should NOT have the view name as part of the CWD    
		rebuildAnchors(el,cwd);  

		//once we've applied the MVC, we can make the view visible. AGAIN!
		$el.css({visibility:'visible'});
	}
	
	function loadView(element, ops, callbacks)
	{
		var viewName = ops.viewName,
		
		//current working directory
		cwd = ops.cwd,
		file = leaf.viewsDirectory + '/' + cwd + '/' + viewName + '.leaf';
		
		
		function setHTML(text, inSameDoc)
		
		{
			
			//once we've loaded the new stuff, tell whatever to unload, such as the previous controller, which
			//may have timers, event listeners, etc. we don't want those sticking around.
			if(!inSameDoc) callbacks.unload();
			
			$(element).html(text);   
			
			//on load, reload the new controller! 
			callbacks.reload();
		}
		
		
		//first check if the leaflet exists 
		var leaflet = $(element).parent().find('[name="'+viewName+'"]')[0];

		//leaflet in same doc? use it instead of loading up a view.
		//NOTE: this needs to get debugged, because I haven't tested it since I refactored a bunch of shit
		if(leaflet) 
		{
			setHTML(leaflet.innerHTML,true);
		}
		else
		
		//if the view's cached, let's NOT reload it. 
		if(text = cacher.get(file))
		{                  
			setHTML(text);                       
		}
		
		//or load it from file
		else
		{                                    
			$.ajax({
				url: file,
				dataType: 'html',
				success: function(text)
				{
					
					//but cache the html for a while. the view files shouldn't take up much memory
					//so saving for the duration the users on should be OKAY. TODO: maybe we can store it locally with
					//sqlite ;)
					cacher.set(file, text.toString(), 1000 * 3600 * 365);
					
					//finally set the loaded html
					setHTML(text);
				}
			});
		}
	}
	
	function loadLeaflet(element, ops, callback)
	{                         
		//the html page that's controled by the controller, and going where the data-leaf item is   
		var controllerName = ops.controllerName,
		
			cwd = ops.cwd;
		loadController(cwd + '/', controllerName, function (mc)
		{
			var viewName = mc.view;
			
			var controllerLoader = {
				unload:function()
				{
					//once the NEW controller is ready, we can go ahead and replace the OLD controller with the new one. we do it
					//BEFORE the view is loaded, otherwise we'll be telling the new view to unload controllers that don't exist >.>
					replaceController(element, mc);
					return controllerLoader;
				}
				,reload:function()
				{
					initController(element, ops);

					if(callback) callback();
				}
			}
			
			//viewname = false, so don't load the view
			if(viewName == false)
			{
				return controllerLoader.unload().reload();
			}
			else
			if(viewName instanceof Function)
			{
				viewName = viewName(element);
			}
			else
			if(!viewName)
			{
				viewName = controllerName;
			}
			
			//set the view name so we can load it up
			ops.viewName = viewName;
			
			//load the external view
			loadView(element, ops, controllerLoader);    
		})                  
		
	}
});

$(document).ready(function()
{                 
	leaf.init(document);  
});

sard.module13 = {}; 
sard.module4;

sard.module13.object = {

	references:[]
	//methods-----------------------------------------------------------------------------------------------

	,clone:function(target,shallow,isDeep,name)
	{                          
		var copy,i;
		if(!target)
		{
			return target;
		}          
		if(target instanceof Array)
		{
			copy = [];

			for(i in target)
			{
				copy.push(shallow && isDeep ? target[i] : this.clone(target[i],shallow,true,i));
			} 
			return copy;
		}                           
		else
		if(typeof(target) == 'object' && (i = this.references.indexOf(target)) == -1)
		{       

			this.references.push(target);

			var clazz = target.constructor;

			copy = new clazz();

			for(var i in target)
			{        

				//this is a small safe-guard against circular references
				if(target == target[i])
				continue; 

				var val = target[i];

				if((!shallow || !isDeep) && typeof(target) == 'object')
				{

					val = this.clone(val,shallow,true,i);

					if(val === false)
					{
						throw new Error("circular reference detected starting from property \""+i+"\".");
					}
				}
				copy[i] = val;    
			}

			this.references.splice(i,1);
		}
		else
		if(i > 0)
		{
			return false;
		}
		else
		{
			copy = target;
		}     


		return copy;                    
	}    


	,copyTo:function(from,target,override)
	{
		for(var property in from)
		{                      

			var toValue = target[property],
			copy;

			if(toValue == undefined || override) 
			{                   
				copy = this.clone(from[property],true,true,property);   
			}     
			else
			{	
				copy = toValue;
			}            

			target[property] = copy;
		}    

		return target;
	}
	,forEach:function(array,callback,isArray)
	{   
		if(!array)
		return;

		if(array instanceof Array || isArray)
		{            
			for(var i = 0, n = array.length; i < n; i++)
			callback(array[i],i);
		}
		else
		if(array instanceof Object)
		{
			for(var i in array)
			callback(array[i],i);
		}
	}

}
sard.module14 = {}; 
sard.module4;

sard.module14.pretty = 
{
	date: function (date)
	{
		
		var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
		
		if ( isNaN(day_diff) || day_diff < 0)
		return day_diff;

		return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
			day_diff == 1 && "Yesterday" ||
			day_diff < 7 && day_diff + " days ago" ||
			day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||  
			day_diff < 365 && Math.floor(day_diff / 30) + " months ago" ||
			Math.floor(day_diff / 365) + " years ago"
	}
}
sard.module15 = {}; 
var events = sard.module7,
sk = sard.module6,       
queue = sard.module8,
garbage = sard.module11;



var AbstractProxy = sk.Structr(	{

	/**
	*/

	'__construct': function()
	{
		//cleans up after event listeners
		var janitor = this._janitor = new garbage.Janitor();

		//emitter for whenever a new subscribtion is made, or a "subscription" call is made
		janitor.addDisposable(this._callEmitter = new events.EventEmitter());

		//emitter for whenever a change is made
		janitor.addDisposable(this._changeEmitter = new events.EventEmitter());
	},

	/**
	* subscribes to any publishes by the given proxy
	* @type the type of subscription to listen for
	* @callback the callback for the subscription 
	*/

	'subscribe' : function ( type, callback )
	{

		var disposable = this._changeEmitter.addListener(type, callback);

		//listen to any changes
		return disposable;
	},
	

	/**
	* subscribes, and makes a request
	*/

	'subscribeAndRequest': function(type, data, callback)
	{
		if(!callback)
		{
			callback = data;
		}
		
		var disposable = this.subscribe(type, callback);

		this.request(type, data, callback, true);

		return disposable;
	},

	/**
	* subscribes to ONE change, then disposes
	*/

	'subscribeOnce': function(type, callback)
	{
		var disposable = this.subscribe(type, function()
		{
			disposable.dispose();
			callback.apply(null, arguments);
		});
	},

	/**
	* returns the current subscription only. must have onSubscribe on other end
	* @type the subscription type to call
	* @data data to pass to the call emitter
	* @callback the callback for the subscription
	*/

	'request': function ( type, data, callback, ignoreWarning)
	{
		if(!callback && typeof data == 'function')
		{
			callback = data;
		}                  
		
		if(!data)
		{
			data = callback;
		}

		//just a warning if it doesn't exist... helps debugging
		if(!ignoreWarning && !this._callEmitter.hasEventListener(type))
		{
			console.warning('The pubsub request "'+type+'" does not exist!');
		}


		//notify on subscription listeners of the new binding. 
		this._callEmitter.emit(type, data, callback);
	},

	'passiveRequest': function(type, data, callback)
	{
		if(!callback)
		{
			callback = data;
			data = null;
		}

		//if passive, and there isn't a call listener, then callback immediately. This is necessary for 
		//architectures where the are plugins
		if(!this._callEmitter.hasEventListener(type))
		{
			return callback();
		}

		this.request(type, data, callback);
	},


	/**
	* called when a subscription is made
	*/

	'onRequest': function ( type, singleton, callback )
	{
		if(!callback)
		{
			callback = singleton;
			singleton = false;
		}

		if(singleton && this._callEmitter.hasEventListener(type))
		{
			throw new Error('Only one "' + type + '" call handler can be registered.');
		}

		return this._callEmitter.addListener(type, callback);
	},

	/**
	* publishes a change
	*/

	'publish': function ( type, data )
	{
		this._changeEmitter.emit(type, data);
	},

	/**
	* disposes the pubsub proxy
	*/

	'dispose': function ()
	{
		this._janitor.dispose();
	}
});


var ConcreteProxy = AbstractProxy.extend({

	/**
	* need to override subscribe so we can transform the type if it's an object, chain, etc.
	*/

	'override subscribe': function(type, callback)
	{
		if(typeof type == 'object')
		{
			var janitor = new garbage.Janitor();

			for(var subType in type)
			{
				janitor.addDisposable(this.subscribe(subType, type[subType]));
			}

			return janitor;
		}

		return this._super(type, callback); 
	},
	

	/**
	* also need to transform the onRequest...
	*/

	'override onRequest': function(type, singleton, callback)
	{		
		if(typeof type == 'object')
		{
			var janitor = new garbage.Janitor();

			for(var subType in type)
			{
				var callHandler = type[subType],
				cb;

				if(typeof callHandler == 'function')
				{
					cb = callHandler;
					singleton = false;
				}
				else
				{
					cb = callHandler.callback;
					singleton = callHandler.singleton;
				}


				janitor.addDisposable(this.onRequest(subType, singleton, cb));
			}

			return janitor;
		}
		
		this._super(type, singleton, callback);
	}
});


var ProtectedProxy = ConcreteProxy.extend({
	'override __construct': function()
	{
		this._super();
		
		this._channelsByMetadata = [];
		
		var self = this;

		//on subscription to channels, return all of them. useful for remote pub/subs 
		this.onRequest('public channels', true, function(protectedKey, callback)
		{
			var channels;
			
			if(protectedKey == self.key())
			{
				channels = self._channelsByMetadata.protected || [];
			}
			
			channels = channels.concat(self._channelsByMetadata.public || []);
			
			var i = channels.indexOf('channels');
			if(i > -1) channels.splice(i, 1);
			
			callback(ac);
		});
	},
	
	'grantRequestAccess': function(channel, key)
	{
		return this.hasChannel('public') || (!this.hasChannel('private', channel) && !(this.hasChannel('protected', channel) && key != this.key()));
	},
	
	'hasChannel': function(metadata, type)
	{
		return (this._channelsByMetadata[metadata] || []).indexOf(type) > -1;
	},
	
	'channels': function(metadata)
	{
		if(metadata) return this._channelsByMetadata[metadata];
		return this._channels;
	},
	
	'key': function(value)
	{
		if(value) this._key = value;
		return value;
	},
	
	'override subscribe': function(type, callback)
	{
		if(typeof type != 'string') return this._super(type, callback);
		return this._super(type.split(' ').pop(), callback);
	},
	
	
	'override onRequest': function(type, singleton, callback)
	{
		if(typeof type != 'string') return this._super(type, singleton, callback);
		
		var metadata = type.split(' '),
			name = metadata.pop();
			
		//publish the change
		if(!this._callEmitter.hasEventListener(name))
		{
			if(!metadata.length)
			{
				metadata.push('private');
			}
			
			for(var i = metadata.length; i--;)
			{
				var md = metadata[i];
				
				if(!this._channelsByMetadata[md]) this._channelsByMetadata[md] = [];
				
				this._channelsByMetadata[md].push(name);
			}
		}
		
		return this._super(name, singleton, callback);
	}
})


        

                            
/**
 * the transport between two proxies
 */

var Transport = sk.Structr({
	                                                 
	                
	
	/**   
	 * connects to the remote connection
	 */
	
	'connect': function(callback) { },      
	
	/**                                          
	 * sends data over to the remote transport
	 */
	
	'send': function(obj) { }
});

                    
/**                                                      
 * glues two remote proxies together
 */                                                   

var RemoteProxyGlue = sk.Structr({  
	
	/**
	 * @param proxy the proxy we're glueing to
	 * @param transport the remote connection between this app, and anything remote
	 */
	
	'__construct': function(transport, proxy)
	{                            
		this._transport = transport;       
		this._proxy = proxy || new ProtectedProxy(); 
		this._requests = {};       
		                        
		//override the messahge
		transport.onMessage = this.getMethod('handleMessage');
		
		this._start();    
	},            
	
	/**
	 * handles the message passed from the transport
	 */
	
	'handleMessage': function(msg)
	{                                            
		                         
		var trans = this._transport,                
			proxy = this._proxy,       
			self = this;   
			                        
		//ignores sending out to remote transports. Fixes infinite loop problems    	
		this.ignore(msg.name, true);
		
		
		if(msg.action == 'request' || msg.action == 'publish')
		{
			//make sure the request is not protected before making it
			if(proxy.grantRequestAccess(msg.name, (msg.data || {}).requestKey))
			{
				if(msg.action == 'request')
				{
					proxy.request(msg.name, msg.data, function(response)
					{                                        
						self._send('response', msg.name, response, msg.uid);
					});
				}
				else
				{
			  		proxy.publish(msg.name, msg.data);
				}
			}
			else
			{
				self._send('response', msg.name, 'You cannot call '+msg.name+'.', msg.uid);
			}
		}   
		else
		if(msg.action == 'response')
		{
			var callback = self._requests[msg.uid];      
			   
			if(callback && msg.data)
			{
				callback(msg.data);  
			}
			else
			if(msg.error)
			{
				console.warn(msg.error);
			}
			
			delete this._requests[msg.uid];
		}                     
		                      
		this.ignore(msg.name, false);      
	},
	
	/**
	 */
	
	'_start': function()
	{    
		var self = this,
		    oldPublish = this._proxy.publish;
		
		this._proxy.publish = function(name, data)
		{
			oldPublish.apply(self._proxy, arguments);         
			if(!self.ignore(name)) self._send('publish', name, data); 
		}
		                      
		
		//connect the transport                              
		this._transport.connect(function()
		{                               
			                   
			//get all the channels so we can listen for them
			self._request('channels', self._proxy.key(), function(channels)
			{                                                           
				
				function listenToChannel(name)
				{                                            
					self._proxy.onRequest(name, function(data, callback)
					{   
						if(typeof data == 'function')
						{
							callback = data;
							data = undefined;
						}                       
						                               
						if(!self.ignore(name)) self._request(name, data, callback); 
					})
				}
				
				for(var i = channels.length; i--;)
				{
					var channel = channels[i];
					if(channel == 'channels') continue;
					listenToChannel(channel);
				}                            
				                                 
				self.ignore('transportReady', true);      
				self._proxy.publish('transportReady'); 
				self.ignore('transportReady', true);
			});
		});
	},
	
	/**   
	 * sends off a remote request with a callback attached
	 */
	
	'_request': function(name, data, callback)
	{              
		if(typeof data == 'function')
		{
			callback = data;
			data = undefined;
		}           
		
		//dirty UID
		var uid = new Date().getTime() + '.' + Math.round(Math.random() * 999999);
		
		this._requests[uid] = callback;
		
		this._send('request', name, data, uid); 
	},
	    
	/**
	 * sends a message off to the transport
	 */
	
	'_send': function(action, name, data, uid)
	{
		this._transport.send({ action: action, name: name, data: data, uid: uid });
	},
	
	'_error': function(action, name, error, uid)
	{
		this._transport.send({ action: action, name: name, error: error, uid: uid });
	},
	
	'ignore': function(name, value)
	{                                       
		if(!this._ignoring) this._ignoring = [];
		var i = this._ignoring.indexOf(name);
		          
		if(value == undefined) return i > -1;
		                                            
		if(!value && i > -1)
		{
			this._ignoring.splice(i, 1);
		}                             
		else
		if(value && i == -1)
		{
			this._ignoring.push(name);
		}
		
		
	}
});


sard.module15.Proxy = ProtectedProxy; 
sard.module15.Transport = Transport;
sard.module15.RemoteProxyGlue = RemoteProxyGlue;
sard.module15.Mediator = new sard.module15.Proxy();

sard.module16 = {}; 
var pubsub = sard.module15;

var Bindable = {
	apply: function(target, proxy, setting)
	{
		if(!proxy) proxy = new sk.Proxy();      
		
		return target instanceof Array ? this.applyArrayBindings(target, proxy, setting) : this.applyObjectBindings(target, proxy, setting);
	},     
	applyObjectBindings: function(target, proxy, setting)
	{
		var props = Structr.findProperties(target, setting || 'bindable');
        
        
		//next go through all the properties and look for the bindable ones
        for(var i = props.length; i--;)
        {
            this.bindObject(proxy, target, props[i]);
        }
        
        return { properties: props, proxy: proxy };
	},  
	bindObject: function(proxy, target, explicitGS)
	{
		//we need to reference the old function since we're just wrapping around it
		var oldGS = target[explicitGS];
		
		//if there's a new subscription, then fetch the current data and return it
		proxy.onRequest(explicitGS, function(callback)
		{
			var gs = target[explicitGS];
			callback(gs())
		});
		
		//overwrite the old property with the new bindable property
		var newGS = target[explicitGS] = function()
		{
			                              
			//if there are arguments, then we're setting a new value
			if(arguments.length)
			{
				//call the old func
				oldGS.apply(target, arguments);
				
				//emit if anything changes
				proxy.publish('propertyChange', {name: explicitGS, value: arguments[0] });
				                                    
				//so we need to publish to the change so any subscriptions get notified
				proxy.publish(explicitGS, arguments[0]);
			}
			else
			{
				//otherwise just return the old data
				return oldGS.apply(target, []);
			}
		}
		
		//allow for the function to be subscribable
		newGS.subscribe = function(callback)
		{
			return proxy.subscribe(explicitGS, callback);
		}
        
        //allow for the function to be subscribable
		newGS.subscribeOnce = function(callback)
		{
			return proxy.subscribeOnce(explicitGS, callback);
		}         
		
        //allow for the function to be subscribable
		newGS.subscribeAndRequest = function(callback)
		{
			return proxy.subscribeAndRequest(explicitGS, callback);
		}
	},
	applyArrayBindings: function(target, proxy)
	{                   
		      
		function argsToArray(args)
		{       
			var ar = new Array(args.length);
			                                
			for(var i = args.length; i--;)
			{
				ar[i] = args[i];
			}                    
			return ar;
		}     
		
		function rep(prop, callback)
		{             
			if(prop instanceof Array)
			{
				for(var i = prop.length; i--;)
				{
					rep(prop[i], callback);
				}                          
				return;
			}           
			
			var oldProp = target[prop];     
			                           
			target[prop] = function()
			{                              
				oldProp.apply(target, arguments);                     
				callback(argsToArray(arguments));     
			}
		}    
		
		function change(data, args)
		{                            
			proxy.publish('change', data);
		}   
		
		function add(items, index)
		{                         
			if(items.length) change(target);            
			// change({type: 'add', items: items, index: index});
		}
		
		function remove(items, index)
		{       
			if(items.length) change(target);
			// change({type: 'remove', items: items, index: index});
		}
		
		function reset()
		{
			// change({type: 'reset'});
		}     
		
		      
		target.subscribe = function(callback)
		{                                
			var disposable = proxy.subscribe('change', callback);
		}
		
		target.subscribeAndRequest = function(callback)
		{                                
			target.subscribe(callback);
			callback(target)
		}
		              
		rep('push', function(items)
		{                           
			add(items, target.length);
		});                            
		
		rep('unshift', function(items)
		{
			add(items, 0);
		})                
		        
		rep('splice', function(args)
		{
			var start = args[0],
			n = args[1],
			items = [];

			for(var i = start; i < n; i++)
			{
            	items.push(target[i]);
			}                         
			
			remove(items, start);
		});  
		
		rep(['sort','slice','reverse'], reset);       
		                                                               
		                   
		return target;
	}
}


sard.module16.Bindable = Bindable;
sard.module17 = {}; 
/**
 * reads the properties as metadata and saves / gets accordingly using cookies. MMmmmm cookies...
 */
 
sk.SettingManager = {
	serializables: {},
    'apply': function(target, directory)
    {
        if(!directory) directory = '';
        
        var props = Bindable.apply(target, null, 'setting').properties;
        
        for(var i = props.length; i--;)
        {
            var prop = props[i],
                v = target[prop];
                
            var stored = sk.cookies.get(directory+'/'+prop);      
            
            this.watch(target, prop, directory);
			
            if(stored)
            {
				var newValue = stored.data;
				
				if(stored.type)
				{
					var clazz = sk.SettingManager.serializables[stored.type];
					
					if(clazz)
					{
						newValue = new clazz();
						newValue.fromJSON(stored.data, target)
					}
					else
					{
						console.warn('remote class ' + stored.type + ' does not exist.');
					}	
				}
				
                v(newValue);
            }
        }
    },
    'watch': function(target, property, directory)
    {                                   
        target[property].subscribe(function(data)
        {                
			var v = { data: data };
			if (data) 
			{	
				var remoteName = data.__proto__.remoteName;
				v.type = remoteName;
			}
			
            sk.cookies.set(directory+'/'+property, v);
        });
    }
}



sk.Serializable = function(remoteName, target)
{
	var clazz = sk.SettingManager.serializables[remoteName] = Structr(target);
	clazz.prototype.remoteName = remoteName;
	return clazz;
}




sard.module18 = {}; 
sard.module4;

sard.module18.str = {
	elipsis: function(str, maxChars, maxWords)
	{
		if(str.length > maxChars)
		{
			var shorter = str

			if(maxWords)
			{     
				var words = shorter.split(' ');

				if(words.length > maxWords)
				{
					shorter = words.splice(0, maxWords).join(' ') + '...';
				} 
			}  
			else
			{
            	shorter = shorter.substr(0, maxChars) + '...';
			}      
			
			return shorter;
		}

		return str;
	},
	capitalizeFirstLetter: function(str)
	{
		return str.substr(0,1).toUpperCase() + str.slice(1);
	} 
}
sard.module19 = {}; 
sard.module4;

sard.module19.lazy = {
	callback:function(callback,timeout)
	{       
		var interval;
		
		return function()
		{                   
			clearTimeout(interval);     
			var args = arguments;
			                              
			interval = setTimeout(function()
			{
				callback.apply(callback,args);
			},timeout);
		}
	}
}                     


                           
sard.module20 = {}; 
//!require sk,../../third-party/json2

sk.cookies = {
	set:function(name,value,expires)
	{
		document.cookie = name + "=" + escape(JSON.stringify({v:value})) + "; path=/" + ((expires == null) ? "" : "; expires=" + expires.toGMTString());
	}
	,get:function(name)
	{
		var dc = document.cookie;	
		var cname = name + "=";	

		if (dc.length > 0) 
		{	
			begin = dc.indexOf(cname); 
			if (begin != -1) 
			{ 
				begin += cname.length; 
				end = dc.indexOf(";",begin);
				if (end == -1) end = dc.length;
				return JSON.parse(unescape(dc.substring(begin, end))).v;
			} 
		}	
		return null;
	}    
	,remove:function(name)
	{                            
		sk.cookies.set(name,false,new Date(0));  
	}
}

sard.module21 = {}; 
//!require sk

sk.image = 
{
	preload:function(src,callback)
	{
		if(!src) return callback(null);
		                           
		var img = new Image();
		          
		document.body.appendChild(img);  
		
		function onload()
		{                  
    		$(img).css({display:'block'});  
			
   
			callback(img);
			
			if(img.parentNode == document.body)
			{
				img.parentNode.removeChild(img);
			}
		}
            
        $(img).css({display:'none'});
        $(img).load(onload).attr('src',src/*+"?"+Math.random()*/);
		
		/*img.src = src; 
		$(img).css({display:'none'});   
		
		
		
		var timer = sk.smart.interval(function()
		{               
			           
			if($(img).width() > 0)
			{                       
				$(img).css({display:'block'});
				callback(img);
				// img.setAttribute('style','display:block;'); 
				
				if(img.parentNode == document.body)
				{
					img.parentNode.removeChild(img)
				}  
				
				
				timer.stop();
			}
		},200);*/   
	}         
	
	,_resizedImageUrls:{}                                                  
	,_resizeIndex:0    
	,_resizeServiceFactories:[  
	function(url,width,height)
	{
		return 'http://www.resizer.co?img='+url+(width ? '&w='+width : '')+(height ? '&h='+height : '') 
	}
	,
	function(url,width,height)
	{
		return 'http://images.weserv.nl/?url='+url.replace('http://','')+(width ? '&w='+width : '')+(height ? '&h='+height : '') 
	}
	]
	
	//uses a list of services which can resize images. Round-robin approach
	,resizedUrl:function(url,width,height)                                              
	{
		if(this._resizedImageUrls[url]) return this._resizedImageUrls[url];   
		var getResizeUrl = this._resizeServiceFactories[(this._resizeIndex++)%this._resizeServiceFactories.length];    
		
		console.log(getResizeUrl(url,width,height))
		return this._resizedImageUrls[url] = getResizeUrl(url,width,height);
	}
}              


sard.module22 = {}; 

sard.module13; 
sard.module14;     
sard.module7;
sard.module15;
sard.module16;
sard.module17;
sard.module18; 
sard.module19;
sard.module20; 
sard.module21;

var Spice = { apps: { } };


/**
* this is just a hell of a lot cleaner. Strings are a lot like magic numbers. They should be in one place, and controlled by a constant
*/

Spice.Events = {
	CONNECT: 'connect',
	RESULT: 'result',
	ACCOUNT: 'account'
}


/**
* returns the host
*/

Spice.getHost = function(appName, protocol)
{
	return (protocol || 'http:')+ '//'+appName+'.spice.io/';
}

/**
* opens a centered window. used for connect
*/

Spice.openWindow = function(url, title, width, height)
{
	window.open(url, title,"width="+width+",height="+height+",left="+(screen.width/2-width/2)+",top="+(screen.height/2-height/2));
}

/**
* authorized the parent. happens after redirect
*/


Spice.authorizeParent = function()
{
	if(!window.opener) return;

	var hash = window.location.href.slice(window.location.href.indexOf('?')+1).split('&'),
	data = {};


	for(var i = hash.length; i--;)
	{
		var val = hash[i].split('=');
		data[val[0]] = val[1]; 
	}                      


	window.opener.Spice.authorizedConnect(data);
	window.close();
}


/**
* transforms a collection of data to another data type
*/

Spice.transformCollection = function(app, collectionOrItem, factory)
{
	if(collectionOrItem instanceof Array)
	{
		var transformed = [];

		for(var i = collectionOrItem.length; i--;)
		{
			var item = Spice.transformCollection(app, collectionOrItem[i], factory);
			
			if(item)
			transformed.push(item);
		}

		return transformed;
	}
	
	return factory(collectionOrItem, app);
}

Spice.transformCollectionPartial = function(factory)
{
	return function(app, collectionOrItem)
	{
		return Spice.transformCollection(app, collectionOrItem, factory)
	}
}



Spice.authorizeParent();





/*if(this._app.profile()) params.accessToken = this._app.profile().accessToken;

this._requests[method].push({
uri: uri,
data: params,
callback: callback
})
if(this._requestTimeout) clearTimeout(this._requestTimeout);
this._requestTimeout = setTimeout(this.getMethod('_onRequestTimeout'), 500);*/

Spice.ServiceHandler = sk.EventEmitter.extend({

	/**
	*/

	'override __construct': function(app)
	{
		this._app = app;
		this._super();

		this._requests = {POST:[],GET:[]};
	},

	/**
	* makes a request to the spice.io server
	*/

	'_request': function(uri, params, method, callback, factory)
	{                                                                           
		new Spice.Request(this._app, uri, params, method, callback, factory);
	},
	
	

    /**
 	 */

	'_get': function(uri, callback, factory)
	{
		return this._get(uri, undefined, callback, factory);                                                                
	},         
	
	/**
	 */
	
	'2 _get': function(uri, params, callback, factory)
	{  
		return this._request(uri, params, 'GET', callback, factory); 
	},

    /**
 	 */

	'_post': function(uri, callback, factory)
	{
		return this._post(uri, undefined, callback, factory);                                                             
	},
	
	/**
	 */
	
	'1 _post': function(uri, params, callback, factory)
	{                                                                  
		return this._request(uri, params, 'POST', callback, factory);
	}
});



Spice.BindedData = sk.EventEmitter.extend({
	'override __construct': function(app, data)
	{
		this._super();

		this._app = app;
		this._data = data;

		Bindable.apply(this).proxy.subscribe('propertyChange', this.getMethod('onPropertyChange'));
		this._ready = true;
	},

	'onPropertyChange': function(data)
	{
		//abstract...
	}
});


Spice.GroupMetaData = Structr({
	'override __construct': function(group, name, value)
	{
		this._super();

		this._group = group;
		this._name = name;
		this.value(value);

	},
	'name': function()
	{
		return this._name;
	},
	
	'explicit value': {
		get: function()
		{
			return this._value;
		},
		set: function(value)
		{
			this._value = value;

			if(!this._group._ready) return;

			clearTimeout(this._timeout);
			this._timeout = setTimeout(this.getMethod('_onTimeout'), 500);
		}
	},
	

	'_onTimeout': function()
	{
		var data = {};

		data[this._name] = this.value();

		this._group._save( {metadata: JSON.stringify(data) });
	}
});                      


Spice.GroupFeed = Spice.BindedData.extend({
	'override __construct': function(group, data)
	{
		this._group = group;

		this.value(data.url || data.q);
		this.category(data.categories);
		this.service(data.services);
		this.action(data.action);
		this.id(data.id);

		this._super();

	},
	'explicit bindable id': 'r',
	'explicit bindable value': 1,
	'explicit bindable category': 1,
	'explicit bindable service': 1,
	'explicit bindable action': 1,

	'remove': function()
	{
		this._group.removeFeed(this);
	}
});



Spice.Group = Spice.BindedData.extend({

	/**
	*/

	'override __construct': function(app, data, parent)
	{                
		if(!data) data = {};

		this._id = data._id;

		this._janitor = new sk.Janitor();


		this.name(data.name);
		this.parentId(data.parentId);  
		this.type(data.type);
		this.publicName(data.publicName);
		this.createdAt(new Date(data.createdAt)); 
		this.parent(parent);


		this._metadata = {};
		if(data.metadata)
		{
			for(var property in data.metadata)
			{
				this.metadata(property, data.metadata[property]);
			}
		}

		var feeds = [];

		if(data.feeds)
		{
			for(var i = data.feeds.length; i--;)
			{
				feeds.push(new Spice.GroupFeed(this, data.feeds[i]));
			}

		}
		this._feeds = Bindable.apply(feeds);


		this._super(app);

	},

	'feeds': function()
	{
		return this._feeds;
	},
	
	/**
	 * returns the group loader
	 */
	
	'loader': function()
	{
		if(!this._loader) this._janitor.addDisposable(this._loader = new Spice.StreamLoader(this._app, { uri: this._id }));
		
		return this._loader;
	},

	/**
	* returns, or sets metadata for group
	*/

	'metadata': function(name, value)
	{                           
		var md = this._metadata[name];

		if(!md)
		{
			md = this._metadata[name] = new Spice.GroupMetaData(this, name, value)
		}                                              
		else
		if(value)
		{
			md.value(value);
		}                   

		return md;
	},               

	/**
	* the parent group
	*/                

	'explicit parent': 1,    

	/**
	*/

	'explicit type': 1,

	/**
	* the name of the group
	*/

	'explicit bindable name': 1,

	/**
	* the parent id of THIS group
	*/

	'explicit bindable parentId': 1,

	/**
	* the public name for the group - e.g: xxx.spice.io/new/footballFans
	*/

	'explicit bindable publicName': 1,

	/**
	* when this group was created
	*/

	'explicit bindable createdAt': 1,


	/**
	* adds current feeds. strings to evaluate, or json objects
	*/

	'addFeeds': function(feedsAr)
	{
		var self = this;

		this._app.api.watchFeeds(this._id, JSON.stringify(feedsAr instanceof Array ? feedsAr : [feedaAr]), function(feeds)
		{
			var newFeeds = [];

			for(var i = feeds.length; i--;)
			{
				newFeeds.push(new Spice.GroupFeed(self, feeds[i]));
			}

			self.feeds().push.apply(self.feeds(), newFeeds);
		})
	},   

	/**
	* removes a feed
	*/

	'removeFeed': function(feed)
	{
		var i = this.feeds().indexOf(feed);

		if(i > -1)
		{
			this.feeds().splice(i, 1);
		}

		this._app.api.unwatchFeeds(this._id, [feed.id()], function(){});
	},

	/**
	* returns child groups
	*/       

	'children': function()
	{                    
		if(this._children) return this._children;

		var children = this._children = sk.Bindable.apply([]),
		self = this;


		this._app.api.getGroups(this._id ? { parent: this._id } : { type: 'scene' }, function(){}, function(app, rawGroups)
		{            
			var groups = [];

			for(var i = rawGroups.length; i--;)
			{                                
				var group = new Spice.Group(this._app, rawGroups[i], self);
				self.addDisposable(group);
				groups.push(group);

			}                         

			self.children().push.apply(children, groups);

			return self.children();
		});      

		return children;
	},  

	/**
	* adds a child group
	*/ 

	'addChild': function(params)
	{                          
		if(this._id) params.parent = this._id;
		var self = this;

		this._app.api.saveGroup(params, function(group)
		{                    
			if(self._children) self.children().push(new Spice.Group(self._app, group, self));
		});
	},                           

	/**
	* removes a child group
	*/

	'removeChild': function(child)
	{                           
		if(this._children)
		{                 
			var i = this.children().indexOf(child);

			if(i > -1) this.children().splice(i,1);
		}                                         

		this._app.api.removeGroup(child._id, function(){});
	},

	/**
	* removes THIS group from the parent
	*/

	'remove': function()
	{
		if(!this.parent()) 
		{
			console.warn('The parent does not exist for group');
			return;
		}

		this.parent().removeChild(this);
	},


	/**
	* when ANY properties change, we need to save it to the server
	*/

	'onPropertyChange': function(data)
	{
		var toSave = {};
		toSave[data.name] = data.value;

		this._save(toSave);
	},   

	/**
	* saves data then sends it up
	*/

	'_save': function(params)
	{
		if(!this._ready) return;

		params._id = this._id;

		var logStr = 'Saving Group: ';

		for(var prop in params)
		{
			logStr += prop + '=' + params[prop] + ', ';
		}

		console.log(logStr);

		this._app.api.saveGroup(params, function(){})
	},

	'addDisposable': function(value)
	{
		this._janitor.addDisposable(value);
	},

	'dispose': function()
	{
		console.log('Disposing Group: '+ this._id);

		this._janitor.dispose();
	}

}); 


Spice.Group.fromObject = Spice.transformCollectionPartial(function(app, item){
	return new Spice.Group(item, app);
});

Spice.Account = Spice.BindedData.extend({

	/**
	*/

	'override __construct': function(profile, data)
	{
		this.id(data._id || data.accountId);
		if(data.joined) this.joined(new Date(data.joined));
		if(data.lastAccessed) this.lastAccessed(new Date(data.lastAccessed));
		this.displayName(data.displayName);
		this.type(data.type || data.service);

		this._super(profile._app, data);

	},
	'explicit bindable id': 1,
	'explicit bindable joined': 1,
	'explicit bindable lastAccessed': 1,
	'explicit bindable displayName': 1,
	'explicit bindable type': 1

});

Spice.Profile = sk.Serializable('spice.io.profile', {

	/**
	*/

	'override __construct': function(data, target)
	{
		this._janitor = new sk.Janitor();

		if(data) this.fromJSON(data, target);
	},     

	'rootGroup': function()
	{
		return this._root;
	},

	'accounts': function()
	{
		if(this._accounts) return this._accounts;

		this._accounts = Bindable.apply([]);

		var self = this;
		self._app.api.getAccounts(function(){}, function(accounts)
		{
			var acc = [];

			for(var i = accounts.length; i--;)
			{
				acc[i] = new Spice.Account(self, accounts[i]);
			}

			self.accounts().push.apply(self.accounts(), acc);
		});

		return this._accounts;
	},

	'fromJSON': function(data, target)
	{
		this._app = target._app;
		this.accessToken = data.accessToken;
		this.displayName = decodeURIComponent(data.displayName);
		this.service 	 = data.service;  
		this.addDisposable(this._root = new Spice.Group(Spice.io(target._app.name)));
		this._data = data;      

	},

	'toJSON': function()
	{
		return this._data;
	},

	'addDisposable': function(item)
	{
		this._janitor.addDisposable(item);
	},

	'dispose': function()
	{
		this._janitor.dispose();
	}
});


Spice.Request = sk.EventEmitter.extend({

	/**
	* Constructor
	* @param app the spice app. used for the accessToken, and uri prefix
	* @param the uri to call
	* @param method the request method: GET, POST, etc.
	* @param the factory which transforms the data
	*/

	'override __construct': function(app, uri, params, method, callback, factory)
	{
		this._super();
		

		this._app 	  = app;
		this._uri     = uri;
		this._params  = params || {};
		this._method  = method || 'GET';
		this._callback = callback;
		this._factory = factory || function(app, data){ return data; }

		//loaderup
		this.load();
	},

	/**
	* loads the request
	*/

	'load': function()
	{
		if(this._app.profile()) this._params.accessToken = this._app.profile().accessToken;

		this._params.rand = Math.random();

		var ops = {
			type: this._method, 
			url: Spice.getHost(this._app.name) + this._uri,
			data: this._params,
			dataType: 'jsonp',
			success: this.getMethod('onResult'),
			error: function(e)
			{
			}
		};


		$.ajax(ops);
	},

	/**
	* called when there is a resposnse
	*/

	'onResult': function(data)
	{
		//ffx issue
		if(typeof data == 'string') data = jQuery.parseJSON(data);

		if(data.result) data = this._factory(this._app, data.result);

		if(this._callback) this._callback(data);

		this.emit(Spice.Events.RESULT, data);
	}
});

Spice.ConnectHandler = sk.EventEmitter.extend({

	/**
	*/

	'override __construct': function(app)
	{
		this._super();

		this._app = app;

		//the connection handler has a few settings
		sk.SettingManager.apply(this, app.name);
	},

	/**
	*/

	'explicit setting profile': {
		set: function(value)
		{
			//dispose of the OLD profile if it exists
			if(this._value) this._value.dispose();

			this._value = value;
		}
	},


	/**
	* opens a new window so to connect the user 
	*/

	'connect': function(serviceName, redirect, callback)
	{
		if(typeof redirect == 'function')
		{
			callback = redirect;
			redirect = undefined;
		}

		if(!redirect)
		{
			redirect = window.location.toString();
		}

		if(redirect.indexOf('http://') == -1)
		{
			var locPath = window.location.toString().split('/');
			locPath.pop();
			redirect = locPath.join('/') + '/' + redirect;
		}

		console.log(redirect)

		var connectUrl = Spice.getHost(this._app.name) + '/connect/'+serviceName + '?r=' + Math.random() + '&redirect='+ escape(redirect);

		//link up the accounts IF logged in
		if(this._app.profile())
		{
			connectUrl += '&accessToken='+this._app.profile().accessToken;
		}

		//open the connection window
		Spice.openWindow(connectUrl, 'Connect', 800, 600);

		var self = this;

		//setup the callback 
		Spice.authorizedConnect = function(profile)
		{
			Spice.authorizedConnect = undefined;

			console.log(profile);

			self.profile(new Spice.Profile(profile, self));

			self.emit(Spice.Events.CONNECT, profile);
		}

		return this;
	},


	/**
	* logs the user out
	*/

	'logout': function()
	{
		console.log("Spice.io::logout");
		this.profile(null);
	}

});

Spice.Stream = { MetaData: { } };

Spice.Stream.MetaData.item = Structr({
	'__construct': function(item, data)
	{
		this._item = item;
		this._data = data;
		
		this.init();
	},
	'init': function(){}
});

/*Spice.Stream.MetaData.image = Spice.Stream.MetaData.item.extend({
	'init': function()
	{
		//console.log(this._data)
	}
});*/

/*Spice.Stream.MetaData.video = Spice.Stream.MetaData.item.extend({
	
});*/



Spice.setMetadata = function(streamItem, item)
{
	var prop = item.type + 's';//plural
	
	if(!streamItem[prop]) streamItem[prop] = [];
	
	var clazz = Spice.Stream.MetaData[item.type];
	
	streamItem[prop].push(clazz ? new clazz(streamItem, item) : item);
};

Spice.Stream.Item = Structr({
	'__construct': function(app, data)
	{
		this._app = app;
		
		//id of the post
		this._id = data._id;
		
		//type of item: video, image, link, article, etc.
		this.type = data.type;
		
		//the servie of the origin: twitter, facebook, youtube, etc.
		this.service = data.service;
		
		//label of article (title)
		this.label = data.label;
		
		//original message before augmenting text
		this.message = data.message;
		
		//sample text from article
		this.text = data.text;
		
		//the link to the article 
		this.link = data.link;
		
		//the origin website 
		this.site = data.site;
		
		//the date the post was created at
		this.createdAt = new Date(data.createdAt);
		
		this.score = data.score;
		this.heat  = data.heat;
		this.likes = data.likes;
		this.dislikes = data.dislikes;
		
		var md = data.metadata;
		
		if(md)
		for(var i = 0, n = md.length; i < n; i++)
		{
			Spice.setMetadata(this,md[i])
		}
		
	},
	
	'pad save': function()
	{
		this._app.api.saveArticle(this.uri, this.link, function()
		{
			console.log("SUCCESS")
		});
	}
	
	
	/*,
	'explicit bindable coverImage': {
		get: function()
		{
			if(!this._coverImage)
		}
	}*/
})


/*Spice.Stream.Article = Spice.Stream.Item.extend({

});

Spice.Stream.Video = Spice.Stream.Item.extend({

});

Spice.Stream.Post = Spice.Stream.Item.extend({

});

Spice.Stream.Image = Spice.Stream.Item.extend({

});*/


Spice.Stream.ItemFactory = Structr({

	/**
	*/

	'__construct': function(app)
	{
		this._app = app;
		this._classes = {};


		this.setClass({
			post: Spice.Stream.Post,
			image: Spice.Stream.Image,
			video: Spice.Stream.Video,
			article: Spice.Stream.Article
		});
	},

	/**
	*/

	'setClass': function(itemType, clazz)
	{

		//itemtyupe can be an object for batch replacements
		if(typeof itemType == 'object')
		{
			for(var type in itemType)
			{
				this.setClass(type, itemType[type]);
			}
			return;
		}

		this._classes[itemType] = clazz;
	},

	/**
	*/

	'getNewItem': function(data)
	{
		/*var clazz = this._classes[data.type];

		if(!clazz)
		{
			console.warn('class '+data.type+' does NOT exist!');
			return null;
		}

		return new clazz(this._app, data);*/
		
		return new Spice.Stream.Item(this._app, data);
	}


});


Spice.StreamLoader = Spice.BindedData.extend({
	
	/**
	 */
	
	'override __construct': function(app, ops)
	{
		this._janitor = new sk.Janitor();
		this._super(app, ops)
		
		this.method('new');
		this.page(0);
		
		for(var prop in ops)
		{
			if(this[prop]) this[prop](ops[prop]);
		}
		
		self = this;
		
		this.lazyLoad = function()
		{
			if(self._ignore) return;
			lazyLoad.apply(self, arguments);
		}
		
		var lazyLoad = sk.lazy.callback(this.getMethod('reload'), 500);
		
		
	},
	
	/**
	 * the uri to load
	 */
	
	'explicit bindable uri': 1,
	
	/**
	 * the current page
	 */
	
	'explicit bindable page': 1,
	
	/**
	 * the filter to use against stream
	 */
	
	'explicit bindable filter': 1,
	
	/**
	 * type of stream: hot, top, stream, new
	 */
	
	'explicit bindable method': 1,
	
	/**
	 * TRUE if currently loading data
	 */
	
	'explicit bindable loading': 1,
	
	/**
	 * returns the content
	 */
	
	'content': function()
	{
		if(this._content) return this._content;
		
		this._content = Bindable.apply([]);
		
		var toBind = ['uri','page','filter','method'];
		
		//listen to the bindable items, then reload the content
		for(var i = toBind.length; i--;)
		{
			this[toBind[i]].subscribe(this.getMethod('lazyLoad'));
		}
		
		return this.reload();
	},
	
	'reload': function()
	{
		this._ignore = true;
		if(!this._content) return this.content();
		
		
		var page = this.page(),
			filter = this.filter(),
			uri = this.uri(),
			method = this.method(),
			app = this._app,
			self = this,
			clean = method != this.previousMethod || uri != this.previousUri || filter != this.previousFilter;
			
		this.previousUri = uri;
		this.previousMethod = method;
		this.previousFilter = filter;
			
		if (clean) 
		{
			page = 0;
			this.page(0);
		}
		
		this._app.api.loadStream(method, uri, { filter: filter, page: page }, function(items)
		{
			var data = Spice.transformCollection(app, items, function(data)
			{
				var item = new Spice.Stream.Item(app, data);
				
				//for saving
				item.uri = uri;
				
				return item;
			});
			
			if(!clean)
			{
				self.content().push.apply(self.content(), data);
			}
			else
			{
				self.content()(data);
			}
		});
		
		this._ignore = false;
		
		return this._content;
	},
	'dispose': function()
	{
		this._janitor.dispose();
	},
	'addDisposable': function(item)
	{
		this._janitor.addDisposable(item);
	}
});

Spice.api = Spice.ServiceHandler.extend({

	/**
	* @param app used to log the user in
	*/

	'override __construct': function(app)
	{
		this._super(app);
	},

	/**
	* returns all accounts for given profile
	*/

	'getAccounts': function(callback, factory)
	{
		this._get('accounts', callback, factory);
	},

	/**
	* saves an article
	*/

	'saveArticle': function (groupId, articleUrl, callback)
	{  
		var uri = 'save/article/' + groupId;     
	
		this._get(uri, {url:articleUrl}, callback, null);
	},

	/**
	* removes an article 
	*/

	'removeArticle': function(groupId, articleUrlOrId, callback)
	{
		var uri = 'remove/article/' + groupId;

		this._get(uri, {url: articleUrlOrId }, callback, null);
	},

	/**
	* unsubscribes from a newsletter
	*/

	'unsubscribe': function (contact, uri, method, callback)
	{
		this._get('unsubscribe/' + contact + '/' + method + '/' + uri, callback);
	},

	/**
	* subscribes to a particular uri
	*/
        

	'subscribe': function(contact, uri, callback)
	{
    	this.subscribe(contact, uri, 'weekly', callback);
	},

	'1 subscribe': function(contat, uri, frequency, callback)
	{   
		this._get('subscribe/' + frequency + '/' + contact + '/' + method + '/' + uri, callback);
	},


	'follow': function(service, data, callback)
	{
		this._get('follow/' + service, data, callback);
	},

	'unfollow': function(service, data, callback)
	{
		this._get('unfollow/' + service, data, callback);
	},

	'followable': function(service, callback)
	{
		this._get('followable/' + service, callback);
	},

	'following': function(service, data, callback)
	{
		this._get('following/' + service, data, callback);
	},

	/**
	* returns input regex for supported services
	*/

	'getQuickInputRegex': function (callback)
	{ 
		this._get('quick/input/regex', callback);
	},

	/**
	* unsubscribes all users from a particular group. group needs to be owned by user
	*/

	'updateAllSubscriptions': function (groupId, method, frequency, callback)
	{
		this._get('update/all/subscriptions/' + frequency + '/' + method + '/' + groupId, callback);
	},

	/**
	* returns the subscribers for given group
	*/

	'getSubscribers': function (groupId, method, callback)
	{
		this._get('subscribers/' + method + '/' + groupId, callback);
	},

	/**
	* returns groups
	*/

	'getGroups': function(params, callback, factory)
	{
		this._get('groups', params, callback, factory || Spice.Group.fromObject);
	},

	/**
	* checks if a group exists
	*/

	'groupExists': function(groupIdOrPublicName, callback)
	{
		this._get('group/exists/' + groupIdOrPublicName, callback, null);
	},

	/**
	* saves a group, and its data
	*/

	'saveGroup': function (data, callback)
	{                 
		this._post('save/group', data, callback, null);
	},

	/**
	* removes a group
	*/

	'removeGroup': function (groupId, callback)
	{
		this._get('remove/group/' + groupId, callback, Spice.Group.fromObject, null);
	},

	/**
	* watches a feed for a group
	*/

	'watchFeeds': function (groupId, feeds, callback)
	{
		this._get('watch/feed/' + groupId, { feed: feeds.toString() }, callback, null);
	},

	/**
	* updates a feed living in a group
	*/

	'updateFeed': function(groupId, feedId, feedData, callback)
	{
		this._get('update/feed/' + groupId + '/' + feedId, {feed: JSON.stringify(feedData)}, callback, null);
	},

	/**
	* unwatches a feed from a group
	*/

	'unwatchFeeds': function(groupId, feeds, callback)
	{
		this._get('unwatch/feed/' + groupId, { feed: feeds.toString() }, callback, null);
	},


	/**
	* loads streamed data
	*/

	'loadStream': function(type, uri, params, callback)
	{
		this._get(type + '/' + uri, params, callback, null);
	}
});


Spice.app = sk.EventEmitter.extend({
	/**
	*/

	'override __construct': function(name)
	{
		this._super();

		//the app name
		this.name = name;
	},

	/**
	* initializes
	*/

	'init': function()
	{

		//need to make this instance bindable. 
		sk.Bindable.apply(this);

		//the api 
		this.api = new Spice.api(this);

		//the connection handler connects the USER account to the app
		this._connectionHandler = new Spice.ConnectHandler(this);

		//the item factory which creates stream data objects
		this.itemFactory = new Spice.Stream.ItemFactory(this);

		//this is just like  the composite pattern :P
		this.profile = this._connectionHandler.profile;
		this.logout = this._connectionHandler.logout;

		return this;
	},

	/**
	* connects the user to the app
	*/

	'connect': function(service, redirect, callback)
	{
		if(typeof redirect == 'function')
		{
			callback = redirect;
			redirect = undefined;
		}

		//if the callback exists, the subscribe once - throw it away after an account has been found
		if(callback) this.profile.subscribeOnce(callback);

		//and then connect the account up
		return this._connectionHandler.connect(service, redirect);
	}
})


Spice.io = function(appName)
{
	if(Spice.apps[appName]) return Spice.apps[appName];

	//instantiate first
	var app = Spice.apps[appName] = new Spice.app(appName);

	//then init, because serialized objects *might* pull the spice app
	return app.init();
}




sard.module23 = {}; 
sard.module22;
sard.module19;

var oldBindObject = sk.Bindable.bindObject;

sk.Bindable.bindObject = function(proxy, target, explicitGS)
{
	oldBindObject(proxy, target, explicitGS);
	
	var oldGS = target[explicitGS];
	
	var newGS = target[explicitGS] = ko.observable(oldGS.apply(target)),
		oldSubscribe = newGS.subscribe;
		
	newGS.subscribe = function(callback)
	{
		var disposable = oldSubscribe.apply(target, [callback]);
		
		if(target.addDisposable) target.addDisposable(disposable);
		
		return disposable;
	}
	
	//need to subscribe to the OLD GS.
	newGS.subscribe(function(data)
	{
		return oldGS.apply(target, [data]);
	});
	
	newGS.subscribeOnce = function(callback)
	{
		disposable = newGS.subscribe(function()
		{
			callback.apply(null, arguments);
			disposable.dispose();
		});
	};
	
	
	newGS.subscribeAndRequest = function(callback)
	{
		callback(newGS.apply(target));
		return newGS.subscribe(callback);
	}
}

/**
 *  needs to be compatible with knockout.js
 */

function bindableArrayPartial(property)
{
	return function()
	{
		if(this[property]) return this[property];
		
		var oldValue =this._super(); 
		this[property] = ko.observableArray(oldValue);
		var oldSubscribe = this[property].subscribe,
			self = this;
			
		
		this[property].subscribe = function(callback)
		{
			var disposable = oldSubscribe.apply(self[property], [callback]);
			
			//needs to stay disposable 
			self.addDisposable(disposable);
			
			return disposable;
		}
		
		
		return this[property];
	}
}

Spice.Group = Spice.Group.extend({
	
	'override children': bindableArrayPartial('_koChildren'),
	'override feeds': bindableArrayPartial('_koFeeds')
});

Spice.Profile = Spice.Profile.extend({
	'override accounts': bindableArrayPartial('_koAccounts')
});

Spice.StreamLoader = Spice.StreamLoader.extend({
	'override content': bindableArrayPartial('_koContent'),
});

sard.module24 = {}; 
sard.module0;   
sard.module1;   
sard.module2;   
sard.module3;   
sard.module8;
sard.module9;   
sard.module12; 
sard.module23;   

var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-22521106-1']);
  _gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();



console.log("GOOGLE")