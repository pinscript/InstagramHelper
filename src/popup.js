/* jshint esnext: true */
/* globals chrome, document */

$(function () {
	//console.log("document ready - " + Date());

	$('#instaUsers').click(function () {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "get_insta_users"
			});
		});
	});
});

window.onload = function () {
	_gaq.push(['_trackPageview']);
	//console.log("window onload - " + Date());

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {

		var arr = tabs[0].url.match(/(?:taken-by=|instagram.com\/)(.[^\/]+)/);

		if (arr) {
			
			getUserProfile(arr[1], function(obj) {
				
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
			});	
		} else {
			$("#container").text("UserName is not found in URL");			
		}
	});
};
