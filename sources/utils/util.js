const FileSaver = require("../../node_modules/file-saver/FileSaver");

function openInNewTab(url) {
	const otherWindow = window.open();
	otherWindow.opener = null;
	otherWindow.location = url;
}

function downloadByLink(url, name) {
	let a = document.createElement("a");
	a.setAttribute("style", "display: none");
	document.body.appendChild(a);
	a.setAttribute("href", url);
	a.setAttribute("target", "_blank");
	a.download = name || "download";
	a.click();
	a.parentNode.removeChild(a);
}

function downloadBlob(blob, name) {
	FileSaver.saveAs(blob, name);
	/*if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, name);
	} else {
		let url = window.URL.createObjectURL(blob);
		downloadByLink(url, name);
		window.URL.revokeObjectURL(url);
	}*/
}

function exportCsv(sourceArray) {
	if (!sourceArray) {
		return;
	}
	let csvContent = "";
	sourceArray.forEach((rowArray) => {
		let row = rowArray.join(",");
		csvContent += row + "\r\n";
	});
	const csvData = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
	downloadBlob(csvData, "images.csv");
}

function isChrome() {
	return webix.env.isWebKit;
}

export default {
	openInNewTab,
	downloadByLink,
	isChrome,
	exportCsv,
	downloadBlob
};

