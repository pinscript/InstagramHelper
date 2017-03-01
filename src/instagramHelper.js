/* jshint esnext: true */
/* globals chrome, document */

function getCsrfToken() {
	var id = "InstaHelperInjection";
	var script = `(function (){
			var ret_value = ((function (){
				return _sharedData;
			})());
			document.getElementById('InstaHelperInjection').innerText = JSON.stringify(ret_value);
			})();`;
	var injScript = document.createElement("script");
	injScript.type = "text/javascript";
	injScript.innerHTML = script;
	injScript.id = id;
	document.head.appendChild(injScript);
	var ret_value = JSON.parse(injScript.innerText);
	var csrfToken = ret_value.config.csrf_token;
	injScript.parentNode.removeChild(injScript);
	return csrfToken;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.action === "get_insta_users_old") {

		chrome.storage.sync.get({
			usersClass: '_539vh'
		}, function (items) {
			var users = document.getElementsByClassName(items.usersClass);
			if (0 === users.length) {
				alert("Please open followers or following list!");
			} else {
				chrome.runtime.sendMessage({
					action: "return_insta_users",
					text: users[0].innerHTML
				});
			}
		});
	} else if (request.action === "get_insta_users") {

		chrome.storage.sync.get({
			pageSize: 20
		}, function (items) {
			var arr = document.URL.match(/(?:taken-by=|instagram.com\/)(.[^\/]+)/); //todo: improve it
			chrome.runtime.sendMessage({
				action: "return_insta_users",
				userName: arr[1],
				pageSize: items.pageSize,
				csrfToken: getCsrfToken()
			});
		});

	}
});

	chrome.runtime.sendMessage({
		action: "show"
	});
