What is it?
-----------

Stress-free combining of your javascript files. Start it with your target project, daemonize it, and forget about it. Forever....

Why?
----

Because current javascript build scripts are a pain to manage, and this one was built to use, and forget.

Requirements
------------

- Node.js 
- Linux / Mac
- NPM
- [beet](https://github.com/spiceapps/beet) - upstart script which daemonizes yor stuff

Don't complain
--------------

This was a Sunday project, so expect leaky, buggy results. I'll fix stuff as they come up.

The name >.>
------------

Sardines sounded pretty good because it makes you think of a bunch of fish (javascript) packed in a tiny can (single file). 

Sweet Stuff
-----------

- Supports NPM packages.
- Extendable ([brazln](https://github.com/spiceapps/brazln))
- Parses require(...), so your code stays compatible on the backend, as well as the front end.
- Don't care for combining JS files, but want to know the dependencies? Use the API.
- Fork the watching process, and forget about it. Need to reboot your machine? It's still watching your shit.
- Doesn't rebuild any html. Instead it looks for JS files with require(...), and includes the dependencies into *that* JS file.


Terminal Usage
--------------

	Usage: sardines <cmd>

	Arguments:

		-input <input dir>		The input directory of the project
		-output <output dir>	The output directory of the project
	
	Optional:

		-daemonize		 	    Daemonizes the watcher
		-watch			   		Watches the project
		-name			   		Name of the running process. Required for forking

Terminal Examples
-----------------

start watching a project:

	sardines -input /path/to/project/src -output /path/to/project/release
	
start watching a project, and daemonize:
	
	sardines -input /path/to/project/src -output /path/to/project/release -name myProjectName -daemonize
	
stopping the daemon:

	beet stop sardine-myProjectName
	
To-Do:
------

- better documentation
- help file for CLI
- reading package.json for project
- compressing javascript files
- combined JS files litter the global namespace.
- clean up the code + document it. 