let createDatasetClicked;
let hasDatasetCreated;

function getCreateDatasetClicked() {
	return createDatasetClicked;
}

function setCreateDatasetClicked(clicked) {
	createDatasetClicked = clicked;
}

function setHasDatasetCreated(hasCreated) {
	hasDatasetCreated = hasCreated;
}

function getHasDatasetCreated() {
	return hasDatasetCreated;
}

export default {
	setCreateDatasetClicked,
	getCreateDatasetClicked,
	setHasDatasetCreated,
	getHasDatasetCreated
}