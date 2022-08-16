// for storing tempraraly blob urls for gallery images
let previewUrls = {};
const normalUrls = {};
let nextImagesUrl = "";
let prevImagesUrl = "";

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

function setPreviewImageUrl(imageId, url) {
	previewUrls[imageId] = url;
}

function getPreviewImageUrl(imageId) {
	return previewUrls[imageId];
}

function setNormalImageUrl(imageId, url) {
	normalUrls[imageId] = url;
}

function getNormalImageUrl(imageId) {
	return normalUrls[imageId];
}

function clearPreviewUrls() {
	previewUrls = {};
}

export default {
	setNextImagesUrl,
	getNextImagesUrl,
	setPrevImagesUrl,
	getPrevImagesUrl,
	setPreviewImageUrl,
	getPreviewImageUrl,
	setNormalImageUrl,
	getNormalImageUrl,
	clearPreviewUrls
};
