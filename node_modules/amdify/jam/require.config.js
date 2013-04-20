var jam = {
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "lib/async.js"
        },
        {
            "name": "asyngleton",
            "location": "jam/asyngleton",
            "main": "./lib/index.js"
        },
        {
            "name": "crc32",
            "location": "jam/crc32",
            "main": "./lib/crc32.js"
        },
        {
            "name": "ejs",
            "location": "jam/ejs",
            "main": "./lib/ejs.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "./index.js"
        },
        {
            "name": "flatten",
            "location": "jam/flatten",
            "main": "./index.js"
        },
        {
            "name": "fs",
            "location": "jam/fs",
            "main": "./index.js"
        },
        {
            "name": "mkdirp",
            "location": "jam/mkdirp",
            "main": "./index.js"
        },
        {
            "name": "outcome",
            "location": "jam/outcome",
            "main": "./lib/index.js"
        },
        {
            "name": "path",
            "location": "jam/path",
            "main": "./index.js"
        },
        {
            "name": "resolve",
            "location": "jam/resolve",
            "main": "./index.js"
        },
        {
            "name": "stepc",
            "location": "jam/stepc",
            "main": "./lib/step.js"
        },
        {
            "name": "structr",
            "location": "jam/structr",
            "main": "./lib/index.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "./underscore.js"
        }
    ],
    "version": "0.2.15",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "lib/async.js"
        },
        {
            "name": "asyngleton",
            "location": "jam/asyngleton",
            "main": "./lib/index.js"
        },
        {
            "name": "crc32",
            "location": "jam/crc32",
            "main": "./lib/crc32.js"
        },
        {
            "name": "ejs",
            "location": "jam/ejs",
            "main": "./lib/ejs.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "./index.js"
        },
        {
            "name": "flatten",
            "location": "jam/flatten",
            "main": "./index.js"
        },
        {
            "name": "fs",
            "location": "jam/fs",
            "main": "./index.js"
        },
        {
            "name": "mkdirp",
            "location": "jam/mkdirp",
            "main": "./index.js"
        },
        {
            "name": "outcome",
            "location": "jam/outcome",
            "main": "./lib/index.js"
        },
        {
            "name": "path",
            "location": "jam/path",
            "main": "./index.js"
        },
        {
            "name": "resolve",
            "location": "jam/resolve",
            "main": "./index.js"
        },
        {
            "name": "stepc",
            "location": "jam/stepc",
            "main": "./lib/step.js"
        },
        {
            "name": "structr",
            "location": "jam/structr",
            "main": "./lib/index.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "./underscore.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "lib/async.js"
        },
        {
            "name": "asyngleton",
            "location": "jam/asyngleton",
            "main": "./lib/index.js"
        },
        {
            "name": "crc32",
            "location": "jam/crc32",
            "main": "./lib/crc32.js"
        },
        {
            "name": "ejs",
            "location": "jam/ejs",
            "main": "./lib/ejs.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "./index.js"
        },
        {
            "name": "flatten",
            "location": "jam/flatten",
            "main": "./index.js"
        },
        {
            "name": "fs",
            "location": "jam/fs",
            "main": "./index.js"
        },
        {
            "name": "mkdirp",
            "location": "jam/mkdirp",
            "main": "./index.js"
        },
        {
            "name": "outcome",
            "location": "jam/outcome",
            "main": "./lib/index.js"
        },
        {
            "name": "path",
            "location": "jam/path",
            "main": "./index.js"
        },
        {
            "name": "resolve",
            "location": "jam/resolve",
            "main": "./index.js"
        },
        {
            "name": "stepc",
            "location": "jam/stepc",
            "main": "./lib/step.js"
        },
        {
            "name": "structr",
            "location": "jam/structr",
            "main": "./lib/index.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "./underscore.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}