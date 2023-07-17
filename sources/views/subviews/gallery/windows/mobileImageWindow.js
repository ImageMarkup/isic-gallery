import galleryImageUrl from "../../../../models/galleryImagesUrls";
import ajax from "../../../../services/ajaxActions";
import windowWithHeader from "../../../components/mobileWindowWithHeader";
import "../../../components/slideButton";


const templateViewer = {
	view: "template",
	css: "absolute-centered-image-template",
	template(obj) {
		if (typeof galleryImageUrl.getNormalImageUrl(obj.imageId) === "undefined") {
			ajax.getImageItem(obj.imageId).then((item) => {
				galleryImageUrl.setNormalImageUrl(obj.imageId, item.files.full.url);
				$$(templateViewer.id).refresh();
			});
		}

		return `<div class="image-zoom-container">
  					<img class= 'zoomable-image' src="${galleryImageUrl.getNormalImageUrl(obj.imageId) || ""}"/>
				</div>
				`;
	},
	borderless: true
};

const zoomButtonsTemplate = {
	view: "template",
	template: `<button class="zoom-btn btn-plus fas fa-search-plus"></button>
  				<button class="zoom-btn btn-minus fas fa-search-minus"></button>`
};

const windowBody = {
	css: "metadata-window-body",
	paddingX: 35,
	width: 0,
	height: 0,
	type: "clean",
	rows: [
		templateViewer,
		{height: 10},
		{
			type: "clean",
			cols: [
				zoomButtonsTemplate,
				{}
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

function getConfig(id) {
	templateViewer.id = `viewer-${webix.uid()}`;
	zoomButtonsTemplate.id = `zoombuttons-template-${webix.uid()}`;
	const windowTitle = "";
	return windowWithHeader.getConfig(id, windowBody, windowTitle);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getViewerId() {
	return templateViewer.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getViewerId,
};
