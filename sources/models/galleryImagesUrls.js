// for storing tempraraly blob urls for gallery images
let previewUrls = {};
const normalUrls = {};

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
	setPreviewImageUrl,
	getPreviewImageUrl,
	setNormalImageUrl,
	getNormalImageUrl,
	clearPreviewUrls
};
