let selectedImages = [];
let studySelectedImages = [];
let studyFlag;
let selectedInAddNewImagePopup = [];

const deletedItemsCollection = new webix.DataCollection();

function add(elements) {
	if (!Array.isArray(elements)) {
		elements = [elements];
	}
	selectedImages = selectedImages.concat(elements);
}

function remove(element) {
	const index = selectedImages.findIndex((item) => item._id === element);
	if (index > -1) {
		selectedImages.splice(index, 1);
	}
}

function isSelected(element) {
	const index = selectedImages.findIndex((item) => item._id === element);
	return index > -1 ? true : false;
}

function clearImagesForDownload() {
	selectedImages = [];
}

function clearImagesForStudies() {
	studySelectedImages = [];
}

function count() {
	return selectedImages.length;
}

function getSelectedImagesForDownload() {
	return selectedImages;
}

function countForStudies() {
	return studySelectedImages.length;
}

function getURIEncoded() {
	const selectedImagesIds = Array.from(selectedImages, selectedImage => selectedImage._id);
	return encodeURI(JSON.stringify(selectedImagesIds));
}

function addForStudy(elements) {
	if (!Array.isArray(elements)) {
		elements = [elements];
	}
	studySelectedImages = studySelectedImages.concat(elements)
}

function isSelectedInStudies(element) {
	const index = studySelectedImages.findIndex((item) => item._id === element);
	return index > -1 ? true : false;
}

function removeImageFromStudies(element) {
	const index = studySelectedImages.findIndex((item) => item._id === element);
	if (index > -1) {
		studySelectedImages.splice(index, 1);
	}
}

function setStudyFlag(value) {
	studyFlag = value;
}

function getStudyFlag() {
	return studyFlag;
}

function getStudyImagesId() {
	return studySelectedImages;
}

function setImageObjectsToLocalStorage(imageObjects) {
	webix.storage.local.put("studyImageObjects", imageObjects);
}

function getImageObjectsFromLocalStorage() {
	return webix.storage.local.get("studyImageObjects");
}

function addToSelectedInAddNewImagePopup(elements) {
	if (!Array.isArray(elements)) {
		elements = [elements];
	}
	selectedInAddNewImagePopup = selectedInAddNewImagePopup.concat(elements);
}

function removeFromSelectedInAddNewImagePopup(element) {
	const index = selectedInAddNewImagePopup.findIndex((item) => item._id === element);
	if (index > -1) {
		selectedInAddNewImagePopup.splice(index, 1);
	}
}

function clearSelectedInAddNewImagePopup() {
	selectedInAddNewImagePopup = [];
}

function countSelectedInAddNewImagePopup() {
	return selectedInAddNewImagePopup.length;
}

function getSelectedInAddNewImagePopup() {
	return selectedInAddNewImagePopup;
}

function isSelectedInAddNewImagePopup(element) {
	const index = selectedInAddNewImagePopup.findIndex((item) => item._id === element);
	return index > -1 ? true : false;
}

function getDeletedItemsDataCollection() {
	return deletedItemsCollection;
}


export default {
	add,
	remove,
	isSelected,
	clearImagesForDownload,
	clearImagesForStudies,
	count,
	countForStudies,
	getURIEncoded,
	addForStudy,
	isSelectedInStudies,
	removeImageFromStudies,
	setStudyFlag,
	getStudyFlag,
	getStudyImagesId,
	setImageObjectsToLocalStorage,
	getImageObjectsFromLocalStorage,
	addToSelectedInAddNewImagePopup,
	removeFromSelectedInAddNewImagePopup,
	clearSelectedInAddNewImagePopup,
	countSelectedInAddNewImagePopup,
	getSelectedInAddNewImagePopup,
	isSelectedInAddNewImagePopup,
	getSelectedImagesForDownload,
	getDeletedItemsDataCollection
};
