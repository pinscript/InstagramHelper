/* jshint esnext: true */

$(function () {
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		console.log("request inside result.js - " + request.action);
		if (request.action == "modifyResultPage") {

			var myData = [];

			$("<ul>" + request.text + "</ul>").find("li").each(function () {
				var link = "https://www.instagram.com" + $(this).find("a").attr("href") + "?__a=1";
				$.ajax({
					url: link,
					success: function (result) {
						console.log(result);
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
						myData.push(obj);
						$('#jqGrid').trigger('reloadGrid'); //temp solution
					},
					async: true
				});
			});

			//build grid
			$("#jqGrid").jqGrid({
				datatype: "local",
				data: myData,
				autowidth: true,
				height: "100%",
				colModel: [{
						label: 'Picture',
						name: 'profile_pic_url_hd',
						formatter: function (cellvalue, model, row) {
							console.log(arguments);
							return `<a href='https://www.instagram.com/${row.username}' target='_blank'><img src='${cellvalue}' alt='' /></a>`;
						}
					}, {
						label: 'Id',
						name: 'id'
					}, {
						label: 'UserName',
						name: 'username'
					}, {
						label: 'Full Name',
						name: 'full_name'
					}, {
						label: 'Bio',
						name: 'biography'
					}, {
						label: 'FB',
						name: 'connected_fb_page'
					}, {
						label: 'Url',
						name: 'external_url'
					}, {
						label: 'Followed',
						name: 'followed_by_viewer'
					}, {
						label: 'Follows',
						name: 'follows_viewer'
					}, {
						label: 'Private',
						name: 'is_private'
					}, {
						label: 'Followers',
						name: 'followers_count'
					}, {
						label: 'Following',
						name: 'followeing_count'
					}, {
						label: 'Posts',
						name: 'media_count'
					}
				],
				viewrecords: true, // show the current page, data rang and total records on the toolbar
				caption: "Instagram followers",
			});
		}
	});
});
