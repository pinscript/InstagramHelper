csvCreate = function(){
}

csvCreate.arrayToCSV = function(arr) {

	var columnNames = [];
	var rows = [];
	for (var i = 0, len = arr.length; i < len; i++) {
		// Each obj represents a row in the table
		var obj = arr[i];
		// row will collect data from obj
		var row = [];
		for (var key in obj) {
			// Don't iterate through prototype stuff
			if (!obj.hasOwnProperty(key))
				continue;
			if (("follows" === key) || ("followed_by" === key) || ("media" === key) || ("biography" === key)) //TODO: HAVE AN ARRAY FOR EXPORT
				continue;
			// Collect the column names only once
			if (i === 0)
				columnNames.push(prepareValueForCSV(key));
			// Collect the data
			row.push(prepareValueForCSV(obj[key]));
		}
		// Push each row to the main collection as csv string
		rows.push(row.join(','));
	}
	// Put the columnNames at the beginning of all the rows
	rows.unshift(columnNames.join(','));
	// Return the csv string
	return rows.join('\n');
}

// This function allows us to have commas, line breaks, and double
// quotes in our value without breaking CSV format.
function prepareValueForCSV(val) {
	val = '' + val;
	// Escape quotes to avoid ending the value prematurely.
	val = val.replace(/\r/g, "").replace(/\n/g, "").replace(/"/g, '""');
	return '"' + val + '"';
}
