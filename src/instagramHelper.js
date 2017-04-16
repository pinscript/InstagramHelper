/* jshint esnext: true */
/* globals chrome, document, instaDefOptions, PromiseChrome */
(function () {
	"use strict";
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

		var getCsrfToken = function () {
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
		};

		if (("get_insta_users" === request.action) || ("get_common_users" === request.action)) {
			(new PromiseChrome()).promiseGetStorage({
				pageSize: instaDefOptions.defPageSize,
				delay: instaDefOptions.defDelay
			}).then(function (items) {

				var sharedData = getCsrfToken();

				request.pageSize = items.pageSize;
				request.delay = items.delay;
				request.csrfToken = sharedData.config.csrf_token;
				if (sharedData.config.viewer === null) {
					alert("You are not logged in, cannot get the list of users.");
				} else {
					request.viewerUserName = sharedData.config.viewer.username;
					if ("get_common_users" === request.action) {
						if (request.user_1_is_private && !request.user_1_followed_by_viewer && request.viewerUserName != request.userName_1) {
							alert(`Username ${request.userName_1} is not valid`);
							return;
						}
						if (request.user_2_is_private && !request.user_2_followed_by_viewer && request.viewerUserName != request.userName_2) {
							alert(`Username ${request.userName_1} is not valid`);
							return;
						}
					} else if (request.user_is_private && !request.user_followed_by_viewer && request.viewerUserName != request.userName) {
						alert(`Username ${request.userName} is not valid`);
						return;
					}
					chrome.runtime.sendMessage(request);
				}
			});
		}
	});

	chrome.runtime.sendMessage({
		action: "show"
	});

})();
