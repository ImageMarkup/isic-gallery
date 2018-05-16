let selectedImages = [];

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

function clearAll() {
	selectedImages = [];
}

function count() {
	return selectedImages.length;
}

function getURIEncoded() {
	return encodeURI(JSON.stringify(selectedImages));
}

export default {
	add,
	remove,
	isSelected,
	clearAll,
	count,
	getURIEncoded
};
