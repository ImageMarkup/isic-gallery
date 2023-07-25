import {JetView} from "webix-jet";
import WZoom from "vanilla-js-wheel-zoom";

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
import pager from "./parts/galleryPager";
import metadataPart from "./parts/metadata";
import filterPanel from "./parts/mobileFilterPanel";
import mobileImageWindow from "./windows/mobileImageWindow";
import logger from "../../../utils/logger";

const ID_RIGHT_PANEL = `right-panel-id-${webix.uid()}`;
const ID_PAGER = `gallery-pager-id-${webix.uid()}`;
const ID_FILTER_PANEL = `filter-panel-id-${webix.uid()}`;
const ID_FILTER_LAYOUT = `filter-layout-id-${webix.uid()}`;
const ID_FILTER_HEADER = `filter-header-id-${webix.uid()}`;
const ID_DATAVIEW = `gallery-dataview-id-${webix.uid()}`;
const ID_GALLERY = `gallery-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_HEADER = `mobile-gallery-header-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_BODY = `mobile-gallery-body-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_FOOTER = `mobile-gallery-footer-id-${webix.uid()}`;
const ID_MOBILE_GALLERY_CONTEXT_MENU = `mobile-gallery-context-menu-id-${webix.uid()}`;
const ID_CLONED_PAGER_FOR_NAME_SEARCH = `cloned-pager-for-name-search-id-${webix.uid()}`;
const ID_IMAGE_WINDOW = `mobile-image-window-${webix.uid()}`;
const ID_METADATA_LAYOUT = `metadata-layout-${webix.uid()}`;
const ID_OPEN_FILTERS_BUTTON = `open-filters-button-id-${webix.uid()}`;
const ID_METADATA_HEADER = `metadata-header-id-${webix.uid()}`;

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

		const galleryHeaderName = {
			template: "Gallery",
			borderless: true,
			css: "gallery-header-name-panel"
		};

		const filterHeaderName = {
			template: "Filters",
			borderless: true,
			css: "gallery-header-name-panel"
		};

		const metadataHeaderName = {
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

		const closeFilterButton = {
			view: "button",
			type: "icon",
			css: "gallery-header-mobile-button",
			icon: "fas fa-times-circle",
			width: 40,
			click: () => {
				const galleryMultiview = this.getGalleryMultiview();
				galleryMultiview.setValue(ID_GALLERY);
				const galleryHeader = this.getGalleryHeader();
				const filtersHeader = this.getFilterHeader();
				filtersHeader.hide();
				galleryHeader.show(false, true);
			}
		};

		const closeMetadataButton = {
			view: "button",
			type: "icon",
			css: "gallery-header-mobile-button",
			icon: "fas fa-times-circle",
			width: 40,
			click: () => {
				const galleryMultiview = this.getGalleryMultiview();
				galleryMultiview.setValue(ID_GALLERY);
				const galleryHeader = this.getGalleryHeader();
				const metadataHeader = this.getMetadataHeader();
				metadataHeader.hide();
				galleryHeader.show(false, true);
			}
		};

		const galleryHeader = {
			id: ID_MOBILE_GALLERY_HEADER,
			cols: [
				galleryHeaderName,
				openFilterButton
			]
		};

		const filterHeader = {
			id: ID_FILTER_HEADER,
			hidden: true,
			cols: [
				filterHeaderName,
				closeFilterButton
			]
		};

		const metadataHeader = {
			id: ID_METADATA_HEADER,
			hidden: true,
			cols: [
				metadataHeaderName,
				closeMetadataButton
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
						this.imageWindowTemplate?.attachEvent("onAfterRender", () => {
							if (this._imageInstance) {
								this._imageInstance.dispatchEvent(new CustomEvent("wheelzoom.destroy"));
							}
							if (this._imageWindow) {
								this._imageInstance = this._imageWindow.$view.getElementsByClassName("zoomable-image")[0];
							}
							window.wheelzoom(this._imageInstance);
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
				"share-icon": async (/* e, id */) => {
					if (navigator.share) {
						const galleryDataview = this.getGalleryDataview();
						const currentItem = galleryDataview.getSelectedItem();
						const currentItemId = currentItem.isic_id;
						const url = await ajax.getDownloadUrl(
							constants.DOWNLOAD_ZIP_SINGLE_IMAGE,
							`isic_id:${currentItemId}`,
							currentItemId
						);
						if (url) { // Web Share API is supported
							navigator.share({
								title: `Share image ${currentItem.isic_id}`,
								url
							}).then(() => {
								logger("Successful share");
							}).catch((error) => {
								logger(`${error}`);
							});
						}
						else {
							webix.message("Do not have link to share image", "info", 5000);
						}
					}
					else {
						// Fallback
						webix.message("Share is not supported", "info", 5000);
					}
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
				return `<div class="gallery-images-container-mobile gallery-images-container-mobile2">
					<img src="${galleryImagesUrls.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image-mobile" height="${util.getImageHeight()}"/>
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

		const gallery = {
			id: ID_GALLERY,
			rows: [
				mobileDataview,
				{height: 10},
				galleryFooter,
				{height: 10},
				{
					cols: [
						{gravity: 0.5},
						pager.getConfig(ID_PAGER, ID_DATAVIEW, true),
						clonePagerForNameFilter,
						{gravity: 0.5}
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
		this.imageWindow = webix.ui(mobileImageWindow.getConfig(ID_IMAGE_WINDOW));
		this.metadataWindow = this.getMetadataLayout();
		const contextMenuConfig = contextMenu.getConfig(ID_MOBILE_GALLERY_CONTEXT_MENU);
		this.galleryContextMenu = this.ui(contextMenuConfig);
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
		const clearAllFiltersTemplate = this.getClearAllFiltersTemplate();
		const appliedFiltersLayout = this.getAppliedFiltersLayout();
		const downloadSelectedImagesButton = this.getDownloadSelectedImagesButton();
		const downloadFilteredImagesButton = this.getFilteredImagesButton();
		const imageWindowZoomButtons = $$(mobileImageWindow.getZoomButtonTemplateId());
		this.imageWindowTemplate = $$(mobileImageWindow.getViewerId());
		this._galleryService = new GalleryService(
			view,
			$$(ID_PAGER),
			$$(ID_DATAVIEW),
			null, // contentHeaderTemplate
			this.imageWindow, // imageWindowInstance
			null, // imageWindowViewer
			null, // imageWindowMetadata
			null, // metadataWindow
			null, // metadataWindowMetadata
			filtersForm,
			$$(appliedFiltersList.getIdFromMobileConfig()),
			null, // unselectLink
			null, // downloadingMenu
			this.filterPanelSearchField,
			clearAllFiltersTemplate,
			null, // allPagesTemplate
			filterScrollView,
			$$(ID_FILTER_PANEL),
			$$(ID_MOBILE_GALLERY_CONTEXT_MENU), // galleryContextMenu
			downloadSelectedImagesButton,
			downloadFilteredImagesButton,
			appliedFiltersLayout,
			imageWindowZoomButtons,
			this.imageWindowTemplate
		);

		const appliedFiltersListView = $$(filterPanel.getAppliedFiltersLisID());
		const appliedFiltersLayoutView = $$(filterPanel.getAppliedFiltersLayoutID());
		// TODO: move handler to function
		appliedFiltersListView.data.attachEvent("onAfterDelete", () => {
			if (filterPanel.isAppliedFiltersListEmpty()) {
				appliedFiltersLayoutView?.hide();
				const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
				openFiltersButtonNode.classList.remove("filtered");
			}
			else {
				appliedFiltersLayoutView?.show();
				const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
				openFiltersButtonNode.classList.add("filtered");
			}
		});

		appliedFiltersListView.attachEvent("onAfterLoad", () => {
			if (filterPanel.isAppliedFiltersListEmpty()) {
				appliedFiltersLayoutView?.hide();
				const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
				openFiltersButtonNode.classList.remove("filtered");
			}
			else {
				appliedFiltersLayoutView?.show();
				const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
				openFiltersButtonNode.classList.add("filtered");
			}
		});

		appliedFiltersListView.data.attachEvent("onDataUpdate", () => {
			if (filterPanel.isAppliedFiltersListEmpty()) {
				appliedFiltersLayoutView?.hide();
				const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
				openFiltersButtonNode.classList.remove("filtered");
			}
			else {
				appliedFiltersLayoutView?.show();
				const openFiltersButtonNode = $$(ID_OPEN_FILTERS_BUTTON).getNode();
				openFiltersButtonNode.classList.add("filtered");
			}
		});

		const currentPager = $$(ID_PAGER);
		const currentGalleryFooter = $$(ID_MOBILE_GALLERY_FOOTER);
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
		this.imageWindowTemplate?.attachEvent("onAfterRender", () => {
			if (this._imageInstance) {
				this._galleryService.wzoom.destroy();
			}
			if (this.imageWindow) {
				this._imageInstance = this.imageWindow.$view.getElementsByClassName("zoomable-image")[0];
			}
			const wzoomOptions = {
				type: "image",
				maxScale: 5,
				zoomOnClick: false,
				minScale: 1
			};
			this._galleryService.wzoom = WZoom.create(this._imageInstance, wzoomOptions);
			setTimeout(() => {
				this._galleryService.wzoom.transform(0, 0, 1);
			});
		});
		dataviewInstance.attachEvent("onAfterLoad", () => {
			const selectItem = dataviewInstance.getSelectedItem();
			if (!selectItem) {
				currentGalleryFooter.hide();
			}
		});
	}

	ready() {
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
			authService.showMobileTermOfUse(() => {
				this._galleryService.load();
			});
		}
		if (authService.isLoggedin()) {
			this.dataviewYCountSelection.show();
		}
		const that = this;
		const resizeHandler = util.debounce(() => {
			const dataWindowView = that.getGalleryDataview();
			state.imagesOffset = 0;
			dataWindowView.unselectAll();
			dataWindowView.$scope.updatePagerSize();
		});
		this.windowResizeEvent = webix.event(window, "resize", resizeHandler);
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

	getFilterHeader() {
		return this.getRoot().queryView({id: ID_FILTER_HEADER});
	}

	getMetadataHeader() {
		return this.getRoot().queryView({id: ID_METADATA_HEADER});
	}

	getFiltersForm() {
		return this.getRoot().queryView({name: filterPanel.getFiltersFormName()});
	}

	getAppliedFiltersLayout() {
		return this.getRoot().queryView({id: filterPanel.getAppliedFiltersLayoutID()});
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
		const rows = Math.floor(maxDataviewHeight / maxImageHeight);
		const elementWidth = Math.round(galleryDataViewWidth / cols);
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
}
