/* globals chrome */

$(function () {
	console.log("document ready - " + Date())
	
    $('#instaUsers').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "get_insta_users" });
        });
    });
		
    //chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	//	chrome.tabs.sendMessage(tabs[0].id, { action: "get_followers_count" });
    //});
});

window.onload = function() {
  console.log("window onload - " + Date())
}