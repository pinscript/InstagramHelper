/* jshint esnext: true */
/* globals chrome, document */

$(function () {
	//console.log("document ready - " + Date());

	$('#username').on ("change keyup", function () {
		//todo: clear following / followers
		if ($(this).val().length > 0) {
			$('#instaUsers').removeAttr("disabled");
		} else {
			$('#instaUsers').attr("disabled", "disabled");
		}
	});

	$('#instaUsersOld').click(function () {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "get_insta_users_old"
			});
		});
	});

	$('#instaUsers').click(function () {
		//console.log($('input[name=relType]:checked').attr("id"));
		//resolve user name
		//update follower/following
		//send them as message
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "get_insta_users",
				userName: $("#username").val(),
				relType: $('input[name=relType]:checked').attr("id")
			});
		});
	});

});

window.onload = function () {
	_gaq.push(['_trackPageview']);

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {

		if (tabs[0].incognito) {
			console.log("incognito mode detected, not supported for getting the list of users"); //todo: how do I handle it?
		}
		
		var arr = tabs[0].url.match(/(?:taken-by=|instagram.com\/)(.[^\/]+)/);

		if (arr) {

			getUserProfile(arr[1], function (obj) {

				var $html = "";
				delete obj.profile_pic_url_hd;
				for (var key in obj) {
					if (obj[key] !== null) {
						if (("connected_fb_page" === key) || ("external_url" === key)) {
							$html += `${key}: <strong><a href='${obj[key]}' target='_blank'>${obj[key]}</a></strong><br/>`;
						} else {
							$html += `${key}: <strong>${obj[key]}</strong><br/>`;
						}
					}
				}
				$("#container").html($html);
				$("#username").val(obj.username);
				//todo:: update followers / following
			});
		} else {
			$("#container").text("UserName is not found in URL");
			$('#instaUsers').attr("disabled", "disabled");
		}
	});
};
