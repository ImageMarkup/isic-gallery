let selectedImages = [];
let studySelectedImages = [];
let studyFlag;
let selectedInAddNewImagePopup = [];

function add(element) {
	selectedImages.push(element);
}

function remove(element) {
	const index = selectedImages.indexOf(element);
	if (index > -1) {
		selectedImages.splice(index, 1);
	}
}

function isSelected(element) {
	return selectedImages.indexOf(element) > -1;
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

function countForStudies() {
	return studySelectedImages.length;
}

function getURIEncoded() {
	return encodeURI(JSON.stringify(selectedImages));
}

function addForStudy(element) {
	studySelectedImages.push(element)
}

function isSelectedInStudies(element) {
	const index = studySelectedImages.findIndex((item) => item.id === element);
	return index > -1 ? true : false;
}

function removeImageFromStudies(element) {
	const index = studySelectedImages.findIndex((item) => item.id === element);
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

function addToSelectedInAddNewImagePopup(element) {
	selectedInAddNewImagePopup.push(element);
}

function removeFromSelectedInAddNewImagePopup(element) {
	const index = selectedInAddNewImagePopup.findIndex((item) => item.id === element);
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
	const index = selectedInAddNewImagePopup.findIndex((item) => item.id === element);
	return index > -1 ? true : false;
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
	isSelectedInAddNewImagePopup
};
