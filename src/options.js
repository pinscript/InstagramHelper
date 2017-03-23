/* globals chrome, document */
(function () {
	"use strict";

	var defPageSize = 100;
	var defDelay = 1000;
	var defCsvFields = document.getElementById('csvFields').placeholder;
	//excluded from default - profile_pic_url_hd, biography,  is_verified, requested_by_viewer

	function save_options() {
		var pageSize = document.getElementById('pageSize').value;
		var delay = document.getElementById('delay').value;
		var csvFields = document.getElementById('csvFields').value;
		chrome.storage.sync.set({
			pageSize: pageSize,
			delay: delay,
			csvFields: csvFields
		}, function () {
			// Update status to let user know options were saved.
			var status = document.getElementById('status');
			status.textContent = 'Options were saved.';
			setTimeout(function () {
				status.textContent = '';
			}, 1000);
		});
	}

	function restore_options() {
		chrome.storage.sync.get({
			pageSize: defPageSize,
			delay: defDelay,
			csvFields: defCsvFields
		}, function (items) {
			document.getElementById('pageSize').value = items.pageSize;
			document.getElementById('delay').value = items.delay;
			document.getElementById('csvFields').value = items.csvFields;
		});
	}

	function restore_defaults() {
		chrome.storage.sync.set({
			pageSize: defPageSize,
			delay: defDelay,
			csvFields: defCsvFields
		}, function () {
			restore_options();
			var status = document.getElementById('status');
			status.textContent = 'Default options were restored.';
			setTimeout(function () {
				status.textContent = '';
			}, 1000);
		});

	}

	document.addEventListener('DOMContentLoaded', restore_options);
	document.getElementById('save').addEventListener('click', save_options);
	document.getElementById('restoreDefaults').addEventListener('click', restore_defaults);

})();

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
