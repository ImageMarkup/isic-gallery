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
	setSelectedImagesToLocalStorage(selectedImages);
}

function remove(element) {
	const index = selectedImages.findIndex(item => item.isic_id === element);
	if (index > -1) {
		selectedImages.splice(index, 1);
	}
	setSelectedImagesToLocalStorage(selectedImages);
}

function isSelected(element) {
	const index = selectedImages.findIndex(item => item.isic_id === element);
	return index > -1;
}

function clearImagesForDownload() {
	selectedImages = [];
	setSelectedImagesToLocalStorage(selectedImages);
}

function clearImagesForStudies() {
	studySelectedImages = [];
	setImageObjectsToLocalStorage(studySelectedImages);
}

function count() {
	return selectedImages.length;
}

function getSelectedImagesForDownload() {
	const localStorageImages = getSelectedImagesFromLocalStorage();
	if (!selectedImages.length && localStorageImages && localStorageImages.length) {
		selectedImages = localStorageImages;
		return getSelectedImagesForDownload();
	}
	return selectedImages;
}

function countForStudies() {
	return studySelectedImages.length;
}

function getURIEncoded() {
	const selectedImagesIds = Array.from(selectedImages, selectedImage => selectedImage.isic_id);
	return encodeURI(JSON.stringify(selectedImagesIds));
}

function addForStudy(elements) {
	if (!Array.isArray(elements)) {
		elements = [elements];
	}
	studySelectedImages = studySelectedImages.concat(elements);
	setImageObjectsToLocalStorage(studySelectedImages);
}

function isSelectedInStudies(element) {
	const index = studySelectedImages.findIndex(item => item.isic_id === element);
	return index > -1;
}

function removeImageFromStudies(element) {
	const index = studySelectedImages.findIndex(item => item.isic_id === element);
	if (index > -1) {
		studySelectedImages.splice(index, 1);
	}
	setImageObjectsToLocalStorage(studySelectedImages);
}

function setStudyFlag(value) {
	webix.storage.local.put("studyFlag", value);
	studyFlag = value;
}

function getStudyFlag() {
	studyFlag = webix.storage.local.get("studyFlag") || false;
	return studyFlag;
}

function getStudyImagesId() {
	const localStorageImages = getImageObjectsFromLocalStorage();
	if (!studySelectedImages.length && localStorageImages && localStorageImages.length) {
		studySelectedImages = localStorageImages;
		return getStudyImagesId();
	}
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
	const index = selectedInAddNewImagePopup.findIndex(item => item.isic_id === element);
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
	const index = selectedInAddNewImagePopup.findIndex(item => item.isic_id === element);
	return index > -1;
}

function getDeletedItemsDataCollection() {
	return deletedItemsCollection;
}

function setSelectedImagesToLocalStorage(images) {
	webix.storage.local.put("selectedImages", images);
}

function getSelectedImagesFromLocalStorage() {
	return webix.storage.local.get("selectedImages");
}

function clearAll() {
	clearImagesForDownload();
	clearImagesForStudies();
	clearSelectedInAddNewImagePopup();
	setStudyFlag(false);
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
	getDeletedItemsDataCollection,
	setSelectedImagesToLocalStorage,
	getSelectedImagesFromLocalStorage,
	clearAll
};
