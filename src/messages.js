var messages = function() {

    var m = {
        "test" : "TEST MESSAGE"
    }

    function getMessage(key) {
        return m[key];
    }

	return {
        getMessage : getMessage
	}
}();