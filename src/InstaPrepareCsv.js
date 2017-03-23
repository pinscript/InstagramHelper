/* jshint esnext: true */

var InstaPrepareCsv = function () {
	"use strict";

	function arrayToCsv(arr, csvFields) {
		var rows = [];

		var columnNames = csvFields.split(",").map(elem => elem.trim());
		rows.push(columnNames.join(","));

		for (var i = 0; i < arr.length; i++) {
			var temp = [];
			var obj = arr[i];
			for (var j = 0; j < columnNames.length; j++) {
				var val = arr[i][columnNames[j]];
				if (val === null) {
					temp.push("");
				} else if (val === false) {
					temp.push("N");
				} else if (val === true) {
					temp.push("Y");
				} else if (typeof val === "number") { 
					temp.push(val);
				} else { //TODO: How do I can skip calling prepareValueForCsv even more, regexp?
					temp.push(prepareValueForCsv(val));
				}
			}
			rows.push(temp.join(","));
		}

		return rows.join('\n');

	}

	// This function allows us to have commas, line breaks, and double
	// quotes in our value without breaking CSV format.
	function prepareValueForCsv(val) {
		val = '' + val;
		// Escape quotes to avoid ending the value prematurely.
		val = val.replace(/\r/g, "").replace(/\n/g, "").replace(/"/g, '""');
		return '"' + val + '"';
	}

	return {
		arrayToCsv: arrayToCsv
	}
};
