const FILES_INFO = "filesInfo";
const SIGNATURE = "signature";

function getFilesInfoFromStorage() {
	return webix.storage.session.get(FILES_INFO);
}

function addFileInfoToStorage(data) {
	if (data) {
		const filesInfo = getFilesInfoFromStorage() || [];
		filesInfo.push(data);
		webix.storage.session.put(FILES_INFO, filesInfo);
	}
}

function saveSignature(signature) {
	if (signature) {
		webix.storage.session.put(SIGNATURE, signature);
	}
}

function getSignature() {
	return webix.storage.session.get(SIGNATURE);
}

function clearAll() {
	webix.storage.session.remove(FILES_INFO);
	webix.storage.session.remove(SIGNATURE);
}

function clearFilesInfo() {
	webix.storage.session.remove(FILES_INFO);
}

function clearSignature() {
	webix.storage.session.remove(SIGNATURE);
}

function getLastFile() {
	let result = null;
	const files = getFilesInfoFromStorage();
	const size = files ? files.length : 0;
	if (size) {
		result = files[size - 1];
	}
	return result;
}

export default {
	addFileInfoToStorage,
	getFilesInfoFromStorage,
	saveSignature,
	getSignature,
	clearAll,
	clearFilesInfo,
	clearSignature,
	getLastFile
};
