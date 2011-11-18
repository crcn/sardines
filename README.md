## What is it?

Combine all node.js scripts into one file. Run it as a single executable, or online.


## Requirements


- Node.js 
- Linux / Mac
- NPM
- [beet](https://github.com/spiceapps/beet) - upstart script which daemonizes yor stuff
- growlnotify for growl notifications


## Sweet Stuff

- Supports NPM packages.
- Parses require(...), so your code stays compatible on the backend, as well as the front end.
- Don't care for combining JS files, but want to know the dependencies? Use the API.


## Terminal Usage


Usage: sardines <cmd>

	Arguments:

		-i <input dir>		The input directory of the project
		-o <output dir>	    The output directory of the project


## Terminal Examples

	sardines -i input.js -o output.js
   
