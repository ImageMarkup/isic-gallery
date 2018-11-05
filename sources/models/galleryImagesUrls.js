// for storing tempraraly blob urls for gallery images
const previewUrls = {};
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


export default {
	setPreviewImageUrl,
	getPreviewImageUrl,
	setNormalImageUrl,
	getNormalImageUrl
};
