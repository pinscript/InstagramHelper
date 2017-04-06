/* globals chrome */

var PromiseChrome = function () {
	"use strict";

	function promiseQuery(options){
	  return new Promise(function(resolve,reject){
		chrome.tabs.query(options, resolve);
	  });
	}	

	function promiseGetStorage(options){
	  return new Promise(function(resolve,reject){
		chrome.storage.sync.get(options, resolve);
	  });		
	}
	
	function promiseCheckOpenTab(options){
	  return new Promise(function(resolve,reject){
		chrome.tabs.query(options, function(tabs){
			if (tabs.length > 0) { //result tab is found
				reject();
			} else {
				resolve(tabs);
			}
		});
	  });
	}		
	
	return {
		promiseQuery: promiseQuery,
		promiseGetStorage: promiseGetStorage,
		promiseCheckOpenTab: promiseCheckOpenTab
	};
};
