import constants from "../../../../constants";
import appliedFiltersModel from "../../../../models/appliedFilters";
import galleryImageUrl from "../../../../models/galleryImagesUrls";
import lesionsModel from "../../../../models/lesionsModel";
import util from "../../../../utils/util";
import collapser from "../../../components/collapser";
import "../../../components/svgIcon";

const ID_MULTI_IMAGE_LESION_WINDOW = `multi-image-lesion-window-id-${webix.uid()}`;
const ID_LEFT_IMAGE_NAME_LABEL = `image-name-id-${webix.uid()}`;
const ID_RIGHT_IMAGE_NAME_LABEL = `image-name-id-${webix.uid()}`;
const ID_TOP_PANEL = `top-panel-id-${webix.uid()}`;
const ID_TOP_SLIDER = `top-slider-id-${webix.uid()}`;
const ID_PREV_PAGE_BUTTON = `prev-page-button-id-${webix.uid()}`;
const ID_NEXT_PAGE_BUTTON = `next-page-button-id-${webix.uid()}`;
const ID_RIGHT_CONTAINER = `container-id-${webix.uid()}`;
const ID_LEFT_DROP_DOWN_FILTER = `left-drop-down-filter-${webix.uid()}`;
const ID_RIGHT_DROP_DOWN_FILTER = `right-drop-down-filter-${webix.uid()}`;
const ID_LEFT_FOOTER = `footer-id-${webix.uid()}`;
const ID_RIGHT_FOOTER = `footer-id-${webix.uid()}`;
const ID_LEFT_SLIDER = `slider-id-${webix.uid()}`;
const ID_RIGHT_SLIDER = `slider-id-${webix.uid()}`;
const ID_LEFT_IMAGE = `image-id-${webix.uid()}`;
const ID_RIGHT_IMAGE = `image-id-${webix.uid()}`;
const ID_BUTTON_FULL_SCREEN = `button-full-screen-id-${webix.uid()}`;
const ID_BUTTON_WINDOWED = `button-windowed-id-${webix.uid()}`;
const ID_SEARCH = `search-id-${webix.uid()}`;
const ID_LEFT_ANCHOR_ICON = `left-anchor-icon-id-${webix.uid()}`;
const ID_RIGHT_ANCHOR_ICON = `right-anchor-icon-id-${webix.uid()}`;

let expandButtonID;
let collapseButtonID;

function getConfig(windowTitle, closeCallback) {
	const topSlider = getTopSlider(
		ID_TOP_PANEL,
		ID_TOP_SLIDER,
		ID_PREV_PAGE_BUTTON,
		ID_NEXT_PAGE_BUTTON
	);
	const topSliderCollapser = collapser.getConfig(ID_TOP_PANEL, {type: "top", closed: true});
	// TODO: find alternatives
	collapseButtonID = topSliderCollapser.cols[0].id;
	expandButtonID = topSliderCollapser.cols[1].id;
	const leftSlider = getVerticalSlider(ID_LEFT_SLIDER, constants.MULTI_LESION_SIDE.LEFT);
	const rightSlider = getVerticalSlider(ID_RIGHT_SLIDER, constants.MULTI_LESION_SIDE.RIGHT);

	/** @type {webix.ui.labelConfig} */
	const leftImageLabel = getImageLabel(ID_LEFT_IMAGE_NAME_LABEL);
	const rightImageLabel = getImageLabel(ID_RIGHT_IMAGE_NAME_LABEL);

	const leftAnchorIcon = {
		view: "icon",
		id: ID_LEFT_ANCHOR_ICON,
		width: 20,
		height: 20,
		icon: "fas fa-anchor"
	};

	const rightAnchorIcon = {
		view: "icon",
		id: ID_RIGHT_ANCHOR_ICON,
		width: 20,
		height: 20,
		icon: "fas fa-anchor"
	};

	/** @type {webix.ui.richselectConfig} */
	const leftGroupDropdown = {
		view: "richselect",
		id: ID_LEFT_DROP_DOWN_FILTER,
		css: "multilesion-filter-dropdown",
		label: "Group by:",
		labelAlign: "left",
		width: 270,
		height: 24,
		labelWidth: 75,
		value: constants.MULTI_LESION_GROUP_BY.TIME,
		// TODO: check options
		options: [
			constants.MULTI_LESION_GROUP_BY.TIME,
			constants.MULTI_LESION_GROUP_BY.TYPE,
			constants.MULTI_LESION_GROUP_BY.COMBINATION,
			constants.MULTI_LESION_GROUP_BY.NO_GROUP,
		]
	};

	const rightGroupDropdown = {
		view: "richselect",
		id: ID_RIGHT_DROP_DOWN_FILTER,
		css: "multilesion-filter-dropdown",
		label: "Group by:",
		labelAlign: "left",
		width: 270,
		height: 30,
		labelWidth: 75,
		value: constants.MULTI_LESION_GROUP_BY.TIME,
		// TODO: check options
		options: [
			constants.MULTI_LESION_GROUP_BY.TIME,
			constants.MULTI_LESION_GROUP_BY.TYPE,
			constants.MULTI_LESION_GROUP_BY.COMBINATION,
			constants.MULTI_LESION_GROUP_BY.NO_GROUP,
		]
	};

	const leftTemplateViewer = getTemplateViewer(
		ID_LEFT_IMAGE,
		true,
		constants.MULTI_LESION_SIDE.LEFT
	);

	const rightTemplateViewer = getTemplateViewer(
		ID_RIGHT_IMAGE,
		true,
		constants.MULTI_LESION_SIDE.RIGHT
	);

	/** @type {webix.ui.toolbarConfig} */
	const leftToolbar = {
		height: 60,
		cols: [
			{width: 20},
			leftImageLabel,
			{width: 5},
			leftAnchorIcon,
			{
				gravity: 1,
				minWidth: 10
			},
			{
				rows: [
					{gravity: 1},
					leftGroupDropdown,
					{gravity: 1},
				]
			},
			{width: 100}
		]
	};

	/** @type {webix.ui.toolbarConfig} */
	const rightToolbar = {
		height: 60,
		cols: [
			{width: 100},
			{
				rows: [
					{gravity: 1},
					rightGroupDropdown,
					{gravity: 1},
				]
			},
			{gravity: 1},
			rightImageLabel,
			{width: 5},
			rightAnchorIcon,
			{gravity: 1},
		],
	};

	const leftFooter = getFooter(ID_LEFT_FOOTER, constants.MULTI_LESION_SIDE.LEFT);
	const rightFooter = getFooter(ID_RIGHT_FOOTER, constants.MULTI_LESION_SIDE.RIGHT);

	const leftImageContainer = {
		css: "container",
		cols: [
			{
				rows: [
					leftToolbar,
					{
						css: "left-image-panel-container",
						cols: [
							leftTemplateViewer,
						]
					},
					{
						cols: [
							{width: 10},
							leftFooter
						]
					}
				]
			},
			{
				width: 1,
				cols: [
					leftSlider
				]
			}
		]
	};

	const rightImageContainer = {
		id: ID_RIGHT_CONTAINER,
		css: "container",
		cols: [
			{
				width: 1,
				cols: [
					rightSlider
				]
			},
			{
				rows: [
					rightToolbar,
					{
						css: "right-image-panel-container",
						cols: [
							rightTemplateViewer,
						]
					},
					rightFooter
				]
			}
		]
	};

	return {
		view: "window",
		id: ID_MULTI_IMAGE_LESION_WINDOW,
		width: 1240,
		height: 750,
		css: "window-with-header",
		modal: true,
		fullscreen: false,
		position: "center",
		headHeight: 48,
		move: false,
		head: {
			view: "toolbar",
			css: "window-header-toolbar2",
			borderless: true,
			type: "clean",
			height: 48,
			cols: [
				{
					template: `<span class="window-header-toolbar-text_title">${windowTitle}</span>` || "",
					css: "window-header-toolbar-text main-subtitle4 window-header-toolbar2__title",
					borderless: true,
					autoheight: true,
				},
				{gravity: 0.001},
				{
					view: "search",
					icon: "fas fa-search lesionWindow__filter-search",
					id: ID_SEARCH,
					name: "multilesionSearchName",
					value: `${appliedFiltersModel.getFilterValue()}`,
					css: "multi-image-lesion-search-block",
					placeholder: "Search images",
					hidden: true,
					inputHeight: 38,
					width: 634,
				},
				{width: 20},
				{
					view: "button",
					id: ID_BUTTON_FULL_SCREEN,
					label: "Full Screen",
					css: "window-header-toolbar2__fullscreen-button",
					type: "icon",
					icon: "fas fa-expand",
					width: 120,
					height: 32,
				},
				{
					view: "button",
					id: ID_BUTTON_WINDOWED,
					hidden: true,
					label: "Windowed",
					css: "window-header-toolbar2__fullscreen-button",
					type: "icon",
					icon: "fas fa-compress",
					width: 120,
					height: 32,
				},
				{width: 20},
				{
					view: "button",
					css: "window-close-button",
					label: '<svg viewBox="0 0 14 14" class="close-icon-svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use></svg>',
					type: "htmlbutton",
					width: 30,
					align: "right",
					on: {
						onItemClick() {
							this.getTopParentView().hide();
							if (typeof closeCallback === "function") {
								closeCallback();
							}
						}
					}
				},
				{width: 5}
			]
		},
		body: {
			css: "multi-image-lesion-window-body",
			rows: [
				topSlider,
				topSliderCollapser,
				{height: 10},
				{
					cols: [
						leftImageContainer,
						rightImageContainer
					]
				}
			]
		}
	};
}

/**
 * Description placeholder
 *
 * @returns {webix.ui.listConfig}
 */
function getTopSlider(topPanelID, sliderID, prevButtonID, nextButtonID) {
	return {
		id: topPanelID,
		hidden: true,
		cols: [
			{width: 20},
			{
				view: "icon",
				id: prevButtonID,
				width: 24,
				icon: "fas fa-chevron-left",
				css: "navigation-button"
			},
			{
				view: "list",
				id: sliderID,
				layout: "x",
				css: "multilesion-top-list",
				scroll: false,
				select: false,
				drag: true,
				height: 134,
				type: {
					height: 104
				},
				template(obj, /* common */) {
					const lesionID = lesionsModel.getItemLesionID(obj);
					const lesion = lesionsModel.getLesionByID(lesionID);
					const lesionModalitiesCount = lesionID
						? lesionsModel.getLesionModalitiesCount(lesionID)
						: null;
					const lesionTimePointsCount = lesionID
						? lesionsModel.getLesionTimePointsCount(lesionID)
						: null;
					const imageIconDimensions = {
						iconContainerDimensions: {
							width: constants.DEFAULT_RIBBON_ICON_CONTAINER_WIDTH,
							height: constants.DEFAULT_RIBBON_ICON_CONTAINER_HEIGHT
						},
						iconDimensions: {
							width: constants.DEFAULT_RIBBON_IMAGE_ICON_WIDTH,
							height: constants.DEFAULT_RIBBON_IMAGE_ICON_HEIGHT
						}
					};
					const lesionIconElementClass = lesion
						? "gallery-images-button-elem"
						: "gallery-images-button-elem-disabled";
					const disabledBadge = lesion
						? ""
						: " disabled-badge";
					const diagnosisIcon = obj.hasAnnotations ?
						`<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
							<span class="gallery-images-button diagnosis-icon tooltip-title" style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px;">
								<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
									<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#diagnosis-icon" class="gallery-icon-use"></use>
								</svg>
							</span>
							<span class="tooltip-block tooltip-block-top" style="z-index: 1000000">Multirater</span>
						</div>` : "";
					const lesionIcon = `<div class="${lesionIconElementClass} tooltip-container tooltip-gallery-images" style="style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px;">
						<span class="gtm-lesion-viewer gallery-images-button layer-group tooltip-title">
							<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#layer-group" class="gallery-icon-use"></use>
							</svg>
						</span>
						<span class="tooltip-block tooltip-block-top" style="display: block">Lesion</span>
						<span class="gallery-images-badge gallery-images-badge_1${disabledBadge} tooltip-title">${lesionModalitiesCount ?? 0}</span>
						<span class="tooltip-block tooltip-block-top" style="display: block">Modalities count</span>
						<span class="gallery-images-badge gallery-images-badge_2${disabledBadge} tooltip-title">${lesionTimePointsCount ?? 0}</span>
						<span class="tooltip-block tooltip-block-top" style="display: block">Time points count</span>
					</div>`;
					const starHtml = obj.hasAnnotations ? "<span class='webix_icon fas fa-star gallery-images-star-icon'></span>" : "";
					if (typeof galleryImageUrl.getPreviewImageUrl(lesionsModel.getItemID(obj)) === "undefined") {
						galleryImageUrl.setPreviewImageUrl(
							lesionsModel.getItemID(obj),
							obj.files.thumbnail_256.url
						); // to prevent sending query more than 1 time
					}
					return `<div class="gallery-images-container" style="height: 104px;">
							<div class='gallery-images-info' style="height: 104px; position: absolute; right:0px;">
								<div class="gallery-images-header">
									<div class="thumbnails-name" style="font-size: ${util.getNewThumnailsNameFontSize()}px">${lesionsModel.getItemID(obj)}</div>
								</div>
								<div class="gallery-images-buttons" style="bottom: 0px;">
									<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
										<span class="gtm-image-enlargement gallery-images-button resize-icon tooltip-title" style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px;">
											<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
												<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#resize-icon" class="gallery-icon-use"></use>
											</svg>
										</span>
										<span class="tooltip-block tooltip-block-top" style="display: block">Enlarge</span>
									</div>
									<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
										<span class="gtm-image-metadata gallery-images-button info-icon tooltip-title" style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px;">
											<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
												<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#info-icon" class="gallery-icon-use"></use>
											</svg>
										</span>
										<span class="tooltip-block tooltip-block-top">Metadata</span>
									</div>
									<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
										<span class="gtm-single-download gallery-images-button batch-icon tooltip-title" style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px;">
											<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
												<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#batch-icon" class="gallery-icon-use"></use>
											</svg>
										</span>
										<span class="tooltip-block tooltip-block-top">Download ZIP</span>
									</div>
									${diagnosisIcon}
									${lesionIcon}
								</div>
							</div>
							${starHtml}
							<img src="${galleryImageUrl.getPreviewImageUrl(lesionsModel.getItemID(obj)) || ""}" class="gallery-image" height="104px"/>
					</div>`;
				},
			},
			{
				view: "icon",
				id: nextButtonID,
				width: 24,
				icon: "fas fa-chevron-right",
				css: "navigation-button"
			},
			{width: 20}
		]
	};
}

function getVerticalSlider(id, side) {
	return {
		view: "list",
		id,
		layout: "y",
		drag: true,
		select: false,
		type: {
			width: 62,
			height: 42,
		},
		css: `vertical-slider-${side}`,
		width: 1,
		/**
		 *
		 * @param {Object} obj
		 * @param {obj} obj.firstImage
		 * @param {string} obj.groupBy
		 * @param {string | number} obj.groupValue
		 * @param {Array} obj.images
		 * @returns
		 */
		template(obj, /* common */) {
			let images;
			let multipleFlag = false;
			if (obj.images) {
				images = obj.images;
				multipleFlag = obj.images.length > 1;
			}
			const lesionID = lesionsModel.getItemLesionID(images[0]);
			const anchorImageID = lesionsModel.getAnchorImageID(lesionID);
			const anchorIcon = lesionsModel.getItemID(images) === anchorImageID
				? `<div class="ribbon-image-elem tooltip-container tooltip-gallery-images">
					<span class="gallery-images-button fas fa-anchor gallery-icon-use" style="color:white"></span>
				</div>`
				: "";
			images.forEach((i) => {
				if (typeof galleryImageUrl.getPreviewImageUrl(lesionsModel.getItemID(i)) === "undefined") {
					galleryImageUrl.setPreviewImageUrl(
						lesionsModel.getItemID(i),
						i.files.thumbnail_256.url
					); // to prevent sending query more than 1 time
				}
			});
			return `<div class='gallery-images-container${multipleFlag ? " images-group" : ""}'>
					${anchorIcon}
					<img src="${galleryImageUrl.getPreviewImageUrl(lesionsModel.getItemID(images[0])) || ""}" 
					class="gallery-image${multipleFlag ? " framed-image" : ""}" height="42px" width="100%"/>
					<img src="${galleryImageUrl.getPreviewImageUrl(lesionsModel.getItemID(images[1])) || ""}" 
					class="gallery-image${multipleFlag ? " framed-image2" : ""}" height="42px" width="100%"/>
					<img src="${galleryImageUrl.getPreviewImageUrl(lesionsModel.getItemID(images[1])) || ""}" 
					class="gallery-image${multipleFlag ? " framed-image3" : "hidden"}" height="42px" width="100%" 
					${"style=display:none"}/>
			</div>`;
		}
	};
}


/**
 * Description placeholder
 *
 * @param {boolean} showButtons
 * @returns {webix.ui.templateConfig}
 */
function getTemplateViewer(id, showButtons, side) {
	return {
		view: "template",
		id,
		css: "absolute-centered-image-template",
		template(obj) {
			const imageUrl = galleryImageUrl.getNormalImageUrl(lesionsModel.getItemID(obj)) || "";
			const lesionsImages = side === constants.MULTI_LESION_SIDE.LEFT
				? lesionsModel.getCurrentLeftImages()
				: lesionsModel.getCurrentRightImages();
			return `<div class="image-zoom-container">
						<img class= 'zoomable-image' src="${imageUrl}"/>
					</div>
					${showButtons && lesionsImages.length > 1 ? '<a class="prev">&#10094;</a><a class="next">&#10095;</a>' : ""}
					`;
		},
		borderless: true
	};
}

function getImageLabel(imageNameId) {
	return {
		view: "label",
		css: "multi-image-lesion-window__image-label",
		width: 100,
		id: imageNameId,
		label: ""
	};
}

function footerTemplateFunction(obj, /* common */) {
	const lesionID = lesionsModel.getItemLesionID(obj);
	const lesionImagesCount = lesionID
		? lesionsModel.getLesionImagesCount(lesionID)
		: "";
	const lesionTimePointsCount = lesionID
		? lesionsModel.getLesionTimePointsCount(lesionID)
		: "";
	let multipleModalities;
	let timePoint;
	let modality;
	if (lesionID) {
		multipleModalities = lesionsModel.checkMultipleModality(lesionID) ? "Yes" : "No";
		timePoint = lesionsModel.getItemTimePoint(obj);
		modality = lesionsModel.getItemModality(obj);
	}
	else {
		multipleModalities = "";
	}
	const container = $$(ID_RIGHT_CONTAINER).isVisible()
		? "<div class='footer-container-narrow'>"
		: "<div class='footer-container-wide'>";
	return `${container}
			<div class="footer-item">
				<span class="footer-item__name">Lesion ID: </span><span class="footer-item__value">${lesionID ?? ""}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Number of unique time points: </span><span class="footer-item__value">${lesionTimePointsCount}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Time point: </span><span class="footer-item__value">${timePoint}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Modality: </span><span class="footer-item__value">${modality}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name"># of total lesion images: </span><span class="footer-item__value">${lesionImagesCount}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Availability of multiple modalities: </span><span class="footer-item__value">${multipleModalities}</span>
			</div>
		</div>`;
}

function getFooter(id, side) {
	let config;
	switch (side) {
		case constants.MULTI_LESION_SIDE.LEFT:
			config = {
				cols: [
					{
						view: "template",
						id,
						css: "footer-template",
						height: 60,
						template: footerTemplateFunction,
					},
					{width: 80}
				]
			};
			break;
		case constants.MULTI_LESION_SIDE.RIGHT:
			config = {
				cols: [
					{width: 100},
					{
						view: "template",
						id,
						css: "footer-template",
						height: 60,
						template: footerTemplateFunction
					},
				]
			};
			break;
		default:
			config = {};
	}
	return config;
}

function getLeftImageNameLabelID() {
	return ID_LEFT_IMAGE_NAME_LABEL;
}

function getRightImageNameLabelID() {
	return ID_RIGHT_IMAGE_NAME_LABEL;
}

function getTopSliderID() {
	return ID_TOP_SLIDER;
}

function getLeftImageID() {
	return ID_LEFT_IMAGE;
}

function getRightImageID() {
	return ID_RIGHT_IMAGE;
}

function getRightContainerID() {
	return ID_RIGHT_CONTAINER;
}

function getLeftSliderID() {
	return ID_LEFT_SLIDER;
}

function getRightSliderID() {
	return ID_RIGHT_SLIDER;
}

function getLeftFooterID() {
	return ID_LEFT_FOOTER;
}

function getRightFooterID() {
	return ID_RIGHT_FOOTER;
}

function getFullScreenButtonID() {
	return ID_BUTTON_FULL_SCREEN;
}

function getWindowedButtonID() {
	return ID_BUTTON_WINDOWED;
}

function getWindowID() {
	return ID_MULTI_IMAGE_LESION_WINDOW;
}

function getSearchID() {
	return ID_SEARCH;
}

function getPrevPageButtonID() {
	return ID_PREV_PAGE_BUTTON;
}

function getNextPageButtonID() {
	return ID_NEXT_PAGE_BUTTON;
}

function getLeftDropDownFilterID() {
	return ID_LEFT_DROP_DOWN_FILTER;
}

function getRightDropDownFilterID() {
	return ID_RIGHT_DROP_DOWN_FILTER;
}

function getLeftAnchorIconID() {
	return ID_LEFT_ANCHOR_ICON;
}

function getRightAnchorIconID() {
	return ID_RIGHT_ANCHOR_ICON;
}

function getTopPanelID() {
	return ID_TOP_PANEL;
}

function getExpandButtonID() {
	return expandButtonID;
}

function getCollapseButtonID() {
	return collapseButtonID;
}

export default {
	getConfig,
	getLeftImageNameLabelID,
	getRightImageNameLabelID,
	getTopSliderID,
	getLeftSliderID,
	getRightSliderID,
	getLeftFooterID,
	getRightFooterID,
	getRightContainerID,
	getLeftImageID,
	getRightImageID,
	getFullScreenButtonID,
	getWindowedButtonID,
	getWindowID,
	getSearchID,
	getNextPageButtonID,
	getPrevPageButtonID,
	getLeftDropDownFilterID,
	getRightDropDownFilterID,
	getLeftAnchorIconID,
	getRightAnchorIconID,
	getTopPanelID,
	getCollapseButtonID,
	getExpandButtonID,
};
