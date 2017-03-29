/* jshint esnext: true */
/* globals chrome, document */

$(function () {
	"use strict";

	$('#username').on("change keyup", function () {
		if ($(this).val().length > 0) {
			$('#instaUsers').removeAttr("disabled");
		} else {
			$('#instaUsers').attr("disabled", "disabled");
		}
	});

	$('#instaUsers').click(function () {

		var userName = $("#username").val();

		if (!userName)
			return;

		//query if we already have result page opened
		var url = chrome.extension.getURL('instaUsers.html');
		chrome.tabs.query({
			url: url
		}, function (tabs) {
			if (tabs.length > 0) { //result tab is found
				alert("The result window is already opened. Please close it before processing");

			} else { //tab is not found, let's continue
				userInfo.getUserProfile(userName, function (obj) {

					chrome.tabs.query({
						active: true,
						currentWindow: true
					}, function (tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {
							action: "get_insta_users",
							userName: $("#username").val(),
							userId: obj.id,
							follows_count: obj.follows_count,
							followed_by_count: obj.followed_by_count,
							relType: $('input[name=relType]:checked').attr("id")
						});
					});
				});
			}
		});
	});
});

window.onload = function () {
	"use strict";

	_gaq.push(['_trackPageview']);

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {

		var arr = tabs[0].url.match(/(?:taken-by=|instagram.com\/)(.[^\/]+)/);

		if (arr) {
			userInfo.getUserProfile(arr[1], function (obj) {

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
				$("#username").val(obj.username);
				$("#username_1").val(obj.username);
				$("#details").html($html);
			});
		} else {
			$("#details").text("UserName is not found in URL");
			$('#instaUsers').attr("disabled", "disabled");
		}
	});
};
