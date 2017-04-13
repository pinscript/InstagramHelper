/* jshint esnext: true */
/* globals chrome */

$(function () {

	"use strict";

	var myData = [];

	var htmlElements = {
		statusDiv: document.getElementById('status'),
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
			
			var fetchSettings_1 = {
				id: 1,
				request: null,
				userName: request.userName_1,
				pageSize: request.pageSize,
				delay: request.delay,
				csrfToken: request.csrfToken,
				userId: request.userId_1,
				relType: "All" === request.relType ? request.follows_count > request.followed_by_count ? "follows" : "followed_by" : request.relType,
				callBoth: "All" === request.relType,
				checkDuplicates: false,
				follows_count: request.follows_1_count,
				followed_by_count: request.followed_by_1_count,
				follows_processed: 0,
				followed_by_processed: 0,
				startTime: startTime,
				timerInterval: timerInterval,
				myData: []
			};
			var fetchSettings_2 = {
				id: 2,
				request: null,
				userName: request.userName_2,
				pageSize: request.pageSize,
				delay: request.delay,
				csrfToken: request.csrfToken,
				userId: request.userId_2,
				relType: "All" === request.relType ? request.follows_count > request.followed_by_count ? "follows" : "followed_by" : request.relType,
				callBoth: "All" === request.relType,
				checkDuplicates: false,
				follows_count: request.follows_2_count,
				followed_by_count: request.followed_by_2_count,
				follows_processed: 0,
				followed_by_processed: 0,
				startTime: startTime,
				timerInterval: timerInterval,
				myData: []
			};

			prepareHtmlElements(request, fetchSettings_1, fetchSettings_2);

			var p1 = promiseFetchInstaUsers(fetchSettings_1);			
			var p2 = promiseFetchInstaUsers(fetchSettings_2);
			
			Promise.all([p1, p2]).then(values => {
				let[obj1, obj2] = values;
				let arr = intersectArrays(obj1.myData, obj2.myData); 
				prepareHtmlElementsForIntersection(arr);
				promiseGetFullInfo(arr).then(function(){
					generationCompleted(request);
				});
			});
		}
	});

	function promiseGetFullInfo(arr) {
	  return new Promise(function(resolve,reject){
		getFullInfo(arr, 0, resolve);
	  });				
	}

	function getFullInfo(arr, index, resolve) {
		userInfo.getUserProfile(arr[index].username).then(function(obj){
			obj.user_1_followed_by = arr[index].user_1_followed_by;
			obj.user_1_follows = arr[index].user_1_follows;
			obj.user_2_followed_by = arr[index].user_2_followed_by;
			obj.user_2_follows = arr[index].user_2_follows;
			
			myData.push(obj);
			if (index === arr.length - 1) {
				resolve();
			} else {
				htmlElements.intersection.asProgress("go", ++index);
				getFullInfo(arr, index, resolve);	//do I need delay requesting user info?
			}
		});
	}

	function promiseFetchInstaUsers(obj) {
	  return new Promise(function(resolve,reject){
		fetchInstaUsers(obj, resolve);
	  });		
	}
	
	function intersectArrays(a, b) {
		var startTime = new Date();
		const sortArray = (a,b) => +a.id - +b.id;
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
					id : arr1.id,
					username : arr1.username,
					user_1_followed_by : arr1.user_followed_by,
					user_1_follows : arr1.user_follows,
					user_2_followed_by : arr2.user_followed_by,
					user_2_follows : arr2.user_follows
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

	function updateStatusDiv(message) {
		htmlElements.statusDiv.textContent = message;
	}

	function showJQGrid(request) {
		$("#jqGrid").jqGrid({
			pager: "#jqGridPager",
			datatype: "local",
			data: myData,
			rowNum: 1000, //TODO: put it into options?
			autowidth: true,
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
					label: 'Follows<br/>you',
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
						return 'style="background-color: #fbf9ee;"  title="Follows you';
					},
					search: true
				}, {
					label: 'Followed<br>by you',
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
					label: `Follows<br/>${request.userName_1}`,
					name: 'user_1_followed_by', //relationship: followed_by - the list of the user's followers
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function() {
						return `title="Follows ${request.userName_1}"`;
					},
					search: true
				}, {
					label: `Followed<br/> by ${request.userName_1}`,
					name: 'user_1_follows', //relationship: follows - from the list of the followed person by user
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function() {
						return `title="Followed by ${request.userName_1}"`;
					},
					search: true
				}, {
					label: `Follows<br/>${request.userName_2}`,
					name: 'user_2_followed_by', //relationship: followed_by - the list of the user's followers
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function() {
						return `title="Follows ${request.userName_2}"`;
					},					
					search: true
				}, {
					label: `Followed<br/> by ${request.userName_2}`,
					name: 'user_2_follows', //relationship: follows - from the list of the followed person by user
					width: '80',
					formatter: 'checkbox',
					align: 'center',
					stype: 'select',
					searchoptions: {
						sopt: ["eq"],
						value: ":Any;true:Yes;false:No"
					},
					cellattr: function() {
						return `title="Followed by ${request.userName_2}"`;
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
					cellattr: function() {
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
					cellattr: function() {
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
					cellattr: function() {
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
					cellattr: function() {
						return 'title="Posts"';
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
			caption: `Common Users of ${request.userName_1} and ${request.userName_2}`, 
		}).jqGrid('filterToolbar', {
			searchOperators: true
		}).jqGrid('navGrid', "#jqGridPager", {
			search: true, // show search button on the toolbar
			add: false,
			edit: false,
			del: false,
			refresh: true
		}).jqGrid('setGridWidth', $('#jqGrid').width() - 20); //TODO: autowidth doesn't work
	}

	function prepareHtmlElements(obj, obj1, obj2) {

		document.getElementById("followed_by_1_title").textContent = `${obj.userName_1} is followed by ${obj.followed_by_1_count} users`;
		htmlElements.followed_by_1.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj.followed_by_1_count,
			goal: obj.followed_by_1_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Followed by:${obj1.followed_by_processed}/${obj.followed_by_1_count}/${percentage}%`;
			}
		});

		document.getElementById("follows_1_title").textContent = `${obj.userName_1} follows ${obj.follows_1_count} users`;
		htmlElements.follows_1.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj.follows_1_count,
			goal: obj.follows_1_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Follows:${obj1.follows_processed}/${obj.follows_1_count}/${percentage}%`;
			}
		});

		document.getElementById("followed_by_2_title").textContent = `${obj.userName_2} is followed by ${obj.followed_by_2_count} users`;
		htmlElements.followed_by_2.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj.followed_by_2_count,
			goal: obj.followed_by_2_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Followed by:${obj2.followed_by_processed}/${obj.followed_by_1_count}/${percentage}%`;
			}
		});

		document.getElementById("follows_2_title").textContent = `${obj.userName_2} follows ${obj.follows_2_count} users`;
		htmlElements.follows_2.asProgress({
			namespace: 'progress',
			min: 0,
			max: obj.follows_2_count,
			goal: obj.follows_2_count,
			labelCallback(n) {
				const percentage = this.getPercentage(n);
				return `Follows:${obj2.follows_processed}/${obj.follows_1_count}/${percentage}%`;
			}
		});

	}

	function prepareHtmlElementsForIntersection(arr) {

		updateStatusDiv(`Found common users ${arr.length}`);
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

	function generationCompleted(request) {
		clearInterval(request.timerInterval);
		var timer = document.querySelector('#timer');
		htmlElements.intersection.asProgress("finish").asProgress("stop");
		updateStatusDiv(`Completed, spent time - ${timer.textContent}, found common users - ${myData.length} 
			(${request.userName_1} follows - ${request.follows_1_count} and followed by - ${request.followed_by_1_count} &&
			${request.userName_2} follows - ${request.follows_2_count} and followed by - ${request.followed_by_2_count})`);
		setTimeout(function () {
			document.getElementById('tempUiElements').remove();
		}, 3000);
		showJQGrid(request);
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
					"X-Requested-With": XMLHttpRequest,
					"eferer": "https://www.instagram.com/" + obj.userName + "/"
				},
				method: 'POST',
				data: obj.request,
				success: function (data, textStatus, xhr) {
					if (429 == xhr.status) {
						setTimeout(function () {
							fetchInstaUsers(obj, resolve);
						}, 180000); //TODO: Test and make configurable
						alert("HTTP 429 status code is returned, request will be retried in 3 minutes");
						return;
					}
					updateStatusDiv("received users - " + data[obj.relType].nodes.length + " (" + obj.relType + ")");
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
						}, obj.delay);
					} else {
						stopProgressBar(obj);
						if (obj.callBoth) {
							obj.request = null;
							obj.relType = obj.relType === "follows" ? "followed_by" : "follows";
							obj.callBoth = false;
							obj.checkDuplicates = true;
							setTimeout(function () {
								fetchInstaUsers(obj, resolve);
							}, obj.delay);
						} else {
							resolve(obj);
						}
					}
				},
				error: function (jqXHR, exception) {
					console.log("error ajax");
					console.log(arguments);
					if (jqXHR.status === 0) {
						alert('Not connect.\n Verify Network. \n Request will be retried in 3 munutes');
						setTimeout(function () {
							fetchInstaUsers(obj, resolve);
						}, 180000); //TODO: Test and make configurable

					} else if (jqXHR.status == 404) {
						alert('Requested page not found. [404]');
					} else if (jqXHR.status == 500) {
						alert('Internal Server Error [500].');
					} else if (exception === 'parsererror') {
						alert('Requested JSON parse failed.');
					} else if (exception === 'timeout') {
						alert('Time out error.');
					} else if (exception === 'abort') {
						alert('Ajax request aborted.');
					} else {
						alert('Uncaught Error.\n' + jqXHR.responseText);
					}
				}
			});
	}

});

window.onload = function () {
	_gaq.push(['_trackPageview']);
};
