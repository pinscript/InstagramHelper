/* jshint esnext: true */

userInfo = function(){
}

userInfo.getUserProfile = function(username, callback) {

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
			callback(obj);
		},
		error: function (xhr) {
			console.log(`Error making ajax request to get ${username} profile, status - ${xhr.status}`);
			console.log(arguments);
			alert (`error getting the user ${username} profile, status - ${xhr.status}`);
		},
		async: true
	});
}
