/* jshint esnext: true */
/* globals chrome */

$(function () {

	"use strict";

	var myData = [];
	var userName = "";
	var cancelProcessing = false;

	var htmlElements = {
		statusDiv: document.getElementById('status'),
		follows: $('#follows'),
		followed_by: $('#followed_by'),
		detailedinfo: $("#detailedinfo")
	};

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.action == "get_insta_users") {

			var promise = instaDefOptions.you === request.userName ? userInfo.getUserProfile(request.viewerUserName) : request.userName;
			Promise.all([promise]).then(values => {
				if (typeof values[0] === "object") {
					request.userName = request.viewerUserName;
					request.user_is_private = values[0].is_private;
					request.follows_count = values[0].follows_count;
					request.followed_by_count = values[0].followed_by_count;
					request.userId = values[0].id;
					request.user_followed_by_viewer = false;
				}
				startFetching(request);
			});
		}
	});

	function startFetching(request) {

		var fetchSettings = {
			request: null,
			userName: request.userName,
			pageSize: request.pageSize,
			delay: request.delay,
			csrfToken: request.csrfToken,
			userId: request.userId,
			relType: "All" === request.relType ? request.follows_count > request.followed_by_count ? "follows" : "followed_by" : request.relType,
			callBoth: "All" === request.relType,
			checkDuplicates: myData.length > 0, //probably we are starting with already opened page , now it is obsolete, and actually should be False
			follows_count: request.follows_count,
			followed_by_count: request.followed_by_count,
			follows_processed: 0,
			followed_by_processed: 0,
			startTime: new Date(),
			timerInterval: startTimer(document.querySelector('#timer'), new Date()),
			receivedResponses: 0,	//received HTTP responses
			processedUsers: 0 	//processed users in get full info
		};
		prepareHtmlElements(fetchSettings);
		promiseFetchInstaUsers(fetchSettings).then(function (obj) {
			
			showJQGrid(obj, simpleColModel);
			showDetailsDiv(obj);		

			prepareHtmlElementsUserDetails(fetchSettings, myData);
			promiseGetFullInfo(fetchSettings, myData).then(function () {
				generationCompleted(fetchSettings, true);
			}).catch(function(){
				generationCompleted(fetchSettings, false);
			});
		});
	}

	function getFullInfo(obj, arr, resolve, reject) {
		userInfo.getUserProfile(arr[obj.processedUsers].username).then(function (user) {
			myData[obj.processedUsers] = $.extend({}, myData[obj.processedUsers], user);;
			obj.receivedResponses++;
			htmlElements.detailedinfo.asProgress("go", obj.processedUsers++);
			updateStatusDiv(`Getting detailed info for users: ${obj.processedUsers} of ${arr.length}`);
			if (obj.processedUsers === arr.length) {
				resolve();
				return;
			}
			if (cancelProcessing) {
				reject();
				return;
			}
			setTimeout(function () {
				getFullInfo(obj, arr, resolve, reject);
			}, 0);
		});
	}

	var updateStatusDiv = function (message, color) {
		htmlElements.statusDiv.textContent = message;
		htmlElements.statusDiv.style.color = color || "black";
	}

	function promiseFetchInstaUsers(obj) {
		return new Promise(function (resolve, reject) {


			var f = new FetchUsers(Object.assign({}, {
				obj, myData, htmlElements, updateStatusDiv, resolve
			}));

			f.fetchInstaUsers();
		});
	}

	function startTimer(timer, startTime) {

		return setInterval(function () {
			var ms = parseInt(new Date() - startTime);
			var x = ms / 1000;
			var seconds = parseInt(x % 60, 10);
			x /= 60;
			var minutes = parseInt(x % 60, 10);
			x /= 60;
			var hours = parseInt(x % 24, 10);
			timer.textContent = `${hours}h:${'00'.substring(0, 2 - ("" + minutes).length) + minutes}m:${'00'.substring(0, 2 - ("" + seconds).length) + seconds}s`;
		}, 1000);
	}

	function showDetailsDiv(obj) {

		$("#details").show();
		$("#exportDiv").show();
		
		$("#export_XLSX").on("click", function () {
			$("#jqGrid").jqGrid("exportToExcel", {
				includeLabels: true,
				includeGroupHeader: false,
				includeFooter: false,
				fileName: `user_${obj.userName}_${exportUtils.formatDate(new Date())}.xlsx`,
				replaceStr: exportUtils.replaceStr
			});
		});

		$("#cancelDetInfo").on("click", () => cancelProcessing = confirm("Do you want to cancel?")); 
	
	}

	function prepareHtmlElements(obj) {

		if (obj.callBoth || ("followed_by" === obj.relType)) {
			document.getElementById("followed_by_title").textContent = `${obj.userName} is followed by ${obj.followed_by_count} users`;
			document.getElementById("followed_by_title").style.display = "block";
			htmlElements.followed_by.show().asProgress({
				namespace: 'progress',
				min: 0,
				max: obj.followed_by_count,
				goal: obj.followed_by_count,
				labelCallback(n) {
					const percentage = this.getPercentage(n);
					return `Followed by:${obj.followed_by_processed}/${obj.followed_by_count}/${percentage}%`;
				}
			});
		}
		if (obj.callBoth || ("follows" === obj.relType)) {
			document.getElementById("follows_title").textContent = `${obj.userName} follows ${obj.follows_count} users`;
			document.getElementById("follows_title").style.display = "block";
			htmlElements.follows.show().asProgress({
				namespace: 'progress',
				min: 0,
				max: obj.follows_count,
				goal: obj.follows_count,
				labelCallback(n) {
					const percentage = this.getPercentage(n);
					return `Follows:${obj.follows_processed}/${obj.follows_count}/${percentage}%`;
				}
			});
		}
	}

	function generationCompleted(obj, resolved) {
		clearInterval(obj.timerInterval);
		var timer = document.querySelector('#timer');
		htmlElements.detailedinfo.asProgress("finish").asProgress("stop");

		var diffFollowed = "", diffFollows = "";
		if (obj.followed_by_count != obj.followed_by_processed) {
			diffFollowed = `(actually returned ${obj.followed_by_processed})`;
		}
		if (obj.follows_count != obj.follows_processed) {
			diffFollows = `(actually returned ${obj.follows_processed})`;
		}

		updateStatusDiv(`${resolved ? "Completed" : "Detailed info collection was cancelled"}, 
			spent time - ${timer.textContent}, 
			created list length - ${myData.length} (follows - ${obj.follows_count}${diffFollows}, 
			followed by - ${obj.followed_by_count}${diffFollowed}),
			sent HTTP requests - ${obj.receivedResponses}`);
		
		if (resolved) {
			$(".ui-jqgrid").replaceWith("<table id='jqGrid'></table>");
			showJQGrid(obj, fullColModel);
		}

		setTimeout(function () {
			document.getElementById('tempUiElements').remove();
			document.getElementById('details').remove();
		}, 3000);
	}

	function promiseGetFullInfo(obj, arr) {
		return new Promise(function (resolve, reject) {
			getFullInfo(obj, arr, resolve, reject);
		});
	}

	function prepareHtmlElementsUserDetails(obj, arr) {
		updateStatusDiv(`Found users ${arr.length}`);
		document.getElementById("detailedinfo_title").textContent = "Getting the detailed info";
		htmlElements.detailedinfo.asProgress({
			namespace: 'progress',
			min: 0,
			max: arr.length,
			goal: arr.length,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Users: ${obj.processedUsers}/${arr.length}/${percentage}%`;
			}
		});
		//assign on click event if confirm 
	}

	function showJQGrid(obj, colModel) {

		userName = obj.userName;

		$("#jqGrid").jqGrid({
			pager: "#jqGridPager",
			datatype: "local",
			data: myData,
			rowNum: instaDefOptions.gridPageSize,
			autowidth: true,
			height: "100%",
			rownumbers: true,
			colModel: colModel,
			viewrecords: true, // show the current page, data rang and total records on the toolbar
			loadonce: true,
			caption: "Users of " + obj.userName,
		}).jqGrid('filterToolbar', {
			searchOperators: true
		}).jqGrid('navGrid', "#jqGridPager", {
			search: true,
			add: false,
			edit: false,
			del: false,
			refresh: true
		}, {}, {}, {}, {
				multipleSearch: true,
				closeAfterSearch: true,
				closeOnEscape: true,
				searchOnEnter: true,
				showQuery: true
			},
			{}).jqGrid('setGridWidth', $('#jqGrid').width() - 20); //TODO: why autowidth doesn't work? what is taken into account

	}

	var fullColModel = [{
		label: 'User',
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
			return cellvalue ? cellvalue : "";
		},
		cellattr: function (rowId, tv, rawObject, cm, rdata) {
			return 'style="white-space: normal;"';
		},
		search: false
	}, {
		label: 'Follows <br/>you',
		name: 'follows_viewer',
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function (rowId, tv, rawObject, cm, rdata) {
			return 'style="background-color: #fbf9ee;" title="Follows you"';
		},
		search: true
	}, {
		label: 'Followed <br>by you',
		name: 'followed_by_viewer',
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function (rowId, tv, rawObject, cm, rdata) {
			return 'style="background-color: #fbf9ee;" title="Followed by you"';
		},
		search: true
	}, {
		label: 'Follows <br/>user',
		name: 'user_followed_by', //relationship: followed_by - the list of the user's followers
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function () {
			return `title="Follows ${userName}"`;
		},
		search: true
	}, {
		label: 'Followed <br/>by user',
		name: 'user_follows', //relationship: follows - from the list of the followed person by user
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function () {
			return `title="Followed by ${userName}"`;
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
		cellattr: function () {
			return 'title="Is private"';
		},
		search: true
	}, {
		label: 'Followers',
		name: 'followed_by_count',
		width: '70',
		align: 'center',
		sorttype: 'number',
		search: true,
		searchoptions: {
			sopt: ["ge", "le", "eq"]
		},
		cellattr: function () {
			return 'title="Followers"';
		}
	}, {
		label: 'Following',
		name: 'follows_count',
		width: '70',
		align: 'center',
		sorttype: 'number',
		search: true,
		searchoptions: {
			sopt: ["ge", "le", "eq"]
		},
		cellattr: function () {
			return 'title="Following"';
		}
	}, {
		label: 'Posts',
		name: 'media_count',
		width: '70',
		align: 'center',
		sorttype: 'number',
		search: true,
		searchoptions: {
			sopt: ["ge", "le", "eq"]
		},
		cellattr: function () {
			return 'title="Posts"';
		}
	}];


	var simpleColModel = [{
		label: 'User',
		name: 'profile_pic_url',
		//width: '320',
		align: 'center',
		sortable: false,
		formatter: function (cellvalue, model, row) {
			return `<a href='https://www.instagram.com/${row.username}' target='_blank'><img src='${cellvalue}' alt='' /></a>`;
		},
		search: false
	}, {
		label: 'Info',
		name: 'id',
		sortable: false,
		formatter: function (cellvalue, model, row) {
			var ret = `id:${row.id}<br/>username:<strong>${row.username}</strong><br/>`;
			ret += row.full_name ? `full name:<strong>${row.full_name}</strong><br/>` : "";
			return ret;
		},
		cellattr: function (rowId, tv, rawObject, cm, rdata) {
			return 'style="white-space: normal;"';
		},
		search: false
	}, {
		label: 'Followed <br>by you',
		name: 'followed_by_viewer',
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function (rowId, tv, rawObject, cm, rdata) {
			return 'style="background-color: #fbf9ee;" title="Followed by you"';
		},
		search: true
	}, {
		label: 'Follows <br/>user',
		name: 'user_followed_by', //relationship: followed_by - the list of the user's followers
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function () {
			return `title="Follows ${userName}"`;
		},
		search: true
	}, {
		label: 'Followed <br/>by user',
		name: 'user_follows', //relationship: follows - from the list of the followed person by user
		width: '80',
		formatter: 'checkbox',
		align: 'center',
		stype: 'select',
		searchoptions: {
			sopt: ["eq"],
			value: ":Any;true:Yes;false:No"
		},
		cellattr: function () {
			return `title="Followed by ${userName}"`;
		},
		search: true
	}];


});

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
