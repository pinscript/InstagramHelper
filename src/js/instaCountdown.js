/* globals Promise */

var instaCountdown = function () { };

instaCountdown.doCountdown = function (element, prefix, stopTime, color) {
    "use strict";

    return new Promise(function (resolve) {
        doCountdown(element, prefix, stopTime, resolve, color);
    });

    function doCountdown(element, prefix, stopTime, resolve, color) {

        var el = document.getElementById(element);
        el.style.color = color || 'red';

        var interval = setInterval(function () {
            var time = Math.round((stopTime - (new Date()).getTime()) / 1000);
            if (time <= 0) {
                clearInterval(interval);
                el.innerHTML = `${prefix}Countdown is completed`;
                resolve();
            } else {
                var minutes = Math.floor(time / 60);
                if (minutes < 10) minutes = "0" + minutes;
                var seconds = time % 60;
                if (seconds < 10) seconds = "0" + seconds;
                var text = minutes + ':' + seconds;
                el.innerHTML = `${prefix}Paused because of HTTP429 error. Continue in ${text}`;
            }
        }, 1000);

    }
};
