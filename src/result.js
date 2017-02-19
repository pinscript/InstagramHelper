$(function() {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		console.log("request inside result.js - " + request.action);
		if(request.action == "modifyResultPage") {
			var $html = $("<ul>" + request.text + "</ul>").find("a").each(function(){
				$(this)
					.attr("href", "https://www.instagram.com" + $(this).attr("href"))
					.attr("target", "_blank");
			}).end();
			$html.find("button").parent().parent().remove();
			$("div#followers").html($html);
		};
	  });
});