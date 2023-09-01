import galleryImagesUrls from "../../../../models/galleryImagesUrls";
import windowWithHeader from "../../../components/windowWithHeader";
import "../../../components/slideButton";


const templateViewer = {
	view: "template",
	css: "absolute-centered-image-template",
	template(obj) {
		const imageUrl = galleryImagesUrls.getNormalImageUrl(obj.imageId) || "";
		return `<div class="image-zoom-container">
					<img class= 'zoomable-image' src="${imageUrl}"/>
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
		const imageUrl = galleryImagesUrls.getNormalImageUrl(obj.imageId) || "";
		return `<div class="image-zoom-container">
					<img class= 'zoomable-image' src="${imageUrl}"/>
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
	on: {
		onChange(newv) {
			if (newv) {
				$$(metadataContainer.id).show();
				// eslint-disable-next-line no-use-before-define
				refreshTemplate();
			}
			else {
				$$(metadataContainer.id).hide();
				// eslint-disable-next-line no-use-before-define
				refreshTemplate();
			}
		}
	}
};

const windowBody = {
	css: "metadata-window-body",
	paddingX: 35,
	width: 1100,
	height: 610,
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

function refreshTemplate() {
	// eslint-disable-next-line no-use-before-define
	let imageTemplate = $$(getViewerId());
	imageTemplate.refresh();
}

function getConfig(id, studyImage, closeCallback) {
	let windowTitle;
	templateViewer.id = `viewer-${webix.uid()}`;
	templateViewerWithoutControls.id = `viewer-without-controls-${webix.uid()}`;
	slideButton.id = `slidebutton-${webix.uid()}`;
	layoutForMetadata.id = `layout-for-metadata-${webix.uid()}`;
	metadataContainer.id = `metadata-container-${webix.uid()}`;
	zoomButtonsTemplate.id = `zoombuttons-template-${webix.uid()}`;
	if (!studyImage) {
		windowTitle = "Metadata";
	}
	else {
		windowTitle = studyImage;
	}
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
	getZoomButtonTemplateId
};
