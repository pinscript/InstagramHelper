/* jshint esnext: true */
/* globals chrome */

$(function () {

	"use strict";

	var myData = [];

	var htmlElements = {
		statusDiv: document.getElementById('status'),
		follows: $('#follows'),
		followed_by: $('#followed_by'),
		intersection: $("#intersection")
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
			receivedResponses: 0
		};
		prepareHtmlElements(fetchSettings);
		fetchInstaUsers(fetchSettings);
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

	function updateStatusDiv(message, color) {
		htmlElements.statusDiv.textContent = message;
		htmlElements.statusDiv.style.color = color || "black";
	}

	function showJQGrid(obj) {
		$("#jqGrid").jqGrid({
			pager: "#jqGridPager",
			datatype: "local",
			data: myData,
			rowNum: instaDefOptions.gridPageSize,
			autowidth: true,
			//shrinkToFit: true,
			height: "100%",
			rownumbers: true,
			colModel: [{
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
				//width: '200',
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
					//	return cellvalue ? `<p>${cellvalue}</p>` : "";
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
					return `title="Follows ${obj.userName}"`;
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
					return `title="Followed by ${obj.userName}"`;
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
			}
			],
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
			}, // pSearch (works with these options)
			{}).jqGrid('setGridWidth', $('#jqGrid').width() - 20); //TODO: find why autowidth doesn't work

	}

	function showExportDiv(obj) {

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
	}

	function prepareHtmlElements(obj) {

		//statusDiv = document.getElementById('status');

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

	function updateProgressBar(obj, count) {
		var newValue = 0 + obj[obj.relType + "_processed"] + count;
		htmlElements[obj.relType].asProgress("go", newValue);
		obj[obj.relType + "_processed"] = newValue;
	}

	function stopProgressBar(obj) {
		htmlElements[obj.relType].asProgress("finish").asProgress("stop");
	}

	function generationCompleted(obj) {
		clearInterval(obj.timerInterval);
		var timer = document.querySelector('#timer');
		htmlElements.intersection.asProgress("finish").asProgress("stop");

		var diffFollowed = "", diffFollows = "";
		if (obj.followed_by_count != obj.followed_by_processed) {
			diffFollowed = `(actually returned ${obj.followed_by_processed})`;
		}
		if (obj.follows_count != obj.follows_processed) {
			diffFollows = `(actually returned ${obj.follows_processed})`;
		}

		updateStatusDiv(`Completed, spent time - ${timer.textContent}, 
			created list length - ${myData.length} (follows - ${obj.follows_count}${diffFollows}, 
			followed by - ${obj.followed_by_count}${diffFollowed}),
			sent HTTP requests - ${obj.receivedResponses}`);
		showJQGrid(obj);
		showExportDiv(obj);

		setTimeout(function () {
			document.getElementById('tempUiElements').remove();
		}, 3000);
	}


	function fetchInstaUsers(obj) {
		var urlTemplate = `https://www.instagram.com/graphql/query/?query_id=${instaDefOptions.queryId[obj.relType]}&id=${obj.userId}&first=${obj.pageSize}`;
		obj.url = obj.url || urlTemplate;
		$.ajax({
			url: obj.url,
			method: 'GET',
			headers: {
				"X-CSRFToken": obj.csrfToken,
				"eferer": "https://www.instagram.com/" + obj.userName + "/"
			},
			success: function (res, textStatus, xhr) {
				obj.receivedResponses += 1;
				var data = res.data.user[Object.keys(res.data.user)[0]];
				updateStatusDiv(`received users - ${data.edges.length} (${obj.relType}/${obj.receivedResponses})`);
				for (let i = 0; i < data.edges.length; i++) {
					var found = false;
					if (obj.checkDuplicates) { //only when the second run happens (or we started with already opened result page)
						for (let j = 0; j < myData.length; j++) {
							if (data.edges[i].node.username === myData[j].username) {
								found = true;
								myData[j]["user_" + obj.relType] = true;
								break;
							}
						}
					}
					if (!(found)) {
						data.edges[i].node.user_follows = false; //explicitly set the value for correct search
						data.edges[i].node.user_followed_by = false; //explicitly set the value for correct search
						data.edges[i].node["user_" + obj.relType] = true;
						myData.push(data.edges[i].node);
					}
				}
				updateProgressBar(obj, data.edges.length);

				if (data.page_info.has_next_page) { //need to continue
					obj.url = `${urlTemplate}&after=${data.page_info.end_cursor}`;
					setTimeout(function () {
						fetchInstaUsers(obj);
					}, calculateTimeOut(obj));
				} else {
					stopProgressBar(obj);
					if (obj.callBoth) {
						obj.url = null;
						obj.relType = obj.relType === "follows" ? "followed_by" : "follows";
						obj.callBoth = false;
						obj.checkDuplicates = true;
						setTimeout(function () {
							fetchInstaUsers(obj);
						}, calculateTimeOut(obj));
					} else {
						//we are done
						prepareHtmlElementsForIntersection(obj, myData);
						promiseGetFullInfo(obj, myData).then(function () {
							generationCompleted(obj);
						});
					}
				}
			},
			error: function (jqXHR, exception) {
				console.log("error ajax");
				console.log(arguments);
				if (jqXHR.status === 0) {
					setTimeout(function () {
						fetchInstaUsers(obj);
					}, instaDefOptions.retryInterval); //TODO: Test and make configurable
					alert(messages.getMessage("NOTCONNECTED", +instaDefOptions.retryInterval / 60000));
				} else if (jqXHR.status === 429) {
					console.log("HTTP429 error.", new Date());
					retryError(jqXHR.status, obj);
				} else if (jqXHR.status == 404) {
					alert(messages.getMessage("HTTP404"));
				} else if (jqXHR.status == 500) {
					alert(messages.getMessage("HTTP500"));
				} else if (exception === 'parsererror') {
					alert(messages.getMessage("JSONPARSEERROR"));
				} else if (exception === 'timeout') {
					alert(messages.getMessage("TIMEOUT"));
				} else if (exception === 'abort') {
					alert(messages.getMessage("AJAXABORT"));
				} else {
					alert(messages.getMessage("UNCAUGHT", jqXHR.responseText));
				}
			}
		});
	}

	function retryError(code, obj) {
		console.log("HTTP error", new Date());
		updateStatusDiv(messages.getMessage("HTTP429", +instaDefOptions.retryInterval / 60000), "red");
		timeout.setTimeout(3000)
			.then(function () {
				return countdown.doCountdown("status", "", (new Date()).getTime() + +instaDefOptions.retryInterval)
			})
			.then(function () {
				console.log("Continue execution after HTTP error", new Date());
				fetchInstaUsers(obj);
			});

	}

	function promiseGetFullInfo(obj, arr) {
		return new Promise(function (resolve, reject) {
			obj.processedUsers = 0;
			getFullInfo(obj, arr, resolve);
		});
	}

	function prepareHtmlElementsForIntersection(obj, arr) {

		updateStatusDiv(`Found users ${arr.length}`);
		document.getElementById("intersection_title").textContent = "Getting the detailed info";
		htmlElements.intersection.asProgress({
			namespace: 'progress',
			min: 0,
			max: arr.length,
			goal: arr.length,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Users: ${obj.processedUsers}/${arr.length}/${percentage}%`;
			}
		});
	}


	function getFullInfo(obj, arr, resolve) {
		userInfo.getUserProfile(arr[obj.processedUsers].username).then(function (user) {
			myData[obj.processedUsers] = $.extend({}, myData[obj.processedUsers], user);;
			obj.receivedResponses++;
			htmlElements.intersection.asProgress("go", obj.processedUsers++);
			if (obj.processedUsers === arr.length) {
				resolve();
				return;
			}
			setTimeout(function () {
				getFullInfo(obj, arr, resolve);
			}, calculateTimeOut(obj));
		});
	}

	function calculateTimeOut(obj) {
		if (instaDefOptions.noDelayForInit && (obj.receivedResponses < instaDefOptions.requestsToSkipDelay)) {
			return 0;
		}
		return obj.delay;
	}

});

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
