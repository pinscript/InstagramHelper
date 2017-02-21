/* jshint esnext: true */

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
					var ret = `id:${row.id}<br/>username:<strong>${row.username}</strong><br/>full name:<strong>${row.full_name}</strong><br/>`;
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
				width: '35',
				formatter: 'checkbox',
				align: 'center'
			}, {
				label: 'Follows',
				name: 'follows_viewer',
				width: '35',
				formatter: 'checkbox',
				align: 'center'
			}, {
				label: 'Private',
				name: 'is_private',
				width: '30',
				formatter: 'checkbox',
				align: 'center'
			}, {
				label: 'Followers',
				name: 'followers_count',
				width: '38',
				align: 'center',
				sorttype: 'number'
			}, {
				label: 'Following',
				name: 'following_count',
				width: '38',
				align: 'center',
				sorttype: 'number'
			}, {
				label: 'Posts',
				name: 'media_count',
				width: '38',
				align: 'center',
				sorttype: 'number'
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
		})
	});

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

		console.log("request inside result.js - " + request.action);
		if (request.action == "modifyResultPage") {

			$("<ul>" + request.text + "</ul>").find("li").each(function () {
				var link = "https://www.instagram.com" + $(this).find("a").attr("href") + "?__a=1";
				$.ajax({
					url: link,
					success: function (result) {
						console.log(result);
						var {
							id,
							username,
							full_name,
							profile_pic_url_hd,
							biography,
							connected_fb_page,
							external_url,
							followed_by_viewer,
							follows_viewer,
							is_private
						} = result.user;
						var following_count = result.user.follows.count;
						var followers_count = result.user.followed_by.count;
						var media_count = result.user.media.count;
						var obj = {};
						Object.assign(obj, {
							id,
							username,
							full_name,
							profile_pic_url_hd,
							biography,
							connected_fb_page,
							external_url,
							followed_by_viewer,
							follows_viewer,
							is_private,
							following_count,
							followers_count,
							media_count
						});
						myData.push(obj);
						//$('#jqGrid').trigger('reloadGrid'); //temp solution
						$('#jqGrid').jqGrid('addRowData', 0, obj);
					},
					async: true
				});
			});
		}
	});
});
