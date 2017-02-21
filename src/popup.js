$(function () {
    $('#instaFollowers').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "get_followers" });
        });
    });
	
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if ("return_followers_count" === request.action) {
			$("h1").replaceWith(request.text);
		}
	});	
	
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		console.log("sending message to get followers count");
		chrome.tabs.sendMessage(tabs[0].id, { action: "get_followers_count" });
    });
});