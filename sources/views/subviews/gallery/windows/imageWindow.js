import windowWithHeader from "../../../components/windowWithHeader";
import "../../../components/slideButton";
import ajax from "../../../../services/ajaxActions";
import galleryImageUrl from "../../../../models/galleryImagesUrls";


const templateViewer = {
	view: "template",
	css: "absolute-centered-image-template",
	template(obj) {
		if (typeof galleryImageUrl.getNormalImageUrl(obj.imageId) === "undefined") {
			ajax.getImage(obj.imageId, 553, 1000).then((data) => {
				galleryImageUrl.setNormalImageUrl(obj.imageId, URL.createObjectURL(data));
				$$(templateViewer.id).refresh();
			});
		}

		return `<div class="image-zoom-container">
  					<img class= 'zoomable-image' src="${galleryImageUrl.getNormalImageUrl(obj.imageId) || ""}"/>
  					<button class="btn-plus">+</button>
  					<button class="btn-minus">-</button>
				</div>
					<a class="prev">&#10094;</a>
 					<a class="next">&#10095;</a>
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
			}
			else {
				$$(metadataContainer.id).hide();
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
				metadataContainer
			]
		},
		{height: 10},
		{
			type: "clean",
			cols: [
				{},
				slideButton
			]
		},
		{height: 10}
	]
};

function getConfig(id, studyImage) {
	let windowTitle;
	templateViewer.id = `viewer-${webix.uid()}`;
	slideButton.id = `slidebutton-${webix.uid()}`;
	layoutForMetadata.id = `layout-for-metadata-${webix.uid()}`;
	metadataContainer.id = `metadata-container-${webix.uid()}`;
	if (!studyImage) {
		windowTitle = "Metadata";
	} else {
		windowTitle = studyImage;
	}
	return windowWithHeader.getConfig(id, windowBody, windowTitle);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getViewerId() {
	return templateViewer.id;
}

function getSliderButtonId() {
	return slideButton.id;
}

function getMetadataLayoutId() {
	return layoutForMetadata.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getViewerId,
	getSliderButtonId,
	getMetadataLayoutId
};
