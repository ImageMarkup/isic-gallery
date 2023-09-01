import windowWithHeader from "app-components/mobileWindow";

import galleryImageUrl from "../../../../models/galleryImagesUrls";
import ajax from "../../../../services/ajaxActions";
import "../../../components/slideButton";

const closeArea = {
	view: "template",
	gravity: 0,
	template: "<div class=\"mobile-window-close-area close-window\"></div>"
};

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

		return `<div class="image-zoom-container">
  					<img class= 'zoomable-image' src="${imageUrl}"/>
				</div>`;
	},
	borderless: true
};

const zoomButtonsTemplate = {
	view: "template",
	css: {background: "transparent"},
	height: 0,
	template: `<button class="zoom-btn btn-plus fas fa-search-plus" style="left:10px"></button>
  				<button class="zoom-btn btn-minus fas fa-search-minus" style="left:65px"></button>`
};

const leftLandscapeZoomButtonTemplate = {
	view: "template",
	css: {background: "transparent"},
	hidden: true,
	height: 0,
	template: '<button class = "land-zoom-btn land-btn-minus fas fa-minus"</button>'
};

const rightLandscapeZoomButtonTemplate = {
	view: "template",
	css: {background: "transparent"},
	hidden: true,
	height: 0,
	template: '<button class = "land-zoom-btn land-btn-plus fas fa-plus"</button>'
};

const windowBody = {
	css: "mobile-image-window-body",
	height: 0,
	type: "clean",
	rows: [
		closeArea,
		{
			cols: [
				{
					gravity: 0,
					type: "clean",
					width: 0,
					css: {position: "absolute", "z-index": "99", width: "100px !important", left: "-100px"},
					cols: [
						leftLandscapeZoomButtonTemplate
					]
				},
				templateViewer,
				{
					gravity: 0,
					type: "clean",
					width: 0,
					css: {position: "absolute", "z-index": "99", width: "100px !important"},
					cols: [
						rightLandscapeZoomButtonTemplate
					]
				}
			]
		},
		{
			gravity: 0,
			type: "clean",
			height: 0,
			css: {position: "absolute", "z-index": "99", height: "60px"},
			cols: [
				zoomButtonsTemplate
			]
		}
	]
};

function getConfig(id, closeCallback) {
	closeArea.onClick = {
		"close-window": function () {
			this.getTopParentView().hide();
			if (typeof closeCallback === "function") closeCallback();
		}
	};
	templateViewer.id = `viewer-${webix.uid()}`;
	zoomButtonsTemplate.id = `zoombuttons-template-${webix.uid()}`;
	leftLandscapeZoomButtonTemplate.id = `left-landscape-zoombutton-template-${webix.uid()}`;
	rightLandscapeZoomButtonTemplate.id = `right-landscape-zoombutton-template-${webix.uid()}`;
	const windowWidth = window.innerWidth * 0.9;
	const windowHeight = window.innerHeight * 0.9;
	const windowSize = windowWidth < windowHeight ? windowWidth : windowHeight;
	windowBody.width = windowSize;
	windowBody.height = windowSize;
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

function getLeftLandscapeZoomButtonTemplateId() {
	return leftLandscapeZoomButtonTemplate.id;
}

function getRightLandscapeZoomButtonTemplateId() {
	return rightLandscapeZoomButtonTemplate.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getViewerId,
	getZoomButtonTemplateId,
	getLeftLandscapeZoomButtonTemplateId,
	getRightLandscapeZoomButtonTemplateId
};
