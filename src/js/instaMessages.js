/* exported instaMessages */

var instaMessages = function () {
	"use strict";

	var m = {
		"HTTP404": "Requested page not found. [404]",
		"HTTP429": "Instagram returned HTTP 429 Error Code that means too many requests were already generated. The execution will continue in ${0} minutes!",
		"HTTP429CONT": "The pause after HTTP 429 Error is finished. Trying to continue the execution.",
		"HTTP500": "Internal Server Error [500].",
		"NOTCONNECTED": "Not connected. Verify Network. Request will be retried in ${0} munutes!",
		"NOTLOGGEDIN": "You are not logged in, cannot get the list of users.",
		"NOTALLOWEDUSER": "You cannot get the followers/following users of user ${0}, its account is private and you are not following it.",
		"JSONPARSEERROR": "Requested JSON parse failed.",
		"TIMEOUT": "Time out error.",
		"AJAXABORT": "Ajax request aborted.",
		"UNCAUGHT": "Uncaught Error: ${0}",
		"THESAMEUSERS": "You are going to find the common users between the same users, please provide the different first or second user name.",
		"ERRGETTINGUSER": "error getting the ${0} user profile, status - ${1}.",
		"USERNAMEISREQ": "Please provide the user name.",
		"USERNAMEISREQPAR": "Please specify the ${0} user name.",
		"TABISOPEN": "Found already open tab with results, please close this tab before processing!"
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

	return {
		getMessage: getMessage
	}
}
();
