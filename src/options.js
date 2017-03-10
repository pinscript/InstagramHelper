/* globals chrome, document */

function save_options() {
	var usersClass = document.getElementById('usersClass').value;
	var pageSize = document.getElementById('pageSize').value;
	var delay = document.getElementById('delay').value;
	chrome.storage.sync.set({
		usersClass: usersClass,
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
		usersClass: '_539vh',
		pageSize: 100,
		delay: 1000
	}, function (items) {
		document.getElementById('usersClass').value = items.usersClass;
		document.getElementById('pageSize').value = items.pageSize;
		document.getElementById('delay').value = items.delay;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', save_options);

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
