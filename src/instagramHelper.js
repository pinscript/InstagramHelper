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
	injScript.parentNode.removeChild(injScript);
	return ret_value;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.action === "get_insta_users") {

		chrome.storage.sync.get({
			pageSize: instaDefOptions.defPageSize,
			delay: instaDefOptions.defDelay
		}, function (items) {

			var sharedData = getCsrfToken();

			request.action = "return_insta_users";
			request.pageSize = items.pageSize;
			request.delay = items.delay;
			request.csrfToken = sharedData.config.csrf_token;
			chrome.runtime.sendMessage(request);
		});
	}
});

chrome.runtime.sendMessage({
	action: "show"
});
