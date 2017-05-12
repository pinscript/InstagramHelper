/* jshint esnext: true */
/* globals chrome */

$(function () {

	"use strict";

	var myData = [];
	var running = 0;

	var htmlElements = {
		statusDiv: document.getElementById('status'),
		status_1: document.getElementById('status_1'),
		status_2: document.getElementById('status_2'),
		follows_1: $('#follows_1'),
		followed_by_1: $('#followed_by_1'),
		follows_2: $('#follows_2'),
		followed_by_2: $('#followed_by_2'),
		intersection: $("#intersection")
	};

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.action == "get_common_users") {

			var startTime = new Date();
			var timerInterval = startTimer(document.querySelector('#timer'), new Date());
			request.timerInterval = timerInterval;
			var promise1 = instaDefOptions.you === request.user_1.userName ? userInfo.getUserProfile(request.viewerUserName) : request.user_1.userName;
			var promise2 = instaDefOptions.you === request.user_2.userName ? userInfo.getUserProfile(request.viewerUserName) : request.user_2.userName;
			Promise.all([promise1, promise2]).then(values => {
				if (typeof values[0] === "object") {
					request.user_1.userName = request.viewerUserName;
					request.user_1.user_is_private = values[0].is_private;
					request.user_1.follows_count = values[0].follows_count;
					request.user_1.followed_by_count = values[0].followed_by_count;
					request.user_1.userId = values[0].id;
					request.user_1.user_followed_by_viewer = false;
				}
				if (typeof values[1] === "object") {
					request.user_2.userName = request.viewerUserName;
					request.user_2.user_is_private = values[1].is_private;
					request.user_2.follows_count = values[1].follows_count;
					request.user_2.followed_by_count = values[1].followed_by_count;
					request.user_2.userId = values[1].id;
					request.user_2.user_followed_by_viewer = false;
				}
				startFetching(request, startTime, timerInterval);
			});
		}
	});

	function startFetching(request, startTime, timerInterval) {
		var fetchSettings_1 = {
			id: 1,
			request: null,
			userName: request.user_1.userName,
			pageSize: request.pageSize,
			delay: request.delay,
			csrfToken: request.csrfToken,
			userId: request.user_1.userId,
			relType: "All" === request.relType ? request.user_1.follows_count > request.user_1.followed_by_count ? "follows" : "followed_by" : request.relType,
			callBoth: "All" === request.relType,
			checkDuplicates: false,
			follows_count: request.user_1.follows_count,
			followed_by_count: request.user_1.followed_by_count,
			follows_processed: 0,
			followed_by_processed: 0,
			startTime: startTime,
			timerInterval: timerInterval,
			myData: [],
			receivedResponses: 0
		};

		var fetchSettings_2 = {
			id: 2,
			request: null,
			userName: request.user_2.userName,
			pageSize: request.pageSize,
			delay: request.delay,
			csrfToken: request.csrfToken,
			userId: request.user_2.userId,
			relType: "All" === request.relType ? request.user_2.follows_count > request.user_2.followed_by_count ? "follows" : "followed_by" : request.relType,
			callBoth: "All" === request.relType,
			checkDuplicates: false,
			follows_count: request.user_2.follows_count,
			followed_by_count: request.user_2.followed_by_count,
			follows_processed: 0,
			followed_by_processed: 0,
			startTime: startTime,
			timerInterval: timerInterval,
			myData: [],
			receivedResponses: 0
		};

		prepareHtmlElements(fetchSettings_1, fetchSettings_2);

		running = 2;
		var p1 = promiseFetchInstaUsers(fetchSettings_1);
		var p2 = promiseFetchInstaUsers(fetchSettings_2);

		Promise.all([p1, p2]).then(values => {
			let[obj1, obj2] = values;
			let arr = intersectArrays(obj1.myData, obj2.myData);
			if (arr.length > 0) { //if common users are found
				prepareHtmlElementsForIntersection(arr);
				promiseGetFullInfo(arr).then(function () {
					generationCompleted(request, obj1, obj2);
				});
			} else {
				generationCompleted(request, obj1, obj2);
			}
		});
	}

	function promiseGetFullInfo(arr) {
		return new Promise(function (resolve, reject) {
			getFullInfo(arr, 0, resolve);
		});
	}

	function getFullInfo(arr, index, resolve) {
		userInfo.getUserProfile(arr[index].username).then(function (obj) {
			obj.user_1_followed_by = arr[index].user_1_followed_by;
			obj.user_1_follows = arr[index].user_1_follows;
			obj.user_2_followed_by = arr[index].user_2_followed_by;
			obj.user_2_follows = arr[index].user_2_follows;

			myData.push(obj);
			if (index === arr.length - 1) {
				resolve();
			} else {
				htmlElements.intersection.asProgress("go", ++index);
				setTimeout(function () {
					getFullInfo(arr, index, resolve);
				}, 200); //IS IT NEEDED?
			}
		});
	}

	function promiseFetchInstaUsers(obj) {
		return new Promise(function (resolve, reject) {
			fetchInstaUsers(obj, resolve);
		});
	}

	function intersectArrays(a, b) {
		var startTime = new Date();
		const sortArray = (a, b) => +a.id - +b.id;
		a.sort(sortArray);
		b.sort(sortArray);
		var result = [];
		while (a.length > 0 && b.length > 0) {
			if (+a[0].id < +b[0].id) {
				a.shift();
			} else if (+a[0].id > +b[0].id) {
				b.shift();
			} else {
				var arr1 = a.shift();
				var arr2 = b.shift();
				result.push({
					id: arr1.id,
					username: arr1.username,
					user_1_followed_by: arr1.user_followed_by,
					user_1_follows: arr1.user_follows,
					user_2_followed_by: arr2.user_followed_by,
					user_2_follows: arr2.user_follows
				});
			}
		}
		console.log(`intersect arrays took ${new Date() - startTime}ms`);
		return result;
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
			timer.textContent = `${hours}h:${'00'.substring(0, 2 - ("" + minutes).length)  + minutes}m:${'00'.substring(0, 2 - ("" + seconds).length) + seconds}s`;
		}, 1000);
	}

	function updateStatusDiv(div, message, color) {
		htmlElements[div].textContent = message;
		htmlElements[div].style.color = color || "black";
		
	}

	function showJQGrid(request) {
		$("#jqGrid").jqGrid({
			pager: "#jqGridPager",
			datatype: "local",
			data: myData,
			rowNum: instaDefOptions.gridPageSize,
			autowidth: true,
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
						//return cellvalue ? `<p>${cellvalue}</p>` : "";
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
						return 'style="background-color: #fbf9ee;"  title="Follows you"';
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
					label: `Follows <br/>${request.user_1.userName}`,
					name: 'user_1_followed_by', //relationship: followed_by - the list of the user's followers
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function () {
						return `title="Follows ${request.user_1.userName}"`;
					},
					search: true
				}, {
					label: `Followed <br/> by ${request.user_1.userName}`,
					name: 'user_1_follows', //relationship: follows - from the list of the followed person by user
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function () {
						return `title="Followed by ${request.user_1.userName}"`;
					},
					search: true
				}, {
					label: `Follows <br/>${request.user_2.userName}`,
					name: 'user_2_followed_by', //relationship: followed_by - the list of the user's followers
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function () {
						return `title="Follows ${request.user_2.userName}"`;
					},
					search: true
				}, {
					label: `Followed <br/> by ${request.user_2.userName}`,
					name: 'user_2_follows', //relationship: follows - from the list of the followed person by user
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function () {
						return `title="Followed by ${request.user_2.userName}"`;
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
			caption: `Common Users of ${request.user_1.userName} and ${request.user_2.userName}`,
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
		{}).jqGrid('setGridWidth', $('#jqGrid').width() - 20); //TODO: autowidth doesn't work
	}

	function showExportDiv(obj) {

		$("#exportDiv").show();

		$("#export_XLSX").on("click", function () {
			$("#jqGrid").jqGrid("exportToExcel", {
				includeLabels: true,
				includeGroupHeader: false,
				includeFooter: false,
				fileName: `commonusers_${obj.user_1.userName}_and_${obj.user_2.userName}_${exportUtils.formatDate(new Date())}.xlsx`,
				replaceStr: exportUtils.replaceStr
			});
		});

	}

	function prepareHtmlElements(obj1, obj2) {

		document.getElementById("followed_by_1_title").textContent = `${obj1.userName} is followed by ${obj1.followed_by_count} users`;
		htmlElements.followed_by_1.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj1.followed_by_count,
			goal: obj1.followed_by_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Followed by:${obj1.followed_by_processed}/${obj1.followed_by_count}/${percentage}%`;
			}
		});

		document.getElementById("follows_1_title").textContent = `${obj1.userName} follows ${obj1.follows_count} users`;
		htmlElements.follows_1.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj1.follows_count,
			goal: obj1.follows_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Follows:${obj1.follows_processed}/${obj1.follows_count}/${percentage}%`;
			}
		});

		document.getElementById("followed_by_2_title").textContent = `${obj2.userName} is followed by ${obj2.followed_by_count} users`;
		htmlElements.followed_by_2.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj2.followed_by_count,
			goal: obj2.followed_by_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Followed by:${obj2.followed_by_processed}/${obj2.followed_by_count}/${percentage}%`;
			}
		});

		document.getElementById("follows_2_title").textContent = `${obj2.userName} follows ${obj2.follows_count} users`;
		htmlElements.follows_2.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj2.follows_count,
			goal: obj2.follows_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Follows:${obj2.follows_processed}/${obj2.follows_count}/${percentage}%`;
			}
		});

	}

	function prepareHtmlElementsForIntersection(arr) {

		updateStatusDiv("statusDiv", `Found common users ${arr.length}`);
		document.getElementById("intersection_title").textContent = "Getting the detailed info";
		htmlElements.intersection.asProgress({
			namespace: 'progress',
			min: 0,
			max: arr.length,
			goal: arr.length,
			labelCallback(n) {
				return this.getPercentage(n) + "%";
			}
		});
	}

	function updateProgressBar(obj, count) {
		var newValue = 0 + obj[obj.relType + "_processed"] + count;
		htmlElements[obj.relType + "_" + obj.id].asProgress("go", newValue);
		obj[obj.relType + "_processed"] = newValue;
	}

	function stopProgressBar(obj) {
		htmlElements[obj.relType + "_" + obj.id].asProgress("finish").asProgress("stop");
	}

	function generationCompleted(request, obj1, obj2) {
		clearInterval(request.timerInterval);
		var timer = document.querySelector('#timer');
		htmlElements.intersection.asProgress("finish").asProgress("stop");

		var diffFollowed_1 = "", diffFollows_1 = "", diffFollowed_2 = "", diffFollows_2 = "";
		if (obj1.followed_by_count != obj1.followed_by_processed) {
			diffFollowed_1 = `(actually returned ${obj1.followed_by_processed})`;
		}
		if (obj1.follows_count != obj1.follows_processed) {
			diffFollows_1 = `(actually returned ${obj1.follows_processed})`;
		}
		if (obj2.followed_by_count != obj2.followed_by_processed) {
			diffFollowed_2 = `(actually returned ${obj2.followed_by_processed})`;
		}
		if (obj2.follows_count != obj2.follows_processed) {
			diffFollows_2 = `(actually returned ${obj2.follows_processed})`;
		}

		updateStatusDiv("statusDiv", `Completed, spent time - ${timer.textContent}, common users - ${myData.length}
			(${request.user_1.userName} follows - ${request.user_1.follows_count}${diffFollows_1} and followed by - ${request.user_1.followed_by_count}${diffFollowed_1} && 
			${request.user_2.userName} follows - ${request.user_2.follows_count}${diffFollows_2} and followed by - ${request.user_2.followed_by_count}${diffFollowed_2}),
			sent HTTP requests - ${~~obj1.receivedResponses + ~~obj2.receivedResponses}`);
		setTimeout(function () {
			document.getElementById('tempUiElements').remove();
			htmlElements.status_1.remove();
			htmlElements.status_2.remove();
		}, 3000);
		showJQGrid(request);
		showExportDiv(request);		
	}

	function fetchInstaUsers(obj, resolve) {

		if (!obj.request) {
			obj.request = $.param({
					q: `ig_user(${obj.userId}) {${obj.relType}.first(${obj.pageSize}) {count, page_info {end_cursor, has_next_page}, nodes {id, username}}}`,
					ref: "relationships::follow_list"
				});
		}

		$.ajax({
			url: "https://www.instagram.com/query/",
			crossDomain: true,
			headers: {
				"X-Instagram-AJAX": '1',
				"X-CSRFToken": obj.csrfToken,
				//"X-Requested-With": XMLHttpRequest,
				"eferer": "https://www.instagram.com/" + obj.userName + "/"
			},
			method: 'POST',
			data: obj.request,
			success: function (data, textStatus, xhr) {
				obj.receivedResponses += 1;
				if (429 == xhr.status) { //sometime 429 was identified as success, todo 
					console.log("HTTP429 error.", new Date());
					updateStatusDiv(`status_${obj.id}`, obj.userName + ":" + messages.getMessage("HTTP429", +instaDefOptions.retryInterval / 60000), "red");					
					timeout.setTimeout(3000)
						.then(function(){
							return countdown.doCountdown(`status_${obj.id}`, obj.userName + ": ",(new Date()).getTime() + +instaDefOptions.retryInterval)
						})
						.then(function(){
							console.log("Continue execution after HTTP429 error.", new Date());
							fetchInstaUsers(obj);
						});					
					return;
				}
				updateStatusDiv(`status_${obj.id}`, `${obj.userName}: received users - ${data[obj.relType].nodes.length} (${obj.relType}/${obj.receivedResponses})`);
				//otherwise assume return code is 200?
				for (let i = 0; i < data[obj.relType].nodes.length; i++) {
					var found = false;
					if (obj.checkDuplicates) { //only when the second run happens (or we started with already opened result page)
						for (let j = 0; j < obj.myData.length; j++) {
							if (data[obj.relType].nodes[i].username === obj.myData[j].username) {
								found = true;
								//console.log(`username ${myData[j].username} is found at ${i}`);
								obj.myData[j]["user_" + obj.relType] = true;
								break;
							}
						}
					}
					if (!(found)) {
						data[obj.relType].nodes[i].user_follows = false; //explicitly set the value for correct search
						data[obj.relType].nodes[i].user_followed_by = false; //explicitly set the value for correct search
						data[obj.relType].nodes[i]["user_" + obj.relType] = true;
						obj.myData.push(data[obj.relType].nodes[i]);
					}
				}
				updateProgressBar(obj, data[obj.relType].nodes.length);

				if (data[obj.relType].page_info.has_next_page) {
					obj.request = $.param({
							q: `ig_user(${obj.userId}) {${obj.relType}.after(${data[obj.relType].page_info.end_cursor}, ${obj.pageSize}) {count, page_info {end_cursor, has_next_page}, nodes {id, username}}}`,
							ref: "relationships::follow_list"
						});
					setTimeout(function () {
						fetchInstaUsers(obj, resolve);
					}, calculateTimeOut(obj));
				} else {
					stopProgressBar(obj);
					if (obj.callBoth) {
						obj.request = null;
						obj.relType = obj.relType === "follows" ? "followed_by" : "follows";
						obj.callBoth = false;
						obj.checkDuplicates = true;
						setTimeout(function () {
							fetchInstaUsers(obj, resolve);
						}, calculateTimeOut(obj));
					} else {
						running--;
						updateStatusDiv(`status_${obj.id}`, `${obj.userName}: generation completed - ${obj.myData.length} users`)
						resolve(obj);
					}
				}
			},
			error: function (jqXHR, exception) {
				console.log("error ajax");
				console.log(arguments);
				if (jqXHR.status === 0) {
					setTimeout(function () {
						fetchInstaUsers(obj, resolve);
					}, instaDefOptions.retryInterval);
					alert(messages.getMessage("NOTCONNECTED", +instaDefOptions.retryInterval / 60000));
				} else if (jqXHR.status === 429) {
					console.log("HTTP429 error.", new Date());
					updateStatusDiv(`status_${obj.id}`, obj.userName + ":" + messages.getMessage("HTTP429", +instaDefOptions.retryInterval / 60000), "red");					
					timeout.setTimeout(3000)
						.then(function(){
							return countdown.doCountdown(`status_${obj.id}`, obj.userName + ": ", (new Date()).getTime() + +instaDefOptions.retryInterval)
						})
						.then(function(){
							console.log("Continue execution after HTTP429 error.", new Date());
							fetchInstaUsers(obj);
						});
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

	function calculateTimeOut(obj) {
		if (instaDefOptions.noDelayForInit && (obj.receivedResponses < (instaDefOptions.requestsToSkipDelay / 2))) {
			return 0;
		}
		return running * +obj.delay;
	}

});

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
