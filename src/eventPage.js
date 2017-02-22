/* globals chrome */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action == "show") {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.pageAction.show(tabs[0].id);
		});
	} else if ("return_insta_users" === request.action) {

		var url = chrome.extension.getURL('result.html');
		var reqText = request.text;

		//query if we already have result page opened
		chrome.tabs.query({
			url: url
		}, function (tabs) {
			if (0 === tabs.length) { //tab is not found, let's create it
				chrome.tabs.create({
					'url': url,
					'selected': true
				}, function (tab) {
					function sendModifyResultPage(tabId, changeInfo, tab) {
						if (tab.url.indexOf('result.html') != -1 && changeInfo.status == 'complete') {
							chrome.tabs.sendMessage(tab.id, {
								"action": "modifyResultPage",
								"text": reqText
							});
							//remove listener
							chrome.tabs.onUpdated.removeListener(sendModifyResultPage);
						}
					}
					chrome.tabs.onUpdated.addListener(sendModifyResultPage);
				});

			} else {	//tab is found, let's show it
				chrome.tabs.update(tabs[0].id, {
					active: true
				});
				chrome.tabs.sendMessage(tabs[0].id, {
					"action": "modifyResultPage",
					"text": reqText
				});
			}
		});
	}
});
