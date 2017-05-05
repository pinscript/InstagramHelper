/* jshint esnext: true */

var countdown = function () {};

countdown.doCountdown = function (element, stopTime) {
	"use strict";

	return new Promise(function (resolve) {
		doCountdown(element, stopTime, resolve);
	});

	function doCountdown(element, stopTime, resolve) {

        var el = document.getElementById(element);

        var interval = setInterval(function() {
		    var time = Math.round((stopTime - (new Date()).getTime()) / 1000);
            if (time <= 0) {
                clearInterval(interval);
                el.innerHTML = "Countdown is completed";
                resolve();
            } else {
                var minutes = Math.floor( time / 60 );
                if (minutes < 10) minutes = "0" + minutes;
                var seconds = time % 60;
                if (seconds < 10) seconds = "0" + seconds; 
                var text = minutes + ':' + seconds;
                el.innerHTML = `Paused because of HTTP429 error. Continue in ${text}`;
            }
        }, 1000);

	}
};
