var router = require('../../').router();

router.on({

    'pull validate -> login/*': function() {

    	console.log("LOGIN");
    	this.next();
    }

});






router.pull('login', function(response) {
	
});