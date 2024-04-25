let prevImagesUrl = "";
let nextImagesUrl = "";
let currImagesUrl = "";
let offset = 0;

function setCurrImagesUrl(url) {
	currImagesUrl = url;
}

function getCurrImagesUrl() {
	return currImagesUrl;
}

function setNextImagesUrl(url) {
	nextImagesUrl = url;
}

function getNextImagesUrl() {
	return nextImagesUrl;
}

function setPrevImagesUrl(url) {
	prevImagesUrl = url;
}

function getPrevImagesUrl() {
	return prevImagesUrl;
}

function getOffset() {
	return offset;
}

function setOffset(newOffset) {
	offset = newOffset;
}

export default {
	getCurrImagesUrl,
	setCurrImagesUrl,
	getNextImagesUrl,
	setNextImagesUrl,
	getPrevImagesUrl,
	setPrevImagesUrl,
	getOffset,
	setOffset,
};
