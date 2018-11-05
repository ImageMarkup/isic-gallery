import constants from "../constants";
import authService from "../services/auth";

const FileSaver = require("../../node_modules/file-saver/FileSaver");

const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 123;

function openInNewTab(url) {
	const otherWindow = window.open();
	otherWindow.opener = null;
	otherWindow.location = url;
}

function downloadByLink(url, name) {
	let a = document.createElement("a");
	a.setAttribute("style", "display: none");
	document.body.appendChild(a);
	a.setAttribute("href", url);
	a.setAttribute("target", "_blank");
	a.download = name || "download";
	a.click();
	a.parentNode.removeChild(a);
}

function downloadBlob(blob, name) {
	FileSaver.saveAs(blob, name);
	/*if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, name);
	} else {
		let url = window.URL.createObjectURL(blob);
		downloadByLink(url, name);
		window.URL.revokeObjectURL(url);
	}*/
}

function exportCsv(sourceArray) {
	if (!sourceArray) {
		return;
	}
	let csvContent = "";
	sourceArray.forEach((rowArray) => {
		let row = rowArray.join(",");
		csvContent += row + "\r\n";
	});
	const csvData = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
	downloadBlob(csvData, "images.csv");
}

function isChrome() {
	return webix.env.isWebKit;
}

// from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
function deepCompare () {
	var i, l, leftChain, rightChain;

	function compare2Objects (x, y) {
		var p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
			return true;
		}

		// Compare primitives and functions.
		// Check if both arguments link to the same object.
		// Especially useful on the step where we compare prototypes
		if (x === y) {
			return true;
		}

		// Works in case when functions are created in constructor.
		// Comparing dates is a common scenario. Another built-ins?
		// We can even handle functions passed across iframes
		if ((typeof x === 'function' && typeof y === 'function') ||
			(x instanceof Date && y instanceof Date) ||
			(x instanceof RegExp && y instanceof RegExp) ||
			(x instanceof String && y instanceof String) ||
			(x instanceof Number && y instanceof Number)) {
			return x.toString() === y.toString();
		}

		// At last checking prototypes as good as we can
		if (!(x instanceof Object && y instanceof Object)) {
			return false;
		}

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
			return false;
		}

		if (x.constructor !== y.constructor) {
			return false;
		}

		if (x.prototype !== y.prototype) {
			return false;
		}

		// Check for infinitive linking loops
		if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
			return false;
		}

		// Quick checking of one object being a subset of another.
		// todo: cache the structure of arguments[0] for performance
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof (x[p])) {
				case 'object':
				case 'function':

					leftChain.push(x);
					rightChain.push(y);

					if (!compare2Objects (x[p], y[p])) {
						return false;
					}

					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (x[p] !== y[p]) {
						return false;
					}
					break;
			}
		}

		return true;
	}

	if (arguments.length < 1) {
		return true; //Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	}

	for (i = 1, l = arguments.length; i < l; i++) {

		leftChain = []; //Todo: this can be cached
		rightChain = [];

		if (!compare2Objects(arguments[0], arguments[i])) {
			return false;
		}
	}

	return true;
}

function getUserId() {
	const userInfo = authService.getUserInfo();
	return userInfo ? userInfo._id : "";
}

function setDataviewItemDimensions(imageWidth, imageHeight) {
	webix.storage.local.put(`dataviewItemWidth-${getUserId()}`, imageWidth);
	webix.storage.local.put(`dataviewItemHeight-${getUserId()}`, imageHeight);
}

function getDataviewItemWidth() {
	let localWidth = webix.storage.local.get(`dataviewItemWidth-${getUserId()}`);
	return localWidth ? localWidth : DEFAULT_WIDTH;
}

function getDataviewItemHeight() {
	let localHeight = webix.storage.local.get(`dataviewItemHeight-${getUserId()}`);
	return localHeight ? localHeight : DEFAULT_HEIGHT;
}

function setDataviewSelectionId(id) {
	webix.storage.local.put(`dataviewSelectionId-${getUserId()}`, id);
}

function getDataviewSelectionId() {
	return webix.storage.local.get(`dataviewSelectionId-${getUserId()}`);
}

function getTopStylePercentage() {
	let dataviewSelectionId = getDataviewSelectionId();
	if (!dataviewSelectionId || dataviewSelectionId === constants.DEFAULT_DATAVIEW_COLUMNS) {
		return 70;
	}
	switch (dataviewSelectionId) {
		case constants.TWO_DATAVIEW_COLUMNS: {
			return 90;
		}
		case constants.THREE_DATAVIEW_COLUMNS: {
			return 85;
		}
		case constants.FOUR_DATAVIEW_COLUMNS: {
			return 80;
		}
		case constants.FIVE_DATAVIEW_COLUMNS: {
			return 75;
		}
		case constants.SIX_DATAVIEW_COLUMNS: {
			return 75;
		}
	}
}

function setNewThumnailsNameFontSize(nameFontSize) {
	if (nameFontSize > 28) {
		nameFontSize = 28;
	}
	webix.storage.local.put(`thumbnailsNameFontSize-${getUserId()}`, nameFontSize);
}

function getNewThumnailsNameFontSize() {
	let fontSize = webix.storage.local.get(`thumbnailsNameFontSize-${getUserId()}`);
	return fontSize ? fontSize : 14;
}

function separateThousandsInNumber(number) {
	let regExp = new RegExp("^(\\d{" + (number.length%3?number.length%3:0) + "})(\\d{3})", "g");
	return number.replace(regExp, "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
}

function isObjectEmpty(obj) {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop))
			return false;
	}
	return true;
}

function angleIconChange(obj) {
	return obj.imageShown ? "fa-angle-down" : "fa-angle-right";
}

function findItemInList(id, list) {
	let returnParam;
	list.find((obj) => {
		if (obj._id === id) {
			returnParam = true;
		}
	});
	return returnParam;
}

export default {
	openInNewTab,
	downloadByLink,
	isChrome,
	exportCsv,
	downloadBlob,
	deepCompare,
	setDataviewItemDimensions,
	getDataviewItemWidth,
	getDataviewItemHeight,
	setDataviewSelectionId,
	getDataviewSelectionId,
	getTopStylePercentage,
	setNewThumnailsNameFontSize,
	getNewThumnailsNameFontSize,
	separateThousandsInNumber,
	isObjectEmpty,
	angleIconChange,
	findItemInList
};

