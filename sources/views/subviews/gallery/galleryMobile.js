import {JetView} from "webix-jet";

import constants from "../../../constants";
import galleryImagesUrls from "../../../models/galleryImagesUrls";
import state from "../../../models/state";
import ajax from "../../../services/ajaxActions";
import authService from "../../../services/auth";
import GalleryService from "../../../services/gallery/gallery";
import util from "../../../utils/util";
import appliedFiltersList from "./parts/appliedFiltersList";
import cartList from "./parts/cartList";
import contextMenu from "./parts/contextMenu";
import filterPanel from "./parts/filterPanel";
import dataview from "./parts/galleryDataview";
import pager from "./parts/galleryPager";
import metadataPart from "./parts/metadata";
import mobileImageWindow from "./windows/mobileImageWindow";

const ID_RIGHT_PANEL = `right-panel-id-${webix.uid()}`;
const ID_PAGER = `gallery-pager-id-${webix.uid()}`;
const ID_FILTER_PANEL = `filter-panel-id-${webix.uid()}`;
const ID_DATAVIEW = `gallery-dataview-id-${webix.uid()}`;
const ID_GALLERY = `gallery-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_HEADER = `mobile-gallery-header-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_BODY = `mobile-gallery-body-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_FOOTER = `mobile-gallery-footer-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_CONTEXT_MENU = `mobile-gallery-context-menu-id-${webix.uid()}`;
const ID_CLONED_PAGER_FOR_NAME_SEARCH = `cloned-pager-for-name-search-id-${webix.uid()}`;
const ID_IMAGE_WINDOW = `mobile-image-window-${webix.uid()}`;
const ID_METADATA_LAYOUT = `metadata-layout-${webix.uid()}`;

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
		const namePanel = {
			template: "Gallery",
			borderless: true,
			css: "gallery-header-name-panel"
		};
		const filterButton = {
			view: "button",
			type: "icon",
			icon: "fas fa-filter",
			click: () => {
				const galleryMultiview = this.getGalleryMultiview();
				if (galleryMultiview.getValue() === ID_FILTER_PANEL) {
					galleryMultiview.setValue(ID_GALLERY);
				}
				else {
					galleryMultiview.setValue(ID_FILTER_PANEL);
				}
			}
		};

		const galleryHeader = {
			id: ID_MOBILE_GALLERY_HEADER,
			cols: [
				namePanel,
				filterButton
			]
		};

		const galleryFooter = {
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
									<span class="gallery-images-button batch-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#batch-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top">Download ZIP</span>
								</div>
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button share-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top">Download ZIP</span>
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
						templateViewer?.setValues({imageId: currentItem.isic_id});
						this.imageWindow.show();
					}
				},
				"info-icon": async (/* e, id */) => {
					try {
						const galleryDataview = this.getGalleryDataview();
						const currentItem = galleryDataview.getSelectedItem();
						const image = await ajax.getImageItem(currentItem.isic_id);
						const metadataLayout = this.getMetadataLayout();
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
				"batch-icon": async (/* e, id */) => {
					const galleryDataview = this.getGalleryDataview();
					const currentItem = galleryDataview.getSelectedItem();
					const currentItemId = currentItem.isic_id;
					const url = await ajax.getDownloadUrl(
						constants.DOWNLOAD_ZIP_SINGLE_IMAGE,
						`isic_id:${currentItemId}`,
						currentItemId
					);
					if (url) {
						util.downloadByLink(url, `${currentItemId}.zip`);
					}
				},
				"share-icon": (/* e, id */) => {
					const galleryDataview = this.getGalleryDataview();
					const currentItem = galleryDataview.getSelectedItem();
					// TODO: implement
				}
			}
		};

		const leftPanelConfig = {
			id: ID_FILTER_PANEL,
			paddingX: 15,
			paddingY: 15,
			margin: 20,
			width: 0
		};

		const leftPanel = filterPanel.getConfig(leftPanelConfig);
		const rightPanel = cartList.getConfig({cartListID: ID_RIGHT_PANEL});

		const mobileDataview = {
			// view: "activeDataview",
			view: "dataview",
			id: ID_DATAVIEW,
			name: "mobileGalleryImagesDataviewName",
			css: "gallery-images-dataview-mobile",
			scroll: false,
			datathrottle: 500,
			onContext: {},
			template(obj/* , common */) {
				// let checkedClass = obj.isic_id === state.mobileSelectedImage ? "is-checked" : "";
				const checkedClass = "";
				// const checkboxInput = obj.markCheckbox
				// 	? '<input type="checkbox" id="scales" name="scales" style="visibility: hidden; width: 0px; height: 0px;" checked>'
				// 	: '<input type="checkbox" id="scales" name="scales" style="visibility: hidden;width: 0px; height: 0px;">';
				const starHtml = obj.hasAnnotations ? "<span class='webix_icon fas fa-star gallery-images-star-icon'></span>" : "";
				if (typeof galleryImagesUrls.getPreviewImageUrl(obj.isic_id) === "undefined") {
					galleryImagesUrls.setPreviewImageUrl(
						obj.isic_id,
						obj.files.thumbnail_256.url
					); // to prevent sending query more than 1 time
				}
				return `<div class="gallery-images-container-mobile gallery-images-container-mobile2">
					<div class="check-layout ${checkedClass}" style="height: ${util.getImageHeight()}px; width: 100%; position: absolute; right:0px; top:${Math.floor((util.getDataviewItemHeight() - util.getImageHeight()) / 2)}px">
						<img src="${galleryImagesUrls.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image" height="${util.getImageHeight()}"/>
						${starHtml}
					</div>
				</div>`;
			},
			borderless: true,
			type: {
				width: util.getDataviewItemWidth(),
				height: util.getDataviewItemHeight()
			},
			onClick: {
				"gallery-images-container-mobile": function (ev, id) {
					this.unselectAll();
					this.select(id);
					const currentGalleryFooter = $$(ID_MOBILE_GALLERY_FOOTER);
					const imageName = this.getItem(id)?.isic_id;
					currentGalleryFooter.parse({isic_id: imageName, id});
					if (state.mobileSelectedImage === imageName) {
						if (currentGalleryFooter.isVisible()) {
							currentGalleryFooter.hide();
						}
						else {
							currentGalleryFooter.show();
						}
					}
					else {
						state.mobileSelectedImage = this.getItem(id)?.isic_id;
						this.refresh(id);
						if (!currentGalleryFooter.isVisible()) {
							currentGalleryFooter.show();
						}
					}
				}
			}
			// activeContent: {
			// 	markCheckbox: {
			// 		view: "checkbox",
			// 		css: "checkbox-ctrl",
			// 		width: 20,
			// 		height: 30,
			// 		on: {
			// 			onChange(value, oldValue) {
			// 				let studyFlag = selectedImages.getStudyFlag();
			// 				const datav = $$(dataview.id);
			// 				const item = datav.getItem(this.config.$masterId);
			// 				if (value
			// 						&& (
			// 							selectedImages.count() >= constants.MAX_COUNT_IMAGES_SELECTION
			// 							|| selectedImages.countForStudies() >= constants.MAX_COUNT_IMAGES_SELECTION
			// 						)
			// 				) {
			// 					datav.updateItem(item.id, {markCheckbox: oldValue});
			// 					webix.alert({
			// 						text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
			// 					});
			// 					return;
			// 				}
			// 				changeSelectedItem(item, value, datav, studyFlag);
			// 			}
			// 		}
			// 	}
			// }
		};

		const gallery = {
			id: ID_GALLERY,
			rows: [
				mobileDataview,
				galleryFooter,
				{
					cols: [
						{width: 10},
						pager.getConfig(ID_PAGER, ID_DATAVIEW, true),
						clonePagerForNameFilter,
						{width: 10}
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
				galleryHeader,
				{height: 5},
				{
					id: ID_MOBILE_GALLERY_BODY,
					view: "multiview",
					cells: [
						// dataview.getConfig(ID_DATAVIEW, true),
						// mobileDataview,
						gallery,
						leftPanel,
						rightPanel,
						metadataLayout
					]
				}
				// galleryFooter,
				// {
				// 	cols: [
				// 		{width: 10},
				// 		pager.getConfig(ID_PAGER, ID_DATAVIEW, true),
				// 		clonePagerForNameFilter,
				// 		{width: 10}
				// 	]
				// }
			]
		};

		const ui = {
			type: "clean",
			rows: [
				{
					cols: [
						multiview
					]
					// galleryFooter
				}
			]
		};
		return ui;
	}

	init(view) {
		// TODO: implement
		// const filterScrollView = view.queryView({name: filterPanel.getFilterScrollViewName()});
		// // this.listCollapsedView = this.getCartListCollapsedView();
		// // this.imageWindow = this.ui(imageWindow.getConfig(ID_IMAGE_WINDOW));
		// this.imageWindow = null;
		// // this.metadataWindow = this.ui(metadataWindow.getConfig(ID_METADATA_WINDOW));
		// this.metadataView = null;
		// const contextMenuConfig = contextMenu.getConfig(ID_MOBILE_GALLERY_CONTEXT_MENU);
		// this.galleryContextMenu = this.ui(contextMenuConfig);
		// // this.allPagesTemplate = this.getSelectAllImagesOnAllPagesTemplate();
		// // this.allPagesSelector = this.getAllPagesSelector();
		// // this.galleryHeader = this.getGalleryHeader();
		// // this.createStudyButton = this.getCreateStudyButton();
		// // this.imagesSelectionTemplate = $$(ID_IMAGES_SELECTION_TEMPLATE);
		// this.imagesSelectionTemplate = null;
		// // this.dataviewYCountSelection = this.getDataviewYCountSelection();
		// // this.activeGalleryList = this.getActiveGalleryCartList();
		// this.galleryList = this.getGalleryCartList();
		// // this.toggleButton = this.getToggleButton();
		// this.filterPanelSearchField = view.queryView({name: filterPanel.getSearchFieldName()});
		// const filtersForm = view.queryView({name: filterPanel.getFiltersFormName()});
		// TODO: mobile service
		// this._galleryService = new GalleryMobileService(
		// 	view,
		// 	$$(ID_PAGER),
		// 	$$(ID_DATAVIEW),
		// 	this.metadataView,
		// 	$$(metadataWindow.getMetadataLayoutId()),
		// 	filtersForm,
		// 	$$(appliedFiltersList.getIdFromConfig()),
		// 	this.imagesSelectionTemplate,
		// 	this.filterPanelSearchField,
		// 	this.allPagesTemplate,
		// 	filterScrollView,
		// 	$$(ID_FILTER_PANEL),
		// 	$$(ID_MOBILE_GALLERY_CONTEXT_MENU)
		// );

		// general variation
		const filterScrollView = view.queryView({name: filterPanel.getFilterScrollViewName()});
		this.listCollapsedView = this.getCartListCollapsedView();
		// this.imageWindow = this.ui(imageWindow.getConfig(ID_IMAGE_WINDOW));
		this.imageWindow = webix.ui(mobileImageWindow.getConfig(ID_IMAGE_WINDOW));
		// this.metadataWindow = this.ui(metadataWindow.getConfig(ID_METADATA_WINDOW));
		this.metadataWindow = this.getMetadataLayout();
		const contextMenuConfig = contextMenu.getConfig(ID_MOBILE_GALLERY_CONTEXT_MENU);
		this.galleryContextMenu = this.ui(contextMenuConfig);
		this.allPagesTemplate = null;
		this.allPagesSelector = null;
		this.galleryHeader = this.getGalleryHeader();
		this.createStudyButton = null;
		this.imagesSelectionTemplate = null;
		this.dataviewYCountSelection = null;
		// this.activeGalleryList = this.getActiveGalleryCartList();
		this.galleryList = this.getGalleryCartList();
		this.toggleButton = this.getToggleButton();
		this.filterPanelSearchField = view.queryView({name: filterPanel.getSearchFieldName()});
		const filtersForm = view.queryView({name: filterPanel.getFiltersFormName()});
		const clearAllFiltersTemplate = this.getClearAllFiltersTemplate();
		const downloadSelectedImagesButton = this.getDownloadSelectedImagesButton();
		const downloadFilteredImagesButton = this.getFilteredImagesButton();
		// TODO: service
		this._galleryService = new GalleryService(
			view,
			$$(ID_PAGER),
			$$(ID_DATAVIEW),
			null, // contentHeaderTemplate
			null, // imageWindowInstance
			null, // imageWindowViewer
			null, // imageWindowMetadata
			null, // metadataWindow
			null, // metadataWindowMetadata
			filtersForm,
			$$(appliedFiltersList.getIdFromConfig()),
			null, // unselectLink
			null, // downloadingMenu
			this.filterPanelSearchField,
			clearAllFiltersTemplate,
			null, // allPagesTemplate
			filterScrollView,
			$$(ID_FILTER_PANEL),
			$$(ID_MOBILE_GALLERY_CONTEXT_MENU), // galleryContextMenu
			downloadSelectedImagesButton,
			downloadFilteredImagesButton
		);
	}

	ready() {
		// TODO: implement
		// const dataviewYCountSelection = this.getDataviewYCountSelection();
		// const yCountSelectionValue = dataviewYCountSelection.getValue();
		// const doNotCallUpdatePager = true;
		// dataviewYCountSelection.callEvent("onChange", [yCountSelectionValue, null, doNotCallUpdatePager]);
		const initial = true;
		this.updatePagerSize(initial);
		const hiddenLeftPanel = util.getHiddenGalleryLeftPanel();
		if (hiddenLeftPanel) {
			const leftPanelCollapser = this.getLeftPanelWithCollapser().queryView({state: "wasOpened"});
			leftPanelCollapser.config.onClick["collapser-btn"](leftPanelCollapser);
		}
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_GALLERY}]);
		if (authService.isTermsOfUseAccepted()) {
			this._galleryService.load();
		}
		else {
			authService.showTermOfUse(() => {
				this._galleryService.load();
			});
		}
		if (authService.isLoggedin()) {
			this.dataviewYCountSelection.show();
			// this.imagesSelectionTemplate.define("maxWidth", 235);
			// TODO uncomment when study will be implemented
			// this.allPagesTemplate.show();
			// this.toggleButton.show();
		}
	}

	destroy() {
		webix.eventRemove(this.windowResizeEvent);
	}

	showList() {
		// TODO: implement
	}

	showFilters() {
		// TODO: implement
	}

	getSelectAllImagesOnAllPagesTemplate() {
		// return this.getRoot().queryView({name: NAME_SELECT_ALL_IMAGES_ON_ALL_PAGES_TEMPLATE});
		return null;
	}

	getCreateStudyButton() {
		// return this.getRoot().queryView({name: "createStudyButtonName"});
		return null;
	}

	getDataviewYCountSelection() {
		// return this.getRoot().queryView({name: "dataviewYCountSelctionName"});
		return null;
	}

	getAllPagesSelector() {
		// return this.getRoot().queryView({name: "allPagesSelector"});
		return null;
	}

	getGalleryHeader() {
		return this.getRoot().queryView({id: ID_MOBILE_GALLERY_HEADER});
	}

	getGalleryCartList() {
		// return this.getRoot().queryView({name: "activeGalleryCartListName"});
		return this.getRoot().queryView({name: cartList.getCartListName()});
	}

	getToggleButton() {
		// return this.getRoot().queryView({name: "toggleSelectAllButtonName"});
		return null;
	}

	getLeftPanelToggleButton() {
		return this.getRoot().queryView({name: filterPanel.getSwitchButtonName()});
	}

	getClonedPagerForNameSearch() {
		return this.getRoot().queryView({id: ID_CLONED_PAGER_FOR_NAME_SEARCH});
	}

	getCartListCollapsedView() {
		// return this.getRoot().queryView({name: "cartListViewCollapsed"});
		return null;
	}

	getLeftPanelWithCollapser() {
		// return this.getRoot().queryView({name: "leftPanelWithCollapser"});
		return null;
	}

	getGalleryDataview() {
		return this.getRoot().queryView({id: ID_DATAVIEW});
	}

	getGalleryEmptySpace() {
		// return this.getRoot().queryView({name: "content-empty-space"});
		return null;
	}

	getGalleryContextMenu() {
		return this.getRoot().queryView({id: ID_MOBILE_GALLERY_CONTEXT_MENU});
	}

	getClearAllFiltersTemplate() {
		return this.getRoot().queryView({name: filterPanel.getClearAllFiltersTemplateName()});
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

	updatePagerSize(initial) {
		const currentPager = this.$$(ID_PAGER);
		const dataWindowView = this.getGalleryDataview();
		const galleryDataViewWidth = dataWindowView.$width;
		const galleryDataviewHeight = dataWindowView.$height;
		const cols = 3;
		// const multiplier = constants.DEFAULT_GALLERY_IMAGE_HEIGHT
		// 	/ constants.DEFAULT_GALLERY_IMAGE_WIDTH;
		const maxImageWidth = Math.floor(dataWindowView.$width / cols);
		const maxDataviewHeight = galleryDataviewHeight;
		const maxImageHeight = maxImageWidth;
		const rows = Math.floor(maxDataviewHeight / maxImageHeight);
		const elementWidth = Math.round(galleryDataViewWidth / cols);
		const elementHeight = Math.round(galleryDataviewHeight / rows);
		dataWindowView.define("type", {width: elementWidth, height: elementHeight});
		util.setDataviewItemDimensions(elementWidth, elementHeight);
		const imageWidth = util.getImageWidth();
		const imageHeight = util.getImageHeight();
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
}
