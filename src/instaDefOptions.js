var instaDefOptions = function() {
	return {
		you : "<<YOU>>",
		defDelay : 1000,
		defPageSize : 100,
		defCsvFields : "id, username, full_name, connected_fb_page, external_url, followed_by_count, follows_count, user_followed_by, user_follows, followed_by_viewer, follows_viewer, is_private, media_count",
		noDelayForInit : true,
		requestsToSkipDelay : 100, 
		retryInterval : 180000,
		regCheckBox : /^\s*<\s*input.+type\s*=\s*"checkbox".+value\s*=\s*(?:"|')\s*(true|false)/i,
		regProfile : /^\s*<\s*a\s.*href\s*=\s*(?:"|')([^"']+)/i,
		regTestInfo : /^\s*id:/,
		cleanInfo : /<\/?strong>/g
	}
}();