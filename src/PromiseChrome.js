var PromiseChrome = function () {
	"use strict";

	function promiseQuery(options){
	  return new Promise(function(resolve,reject){
		chrome.tabs.query(options, resolve);
	  });
	}	

	return {
		promiseQuery: promiseQuery
	};
};
