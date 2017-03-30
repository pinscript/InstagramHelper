/* globals chrome */

(function () {
	"use strict";
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

		if (request.action == "show") {
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				chrome.pageAction.show(tabs[0].id);
			});
		} else if ("get_insta_users" === request.action) {
			var url = chrome.extension.getURL('instaUsers.html');
			//request.action = "modifyResultPage";

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
							if (tab.url.indexOf('instaUsers.html') != -1 && changeInfo.status == 'complete') {
								chrome.tabs.sendMessage(tab.id, request);
								chrome.tabs.onUpdated.removeListener(sendModifyResultPage);
							}
						}
						chrome.tabs.onUpdated.addListener(sendModifyResultPage);
					});

				} else { //tab is found, let's show it
					chrome.tabs.update(tabs[0].id, {
						active: true
					});
					chrome.tabs.sendMessage(tabs[0].id, request);
				}
			});
		}
	});

	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {

		var headers = details.requestHeaders;
		//modify Referer to make instagram happier
		for (var header in headers) {
			if (headers[header].name === "eferer") {
				headers[header].name = "Referer";
				break;
			}
		}
		return {
			requestHeaders: details.requestHeaders
		};

	}, {
		urls: ["https://www.instagram.com/query/"]
	},
		['blocking', "requestHeaders"]);
})();
