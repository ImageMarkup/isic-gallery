import constants from "../../../../constants";
import appliedFiltersModel from "../../../../models/appliedFilters";
import galleryImageUrl from "../../../../models/galleryImagesUrls";
import lesionsModel from "../../../../models/lesionsModel";
import util from "../../../../utils/util";

const ID_MULTI_IMAGE_LESION_WINDOW = `multi-image-lesion-window-id-${webix.uid()}`;
const ID_LEFT_IMAGE_NAME_LABEL = `image-name-id-${webix.uid()}`;
const ID_RIGHT_IMAGE_NAME_LABEL = `image-name-id-${webix.uid()}`;
const ID_LEFT_BUTTON1 = `button1-id-${webix.uid()}`;
const ID_RIGHT_BUTTON1 = `button1-id-${webix.uid()}`;
const ID_LEFT_BUTTON2 = `button2-id-${webix.uid()}`;
const ID_RIGHT_BUTTON2 = `button2-id-${webix.uid()}`;
const ID_LEFT_BUTTON3 = `button3-id-${webix.uid()}`;
const ID_RIGHT_BUTTON3 = `button3-id-${webix.uid()}`;
const ID_TOP_SLIDER = `top-slider-id-${webix.uid()}`;
const ID_PREV_PAGE_BUTTON = `prev-page-button-id-${webix.uid()}`;
const ID_NEXT_PAGE_BUTTON = `next-page-button-id-${webix.uid()}`;
const ID_RESIZER = `resizer-id-${webix.uid()}`;
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

function getConfig(windowTitle, closeCallback) {
	const topSlider = getTopSlider(ID_TOP_SLIDER, ID_PREV_PAGE_BUTTON, ID_NEXT_PAGE_BUTTON);
	const leftSlider = getVerticalSlider(ID_LEFT_SLIDER, "left");
	const rightSlider = getVerticalSlider(ID_RIGHT_SLIDER, "right");

	/** @type {webix.ui.labelConfig} */
	const leftImageLabel = getImageLabel(ID_LEFT_IMAGE_NAME_LABEL);
	const rightImageLabel = getImageLabel(ID_RIGHT_IMAGE_NAME_LABEL);

	/** @type {webix.ui.buttonConfig} */
	const lButton1 = getButtonIconConfig(ID_LEFT_BUTTON1, "fas fa-clock");
	const lButton2 = getButtonIconConfig(ID_LEFT_BUTTON2, "fas fa-newspaper");
	const lButton3 = getButtonIconConfig(ID_LEFT_BUTTON3, "fas fa-layer-group");
	const rButton1 = getButtonIconConfig(ID_RIGHT_BUTTON1, "fas fa-clock");
	const rButton2 = getButtonIconConfig(ID_RIGHT_BUTTON2, "fas fa-newspaper");
	const rButton3 = getButtonIconConfig(ID_RIGHT_BUTTON3, "fas fa-layer-group");

	const anchorIcon = {
		view: "icon",
		width: 20,
		height: 20,
		icon: "fas fa-anchor"
	};

	/** @type {webix.ui.selectConfig} */
	const leftSortDropdown = {
		view: "select",
		id: ID_LEFT_DROP_DOWN_FILTER,
		css: "multilesion-filter-dropdown",
		label: "Sorted by:",
		labelAlign: "left",
		width: 180,
		height: 16,
		labelWidth: 70,
		// TODO: check options
		options: [
			constants.MULTI_LESION_FILTERS.TIME,
			constants.MULTI_LESION_FILTERS.TYPE,
			constants.MULTI_LESION_FILTERS.CONTR_DAY
		]
	};

	const rightSortDropdown = {
		view: "select",
		id: ID_RIGHT_DROP_DOWN_FILTER,
		css: "multilesion-filter-dropdown",
		label: "Sorted by:",
		labelAlign: "left",
		width: 180,
		height: 16,
		labelWidth: 70,
		// TODO: check options
		options: [
			constants.MULTI_LESION_FILTERS.TIME,
			constants.MULTI_LESION_FILTERS.TYPE,
			constants.MULTI_LESION_FILTERS.CONTR_DAY
		]
	};

	const leftTemplateViewer = getTemplateViewer(ID_LEFT_IMAGE, false);

	const rightTemplateViewer = getTemplateViewer(ID_RIGHT_IMAGE, false);

	/** @type {webix.ui.toolbarConfig} */
	const leftToolbar = {
		height: 60,
		cols: [
			{width: 20},
			lButton1,
			lButton2,
			lButton3,
			{width: 20},
			leftImageLabel,
			{width: 5},
			anchorIcon,
			{gravity: 1},
			leftSortDropdown,
			{width: 100}
		]
	};

	/** @type {webix.ui.toolbarConfig} */
	const rightToolbar = {
		height: 60,
		cols: [
			{width: 100},
			rightSortDropdown,
			{gravity: 1},
			rightImageLabel,
			{width: 20},
			rButton1,
			rButton2,
			rButton3,
		]
	};

	const leftFooter = getFooter(ID_LEFT_FOOTER, "left");
	const rightFooter = getFooter(ID_RIGHT_FOOTER, "right");

	const leftImageContainer = {
		css: "container",
		cols: [
			{
				rows: [
					leftToolbar,
					{
						css: "image-panel-container",
						cols: [
							leftTemplateViewer,
						]
					},
					leftFooter
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
						cols: [
							rightTemplateViewer,
						]
					},
					rightFooter
				]
			}
		]
	};

	const resizer = {
		view: "resizer",
		id: ID_RESIZER
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
		move: true,
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
					height: 22,
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
				{
					cols: [
						leftImageContainer,
						resizer,
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
function getTopSlider(id, prevButtonID, nextButtonID) {
	return {
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
				id,
				layout: "x",
				css: "multilesion-top-list",
				scroll: false,
				select: true,
				drag: true,
				height: 134,
				type: {
					height: 104
				},
				template(obj, /* common */) {
					const imageIconDimensions = {
						iconContainerDimensions: {
							width: constants.DEFAULT_GALLERY_IMAGE_ICON_CONTAINER_WIDTH,
							height: constants.DEFAULT_GALLERY_IMAGE_ICON_CONTAINER_HEIGHT
						},
						iconDimensions: {
							width: constants.DEFAULT_GALLERY_IMAGE_ICON_WIDTH,
							height: constants.DEFAULT_GALLERY_IMAGE_ICON_HEIGHT
						}
					};
					const diagnosisIcon = obj.hasAnnotations ?
						`<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
							<span class="gallery-images-button diagnosis-icon tooltip-title">
								<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
									<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#diagnosis-icon" class="gallery-icon-use"></use>
								</svg>
							</span>
							<span class="tooltip-block tooltip-block-top" style="z-index: 1000000">Multirater</span>
						</div>` : "";
					const timePointsIcon = `<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
						<span class="gallery-images-button time-attack tooltip-title">
							<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#time-attack" class="gallery-icon-use"></use>
							</svg>
						</span>
						<span class="gallery-images-badge">${obj.multipleAvailableTimePoints ?? 1}</span>
						<span class="tooltip-block tooltip-block-top" style="display: block">Multiple time points</span>
					</div>`;
					const modalitiesIcon = `<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
						<span class="gallery-images-button layer-group tooltip-title">
							<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#layer-group" class="gallery-icon-use"></use>
							</svg>
						</span>
						<span class="gallery-images-badge">${obj.multipleAvailableModalities ?? 2}</span>
						<span class="tooltip-block tooltip-block-top" style="display: block">Multiple available modalities</span>
					</div>`;
					const totalIcons = `<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
						<span class="gallery-images-button sum-of-sum tooltip-title">
							<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sum-of-sum" class="gallery-icon-use"></use>
							</svg>
						</span>
						<span class="gallery-images-badge">${obj.totalCount ?? 3}</span>
						<span class="tooltip-block tooltip-block-top" style="display: block">Multiple images per lesion</span>
					</div>`;
					const starHtml = obj.hasAnnotations ? "<span class='webix_icon fas fa-star gallery-images-star-icon'></span>" : "";
					if (typeof galleryImageUrl.getPreviewImageUrl(obj.isic_id) === "undefined") {
						galleryImageUrl.setPreviewImageUrl(
							obj.isic_id,
							obj.files.thumbnail_256.url
						); // to prevent sending query more than 1 time
					}
					return `<div class="gallery-images-container" style="height: 104px;">
							<div class='gallery-images-info' style="height: 104px; position: absolute; right:0px;">
								<div class="gallery-images-header">
									<div class="thumbnails-name" style="font-size: ${util.getNewThumnailsNameFontSize()}px">${obj.isic_id}</div>
								</div>
								<div class="gallery-images-buttons" style="bottom: 0px;">
									<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
										<span class="gallery-images-button resize-icon tooltip-title">
											<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
												<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#resize-icon" class="gallery-icon-use"></use>
											</svg>
										</span>
												<span class="tooltip-block tooltip-block-top" style="display: block">Enlarge</span>
									</div>
									<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
										<span class="gallery-images-button info-icon tooltip-title">
											<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
												<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#info-icon" class="gallery-icon-use"></use>
											</svg>
										</span>
										<span class="tooltip-block tooltip-block-top">Metadata</span>
									</div>
									<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
										<span class="gallery-images-button batch-icon tooltip-title">
											<svg viewBox="0 0 14 14" class="gallery-icon-svg" style="width: ${imageIconDimensions.iconDimensions.width}px; height: ${imageIconDimensions.iconDimensions.height}px;">
												<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#batch-icon" class="gallery-icon-use"></use>
											</svg>
										</span>
										<span class="tooltip-block tooltip-block-top">Download ZIP</span>
									</div>
									${diagnosisIcon}
									${timePointsIcon}
									${modalitiesIcon}
									${totalIcons}
								</div>
							</div>
							${starHtml}
							<img src="${galleryImageUrl.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image" height="104px"/>
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
		// width: 62,
		type: {
			width: 62,
			height: 42,
		},
		css: `vertical-slider-${side}`,
		width: 1,
		template(obj, /* common */) {
			const imageIconDimensions = {
				iconContainerDimensions: {
					width: constants.DEFAULT_GALLERY_IMAGE_ICON_CONTAINER_WIDTH / 2,
					height: constants.DEFAULT_GALLERY_IMAGE_ICON_CONTAINER_HEIGHT / 2
				},
				iconDimensions: {
					width: constants.DEFAULT_GALLERY_IMAGE_ICON_WIDTH / 2,
					height: constants.DEFAULT_GALLERY_IMAGE_ICON_HEIGHT / 2
				}
			};
			const anchorIcon = obj.hasAnnotations ?
				`<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions.iconContainerDimensions.width}px; height: ${imageIconDimensions.iconContainerDimensions.height}px;">
					<span class="gallery-images-button diagnosis-icon tooltip-title fas fa-anchor gallery-icon-use"></span>
					<span class="tooltip-block tooltip-block-top" style="z-index: 1000000">Anchor image</span>
				</div>` : "";
			if (typeof galleryImageUrl.getPreviewImageUrl(obj.isic_id) === "undefined") {
				galleryImageUrl.setPreviewImageUrl(
					obj.isic_id,
					obj.files.thumbnail_256.url
				); // to prevent sending query more than 1 time
			}
			return `<div class="gallery-images-container">
					<div class='gallery-images-info' style="height: 44px; position: absolute; right:0px;">
						<div class="gallery-images-buttons" style="bottom: 0px;">
							${anchorIcon}
						</div>
					</div>
					<img src="${galleryImageUrl.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image" height="42px" width="62px"/>
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
function getTemplateViewer(id, showButtons) {
	return {
		view: "template",
		id,
		css: "absolute-centered-image-template",
		template(obj) {
			const imageUrl = galleryImageUrl.getNormalImageUrl(obj.isic_id) || "";
			return `<div class="image-zoom-container">
						<img class= 'zoomable-image' src="${imageUrl}"/>
					</div>
						${showButtons ? '<a class="prev">&#10094;</a><a class="next">&#10095;</a>' : ""}
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
		label: "12345678901234567890"
	};
}

function footerTemplateFunction(obj, /* common */) {
	const lesionID = lesionsModel.getItemLesionID(obj);
	const lesionImagesCount = lesionsModel.getLesionImagesCount(lesionID);
	const lesionTimePointsCount = lesionsModel.getLesionTimePointsCount(lesionID);
	const multipleModalities = lesionsModel.checkMultipleModality(lesionID) ? "Yes" : "No";
	return true
		? `<div class="footer-container">
			<div class="footer-item">
				<span class="footer-item__name">Lesion ID: </span><span class="footer-item__value">${lesionID}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name"># of total lesion images: </span><span class="footer-item__value">${lesionImagesCount}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Number of unique time points: </span><span class="footer-item__value">${lesionTimePointsCount}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Availability of multiple modalities: </span><span class="footer-item__value">${multipleModalities}</span>
			</div>
		</div>`
		: `<div class="footer-container">
			<div class="footer-item">
				<span class="footer-item__name">Lesion ID: </span><span class="footer-item__value">${lesionID}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name"># of total lesion images: </span><span class="footer-item__value">${lesionImagesCount}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Number of unique time points: </span><span class="footer-item__value">${lesionTimePointsCount}</span>
			</div>
			<div class="footer-item">
				<span class="footer-item__name">Availability of multiple modalities: </span><span class="footer-item__value">${multipleModalities}</span>
			</div>
		</div>`;
}

function getFooter(id, side) {
	let config;
	switch (side) {
		case "left":
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
		case "right":
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

function getButtonIconConfig(id, icon) {
	return {
		id,
		icon,
		view: "button",
		type: "icon",
		width: 34,
		height: 34,
	};
}

function getLeftImageNameLabelID() {
	return ID_LEFT_IMAGE_NAME_LABEL;
}

function getRightImageNameLabelID() {
	return ID_RIGHT_IMAGE_NAME_LABEL;
}

function getLeftButton1ID() {
	return ID_LEFT_BUTTON1;
}
function getLeftButton2ID() {
	return ID_LEFT_BUTTON2;
}
function getLeftButton3ID() {
	return ID_LEFT_BUTTON3;
}

function getRightButton1ID() {
	return ID_RIGHT_BUTTON1;
}

function getRightButton2ID() {
	return ID_RIGHT_BUTTON2;
}

function getRightButton3ID() {
	return ID_RIGHT_BUTTON3;
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

function getResizerID() {
	return ID_RESIZER;
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

export default {
	getConfig,
	getLeftImageNameLabelID,
	getRightImageNameLabelID,
	getLeftTimePointButtonID: getLeftButton1ID,
	getLeftModalityButtonID: getLeftButton2ID,
	getLeftTotalButtonID: getLeftButton3ID,
	getRightTimePointButtonID: getRightButton1ID,
	getRightModalityButtonID: getRightButton2ID,
	getRightTotalButtonID: getRightButton3ID,
	getTopSliderID,
	getLeftSliderID,
	getRightSliderID,
	getLeftFooterID,
	getRightFooterID,
	getResizerID,
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
};
