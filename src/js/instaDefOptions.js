/* exported instaDefOptions */

var instaDefOptions = function() {
	return {
		you : "<<YOU>>",
		defDelay : 1000,
		defPageSize : 20,
		gridPageSize : 500,
		noDelayForInit : true,
		requestsToSkipDelay : 150, 
		retryInterval : 180000,
		regCheckBox : /^\s*<\s*input.+type\s*=\s*"checkbox".+value\s*=\s*(?:"|')\s*(true|false)/i,
		regProfile : /^\s*<\s*a\s.*href\s*=\s*(?:"|')([^"']+)/i,
		regTestInfo : /^\s*id:/,
		cleanInfo : /<\/?.[^>]*>/g,
		newLine : /<br\s*\/>(?=.)/gi, //should be followed by at least one symbol
		queryId : {
			followed_by : "17851374694183129",
			follows : "17874545323001329"
		}
	}
}();