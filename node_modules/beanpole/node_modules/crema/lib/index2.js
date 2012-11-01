var strcanner = require("strscanner");


function getScanner(source) {
	return typeof source == "string" ? strcanner(source) : source;
}

function splitOr()

function parse(source) {
	var scanner = strcanner(source.toLowerCase()),
	routes = [];

	//grab the type
	if(scanner.isAZ()) {
		var type = scanner.nextWord();
	}

	while(!scanner.eof()) {
		switch(scanner.cchar()) {
			case "o": 
				if(scanner.peek(3) === "or ") {

				} 
		}
		scanner.nextChar();
	}

	/*while(!scanner.eof()) {
		switch(scanner.cchar()) {
			case ""
		}
	}*/
}

function parseRoute(scanner) {

}

function parseTag(scanner) {
	scanner.nextChar(); //skip -
	var name = scanner.nextWord();
	console.log(scanner.cchar())
}


parse("hello test OR world")