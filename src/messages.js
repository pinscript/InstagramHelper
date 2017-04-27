var messages = function() {
    "use strict";

    var m = {
        "HTTP429" : "Instagram returned HTTP 429 Error Code that means too many requests were already generated. The execution will continue in ${0} minutes!",
    }

    function getMessage(key) {
        var arr = Array.prototype.slice.call(arguments, 1);
        var ret = m[key];
        for (var i = 0; i < arr.length; i++) {
            var reg = new RegExp("\\$\\{" + i + "}", "g");
            ret = ret.replace(reg, arr[i]);
        }
        return ret;
    }

    //for alert
	return {
        getMessage : getMessage
	}
}();