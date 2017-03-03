/* globals chrome, document */

function save_options() {
	var usersClass = document.getElementById('usersClass').value;
	chrome.storage.sync.set({
		usersClass: usersClass,
		pageSize: pageSize
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
	chrome. storage.sync.get({
		usersClass: '_539vh',
		pageSize: 20
	}, function (items) {
		document.getElementById('usersClass').value = items.usersClass;
		document.getElementById('pageSize').value = items.pageSize;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

window.onload = function () {
	_gaq.push(['_trackPageview']);
}