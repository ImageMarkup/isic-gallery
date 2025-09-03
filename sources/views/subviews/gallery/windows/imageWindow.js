import windowWithHeader from "../../../components/windowWithHeader";
import "../../../components/slideButton";

const templateViewer = {
	view: "template",
	css: "absolute-centered-image-template",
	template(obj) {
		return `<div class="image-zoom-container">
					<div isic_id=${obj.imageId} class= "zoomable-image"></div>
				</div>
					<a class="prev">&#10094;</a>
 					<a class="next">&#10095;</a>
				`;
	},
	borderless: true
};

const templateViewerWithoutControls = {
	view: "template",
	css: "absolute-centered-image-template",
	hidden: true,
	template(obj) {
		return `<div class="image-zoom-container">
					<div isic_id=${obj.imageId} class= "zoomable-image"></div>
				</div>
				`;
	},
	borderless: true
};

// this rows will be set during initialisation. we set id to this element in getConfig method
const layoutForMetadata = {
	css: "metadata-layout",
	width: 443,
	rows: []
};

const metadataContainer = {// this container is needed to draw external borders
	align: "absolute",
	hidden: true,
	body: layoutForMetadata
};

const zoomButtonsTemplate = {
	view: "template",
	template: `<button class="zoom-btn btn-plus fas fa-search-plus"></button>
  				<button class="zoom-btn btn-minus fas fa-search-minus"></button>`
};

const slideButton = {
	view: "slidebutton",
	css: "slidebutton",
	width: 190,
	labelWidth: 90,
	label: "METADATA:",
	labelLeft: "off",
	labelRight: "on",
	value: false,
};

const windowBody = {
	css: "metadata-window-body",
	paddingX: 35,
	width: Math.floor(window.innerWidth * 0.7),
	height: Math.floor(window.innerHeight * 0.7),
	type: "clean",
	rows: [
		{
			margin: 10,
			type: "clean",
			cols: [
				templateViewer,
				templateViewerWithoutControls,
				metadataContainer
			]
		},
		{height: 10},
		{
			type: "clean",
			cols: [
				zoomButtonsTemplate,
				{},
				slideButton
			]
		},
		{height: 10}
	]
};

function getConfig(id, studyImage, closeCallback) {
	templateViewer.id = `viewer-${webix.uid()}`;
	templateViewerWithoutControls.id = `viewer-without-controls-${webix.uid()}`;
	slideButton.id = `slidebutton-${webix.uid()}`;
	layoutForMetadata.id = `layout-for-metadata-${webix.uid()}`;
	metadataContainer.id = `metadata-container-${webix.uid()}`;
	zoomButtonsTemplate.id = `zoombuttons-template-${webix.uid()}`;
	const windowTitle = studyImage ?? "";
	return windowWithHeader.getConfig(id, windowBody, windowTitle, closeCallback);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getViewerId() {
	return templateViewer.id;
}

function getViewerWithoutControlsId() {
	return templateViewerWithoutControls.id;
}

function getSliderButtonId() {
	return slideButton.id;
}

function getMetadataLayoutId() {
	return layoutForMetadata.id;
}

function getMetadataContainerId() {
	return metadataContainer.id;
}

function getZoomButtonTemplateId() {
	return zoomButtonsTemplate.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getViewerId,
	getViewerWithoutControlsId,
	getSliderButtonId,
	getMetadataLayoutId,
	getMetadataContainerId,
	getZoomButtonTemplateId
};
