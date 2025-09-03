import constants from "../constants";
import state from "../models/state";
import logger from "./logger";

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

function openImageInNewTab(url, name) {
	const image_window = window.open("", "_blank")
	image_window.document.write(`
	<html>
		<head>
		</head>
		<body>
			<img src="${url}" alt="${name}" style="
				display: block;
				max-width: 100%;
				max-height: 100%;
				margin-left:  auto;
				margin-right: auto;
			">
		</body>
	</html>
	`);
}

function downloadByLink(url, name) {
	let a = document.createElement("a");
	a.setAttribute("style", "display: none");
	document.body.appendChild(a);
	a.setAttribute("href", url);
	a.setAttribute("target", "_blank");
	a.setAttribute("rel", "noopener noreferrer")
	a.click();
	a.parentNode.removeChild(a);
}

function downloadBlob(blob, name) {
	FileSaver.saveAs(blob, name);
	/* if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, name);
	} else {
		let url = window.URL.createObjectURL(blob);
		downloadByLink(url, name);
		window.URL.revokeObjectURL(url);
	} */
}

function exportCsv(sourceArray) {
	if (!sourceArray) {
		return;
	}
	let csvContent = "";
	sourceArray.forEach((rowArray) => {
		let row = rowArray.join();
		csvContent += `${row}\r\n`;
	});
	const csvData = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
	downloadBlob(csvData, "images.csv");
}

function isChrome() {
	return webix.env.isWebKit;
}

// from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
function deepCompare(...args) {
	let i;
	let l;
	let leftChain;
	let rightChain;

	function compare2Objects(x, y) {
		let p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (Number.isNaN(x) && Number.isNaN(y) && typeof x === "number" && typeof y === "number") {
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
		if ((typeof x === "function" && typeof y === "function") ||
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
		// eslint-disable-next-line no-restricted-syntax
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		// eslint-disable-next-line
		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
			switch (typeof x[p]) {
				case "object":
				case "function":
					leftChain.push(x);
					rightChain.push(y);
					if (!compare2Objects(x[p], y[p])) {
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

	if (args.length < 1) {
		return true; // Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	}

	for (i = 1, l = args.length; i < l; i++) {
		leftChain = []; // Todo: this can be cached
		rightChain = [];

		if (!compare2Objects(args[0], args[i])) {
			return false;
		}
	}

	return true;
}

function getUserId() {
	const userInfo = state.auth.getUserInfo();
	return userInfo ? userInfo._id : "";
}

function setDataviewItemDimensions(width, height) {
	webix.storage.local.put(`dataviewItemWidth-${getUserId()}`, width);
	webix.storage.local.put(`dataviewItemHeight-${getUserId()}`, height);
}

function setImageDimensions(imageWidth, imageHeight){
	webix.storage.local.put(`dataviewImageWidth-${getUserId()}`, imageWidth);
	webix.storage.local.put(`dataviewImageHeight-${getUserId()}`, imageHeight);
}

function setDataviewHeight(height) {
	webix.storage.local.put(`dataviewHeight-${getUserId()}`, height);
}

function getDataviewHeight() {
	const localDataviewHeight = webix.storage.local.get(`dataviewHeight-${getUserId()}`);
	return localDataviewHeight;
}

function getImageWidth() {
	const localImageWidth = webix.storage.local.get(`dataviewImageWidth-${getUserId()}`);
	return localImageWidth || DEFAULT_WIDTH;
}

function getImageHeight() {
	const localImageHeight = webix.storage.local.get(`dataviewImageHeight-${getUserId()}`);
	return localImageHeight || DEFAULT_HEIGHT;
}

function getDataviewItemWidth() {
	let localWidth = webix.storage.local.get(`dataviewItemWidth-${getUserId()}`);
	return localWidth || DEFAULT_WIDTH;
}

function getDataviewItemHeight() {
	let localHeight = webix.storage.local.get(`dataviewItemHeight-${getUserId()}`);
	return localHeight || DEFAULT_HEIGHT;
}

function setDataviewSelectionId(id) {
	webix.storage.local.put(`dataviewSelectionId-${getUserId()}`, id);
}

function getDataviewSelectionId() {
	return webix.storage.local.get(`dataviewSelectionId-${getUserId()}`);
}

function getOptionId(filterId, optionValue) {
	return `${filterId || ""}|${optionValue || ""}`;
}

function getFilterLabelId(filterId) {
	return `filter-label-${filterId || ""}`
}

/**
 * @param {string} iconId
 * @param {boolean} isIconEnabled
 * @param {string} tooltipText
 * @param {string} gtmClass
 * @param {string} iconBadges
 * @returns {string}
 */
function getIconButton(iconId, isIconEnabled, tooltipText, gtmClass, iconBadges) {
	const buttonClass = `gallery-images-button-elem ${isIconEnabled ? '' : 'disabled'} tooltip-container tooltip-gallery-images`;
	return `
	<div class="${buttonClass}">
		<span class="${gtmClass} ${iconId} gallery-images-button tooltip-title">
			<svg viewBox="0 0 26 26" class="gallery-icon-svg">
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${iconId}" class="gallery-icon-use"></use>
			</svg>
		</span>
		<span class="tooltip-block tooltip-block-top">${tooltipText}</span>
		${iconBadges}
	</div>
	`;
};

/**
 * @param {string} badgeText
 * @param {string} tooltipText
 * @param {boolean} isEnabledBadge
 * @param {boolean} isLeftBadge
 * @returns {string}
 */
function getIconBadge(badgeText, tooltipText, isEnabledBadge, isLeftBadge) {
	const badgeAbilityClass = isEnabledBadge ? "" : "disabled-badge";

	const iconBadgeStyle = `
		${isLeftBadge ? `transform: translateX(-50%); left: 0;` : `transform: translateX(50%); right: 0;`}
	`;

	return `
		<span class="gallery-images-badge ${badgeAbilityClass} tooltip-title" style="${iconBadgeStyle}">
			${badgeText}
		</span>
		<span class="tooltip-block tooltip-block-top">${tooltipText}</span>
	`;
}

function separateThousandsInNumber(number) {
	let regExp = new RegExp(`^(\\d{${number.length % 3 ? number.length % 3 : 0}})(\\d{3})`, "g");
	return number.replace(regExp, "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
}

function isObjectEmpty(obj) {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) { return false; }
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
		return false;
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
	}
	else if (studyFlag) {
		selectedDataviewImages = selectedImages.getStudyImagesId();
		selectedImagesLength = selectedImages.countForStudies();
	}
	else {
		selectedDataviewImages = selectedImages.getSelectedImagesForDownload();
		selectedImagesLength = selectedImages.count();
	}
	return [selectedDataviewImages, selectedImagesLength];
}

function getImagesToSelectByShift(
	item,
	studyFlag,
	selectedImages,
	dataview,
	value,
	createStudyDataview
) {
	let isNeedShowAlert = true;
	const selectedImagesInfoArray = getSelectedDataviewImages(
		studyFlag,
		createStudyDataview,
		selectedImages
	);
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
		}
		else {
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
		}
		else {
			startIndex = indexOfLastActionItem;
			finishIndex = indexOfLastItemToAction;
		}
		for (;startIndex <= finishIndex; startIndex++) {
			const imagesArrayToReturnLength = imagesArrayToReturn.length;
			if (
				value
				&& imagesArrayToReturnLength + selectedImagesLength <= constants.MAX_COUNT_IMAGES_SELECTION - 2
				|| !value
			) {
				let dataviewItemId = dataview.getIdByIndex(startIndex);
				let dataviewItem = dataview.getItem(dataviewItemId);
				if (dataviewItem && dataviewItem.markCheckbox !== value) {
					dataviewItem.markCheckbox = value;
					imagesArrayToReturn.push(dataviewItem);
				}
			}
			else if (isNeedShowAlert) {
				isNeedShowAlert = false;
				webix.alert({
					text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
				});
			}
		}
		imagesArrayToReturn.push(item);
		deletedItemsDataCollection.clearAll();
		return imagesArrayToReturn;
	}
	return [item];
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

function isIOS() {
	return /iPad|iPhone|iPod/i.test(navigator.userAgent)
}

function isMobilePhone() {
	return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 *
 * @param title - A string representing a title to be shared.
 * @param url - A string representing a URL to be shared.
 */
function shareUrl(title, url) {
	if (navigator.share) {
		navigator.share({
			title,
			url
		}).then(() => {
			logger.info("Successful share");
		}).catch((error) => {
			logger.error(`${error}`);
		})
	}
	else {
		// Fallback
		webix.message("Share is not supported")
	}
}

function shareFile(title, data, fileName) {
	const file = new File([data], `${fileName}.jpeg`, {type: data.type});
	navigator.share({
		title: title,
		files: [file]
	}).then(() => {
		logger.info("Successful download");
	}).catch ((err) => {
		console.error("Download failed:", err.message);
	});
}

function isPortrait() {
	return window.matchMedia("(orientation: portrait)").matches;
}

function isSafari() {
	return navigator.userAgent.indexOf("Safari") > -1;
}

function isMacintosh() {
	return webix.env.isMac;
}

export default {
	openInNewTab,
	openImageInNewTab,
	downloadByLink,
	isChrome,
	exportCsv,
	downloadBlob,
	deepCompare,
	setDataviewItemDimensions,
	setDataviewHeight,
	getDataviewHeight,
	getDataviewItemWidth,
	getDataviewItemHeight,
	setDataviewSelectionId,
	getDataviewSelectionId,
	getIconButton,
	getIconBadge,
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
	debounce,
	getImageWidth,
	getImageHeight,
	setImageDimensions,
	getOptionId,
	isIOS,
	isMobilePhone,
	shareUrl,
	shareFile,
	isPortrait,
	getFilterLabelId,
	isSafari,
	isMacintosh,
};

