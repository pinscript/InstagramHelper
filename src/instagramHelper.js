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

	if (request.action === "get_insta_users_old") {

		chrome.storage.sync.get({
			usersClass: '_539vh'
		}, function (items) {
			var users = document.getElementsByClassName(items.usersClass);
			if (0 === users.length) {
				alert("Please open followers or following list!");
			} else {
				chrome.runtime.sendMessage({
					action: "return_insta_users_old",
					text: users[0].innerHTML
				});
			}
		});
	} else if (request.action === "get_insta_users") {

		chrome.storage.sync.get({
			pageSize: 20
		}, function (items) {
			//var arr = document.URL.match(/(?:taken-by=|instagram.com\/)(.[^\/]+)/);
			var sharedData = getCsrfToken();

			chrome.runtime.sendMessage({
				action: "return_insta_users",
				userName: request.userName,
				pageSize: items.pageSize,
				csrfToken: sharedData.config.csrf_token,
				relType: request.relType
			});
/*
			var injScript = document.createElement("script"); //maybe I don't need to inject jquery if I add it into manifest
			injScript.src = "https://code.jquery.com/jquery-3.1.1.js";
			injScript.type = "text/javascript";
			document.head.appendChild(injScript);

			var script = `(function (){
	
	console.log("fectch insta users2");
    var request = "q=ig_user(2101604723)+%7B%0A++followed_by.first(10)+%7B%0A++++count%2C%0A++++page_info+%7B%0A++++++end_cursor%2C%0A++++++has_next_page%0A++++%7D%2C%0A++++nodes+%7B%0A++++++id%2C%0A++++++is_verified%2C%0A++++++followed_by_viewer%2C%0A++++++requested_by_viewer%2C%0A++++++full_name%2C%0A++++++profile_pic_url%2C%0A++++++username%0A++++%7D%0A++%7D%0A%7D%0A&amp;amp;ref=relationships%3A%3Afollow_list";
    $.ajax({
        url: "https://www.instagram.com/query/",
        crossDomain: true,
		headers: {
            "x-instagram-ajax": '1',
            "x-csrftoken": "w4O9nb79iLefqAWvyimC4vstaDpdltRg",
			"x-requested-with": XMLHttpRequest
        },
        method: 'POST',
        data: request,
		xhrFields: {
			withCredentials: true
		},	
		beforeSend: function() {
			console.log(arguments);
		},
        success: function(data) {
            console.log(data);
        }
    });
			})();`;
			var injScript = document.createElement("script");
			injScript.type = "text/javascript";
			injScript.innerHTML = script;
			document.head.appendChild(injScript);
*/
		});
	}
});

chrome.runtime.sendMessage({
	action: "show"
});
