/* globals chrome */

var timeout = function () {
	"use strict";

	var setTimeout = function(ms) {
		return new Promise(function (resolve) {
			window.setTimeout(function() {
				resolve();
			}, ms);
		});
	}

	return {
		setTimeout: setTimeout
	};
}();
