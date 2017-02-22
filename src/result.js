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
				formatter: function (cellvalue, model, row) {
					return `<a href='https://www.instagram.com/${row.username}' target='_blank'><img src='${cellvalue}' alt='' /></a>`;
				}
			}, {
				label: 'Info',
				width: '300',
				formatter: function (cellvalue, model, row) {
					console.log(arguments);
					var ret = `id:${row.id}<br/>username:<strong>${row.username}</strong><br/>`;
					ret += row.full_name ? `full name:<strong>${row.full_name}</strong><br/>` : "";
					ret += row.connected_fb_page ? `FB:<a href='${row.connected_fb_page}' target='_blank'>${row.connected_fb_page}</a><br/>` : "";
					ret += row.external_url ? `url:<a href='${row.external_url}' target='_blank'>${row.external_url}</a>` : "";
					return ret;
				},
				cellattr: function (rowId, tv, rawObject, cm, rdata) {
					return 'style="white-space: normal;"';
				}
			}, {
				label: 'Bio',
				name: 'biography',
				formatter: function (cellvalue, model, row) {
					return cellvalue ? `<p>${cellvalue}</p>` : "";
				},
				cellattr: function (rowId, tv, rawObject, cm, rdata) {
					return 'style="white-space: normal;"';
				}
			}, {
				label: 'Followed',
				name: 'followed_by_viewer',
				width: '50',
				formatter: 'checkbox',
				align: 'center'
			}, {
				label: 'Follows',
				name: 'follows_viewer',
				width: '50',
				formatter: 'checkbox',
				align: 'center'
			}, {
				label: 'Private',
				name: 'is_private',
				width: '50',
				formatter: 'checkbox',
				align: 'center'
			}, {
				label: 'Followers',
				name: 'followers_count',
				width: '60',
				align: 'center',
				sorttype: 'number'
			}, {
				label: 'Following',
				name: 'following_count',
				width: '60',
				align: 'center',
				sorttype: 'number'
			}, {
				label: 'Posts',
				name: 'media_count',
				width: '40',
				align: 'center',
				sorttype: 'number'
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
		caption: "Instagram followers",
	});

	$("#export").on("click", function () {
		$("#jqGrid").jqGrid("exportToCsv", {
			separator: ",",
			separatorReplace: "", // in order to interpret numbers
			quote: '"',
			escquote: '"',
			newLine: "\r\n", // navigator.userAgent.match(/Windows/) ?	'\r\n' : '\n';
			replaceNewLine: " ",
			includeCaption: true,
			includeLabels: true,
			includeGroupHeader: true,
			includeFooter: true,
			fileName: "jqGridExport.csv",
			returnAsString: false
		});
	});

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

		if (request.action == "modifyResultPage") {
			$("<ul>" + request.text + "</ul>").find("li").each(function () {

				var href = $(this).find("a").attr("href");
				var user = href.replace(/\//g, "");

				//check if user is already in array
				for (let i = 0; i < myData.length; i++) {
					if (user === myData[i].username) {
						console.log(`username ${user} is found at ${i}`);
						return;
					}
				}
				
				getUserProfile(user, function(obj) {
					$('#jqGrid').jqGrid('addRowData', obj.id, obj);					
				});
			
			});
		}
	});
});
