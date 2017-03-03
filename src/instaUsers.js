/* jshint esnext: true */
/* globals chrome */

$(function () {

	var myData = [];

	//build grid
	$("#jqGrid").jqGrid({
		pager: "#jqGridPager",
		datatype: "local",
		data: myData,
		//autowidth: false,
		width: "98%",
		shrinkToFit: true,
		height: "100%",
		rownumbers: true,
		colModel: [{
				label: 'Picture',
				name: 'profile_pic_url_hd',
				width: '320',
				align: 'center',
				sortable: false,
				formatter: function (cellvalue, model, row) {
					return `<a href='https://www.instagram.com/${row.username}' target='_blank'><img src='${cellvalue}' alt='' /></a>`;
				},
				search: false
			}, {
				label: 'Info',
				name: 'id',
				width: '250',
				sortable: false,
				formatter: function (cellvalue, model, row) {
					var ret = `id:${row.id}<br/>username:<strong>${row.username}</strong><br/>`;
					ret += row.full_name ? `full name:<strong>${row.full_name}</strong><br/>` : "";
					ret += row.connected_fb_page ? `FB:<a href='${row.connected_fb_page}' target='_blank'>${row.connected_fb_page}</a><br/>` : "";
					ret += row.external_url ? `url:<a href='${row.external_url}' target='_blank'>${row.external_url}</a>` : "";
					return ret;
				},
				cellattr: function (rowId, tv, rawObject, cm, rdata) {
					return 'style="white-space: normal;"';
				},
				search: false
			}, {
				label: 'Bio',
				name: 'biography',
				sortable: false,
				formatter: function (cellvalue, model, row) {
					return cellvalue ? `<p>${cellvalue}</p>` : "";
				},
				cellattr: function (rowId, tv, rawObject, cm, rdata) {
					return 'style="white-space: normal;"';
				},
				search: false
			}, {
				label: 'Followed',
				name: 'followed_by_viewer',
				width: '80',
				formatter: 'checkbox',
				align: 'center',
				stype: 'select',
				searchoptions: {
					sopt: ["eq"],
					value: ":Any;true:Yes;false:No"
				},
				search: true
			}, {
				label: 'Follows',
				name: 'follows_viewer',
				width: '80',
				formatter: 'checkbox',
				align: 'center',
				stype: 'select',
				searchoptions: {
					sopt: ["eq"],
					value: ":Any;true:Yes;false:No"
				},
				search: true
			}, {
				label: 'Private',
				name: 'is_private',
				width: '80',
				formatter: 'checkbox',
				align: 'center',
				stype: 'select',
				searchoptions: {
					sopt: ["eq"],
					value: ":Any;true:Yes;false:No"
				},
				search: true
			}, {
				label: 'Followers',
				name: 'followers_count',
				width: '75',
				align: 'center',
				sorttype: 'number',
				search: true,
				searchoptions: {
					sopt: ["ge", "le", "eq"]
				}
			}, {
				label: 'Following',
				name: 'following_count',
				width: '75',
				align: 'center',
				sorttype: 'number',
				search: true,
				searchoptions: {
					sopt: ["ge", "le", "eq"]
				}
			}, {
				label: 'Posts',
				name: 'media_count',
				width: '75',
				align: 'center',
				sorttype: 'number',
				search: true,
				searchoptions: {
					sopt: ["ge", "le", "eq"]
				}
			}, {
				name: 'username',
				hidden: true
			}, {
				name: 'id',
				hidden: true
			}, {
				name: 'full_name',
				hidden: true
			}, {
				name: 'connected_fb_page',
				hidden: true
			}, {
				name: 'external_url',
				hidden: true
			}

		],
		viewrecords: true, // show the current page, data rang and total records on the toolbar
		loadonce: true,
		caption: "Instagram Users",
	});

	$('#jqGrid').jqGrid('filterToolbar', {
		searchOperators: true
	});
	$('#jqGrid').jqGrid('navGrid', "#jqGridPager", {
		search: true, // show search button on the toolbar
		add: false,
		edit: false,
		del: false,
		refresh: true
	});

	$("#exportCSV").click(function () {
		var csv = arrayToCSV(myData);
		this.download = "export.csv";
		this.href = "data:application/csv;charset=UTF-16," + encodeURIComponent(csv);
	});

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.action == "modifyResultPage") {

			getUserProfile(request.userName, function (obj) {
				fetchInstaUsers(null, request.userName, request.pageSize, request.csrfToken, obj.id, "followed_by");
				//todo: add one more fetchInstaUsers
			});
		}
	});
});

function fetchInstaUsers(request, userName, pageSize, csrfToken, userId, type) {
//type could be followed by or follows
//	type = "followed_by"

	console.log("fectch insta users");
	console.log(arguments);

	if (!request) {
		request = "q=ig_user(" + userId + ")+%7B%0A++" + type + ".first(20)+%7B%0A++++count%2C%0A++++page_info+%7B%0A++++++end_cursor%2C%0A++++++has_next_page%0A++++%7D%2C%0A++++nodes+%7B%0A++++++id%2C%0A++++++is_verified%2C%0A++++++followed_by_viewer%2C%0A++++++requested_by_viewer%2C%0A++++++full_name%2C%0A++++++profile_pic_url%2C%0A++++++username%2C%0Afollows_viewer%2Cis_private%2Cfollows%7Bcount%7D%2Cfollowed_by%7Bcount%7D++++%7D%0A++%7D%0A%7D%0A&amp;ref=relationships%3A%3Afollow_list";
	}

	$.ajax({
		url: "https://www.instagram.com/query/",
		crossDomain: true,
		headers: {
			"X-Instagram-AJAX": '1',
			"X-CSRFToken": csrfToken,
			"X-Requested-With": XMLHttpRequest,
			"eferer": "https://www.instagram.com/" + userName + "/"
		},
		method: 'POST',
		data: request,
		success: function (data) {
			console.log(data[type].nodes);
			
/*
				//check if user is already in array
				for (let i = 0; i < myData.length; i++) {
					if (user === myData[i].username) {
						console.log(`username ${user} is found at ${i}`);
						return;
					}
				}

				getUserProfile(user, function (obj) {
					$('#jqGrid').jqGrid('addRowData', obj.id, obj);
				});

*/			
			
			if (data.followed_by.page_info.has_next_page) {
				var next_req = "q=ig_user(" + userId + ")+%7B%0A++" + type + ".after(" + data.followed_by.page_info.end_cursor + "%2C+20)+%7B%0A++++count%2C%0A++++page_info+%7B%0A++++++end_cursor%2C%0A++++++has_next_page%0A++++%7D%2C%0A++++nodes+%7B%0A++++++id%2C%0A++++++is_verified%2C%0A++++++followed_by_viewer%2C%0A++++++requested_by_viewer%2C%0A++++++full_name%2C%0A++++++profile_pic_url%2C%0A++++++username%2C%0Afollows_viewer%2C1is_private%2Cfollows%7Bcount%7D%2Cfollowed_by%7Bcount%7D++++%7D%0A++%7D%0A%7D%0A&amp;ref=relationships%3A%3Afollow_list";
				fetchInstaUsers(next_req, userName, pageSize, csrfToken, userId, type);
			}
		}
	});

}

window.onload = function () {
	_gaq.push(['_trackPageview']);
}
