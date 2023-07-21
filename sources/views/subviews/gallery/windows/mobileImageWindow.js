import windowWithHeader from "app-components/mobileWindow";

import galleryImageUrl from "../../../../models/galleryImagesUrls";
import ajax from "../../../../services/ajaxActions";
import "../../../components/slideButton";


const templateViewer = {
	view: "template",
	css: "absolute-centered-image-template-mobile",
	autoHeight: true,
	gravity: 1,
	template(obj) {
		if (typeof galleryImageUrl.getNormalImageUrl(obj.imageId) === "undefined") {
			ajax.getImageItem(obj.imageId).then((item) => {
				galleryImageUrl.setNormalImageUrl(obj.imageId, item.files.full.url);
				$$(templateViewer.id).refresh();
			});
		}
		const imageUrl = galleryImageUrl.getNormalImageUrl(obj.imageId) ?? "";

		return `<div class="mobile-window-close-button">
							<svg viewBox="0 0 26 26" class="close-icon-svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-btn close-icon-svg-use"></use></svg>',
						</div>
				<div class="image-zoom-container">
  					<img class= 'zoomable-image' src="${imageUrl}"/>
				</div>
				`;
	},
	borderless: true
};

const zoomButtonsTemplate = {
	view: "template",
	css: {background: "transparent"},
	height: 0,
	template: `<button class="zoom-btn btn-plus fas fa-search-plus" style="left:10px"></button>
  				<button class="zoom-btn btn-minus fas fa-search-minus" style="left:45px"></button>`
};

const closeButton = {
	view: "button",
	css: "mobile-window-close-button",
	label: '<svg viewBox="0 0 26 26" class="close-icon-svg" style="width:30px"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use></svg>',
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
		templateViewer,
		{
			gravity: 0,
			type: "clean",
			height: 0,
			css: {position: "absolute", "z-index": "99", height: "40px"},
			cols: [
				zoomButtonsTemplate
			]
		}
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
	return windowWithHeader.getConfig(id, windowBody);
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
