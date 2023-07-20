import windowWithHeader from "app-components/mobileWindow";

import galleryImageUrl from "../../../../models/galleryImagesUrls";
import ajax from "../../../../services/ajaxActions";
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

const closeButton = {
	view: "button",
	css: "mobile-window-close-button",
	label: '<svg viewBox="0 0 26 26" class="close-icon-svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use></svg>',
	type: "htmlbutton",
	width: 30,
	align: "right",
	on: {
		onItemClick() {
			this.getTopParentView().hide();
		}
	}
};

const windowBody = {
	css: "mobile-image-window-body",
	height: 0,
	type: "clean",
	rows: [
		{
			cols: [
				{gravity: 1},
				closeButton
			]
		},
		templateViewer,
		{height: 10},
		{
			type: "clean",
			height: 30,
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

function getZoomButtonTemplateId() {
	return zoomButtonsTemplate.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getViewerId,
	getZoomButtonTemplateId
};
