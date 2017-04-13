/* jshint esnext: true */
/* globals chrome, document, PromiseChrome, userInfo, _gaq */

$(function () {
	"use strict";

	var promiseChrome = new PromiseChrome();

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

		promiseChrome.promiseCheckOpenTab({
			url: chrome.extension.getURL('instaUsers.html')
		}).then(function () {
			var promiseUserInfo = userInfo.getUserProfile(userName);
			var promiseQueryActiveTab = promiseChrome.promiseQuery({
					active: true,
					currentWindow: true
				});
			Promise.all([promiseUserInfo, promiseQueryActiveTab]).then(values => {
				let[obj, tabs] = values;
				chrome.tabs.sendMessage(tabs[0].id, {
					action: "get_insta_users",
					page: "instaUsers.html",
					userName: userName,
					userId: obj.id,
					follows_count: obj.follows_count,
					followed_by_count: obj.followed_by_count,
					relType: $('input[name=relType]:checked').attr("id")
				});
			});
		}, () => alert("Already found open tab with results, please close!"));
	});

	$('#findCommonUsers').click(function () {
		var userName_1 = $("#username_1").val();
		if (!userName_1) {
			alert("Please specify the 1st user name");
			return;
		}
		
		var userName_2 = $("#username_2").val();
		if (!userName_2) {
			alert("Please specify the 2nd user name");
			return;
		}
			
		promiseChrome.promiseCheckOpenTab({
			url: chrome.extension.getURL('commonUsers.html')
		}).then(function () {
			var promiseUserInfo1 = userInfo.getUserProfile(userName_1);
			var promiseUserInfo2 = userInfo.getUserProfile(userName_2);
			var promiseQueryActiveTab = promiseChrome.promiseQuery({
					active: true,
					currentWindow: true
				});
			Promise.all([promiseUserInfo1, promiseUserInfo2, promiseQueryActiveTab]).then(values => {
				let[obj1, obj2, tabs] = values;
				chrome.tabs.sendMessage(tabs[0].id, {
					action: "get_common_users",
					page: "commonUsers.html",
					userName_1: userName_1,
					userId_1: obj1.id,
					follows_1_count: obj1.follows_count,
					followed_by_1_count: obj1.followed_by_count,
					userName_2: userName_2,
					userId_2: obj2.id,
					follows_2_count: obj2.follows_count,
					followed_by_2_count: obj2.followed_by_count,
					relType: "All"
				});
			});				
		}, () => alert("Already found open tab with results, please close!"));
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
			userInfo.getUserProfile(arr[1]).then(function (obj) {

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
