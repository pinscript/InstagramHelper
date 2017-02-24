/* globals chrome, document */

function save_options() {
	var usersClass = document.getElementById('usersClass').value;
	chrome.storage.sync.set({
		usersClass: usersClass
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
	// Use default value color = 'red' and likesColor = true.
	chrome. storage.sync.get({
		usersClass: '_539vh'
	}, function (items) {
		document.getElementById('usersClass').value = items.usersClass;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
