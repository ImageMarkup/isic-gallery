import constants from "../constants";
import state from "../models/state";

const FileSaver = require("../../node_modules/file-saver/FileSaver");

let hiddenGalleryCartList = false;
let hiddenGalleryLeftPanel = false;
const DEFAULT_WIDTH = constants.DEFAULT_GALLERY_IMAGE_WIDTH;
const DEFAULT_HEIGHT = constants.DEFAULT_GALLERY_IMAGE_HEIGHT;

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
		let row = rowArray.join();
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
	const userInfo = state.auth.getUserInfo();
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

function getImageIconDimensions() {
	const initialIconWidth = constants.DEFAULT_GALLERY_IMAGE_ICON_WIDTH;
	const initialIconHeight = constants.DEFAULT_GALLERY_IMAGE_ICON_HEIGHT;
	const initialIconContainerWidth = constants.DEFAULT_GALLERY_IMAGE_ICON_CONTAINER_WIDTH;
	const initialIconContainerHeight = constants.DEFAULT_GALLERY_IMAGE_ICON_CONTAINER_HEIGHT;
	const defaultIconWidthDifference = initialIconContainerWidth - initialIconWidth;
	const deafultIconHeightDifference = initialIconContainerHeight - initialIconHeight;

	let bottomOffsetPercentage;
	let newIconWidth;
	let newIconHeight;
	let newIconContainerWidth;
	let newIconContainerHeight;
	let iconContainerDimensions;
	let iconDimensions;
	let dataviewItemWidth = getDataviewItemWidth();

	if (dataviewItemWidth <= 110) {
		if (dataviewItemWidth > 100) {
			newIconContainerWidth = initialIconWidth - 1;
			newIconContainerHeight = initialIconHeight - 1;
			newIconWidth = newIconContainerWidth - defaultIconWidthDifference;
			newIconHeight = newIconContainerHeight - deafultIconHeightDifference;
			bottomOffsetPercentage = -8;
		} else if (dataviewItemWidth <= 100 && dataviewItemWidth > 95) {
			newIconContainerWidth = initialIconWidth - 2;
			newIconContainerHeight = initialIconHeight - 2;
			newIconWidth = newIconContainerWidth - defaultIconWidthDifference;
			newIconHeight = newIconContainerHeight - deafultIconHeightDifference;
			bottomOffsetPercentage = -10;
		} else if (dataviewItemWidth <= 95) {
			newIconContainerWidth = initialIconWidth - 3;
			newIconContainerHeight = initialIconHeight - 3;
			newIconWidth = newIconContainerWidth - defaultIconWidthDifference;
			newIconHeight = newIconContainerHeight - deafultIconHeightDifference;
			bottomOffsetPercentage = -12;
		}
		iconContainerDimensions = {
			width: newIconContainerWidth,
			height: newIconContainerHeight
		};

		iconDimensions = {
			width: newIconWidth,
			height: newIconHeight
		};
	} else {
		iconContainerDimensions = {
			width: initialIconContainerWidth,
			height: initialIconContainerHeight
		};

		iconDimensions = {
			width: initialIconWidth,
			height: initialIconHeight
		};
		bottomOffsetPercentage = 0;
	}
	return [iconContainerDimensions, iconDimensions, bottomOffsetPercentage];
}

function setNewThumnailsNameFontSize(nameFontSize) {
	if (nameFontSize > 28) {
		nameFontSize = 28;
	} else if (nameFontSize < 7.5) {
		nameFontSize = 7.5;
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
		if (obj.isic_id === id) {
			returnParam = true;
		}
	});
	return returnParam;
}

function isOverflown(element) {
	return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function getSelectedDataviewImages(studyFlag, createStudyDataview, selectedImages) {
	let selectedDataviewImages;
	let selectedImagesLength;
	if (studyFlag && createStudyDataview) {
		selectedDataviewImages = selectedImages.getSelectedInAddNewImagePopup();
		selectedImagesLength = selectedImages.countSelectedInAddNewImagePopup();
	} else if (studyFlag) {
		selectedDataviewImages = selectedImages.getStudyImagesId();
		selectedImagesLength = selectedImages.countForStudies();
	} else {
		selectedDataviewImages = selectedImages.getSelectedImagesForDownload();
		selectedImagesLength = selectedImages.count();
	}
	return [selectedDataviewImages, selectedImagesLength];
}

function getImagesToSelectByShift(item, studyFlag, selectedImages, dataview, value, createStudyDataview) {
	let isNeedShowAlert = true;
	const selectedImagesInfoArray = getSelectedDataviewImages(studyFlag, createStudyDataview, selectedImages);
	let imagesArrayToReturn = [];
	const selectedDataviewImages = selectedImagesInfoArray[0];
	const selectedImagesLength = selectedImagesInfoArray[1];
	const deletedItemsDataCollection = selectedImages.getDeletedItemsDataCollection();

	if (selectedImagesLength > 0) {
		let indexOfLastActionItem;
		let lastActionItem;
		let indexOfLastItemToAction;
		if (deletedItemsDataCollection.count() > 0 && !value) {
			const lastItemId = deletedItemsDataCollection.getLastId();
			lastActionItem = deletedItemsDataCollection.getItem(lastItemId);
			indexOfLastItemToAction = dataview.getIndexById(item.id);
		} else {
			lastActionItem = selectedDataviewImages[selectedImagesLength - 1];
			indexOfLastItemToAction = dataview.getIndexById(item.id);
		}
		dataview.data.each((image, index) => {
			if (image.isic_id === lastActionItem.isic_id) {
				indexOfLastActionItem = index;
				return true;
			}
		}, true);

		let startIndex;
		let finishIndex;
		if (indexOfLastActionItem > indexOfLastItemToAction) {
			startIndex = indexOfLastItemToAction;
			finishIndex = indexOfLastActionItem;
		} else {
			startIndex = indexOfLastActionItem;
			finishIndex = indexOfLastItemToAction;
		}
		for (;startIndex <= finishIndex; startIndex++) {
			const imagesArrayToReturnLength = imagesArrayToReturn.length;
			if ((value && imagesArrayToReturnLength + selectedImagesLength <= constants.MAX_COUNT_IMAGES_SELECTION - 2) || !value) {
				let dataviewItemId = dataview.getIdByIndex(startIndex);
				let dataviewItem = dataview.getItem(dataviewItemId);
				if (dataviewItem && dataviewItem.markCheckbox !== value) {
					dataviewItem.markCheckbox = value;
					imagesArrayToReturn.push(dataviewItem);
				}
			} else if (isNeedShowAlert) {
				isNeedShowAlert = false;
				webix.alert({
					text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
				});
			}
		}
		imagesArrayToReturn.push(item);
		deletedItemsDataCollection.clearAll();
		return imagesArrayToReturn;
	} else {
		return [item];
	}
}

function changeInputNodeColor(textView) {
	let inputNode = textView.getInputNode();
	textView.attachEvent("onChange", () => {
		returnColorForTextView(inputNode);
	});
	textView.attachEvent("onKeyPress", () => {
		returnColorForTextView(inputNode);
	});
	inputNode.style.backgroundColor = "#fff6f6";
	inputNode.style.borderColor = "#fea5a8";
}

function returnColorForTextView(inputNode) {
	inputNode.style.backgroundColor = "#FFFFFF";
	inputNode.style.borderColor = "#BDC4D4";
}

function scrollToLast(view) {
	const offsetTop = view.$view.offsetTop;
	view.scrollTo(0, offsetTop);
}

function getHiddenGalleryCartList() {
	return hiddenGalleryCartList;
}

function setHiddenGalleryCartList(value) {
	hiddenGalleryCartList = value;
}

function getHiddenGalleryLeftPanel() {
	return hiddenGalleryLeftPanel;
}

function setHiddenGalleryLeftPanel(value) {
	hiddenGalleryLeftPanel = value;
}

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { func.apply(this, args); }, timeout);
	};
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
	getImageIconDimensions,
	setNewThumnailsNameFontSize,
	getNewThumnailsNameFontSize,
	separateThousandsInNumber,
	isObjectEmpty,
	angleIconChange,
	findItemInList,
	isOverflown,
	getImagesToSelectByShift,
	changeInputNodeColor,
	scrollToLast,
	getHiddenGalleryCartList,
	setHiddenGalleryCartList,
	getHiddenGalleryLeftPanel,
	setHiddenGalleryLeftPanel,
	debounce
};

