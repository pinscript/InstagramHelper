chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "show") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.pageAction.show(tabs[0].id);
        });
    } else if ("return_followers" === request.action) {
		console.log($(request.text).length);
		chrome.tabs.create({'url': chrome.extension.getURL('result.html')}, function(tab) {
			var reqText = request.text;
			chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
				if (tab.url.indexOf('result.html') != -1 && changeInfo.status == 'complete') {
					chrome.tabs.sendMessage(tab.id, {"action" : "modifyResultPage", "text" : reqText});
				};
			});
		});
	}
});



