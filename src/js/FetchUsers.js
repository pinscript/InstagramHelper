var FetchUsers = function (obj, myData, htmlElements, updateStatusDiv, resolve) {

    "use strict";

    var urlTemplate;

    var fetchInstaUsers = function () { //do I need obj?
        console.log("fetchInstaUsers", this);
        urlTemplate = `https://www.instagram.com/graphql/query/?query_id=${instaDefOptions.queryId[obj.relType]}&id=${obj.userId}&first=${obj.pageSize}`;
        obj.url = obj.url || urlTemplate;
        $.ajax({
            url: obj.url,
            context: this,
            method: 'GET',
            headers: {
                "X-CSRFToken": obj.csrfToken,
                "eferer": "https://www.instagram.com/" + obj.userName + "/"
            },
            success: successFetch,
            error: errorFetch
        });
    }

    var successFetch = function (res, textStatus, xhr) {
        console.log("successFetch", this);
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
            setTimeout( () => fetchInstaUsers(), calculateTimeOut(obj));
            return;
        }
        htmlElements[obj.relType].asProgress("finish").asProgress("stop"); //stopProgressBar(obj);
        if (obj.callBoth) {
            obj.url = null;
            obj.relType = obj.relType === "follows" ? "followed_by" : "follows";
            obj.callBoth = false;
            obj.checkDuplicates = true;
            setTimeout( () => fetchInstaUsers(), calculateTimeOut(obj));
            return;
        }
        resolve();
    }

    var errorFetch = function (jqXHR, exception) {
        console.log("error ajax");
        console.log(arguments);
        if (jqXHR.status === 0) {
            setTimeout( () => fetchInstaUsers(), instaDefOptions.retryInterval);
            alert(messages.getMessage("NOTCONNECTED", +instaDefOptions.retryInterval / 60000));
        } else if (jqXHR.status === 429) {
            console.log("HTTP429 error.", new Date());
            retryError(jqXHR.status);
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

    function retryError(code) {
        console.log("HTTP error", new Date());
        updateStatusDiv(messages.getMessage("HTTP429", +instaDefOptions.retryInterval / 60000), "red");
        timeout.setTimeout(3000)
            .then(function () {
                return countdown.doCountdown("status", "", (new Date()).getTime() + +instaDefOptions.retryInterval)
            })
            .then(function () {
                console.log("Continue execution after HTTP error", new Date());
                fetchInstaUsers();
            });
    }

    function calculateTimeOut(obj) {
        if (instaDefOptions.noDelayForInit && (obj.receivedResponses < instaDefOptions.requestsToSkipDelay)) {
            return 0;
        }
        return obj.delay;
    }

    function updateProgressBar(obj, count) {
        var newValue = 0 + obj[obj.relType + "_processed"] + count;
        htmlElements[obj.relType].asProgress("go", newValue);
        obj[obj.relType + "_processed"] = newValue;
    }

    return {
        fetchInstaUsers: fetchInstaUsers
    }
};