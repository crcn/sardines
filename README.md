## What is it?

Combine all node.js scripts into one file. Run it as a single executable, or online.

## Features

- Combine all scripts into one (shrinkwrap method)
- Asynchronously load all scripts (browserify method)
- express middleware

### JS Example

```javascript
var sardines = require("sardines"),
fs = require("fs");

sardines.shrinkwrap({
	entry: __filename
}, function(err, content) {
	fs.writeFile(__dirname + "/shrinkwrapped.js", content);
});
```

### Express example
```javascript
var server = require("express").createServer();
server.use(require("sardines").middleware({
	directory: __dirname + "/public"
}));
server.listen(8080);
```

In your browser, load a script and append one of the following query arguments: `shrinkwrap`, `browserify`, or `wrap`.

Like so:

```bash
http://localhost:8080/js/app.js?browserify # asynchronously loads ALL scripts vs loading into one
http://localhost:8080/js/app.js?shrinkwrap # loads all scripts into one
http://localhost:8080/js/app.js?wrap # wraps the script in a function so it doesn't pollute the global namespace
```

## Terminal Usage

```bash

Usage: sardines [include] -e [entry] -o [output] -p [port] -d -s

Options:
  -s, --server     run the http server             
  -d, --directory  public directory for http server  [default: cwd]
  -p, --port                                         [default: 8080]
  -m  --method                                       [default: "shrinkwrap"]
```


## Terminal Examples

```bash
sardines -e app.js -o app.shrinkwrap.js -m shrinkwrap # shrinkwrap the app
sardines -s # start the server
```
