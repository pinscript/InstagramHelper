/* globals chrome, document */
(function () {
	"use strict";

	function save_options() {
		var pageSize = document.getElementById('pageSize').value;
		var delay = document.getElementById('delay').value;
		chrome.storage.sync.set({
			pageSize: pageSize,
			delay: delay
		}, function () {
			// Update status to let user know options were saved.
			var status = document.getElementById('status');
			status.textContent = 'Options saved.';
			setTimeout(function () {
				status.textContent = '';
			}, 750);
		});
	}

	function restore_options() {
		chrome.storage.sync.get({
			pageSize: 100,
			delay: 1000
		}, function (items) {
			document.getElementById('pageSize').value = items.pageSize;
			document.getElementById('delay').value = items.delay;
		});
	}

	document.addEventListener('DOMContentLoaded', restore_options);

	document.getElementById('save').addEventListener('click', save_options);

})();

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
