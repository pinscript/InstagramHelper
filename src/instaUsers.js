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
				searchoptions: { sopt: ["eq"], value: ":Any;true:Yes;false:No" },
				search: true				
			}, {
				label: 'Follows',
				name: 'follows_viewer',
				width: '80',
				formatter: 'checkbox',
				align: 'center',
				stype: 'select', 
				searchoptions: { sopt: ["eq"], value: ":Any;true:Yes;false:No" },
				search: true				
			}, {
				label: 'Private',
				name: 'is_private',
				width: '80',
				formatter: 'checkbox',
				align: 'center',
				stype: 'select', 
				searchoptions: { sopt: ["eq"], value: ":Any;true:Yes;false:No" },
				search: true
			}, {
				label: 'Followers',
				name: 'followers_count',
				width: '75',
				align: 'center',
				sorttype: 'number',
				search: true,
				searchoptions : { sopt: ["ge","le","eq"] }
			}, {
				label: 'Following',
				name: 'following_count',
				width: '75',
				align: 'center',
				sorttype: 'number',
				search: true,
				searchoptions : { sopt: ["ge","le","eq"] }
			}, {
				label: 'Posts',
				name: 'media_count',
				width: '75',
				align: 'center',
				sorttype: 'number',
				search: true,
				searchoptions : { sopt: ["ge","le","eq"] }
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

	$('#jqGrid').jqGrid('filterToolbar', {searchOperators: true});
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
		this.href = "data:application/csv;charset=UTF-16,"  + encodeURIComponent(csv);
	});

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.action == "modifyResultPage") {
			//fetch users
		}
	});
});


window.onload = function () {
	_gaq.push(['_trackPageview']);
}