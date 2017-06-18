/* jshint esnext: true */

var userInfo = function () {};

userInfo.getUserProfile = function (username) {
	"use strict";

	return new Promise(function (resolve, reject) {
		getUserProfile(username, resolve, reject);
	});

	function getUserProfile(username, resolve, reject) {
		var link = `https://www.instagram.com/${username}/?__a=1`;
		$.ajax({
			url: link,
			success: function (data) {
				var {
					id,
					username,
					full_name,
					profile_pic_url_hd,
					biography,
					connected_fb_page,
					external_url,
					followed_by_viewer,
					follows_viewer,
					is_private,
					has_requested_viewer,
					blocked_by_viewer,
					requested_by_viewer,
					has_blocked_viewer
				} = data.user;
				var follows_count = data.user.follows.count;
				var followed_by_count = data.user.followed_by.count;
				var media_count = data.user.media.count;
				var obj = {};
				Object.assign(obj, {
					id,
					username,
					full_name,
					profile_pic_url_hd,
					biography,
					connected_fb_page,
					external_url,
					followed_by_viewer,
					follows_viewer,
					is_private,
					has_requested_viewer,
					blocked_by_viewer,
					requested_by_viewer,
					has_blocked_viewer,
					follows_count,
					followed_by_count,
					media_count
				});
				resolve(obj);
			},
			error: function (jqXHR) {
				console.log(`Error making ajax request to get ${username} profile, status - ${jqXHR.status}`);
				console.log(arguments);
				if (jqXHR.status === 0) {
					setTimeout(function () {
						getUserProfile(username, resolve, reject);
					}, instaDefOptions.retryInterval);
					alert(messages.getMessage("NOTCONNECTED", +instaDefOptions.retryInterval / 60000));
				} else if (jqXHR.status === 429) {
					//TODO: improve error handling
					console.log("HTTP429 error getting the user profile.", new Date());
					setTimeout(function () {
						console.log("Continue execution after HTTP429 error.", new Date());
						getUserProfile(username, resolve, reject);
					}, instaDefOptions.retryInterval);
					alert(messages.getMessage("HTTP429", +instaDefOptions.retryInterval / 60000));

				} else if (jqXHR.status === 502) {
					//TODO: improve error handling
					console.log("HTTP502 error getting the user profile.", new Date());
					setTimeout(function () {
						console.log("Continue execution after HTTP502 error.", new Date());
						getUserProfile(username, resolve, reject);
					}, 30000);

					alert("HTTP502 error, continue after 30 seconds");
				
				} else {
					alert(messages.getMessage("ERRGETTINGUSER", username, jqXHR.status));
					reject();
				}
			},
			async: true
		});
	}
};
