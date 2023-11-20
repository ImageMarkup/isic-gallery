import {JetView} from "webix-jet";

import MobileHeaderService from "app-services/header/mobileHeaderServices";
import menuHandlerService from "app-services/menuHandlers";

import constants from "../../../constants";
import galleryImagesUrls from "../../../models/galleryImagesUrls";
import state from "../../../models/state";
import ajax from "../../../services/ajaxActions";
import authService from "../../../services/auth";
import GalleryService from "../../../services/gallery/gallery";
import logger from "../../../utils/logger";
import util from "../../../utils/util";
import cartList from "./parts/cartList";
import contextMenu from "./parts/contextMenu";
import pager from "./parts/galleryPager";
import metadataPart from "./parts/metadata";
import filterPanel from "./parts/mobileFilterPanel";
import mobileImageWindow from "./windows/mobileImageWindow";

const ID_RIGHT_PANEL = `right-panel-id-${webix.uid()}`;
const ID_PAGER = `gallery-pager-id-${webix.uid()}`;
const ID_FILTER_PANEL = `filter-panel-id-${webix.uid()}`;
const ID_FILTER_LAYOUT = `filter-layout-id-${webix.uid()}`;
const ID_FILTER_HEADER = `filter-header-id-${webix.uid()}`;
const ID_DATAVIEW = `gallery-dataview-id-${webix.uid()}`;
const ID_CONTENT_HEADER = `content-header-id-${webix.uid()}`;
const ID_DATAVIEW_LEFT_BUTTON = `gallery-dataview-left-button-id-${webix.uid()}`;
const ID_DATAVIEW_RIGHT_BUTTON = `gallery-dataview-right-button-id-${webix.uid()}`;
const ID_GALLERY = `gallery-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_HEADER = `mobile-gallery-header-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_BODY = `mobile-gallery-body-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_FOOTER = `mobile-gallery-footer-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_CONTEXT_MENU = `mobile-gallery-context-menu-id-${webix.uid()}`;
const ID_ENLARGE_CONTEXT_MENU = `enlarge-context-menu-id-${webix.uid()}`;
const ID_CLONED_PAGER_FOR_NAME_SEARCH = `cloned-pager-for-name-search-id-${webix.uid()}`;
const ID_IMAGE_WINDOW = `mobile-image-window-${webix.uid()}`;
const ID_METADATA_LAYOUT = `metadata-layout-${webix.uid()}`;
const ID_OPEN_FILTERS_BUTTON = `open-filters-button-id-${webix.uid()}`;
const ID_METADATA_HEADER = `metadata-header-id-${webix.uid()}`;
const ID_GALLERY_PAGER_LAYOUT = `gallery-pager-layout-id-${webix.uid()}`;
const ID_LOGOUT_PANEL = `logout-panel-id-${webix.uid()}`;
const ID_LOGIN_MENU = `login-menu-id-${webix.uid()}`;
const ID_LOGIN_PANEL = `login-panel-id-${webix.uid()}`;

export default class GalleryMobileView extends JetView {
	config() {
		const clonePagerForNameFilter = {
			view: "pager",
			id: ID_CLONED_PAGER_FOR_NAME_SEARCH,
			size: 80,
			hidden: true,
			height: 40,
			template(obj, common) {
				return `${common.prev()} ${common.next()}`;
			}
		};

		const logo = {
			template: "ISIC",
			gravity: 1,
			css: "mobile-gallery-header-logo",
			borderless: true,
			onClick: {
				"mobile-gallery-header-logo": () => menuHandlerService.clickHome()
			}
		};

		const loginMenu = {
			template: "<span class='menu-login login-menu-item'>Login</span> ",
			id: ID_LOGIN_MENU,
			css: "login-menu-mobile",
			borderless: true,
			width: 90,
			onClick: {
				"menu-login": (/* e, id */) => {
					authService.login();
				}
			}
		};

		const loginPanel = {
			id: ID_LOGIN_PANEL,
			cols: [
				loginMenu
			]
		};

		const logoutPanel = {
			id: ID_LOGOUT_PANEL,
			cols: [
			] // cols will be init after auth (after fiering login event on app).
		};

		const userPanel = {
			view: "multiview",
			css: "userbar-mobile userbar",
			gravity: 1,
			cells: [
				loginPanel,
				logoutPanel
			]
		};

		const filterHeaderName = {
			template: "Filters",
			width: 80,
			borderless: true,
			css: "gallery-header-name-panel"
		};

		const metadataHeaderName = {
			width: 110,
			template: "Metadata",
			borderless: true,
			css: "gallery-header-name-panel"
		};

		const openFilterButton = {
			view: "button",
			id: ID_OPEN_FILTERS_BUTTON,
			css: "gallery-header-mobile-button",
			type: "icon",
			width: 40,
			icon: "fas fa-filter",
			click: () => {
				const galleryMultiview = this.getGalleryMultiview();
				galleryMultiview.setValue(ID_FILTER_LAYOUT);
				const galleryHeader = this.getGalleryHeader();
				const filtersHeader = this.getFilterHeader();
				galleryHeader.hide();
				filtersHeader.show(false, true);
			}
		};

		const filteredImagesCountTemplate = {
			id: ID_CONTENT_HEADER,
			css: "gallery-header-mobile-context",
			width: 1,
			template(obj) {
				const result = obj?.filtered ? `(${obj.currentCount})` : "";
				return result;
			},
			borderless: true,
			autoheight: true
		};

		const closeFilterButton = {
			view: "button",
			type: "icon",
			width: 150,
			css: "gallery-header-mobile-button back-to-gallery-button",
			icon: "fas fa-long-arrow-alt-left",
			label: "Back to Gallery",
			click: () => {
				const galleryMultiview = this.getGalleryMultiview();
				galleryMultiview.setValue(ID_GALLERY);
				const galleryHeader = this.getGalleryHeader();
				const filtersHeader = this.getFilterHeader();
				filtersHeader.hide();
				galleryHeader.show(false, true);
				this.updatePagerSize();
			}
		};

		const closeMetadataButton = {
			view: "button",
			type: "icon",
			width: 150,
			css: "gallery-header-mobile-button back-to-gallery-button",
			icon: "fas fa-long-arrow-alt-left",
			label: "Back to Gallery",
			click: () => {
				const galleryMultiview = this.getGalleryMultiview();
				galleryMultiview.setValue(ID_GALLERY);
				const galleryHeader = this.getGalleryHeader();
				const metadataHeader = this.getMetadataHeader();
				metadataHeader.hide();
				galleryHeader.show(false, true);
				this.updatePagerSize();
			}
		};

		const galleryHeader = {
			id: ID_MOBILE_GALLERY_HEADER,
			cols: [
				{width: 20},
				{
					cols: [
						logo,
						{gravity: 1}
					]
				},
				{
					cols: [
						openFilterButton,
						filteredImagesCountTemplate,
						userPanel
					]
				}
			]
		};

		const filterHeader = {
			id: ID_FILTER_HEADER,
			hidden: true,
			cols: [
				{
					cols: [
						closeFilterButton
					]
				},
				{
					cols: [
						{gravity: 0.5},
						filterHeaderName
					]
				},
				{width: 20}
			]
		};

		const metadataHeader = {
			id: ID_METADATA_HEADER,
			hidden: true,
			cols: [
				{
					cols: [
						closeMetadataButton
					]
				},
				{
					cols: [
						{gravity: 0.5},
						metadataHeaderName
					]
				},
				{width: 20}
			]
		};

		const galleryFooter = {
			view: "layout",
			height: 30,
			rows: [{
				id: ID_MOBILE_GALLERY_FOOTER,
				css: "mobile-gallery-footer",
				view: "template",
				height: 30,
				hidden: true,
				template(obj) {
					const imageIconDimensions = util.getImageIconDimensions();
					const diagnosisIcon = obj.hasAnnotations
						? `<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button diagnosis-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#diagnosis-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top" style="z-index: 1000000">Multirater</span>
								</div>`
						: "";
					const html = `<div class="mobile-gallery-images-info">
									<div class="thumbnails-name" style="font-size: 20px">${obj.isic_id}</div>
									<div class="mobile-gallery-images-buttons" style="bottom: ${imageIconDimensions[2]}px;">
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button resize-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#resize-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top" style="display: block">Enlarge</span>
								</div>
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button info-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#info-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top">Metadata</span>
								</div>
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button share-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top">Share</span>
								</div>
								${diagnosisIcon}
								</div>
								</div>`;
					return html;
				},
				onClick: {
					"resize-icon": (/* e, id */) => {
						const galleryDataview = this.getGalleryDataview();
						const currentItem = galleryDataview.getSelectedItem();
						if (this.imageWindow) {
							const templateViewer = $$(mobileImageWindow.getViewerId());
							templateViewer?.setValues({
								imageId: currentItem.isic_id,
								fullFileUrl: currentItem.files?.full?.url
							});
							this.imageWindow.show();
						}
					},
					"info-icon": async (/* e, id */) => {
						try {
							const galleryDataview = this.getGalleryDataview();
							const currentItem = galleryDataview.getSelectedItem();
							const image = await ajax.getImageItem(currentItem.isic_id);
							const metadataLayout = this.getMetadataLayout();
							const galleryHeaderView = this.getGalleryHeader();
							galleryHeaderView.hide();
							const metadataHeaderView = this.getMetadataHeader();
							metadataHeaderView.show();
							if (metadataLayout) {
								webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)], metadataLayout); // [] - because we rebuild only rows of this._imageWindowMetadata
							}
							else {
								webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)]); // [] - because we rebuild only rows of this._imageWindowMetadata
							}
							// this._metadataWindow.show();
							const galleryMultiview = this.getGalleryMultiview();
							galleryMultiview.setValue(ID_METADATA_LAYOUT);
						}
						catch (error) {
							if (!this._view.$destructed) {
								webix.message("ShowMetadata: Something went wrong");
							}
						}
					},
					"share-icon": async (/* e, id */) => {
						const galleryDataview = this.getGalleryDataview();
						const currentItem = galleryDataview.getSelectedItem();
						const currentItemId = currentItem.isic_id;
						const url = new URL(document.location.href);
						url.hash = `#${this.app.getRouter()._prefix}${this.app.getRouter()
							.get()}&image=${currentItemId}`;
						if (url) { // Web Share API is supported
							const title = `Share image ${currentItem.isic_id}`;
							util.shareUrl(title, url);
						}
						else {
							webix.message("Do not have link to share image", "info", 5000);
						}
					}
				}
			}]
		};

		const leftPanelConfig = {
			id: ID_FILTER_PANEL,
			paddingX: 15,
			paddingY: 15,
			margin: 20,
			width: 0
		};

		const leftPanel = {
			id: ID_FILTER_LAYOUT,
			cols: [
				filterPanel.getConfig(leftPanelConfig)
			]
		};
		const rightPanel = cartList.getConfig({cartListID: ID_RIGHT_PANEL});

		const mobileDataview = {
			view: "dataview",
			id: ID_DATAVIEW,
			name: "mobileGalleryImagesDataviewName",
			css: "gallery-images-dataview-mobile",
			scroll: false,
			datathrottle: 500,
			onContext: {},
			template(obj/* , common */) {
				const starHtml = obj.hasAnnotations ? "<span class='webix_icon fas fa-star gallery-images-star-icon'></span>" : "";
				if (typeof galleryImagesUrls.getPreviewImageUrl(obj.isic_id) === "undefined") {
					galleryImagesUrls.setPreviewImageUrl(
						obj.isic_id,
						obj.files.thumbnail_256.url
					); // to prevent sending query more than 1 time
				}
				return `<div class="gallery-images-container-mobile">
					<img src="${galleryImagesUrls.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image-mobile" height="${util.getImageHeight()}" width="${util.getImageWidth()}"/>
					${starHtml}
				</div>`;
			},
			borderless: true,
			type: {
				width: util.getDataviewItemWidth(),
				height: util.getDataviewItemHeight()
			},
			onClick: {
				"gallery-images-container-mobile": function (ev, id) {
					const selectedItem = this.getSelectedItem();
					const currentGalleryFooter = $$(ID_MOBILE_GALLERY_FOOTER);
					if (selectedItem?.id.toString() === id.toString()) {
						this.unselectAll();
						currentGalleryFooter.hide();
					}
					else {
						this.select(id);
						const imageName = this.getItem(id)?.isic_id;
						currentGalleryFooter.parse({isic_id: imageName, id});
						if (!currentGalleryFooter.isVisible()) {
							currentGalleryFooter.show();
						}
					}
				}
			}
		};

		const galleryDataviewLeftButton = {
			id: ID_DATAVIEW_LEFT_BUTTON,
			view: "button",
			type: "icon",
			width: 50,
			height: 0,
			icon: "fas fa-chevron-left"
		};

		const galleryDataviewRightbutton = {
			id: ID_DATAVIEW_RIGHT_BUTTON,
			view: "button",
			type: "icon",
			width: 50,
			height: 0,
			icon: "fas fa-chevron-right"
		};

		const galleryDataviewWithButtons = {
			cols: [
				galleryDataviewLeftButton,
				mobileDataview,
				galleryDataviewRightbutton
			]
		};

		const gallery = {
			id: ID_GALLERY,
			rows: [
				galleryDataviewWithButtons,
				{height: 10},
				galleryFooter,
				{height: 10},
				{
					id: ID_GALLERY_PAGER_LAYOUT,
					cols: [
						pager.getConfig(ID_PAGER, ID_DATAVIEW, true),
						clonePagerForNameFilter
					]
				}
			]
		};

		const metadataLayout = {
			id: ID_METADATA_LAYOUT,
			css: "metadata-layout",
			rows: []
		};

		const multiview = {
			css: "mobile-gallery-main",
			width: 0,
			rows: [
				{height: 10},
				galleryHeader,
				filterHeader,
				metadataHeader,
				{height: 5},
				{
					id: ID_MOBILE_GALLERY_BODY,
					view: "multiview",
					cells: [
						gallery,
						leftPanel,
						rightPanel,
						metadataLayout
					]
				}
			]
		};

		const ui = {
			type: "clean",
			rows: [
				{
					cols: [
						multiview
					]
				}
			]
		};
		return ui;
	}

	init(view) {
		const dataviewInstance = $$(ID_DATAVIEW);
		const filterScrollView = view.queryView({name: filterPanel.getFilterScrollViewName()});
		this.listCollapsedView = this.getCartListCollapsedView();
		this.imageWindow = webix.ui(mobileImageWindow.getConfig(
			ID_IMAGE_WINDOW,
			this.removeParam.bind(this)
		));
		this.metadataWindow = this.getMetadataLayout();
		const contextMenuConfig = contextMenu.getConfig(ID_MOBILE_GALLERY_CONTEXT_MENU);
		this.contextMenu = this.ui(contextMenuConfig);
		const enlargeContextMenuConfig = contextMenu.getConfig(ID_ENLARGE_CONTEXT_MENU);
		this.enlargeContextMenu = this.ui(enlargeContextMenuConfig);
		this.allPagesTemplate = null;
		this.allPagesSelector = null;
		this.galleryHeader = this.getGalleryHeader();
		this.createStudyButton = null;
		this.imagesSelectionTemplate = null;
		this.dataviewYCountSelection = null;
		this.galleryList = this.getGalleryCartList();
		this.toggleButton = this.getToggleButton();
		this.filterPanelSearchField = view.queryView({name: filterPanel.getSearchFieldName()});
		const filtersForm = view.queryView({name: filterPanel.getFiltersFormName()});
		const portraitClearAllFiltersTemplate = this.getPortraitClearAllFiltersTemplate();
		const landscapeClearAllFiltersTemplate = this.getLandscapeClearAllFiltersTemplate();
		const appliedFiltersLayout = this.getAppliedFiltersLayout();
		const downloadSelectedImagesButton = this.getDownloadSelectedImagesButton();
		const imageWindowZoomButtons = $$(mobileImageWindow.getZoomButtonTemplateId());
		const leftLandImageZoomButton = $$(mobileImageWindow.getLeftLandscapeZoomButtonTemplateId());
		const rightLandImageZoomButton = $$(mobileImageWindow.getRightLandscapeZoomButtonTemplateId());
		this.imageWindowTemplate = $$(mobileImageWindow.getViewerId());
		const scrollUpButton = view.queryView({id: filterPanel.getScrollUpButtonID()});
		const scrollDownButton = view.queryView({id: filterPanel.getScrollDownButtonID()});
		const scrollUpLandscapeButton = view.queryView({
			id: filterPanel.getScrollLandscapeUpButtonID()
		});
		const scrollDownLandscapeButton = view.queryView({
			id: filterPanel.getScrollLandscapeDownButtonID()
		});
		const appliedFiltersUpMark = view.queryView({
			id: filterPanel.getAppliedFiltersUpMarkID()
		});
		const appliedFiltersDownMark = view.queryView({
			id: filterPanel.getAppliedFiltersDownMarkID()
		});
		const appliedFiltersUpLandscapeMark = view.queryView({
			id: filterPanel.getAppliedFiltersUpLandscapeMarkID()
		});
		const appliedFiltersDownLandscapeMark = view.queryView({
			id: filterPanel.getAppliedFiltersDownLandscapeMarkID()
		});
		const appliedFiltersList = view.queryView({
			id: filterPanel.getAppliedFiltersListID()
		});
		this._galleryService = new GalleryService(
			view,
			$$(ID_PAGER),
			$$(ID_DATAVIEW),
			$$(ID_CONTENT_HEADER), // contentHeaderTemplate
			this.imageWindow, // imageWindowInstance
			$$(mobileImageWindow.getViewerId()), // imageWindowViewer
			null, // imageWindowMetadata
			null, // metadataWindow
			null, // metadataWindowMetadata
			filtersForm,
			$$(filterPanel.getAppliedFiltersListID()),
			null, // unselectLink
			null, // downloadingMenu
			this.filterPanelSearchField,
			null, // clearAllFiltersTemplate
			null, // allPagesTemplate
			filterScrollView,
			$$(ID_FILTER_PANEL),
			$$(ID_MOBILE_GALLERY_CONTEXT_MENU), // galleryContextMenu
			downloadSelectedImagesButton,
			null, // downloadFilteredImagesButton
			appliedFiltersLayout,
			imageWindowZoomButtons,
			leftLandImageZoomButton,
			rightLandImageZoomButton,
			null, // imageWindowTemplate
			this.imageWindowTemplate,
			this.enlargeContextMenu,
			portraitClearAllFiltersTemplate,
			landscapeClearAllFiltersTemplate
		);

		this.heaaderService = new MobileHeaderService(
			view,
			$$(ID_LOGIN_PANEL),
			$$(ID_LOGOUT_PANEL)
		);
		if (authService.isLoggedin()) {
			this.heaaderService.showLogoutPanel();
		}
		const appliedFiltersListView = $$(filterPanel.getPortraitFiltersListID());
		appliedFiltersListView.data.attachEvent("onAfterDelete", this.filteredListUpdateHandler);
		appliedFiltersListView.attachEvent("onAfterLoad", this.filteredListUpdateHandler);
		appliedFiltersListView.data.attachEvent("onDataUpdate", this.filteredListUpdateHandler);

		const landscapeAppliedFiltersListView = $$(filterPanel.getLandscapeFiltersListID());
		landscapeAppliedFiltersListView.data.attachEvent("onAfterDelete", this.filteredListUpdateHandler);
		landscapeAppliedFiltersListView.attachEvent("onAfterLoad", this.filteredListUpdateHandler);
		landscapeAppliedFiltersListView.data.attachEvent("onDataUpdate", this.filteredListUpdateHandler);

		const currentPager = $$(ID_PAGER);
		const currentGalleryFooter = $$(ID_MOBILE_GALLERY_FOOTER);
		const contentHeader = $$(ID_CONTENT_HEADER);

		currentPager.attachEvent("onItemClick", (id) => {
			switch (id) {
				case "prev":
				case "next":
					$$(ID_DATAVIEW).unselectAll();
					currentGalleryFooter.hide();
					break;
				default:
			}
		});

		dataviewInstance.attachEvent("onAfterLoad", () => {
			const selectItem = dataviewInstance.getSelectedItem();
			if (!selectItem) {
				currentGalleryFooter.hide();
			}
		});

		contentHeader.attachEvent("onBeforeRender", (obj) => {
			const result = obj?.filtered ? `(${obj.currentCount})` : "";
			const currentTemplate = $$(ID_CONTENT_HEADER);
			if (result !== "") {
				currentTemplate?.define("width", 0);
			}
			else {
				currentTemplate?.define("width", 1);
			}
			return true;
		});

		const galleryDataviewLeftButton = $$(ID_DATAVIEW_LEFT_BUTTON);
		galleryDataviewLeftButton?.attachEvent("onItemClick", () => {
			currentPager?.callEvent("onItemClick", ["prev"]);
		});
		const galleryDataviewRightButton = $$(ID_DATAVIEW_RIGHT_BUTTON);
		galleryDataviewRightButton?.attachEvent("onItemClick", () => {
			currentPager?.callEvent("onItemClick", ["next"]);
		});

		const portrait = window.matchMedia("(orientation: portrait)").matches;
		this.showOrHideElementsOnOrientation(portrait);

		const rotateHandler = util.debounce((landscape) => {
			const currentPortrait = !landscape;
			this.showOrHideElementsOnOrientation(currentPortrait);
			this.updatePagerSize();
		}, 1000);
		webix.attachEvent("onRotate", rotateHandler);

		const showOrHideScrollButtons = function () {
			const currentFilterScrollView = view.queryView({name: filterPanel.getFilterScrollViewName()});
			const scrollState = this.getScrollState();
			const scrollBodyHeight = currentFilterScrollView.getBody()?.$height ?? 0;
			if (scrollState.y === scrollBodyHeight - currentFilterScrollView.$height) {
				if (util.isPortrait()) {
					scrollDownButton.hide();
				}
				else {
					scrollDownLandscapeButton.hide();
				}
			}

			if (scrollState.y !== 0) {
				if (util.isPortrait()) {
					scrollUpButton.show();
				}
				else {
					scrollUpLandscapeButton.show();
				}
			}

			if (scrollState.y < scrollBodyHeight - currentFilterScrollView.$height) {
				if (util.isPortrait()) {
					scrollDownButton.show();
				}
				else {
					scrollDownLandscapeButton.show();
				}
			}

			if (scrollState.y === 0) {
				if (util.isPortrait()) {
					scrollUpButton.hide();
				}
				else {
					scrollUpLandscapeButton.hide();
				}
				if (scrollBodyHeight > currentFilterScrollView.$height) {
					if (util.isPortrait()) {
						scrollDownButton.show();
					}
					else {
						scrollDownLandscapeButton.show();
					}
				}
			}
			scrollDownButton.refresh();
			scrollDownLandscapeButton.refresh();
			scrollUpButton.refresh();
			scrollUpLandscapeButton.refresh();
		};

		const scrollDownButtonID = filterPanel.getScrollDownButtonID();
		const scrollUpButtonID = filterPanel.getScrollUpButtonID();
		const scrollDownLandscapeButtonID = filterPanel.getScrollLandscapeDownButtonID();
		const scrollUpLandscapeButtonID = filterPanel.getScrollLandscapeUpButtonID();
		const portraitFilterScrollView = view.queryView({
			name: filterPanel.getPortraitFilterScrollViewName()
		});
		const landscapeFilterScrollView = view.queryView({
			name: filterPanel.getLandscapeFilterScrollViewName()
		});
		const moveScroll = function (id) {
			const currentFilterScrollView = view.queryView({name: filterPanel.getFilterScrollViewName()});
			if (id === scrollDownButtonID) {
				const scrollBodyHeight = currentFilterScrollView.getBody()?.$height ?? 0;
				const filterScrollViewHeight = currentFilterScrollView.$height ?? 0;
				currentFilterScrollView.scrollTo(0, scrollBodyHeight - filterScrollViewHeight);
				scrollDownButton.hide();
				scrollUpButton.show();
			}
			else if (id === scrollUpButtonID) {
				currentFilterScrollView.scrollTo(0, 0);
				scrollDownButton.show();
				scrollUpButton.hide();
			}
			if (id === scrollDownLandscapeButtonID) {
				const scrollBodyHeight = currentFilterScrollView.getBody()?.$height ?? 0;
				const filterScrollViewHeight = currentFilterScrollView.$height ?? 0;
				currentFilterScrollView.scrollTo(0, scrollBodyHeight - filterScrollViewHeight);
				scrollDownLandscapeButton.hide();
				scrollUpLandscapeButton.show();
			}
			if (id === scrollUpLandscapeButtonID) {
				currentFilterScrollView.scrollTo(0, 0);
				scrollDownButton.show();
				scrollUpButton.hide();
			}
			scrollDownButton.refresh();
			scrollUpButton.refresh();
		};

		const portraitAppliedFiltersList = view.queryView({
			id: filterPanel.getPortraitAppliedFiltersListID()
		});

		const landscapeAppliedFiltersList = view.queryView({
			id: filterPanel.getLandscapeAppliedFiltersListID()
		});

		const showOrHideAppliedFiltersMarks = function () {
			const currentAppliedFiltersView = view.queryView({
				id: filterPanel.getAppliedFiltersListID()
			});
			const scrollState = this.getScrollState();
			const scrollBodyHeight = currentAppliedFiltersView.getNode().childNodes[0].clientHeight - 5
				?? 0;

			if (
				currentAppliedFiltersView.getVisibleCount() >= currentAppliedFiltersView.count()
			) {
				if (util.isPortrait()) {
					appliedFiltersDownMark.hide();
					appliedFiltersUpMark.hide();
				}
				else {
					appliedFiltersDownLandscapeMark.hide();
					appliedFiltersUpLandscapeMark.hide();
				}
			}

			else {
				if (scrollState.y >= scrollBodyHeight - currentAppliedFiltersView.$height) {
					if (util.isPortrait()) {
						appliedFiltersDownMark.hide();
					}
					else {
						appliedFiltersDownLandscapeMark.hide();
					}
				}

				if (scrollState.y !== 0) {
					if (util.isPortrait()) {
						appliedFiltersUpMark.show();
					}
					else {
						appliedFiltersUpLandscapeMark.show();
					}
				}

				if (scrollState.y < scrollBodyHeight - currentAppliedFiltersView.$height) {
					if (util.isPortrait()) {
						appliedFiltersDownMark.show();
					}
					else {
						appliedFiltersDownLandscapeMark.show();
					}
				}

				if (scrollState.y === 0) {
					if (util.isPortrait()) {
						appliedFiltersUpMark.hide();
					}
					else {
						appliedFiltersUpLandscapeMark.hide();
					}
				}
			}
			appliedFiltersDownMark.refresh();
			appliedFiltersUpMark.refresh();
			appliedFiltersDownLandscapeMark.refresh();
			appliedFiltersUpLandscapeMark.refresh();
		};

		portraitFilterScrollView.attachEvent("onViewShow", showOrHideScrollButtons);

		portraitFilterScrollView.attachEvent("onAfterScroll", showOrHideScrollButtons);

		landscapeFilterScrollView.attachEvent("onViewShow", showOrHideScrollButtons);

		landscapeFilterScrollView.attachEvent("onAfterScroll", showOrHideScrollButtons);

		scrollDownButton.attachEvent("onItemClick", moveScroll);

		scrollUpButton.attachEvent("onItemClick", moveScroll);

		portraitAppliedFiltersList.attachEvent("onViewShow", showOrHideAppliedFiltersMarks);

		portraitAppliedFiltersList.attachEvent("onAfterScroll", showOrHideAppliedFiltersMarks);

		portraitAppliedFiltersList.attachEvent("onAfterLoad", showOrHideAppliedFiltersMarks);

		landscapeAppliedFiltersList.attachEvent("onViewShow", showOrHideAppliedFiltersMarks);

		landscapeAppliedFiltersList.attachEvent("onAfterScroll", showOrHideAppliedFiltersMarks);

		landscapeAppliedFiltersList.attachEvent("onAfterLoad", showOrHideAppliedFiltersMarks);
	}

	async ready() {
		const initial = true;
		this.updatePagerSize(initial);
		const hiddenLeftPanel = util.getHiddenGalleryLeftPanel();
		if (hiddenLeftPanel) {
			const leftPanelCollapser = this.getLeftPanelWithCollapser().queryView({state: "wasOpened"});
			leftPanelCollapser.config.onClick["collapser-btn"](leftPanelCollapser);
		}
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_GALLERY}]);
		const isTermsOfUseAccepted = await authService.isTermsOfUseAccepted();
		if (isTermsOfUseAccepted) {
			this._galleryService.load();
		}
		else if (util.isMobilePhone()) {
			authService.showMobileTermOfUse(() => {
				this._galleryService.load();
			});
		}

		const that = this;
		const resizeHandler = util.debounce(() => {
			const dataWindowView = that.getGalleryDataview();
			state.imagesOffset = 0;
			dataWindowView.unselectAll();
			dataWindowView.$scope.updatePagerSize();
		});
		this.windowResizeEvent = webix.event(window, "resize", resizeHandler);

		const galleryDataview = this.getGalleryDataview();
		if (!util.isIOS()) {
			this.contextMenu?.attachTo(galleryDataview);
		}
		const imgWindowTemplateView = this.imageWindow.queryView({id: mobileImageWindow.getViewerId()})
			.$view;

		if (!util.isIOS()) {
			this.enlargeContextMenu?.attachTo(imgWindowTemplateView);
			this.enlargeContextMenu?.setContext({obj: this.imageWindowTemplate});
		}
		else {
			this.imageWindowTemplate?.attachEvent("onLongTouch", (context) => {
				if (context?.target?.tagName === "IMG") {
					this.enlargeContextMenu?.setPosition(context.x, context.y);
					this.enlargeContextMenu?.show();
				}
			});
		}

		if (util.isIOS()) {
			const galleryContextMenu = this.contextMenu;
			galleryDataview?.attachEvent("onLongTouch", (context) => {
				if (context?.target?.tagName === "IMG") {
					galleryDataview?.select(context.target.parentNode.parentNode.getAttribute("webix_l_id"));
					galleryContextMenu?.setPosition(context.x, context.y);
					const newContext = galleryDataview.getSelectedItem();
					galleryContextMenu?.setContext(newContext);
					galleryContextMenu?.show();
				}
			});
		}

		const isicId = this.getRoot().$scope.getParam("image");
		if (!util.isMobilePhone()) {
			this.app.show(`${constants.PATH_GALLERY}?image=${isicId}`);
		}
		else if (isicId && isTermsOfUseAccepted) {
			if (this.imageWindow) {
				const currentImage = await ajax.getImageItem(isicId);
				this._galleryService._setImageWindowValues(currentImage);
				this.imageWindow.show();
			}
		}
	}

	destroy() {
		webix.eventRemove(this.windowResizeEvent);
	}

	getCreateStudyButton() {
		return null;
	}

	getDataviewYCountSelection() {
		return null;
	}

	getAllPagesSelector() {
		return null;
	}

	getGalleryHeader() {
		return this.getRoot().queryView({id: ID_MOBILE_GALLERY_HEADER});
	}

	getGalleryCartList() {
		return this.getRoot().queryView({name: cartList.getCartListName()});
	}

	getToggleButton() {
		return null;
	}

	getLeftPanelToggleButton() {
		return this.getRoot().queryView({name: filterPanel.getSwitchButtonName()});
	}

	getClonedPagerForNameSearch() {
		return this.getRoot().queryView({id: ID_CLONED_PAGER_FOR_NAME_SEARCH});
	}

	getCartListCollapsedView() {
		return null;
	}

	getLeftPanelWithCollapser() {
		return null;
	}

	getGalleryDataview() {
		return this.getRoot().queryView({id: ID_DATAVIEW});
	}

	getGalleryEmptySpace() {
		return null;
	}

	getGalleryContextMenu() {
		return this.getRoot().queryView({id: ID_MOBILE_GALLERY_CONTEXT_MENU})
			?? this.$$(ID_MOBILE_GALLERY_CONTEXT_MENU);
	}

	getPortraitClearAllFiltersTemplate() {
		return this.getRoot().queryView({name: filterPanel.getPortraitClearAllFiltersTemplateName()});
	}

	getLandscapeClearAllFiltersTemplate() {
		return this.getRoot().queryView({name: filterPanel.getLandscapeClearAllFiltersTemplateName()});
	}

	getDownloadSelectedImagesButton() {
		return this.getRoot().queryView({name: cartList.getDownloadSelectedImagesButtonName()});
	}

	getFilteredImagesButton() {
		return this.getRoot().queryView({name: filterPanel.getDownloadFilteredImagesButtonName()});
	}

	getGalleryFooter() {
		return this.getRoot().queryView({id: ID_MOBILE_GALLERY_FOOTER});
	}

	getGalleryMultiview() {
		return this.getRoot().queryView({id: ID_MOBILE_GALLERY_BODY});
	}

	getMetadataLayout() {
		return this.getRoot().queryView({id: ID_METADATA_LAYOUT});
	}

	getFilterHeader() {
		return this.getRoot().queryView({id: ID_FILTER_HEADER});
	}

	getMetadataHeader() {
		return this.getRoot().queryView({id: ID_METADATA_HEADER});
	}

	getFiltersForm() {
		return this.getRoot().queryView({name: filterPanel.getFiltersFormName()});
	}

	getAppliedFiltersList() {
		return this.getRoot().queryView({id: filterPanel.getAppliedFiltersListID()});
	}

	getAppliedFiltersLayout() {
		return this.getRoot().queryView({id: filterPanel.getAppliedFiltersLayoutID()});
	}

	filteredListUpdateHandler() {
		const appliedFiltersLayoutView = $$(filterPanel.getAppliedFiltersLayoutID());
		if (filterPanel.isAppliedFiltersListEmpty()) {
			appliedFiltersLayoutView?.hide();
			const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
			openFiltersButtonNode.classList.remove("filtered");
			$$(ID_CONTENT_HEADER).refresh();
		}
		else {
			appliedFiltersLayoutView?.show();
			const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
			openFiltersButtonNode.classList.add("filtered");
			$$(ID_CONTENT_HEADER).refresh();
		}
	}

	updatePagerSize(initial) {
		const currentPager = this.$$(ID_PAGER);
		const dataWindowView = this.getGalleryDataview();
		const galleryDataViewWidth = dataWindowView.$width;
		const galleryDataviewHeight = dataWindowView.$height;
		const cols = 3;
		const maxImageWidth = Math.floor(dataWindowView.$width / cols);
		const maxDataviewHeight = galleryDataviewHeight;
		const maxImageHeight = maxImageWidth;
		const rows = Math.floor(maxDataviewHeight / maxImageHeight) || 1;
		const portrait = window.matchMedia("(orientation: portrait)").matches;
		if (portrait && rows <= 1 && dataWindowView.isVisible()) {
			dataWindowView.getTopParentView().resize();
			this.showOrHideElementsOnOrientation(portrait);
			return;
		}
		else if (!portrait && rows > 2 && dataWindowView.isVisible()) {
			dataWindowView.getTopParentView().resize();
			this.showOrHideElementsOnOrientation(portrait);
			return;
		}
		// we use minus 1 to fix image load bug
		const elementWidth = Math.round(galleryDataViewWidth / cols) - 1;
		const elementHeight = Math.round(galleryDataviewHeight / rows);
		dataWindowView.define("type", {width: elementWidth, height: elementHeight});
		util.setDataviewItemDimensions(elementWidth, elementHeight);
		const imageWidth = galleryDataViewWidth / cols - 15;
		const imageHeight = imageWidth;
		this._galleryService._setDataviewColumns(
			elementWidth,
			elementHeight,
			imageWidth,
			imageHeight
		);
		const newSize = Math.floor(rows * cols);
		if (newSize !== currentPager.data.size) {
			let newOffset = 0;
			currentPager.data.size = newSize;
			galleryImagesUrls.setPrevImagesUrl(null);
			galleryImagesUrls.setNextImagesUrl(null);
			if (!initial) {
				this._galleryService._updateImagesDataview(newOffset, currentPager.data.size);
			}
		}
	}

	async setImageValues(currentItem) {
		this._currentItem = currentItem;
		this._imageWindowViewer?.setValues({imageId: currentItem.isic_id});
		const image = await ajax.getImageItem(currentItem.isic_id);
		if (this._imageWindowMetadata) {
			webix.ui([metadataPart.getConfig("image-window-metadata", image, currentItem)], this._imageWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
		}
		else {
			webix.ui([metadataPart.getConfig("image-window-metadata", image, currentItem)]); // [] - because we rebuild only rows of this._imageWindowMetadata
		}
	}

	showOrHideElementsOnOrientation(portrait) {
		try {
			const imageWindowZoomButtons = $$(mobileImageWindow.getZoomButtonTemplateId());
			const leftLandscapeImageWindowZoomButton = $$(mobileImageWindow.getLeftLandscapeZoomButtonTemplateId());
			const rightLandscapeImageWindowZoomButton = $$(mobileImageWindow.getRightLandscapeZoomButtonTemplateId());
			const currentFilterPanel = $$(ID_FILTER_PANEL);
			const galleryDataview = $$(ID_DATAVIEW);
			const currentGalleryFooter = $$(ID_MOBILE_GALLERY_FOOTER);
			galleryDataview.unselectAll();
			currentGalleryFooter.hide();
			const galleryDataviewLeftButton = $$(ID_DATAVIEW_LEFT_BUTTON);
			const galleryDataviewRightButton = $$(ID_DATAVIEW_RIGHT_BUTTON);
			const galleryPagerLayout = $$(ID_GALLERY_PAGER_LAYOUT);
			const portraitFiltersLayout = currentFilterPanel.queryView({
				id: filterPanel.getPortraitFiltersLayoutID()
			});
			const landscapeFiltersLayout = currentFilterPanel.queryView({
				id: filterPanel.getLandscapeFiltersLayoutID()
			});
			if (portrait) {
				galleryDataviewLeftButton.hide();
				galleryDataviewRightButton.hide();
				galleryPagerLayout.show();
				imageWindowZoomButtons.show();
				leftLandscapeImageWindowZoomButton.hide();
				rightLandscapeImageWindowZoomButton.hide();
				portraitFiltersLayout.show();
				landscapeFiltersLayout.hide();
			}
			else {
				galleryDataviewLeftButton.show();
				galleryDataviewRightButton.show();
				galleryPagerLayout.hide();
				imageWindowZoomButtons.hide();
				leftLandscapeImageWindowZoomButton.show();
				rightLandscapeImageWindowZoomButton.show();
				portraitFiltersLayout.hide();
				landscapeFiltersLayout.show();
			}
			galleryDataview.refresh();
			this.imageWindowTemplate.refresh();
		}
		catch (e) {
			logger.error(e);
		}
		finally {
			this.updatePagerSize();
		}
	}

	removeParam() {
		const image = this.getParam("image");
		if (image) {
			this.setParam("image", "", true);
		}
	}
}
