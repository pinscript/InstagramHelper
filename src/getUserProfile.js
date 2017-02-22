/* jshint esnext: true */

function getUserProfile(username, callback) {

	var link = `https://www.instagram.com/${username}/?__a=1`;
	$.ajax({
		url: link,
		success: function (result) {
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
				is_private
			} = result.user;
			var following_count = result.user.follows.count;
			var followers_count = result.user.followed_by.count;
			var media_count = result.user.media.count;
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
				following_count,
				followers_count,
				media_count
			});
			callback(obj);
		},
		error: function () {
			console.log(`Error calling ajax to get ${username} profile`);
			console.log(arguments);
		},
		async: true
	});
}
