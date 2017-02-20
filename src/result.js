$(function() {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		console.log("request inside result.js - " + request.action);
		if(request.action == "modifyResultPage") {
					
			var $html = $("<ul>" + request.text + "</ul>").find("a").each(function(){
				var link = "https://www.instagram.com" + $(this).attr("href");
				$(this)
					.attr("href", link)
					.attr("target", "_blank");
			}).end();
			
			$html.find("button").parent().parent().remove();
			
			$("div#followers").html($html);
			
			//submit ajax request for each displayed user
			$html.find("li").each(function() {
				var link = $(this).find("a").attr("href") + "?__a=1";
				var $self = $(this);
				$.ajax({
					url: link,
					success: function (result) {
						console.log(result);
						var userObj = result.user;
						var {id, biography, connected_fb_page, external_url, followed_by_viewer, follows_viewer, is_private} = userObj;
						//todo: get followers, following, posts
						var $div = $("<div>", {id: "foo", "class": "_ajaxresponse"}).append("UserId - " + id);
						$self.find("._mmgca").append($div);
					},
					async: true
				});
			});
		}
	});
});