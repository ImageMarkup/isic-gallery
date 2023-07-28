import windowWithHeader from "../../../components/windowWithHeader";

// this row will be set during initialisation
const layoutForMetadata = {
	css: "metadata-layout",
	rows: []
};

const windowBody = {
	css: "metadata-window-body",
	paddingX: 35,
	width: 523,
	height: 610,
	type: "clean",
	rows: [
		{ // this container is needed to draw external borders
			align: "absolute",
			body: layoutForMetadata
		},
		{height: 35}
	]
};

function getConfig(id) {
	layoutForMetadata.id = `layout-for-metadata-${webix.uid()}`;
	return windowWithHeader.getConfig(id, windowBody);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getMetadataLayoutId() {
	return layoutForMetadata.id;
}

function getMetadataBody() {
	return windowBody;
}

export default {
	getConfig,
	getIdFromConfig,
	getMetadataLayoutId,
	getMetadataBody
};
