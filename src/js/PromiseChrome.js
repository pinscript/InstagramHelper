/* globals chrome, Promise */

/* exported PromiseChrome */
	
var PromiseChrome = function () {
	"use strict";

	function promiseQuery(options) {
		return new Promise(function (resolve) {
			chrome.tabs.query(options, resolve);
		});
	}

	function promiseCreateTab(options) {
		return new Promise(function (resolve) {
			chrome.tabs.create(options, resolve);
		});
	}

	function promiseGetStorage(options) {
		return new Promise(function (resolve) {
			chrome.storage.sync.get(options, resolve);
		});
	}

	function promiseCheckOpenTab(options) {
		return new Promise(function (resolve, reject) {
			chrome.tabs.query(options, function (tabs) {
				if (tabs.length > 0) { //result tab is found
					reject(tabs);
				} else {
					resolve(tabs);
				}
			});
		});
	}

	return {
		promiseQuery: promiseQuery,
		promiseCreateTab: promiseCreateTab,
		promiseGetStorage: promiseGetStorage,
		promiseCheckOpenTab: promiseCheckOpenTab
	};
};
