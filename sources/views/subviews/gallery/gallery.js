import {JetView} from "webix-jet";

import constants from "../../../constants";
import "../../components/activeList";
import galleryImagesUrls from "../../../models/galleryImagesUrls";
import selectedImages from "../../../models/selectedGalleryImages";
import authService from "../../../services/auth";
import GalleryService from "../../../services/gallery/gallery";
import searchButtonModel from "../../../services/gallery/searchButtonModel";
import util from "../../../utils/util";
import collapser from "../../components/collapser";
import cartList from "./parts/cartList";
import contextMenu from "./parts/contextMenu";
import filterPanel from "./parts/filterPanel";
import dataview from "./parts/galleryDataview";
import pager from "./parts/galleryPager";
import imageWindow from "./windows/imageWindow";
import metadataWindow from "./windows/metadataWindow";

const ID_PAGER = "gallery-pager-id";
const ID_DATAVIEW = "gallery-dataview-id";
const ID_LEFT_PANEL = constants.ID_GALLERY_LEFT_PANEL;
const ID_IMAGE_WINDOW = "gallery-image-window-id";
const ID_METADATA_WINDOW = "metadata-window";
const ID_CONTENT_HEADER = "content-header";
const ID_IMAGES_SELECTION_TEMPLATE = "gallery-images-selection-template";
const ID_DOWNLOADING_MENU = constants.DOWNLOAD_MENU_ID;
const ID_RIGHT_PANEL = constants.ID_GALLERY_RIGHT_PANEL;
const ID_GALLERY_CONTEXT_MENU = "gallery-context-menu";
const ID_ENLARGE_CONTEXT_MENU = `enlarge-context-menu-id-${webix.uid()}`;
const NAME_GALLERY_HEADER = `galleryHeaderName-${webix.uid()}`;
const NAME_SELECT_ALL_IMAGES_ON_ALL_PAGES_TEMPLATE = `selectAllImagesOnAllPagesTemplateName-${webix.uid()}`;
const NAME_CLONED_PAGER_FOR_NAME_SEARCH = "clonedPagerForNameSearchName";

const tooltipForDataviewTemplatesClassName = constants.TOOLTIP_CLASS_NAME_FOR_DATAVIEW;

export default class GalleryView extends JetView {
	config() {
		const clonePagerForNameFilter = {
			view: "pager",
			name: NAME_CLONED_PAGER_FOR_NAME_SEARCH,
			size: 80,
			hidden: true,
			height: 36,
			width: 250,
			template(obj, common) {
				return `${common.prev()} ${common.next()}`;
			}
		};

		const leftPanelConfig = {
			id: ID_LEFT_PANEL,
			width: 400,
			paddingX: 15,
			paddingY: 15,
			margin: 20
		};

		const leftPanel = filterPanel.getConfig(leftPanelConfig);

		const downloadingMenu = {
			view: "menu",
			hidden: true,
			id: ID_DOWNLOADING_MENU,
			css: "downloading-menu",
			width: 150,
			openAction: "click",
			// TODO: enable when download will be implemented
			disabled: true,
			submenuConfig: {
				width: 300
			},
			data: [
				{
					id: "download-menu-item",
					value: "Download as ZIP",
					submenu: [
						{id: constants.ID_MENU_DOWNLOAD_SEL_IMAGES_METADATA, value: "Download Selected Images and Metadata"},
						// {id: constants.ID_MENU_DOWNLOAD_SEL_IMAGES, value: "Download Selected Images only"},
						{id: constants.ID_MENU_DOWNLOAD_SEL_METADATA, value: "Download Selected Metadata only"},
						{id: constants.ID_MENU_DOWNLOAD_IMAGES_METADATA, value: "Download all Images and Metadata in ISIC Archive"},
						// {id: constants.ID_MENU_DOWNLOAD_IMAGES, value: "Download Images only"},
						{id: constants.ID_MENU_DOWNLOAD_METADATA, value: "Download all Metadata in ISIC Archive"}
					]
				}
			],
			type: {
				subsign: true,
				height: 30,
				width: 150
			}
		};

		const createStudyButton = {
			view: "button",
			css: "btn",
			id: constants.NEW_STUDY_BUTTON_ID,
			label: "Create Study",
			hidden: true,
			name: "createStudyButtonName",
			width: 150,
			height: 30
		};

		const dataviewYCountSelection = {
			view: "richselect",
			css: "select-field gallery-y-count-selection",
			hidden: true,
			name: "dataviewYCountSelctionName",
			id: constants.ID_GALLERY_RICHSELECT,
			width: 225,
			height: 36,
			options: [
				constants.TWO_DATAVIEW_COLUMNS,
				constants.THREE_DATAVIEW_COLUMNS,
				constants.FOUR_DATAVIEW_COLUMNS,
				constants.FIVE_DATAVIEW_COLUMNS,
				constants.SIX_DATAVIEW_COLUMNS,
				constants.DEFAULT_DATAVIEW_COLUMNS
			]
		};

		const switchView = {
			view: "switch",
			hidden: true,
			name: "toggleSelectAllButtonName",
			height: 30,
			css: "gallery-images-switch",
			width: 60,
			value: 0
		};

		const galleryHeader = {
			name: NAME_GALLERY_HEADER,
			rows: [
				{height: 15},
				{
					cols: [
						{
							css: "centered",
							id: ID_CONTENT_HEADER,
							template(obj) {
								const rangeHtml = `Shown images: <b>${obj.rangeStart || ""}</b>-<b>${obj.rangeFinish || ""}</b>.`;
								const totalAmountHtml = `Total amount of images: <b>${obj.totalCount || ""}</b>.`;
								const filteredAmountHtml = `Filtered images: <b>${obj.currentCount || 0}</b>`;
								let result = "";
								if (obj.filtered) {
									result = ` ${filteredAmountHtml} ${totalAmountHtml}`;
									if (obj.rangeFinish - obj.rangeStart < obj.currentCount) {
										result = `${rangeHtml} ${result}`;
									}
								}
								else {
									result = totalAmountHtml;
									if (obj.rangeFinish - obj.rangeStart < obj.totalCount) {
										result = `${rangeHtml} ${result}`;
									}
								}
								return result;
							},
							borderless: true,
							autoheight: true
						}
					]
				},
				{
					css: {overflow: "visible;"},
					cols: [
						{
							view: "template",
							maxWidth: window.innerWidth,
							minWidth: 10,
							css: "gallery-main-header",
							id: ID_IMAGES_SELECTION_TEMPLATE,
							template: () => {
								webix.delay(() => {
									const selectImagesForDownloadTemplateNode = this
										.imagesSelectionTemplate
										.$view
										.firstChild
										.firstChild;
									const tooltipTextForDownload = `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images for download.`;
									searchButtonModel.createHintForSearchTimesButton(
										selectImagesForDownloadTemplateNode,
										tooltipForDataviewTemplatesClassName,
										tooltipTextForDownload
									);
								});
								const text = "<span class='gallery-select-all-images link'> Select All on the Page for Download</span>";
								const selectedImagesCount = selectedImages.count();
								if (selectedImagesCount) {
									return `${text} <span class='unselect-images-link link'><br>Unselect ${selectedImagesCount} ${selectedImagesCount === 1 ? "image" : "images"}</span>`;
								}
								return text;
							},
							borderless: true,
							autoheight: true
						},
						{
							rows: [
								switchView
							]
						},
						{
							name: "allPagesSelector",
							css: {overflow: "visible !important;"},
							cols: [
								{
									view: "template",
									css: "gallery-main-header",
									name: NAME_SELECT_ALL_IMAGES_ON_ALL_PAGES_TEMPLATE,
									hidden: true,
									template: () => {
										webix.delay(() => {
											const selectImagesForStudyCreationTemplateNode = this
												.allPagesTemplate
												.$view
												.firstChild
												.firstChild;
											const tooltipTextForStudy = `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images for creating a study.`;
											searchButtonModel.createHintForSearchTimesButton(
												selectImagesForStudyCreationTemplateNode,
												tooltipForDataviewTemplatesClassName,
												tooltipTextForStudy
											);
										});
										const text = `<span class='gallery-select-all-images-on-all-pages link'> Select First ${constants.MAX_COUNT_IMAGES_SELECTION} images for Study Creation</span>`;
										const selectedImagesCount = selectedImages.countForStudies();
										if (selectedImagesCount) {
											return `${text} <span class='unselect-images-on-all-pages link'><br>Unselect ${selectedImagesCount} ${selectedImagesCount === 1 ? "image" : "images"}</span>`;
										}
										return text;
									},
									autoheight: true,
									borderless: true
								}
							]
						},
						{width: 13},
						dataviewYCountSelection,
						{width: 15},
						pager.getConfig(ID_PAGER, ID_DATAVIEW),
						clonePagerForNameFilter,
						{width: 10}
					]
				}
			]
		};

		const rightPanel = cartList.getConfig({cartListID: ID_RIGHT_PANEL});

		const cartListCollapser = collapser.getConfig(ID_RIGHT_PANEL, {
			type: "right",
			closed: false
		});

		const content = {
			css: "gallery-main",
			paddingX: 15,
			rows: [
				galleryHeader,
				{height: 5},
				{
					name: "galleryBodyName",
					cols: [
						dataview.getConfig(ID_DATAVIEW),
						{
							name: "cartListViewCollapsed",
							hidden: true,
							cols: [
								cartListCollapser,
								rightPanel
							]
						},
						{name: "content-empty-space", gravity: 0}
					]
				},
				{height: 10},
				{
					id: constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID,
					height: 1,
					cols: [
						{width: 10},
						createStudyButton,
						downloadingMenu,
						{}
					]
				},
				{height: 10}
			]

		};

		const leftCollapser = collapser.getConfig(ID_LEFT_PANEL, {
			type: "left"
		});

		const leftPanelWithCollapser = {
			name: "leftPanelWithCollapser",
			cols: [
				leftPanel,
				leftCollapser
			]
		};

		const ui = {
			type: "clean",
			rows: [
				{
					cols: [
						leftPanelWithCollapser,
						content
					]
				}
			]
		};
		return ui;
	}

	init(view) {
		const filterScrollView = view.queryView({name: filterPanel.getFilterScrollViewName()});
		this.listCollapsedView = this.getCartListCollapsedView();
		this.imageWindow = this.ui(imageWindow.getConfig(
			ID_IMAGE_WINDOW,
			null,
			this.removeParam.bind(this)
		));
		this.metadataWindow = this.ui(metadataWindow.getConfig(ID_METADATA_WINDOW));
		const contextMenuConfig = contextMenu.getConfig(ID_GALLERY_CONTEXT_MENU);
		this.galleryContextMenu = this.ui(contextMenuConfig);
		const enlargeContextMenuConfig = contextMenu.getConfig(ID_ENLARGE_CONTEXT_MENU);
		this.enlargeContextMenu = this.ui(enlargeContextMenuConfig);
		this.allPagesTemplate = this.getSelectAllImagesOnAllPagesTemplate();
		this.allPagesSelector = this.getAllPagesSelector();
		this.createStudyButton = this.getCreateStudyButton();
		this.imagesSelectionTemplate = $$(ID_IMAGES_SELECTION_TEMPLATE);
		this.dataviewYCountSelection = this.getDataviewYCountSelection();
		this.filterPanelSearchField = view.queryView({name: filterPanel.getSearchFieldName()});
		const filtersForm = view.queryView({name: filterPanel.getFiltersFormName()});
		const clearAllFiltersTemplate = this.getClearAllFiltersTemplate();
		const downloadSelectedImagesButton = this.getDownloadSelectedImagesButton();
		const downloadFilteredImagesButton = this.getFilteredImagesButton();
		const imageWindowZoomButtons = $$(imageWindow.getZoomButtonTemplateId());
		const imageWindowTemplate = $$(imageWindow.getViewerId());
		const imageWindowTemplateWithoutControls = $$(imageWindow.getViewerWithoutControlsId());
		this._galleryService = new GalleryService(
			view,
			$$(ID_PAGER),
			$$(ID_DATAVIEW),
			$$(ID_CONTENT_HEADER),
			this.imageWindow,
			$$(imageWindow.getViewerId()),
			$$(imageWindow.getMetadataLayoutId()),
			this.metadataWindow,
			$$(metadataWindow.getMetadataLayoutId()),
			filtersForm,
			this.getAppliedFiltersList(),
			this.imagesSelectionTemplate,
			$$(ID_DOWNLOADING_MENU),
			this.filterPanelSearchField,
			clearAllFiltersTemplate,
			this.allPagesTemplate,
			filterScrollView,
			$$(ID_LEFT_PANEL),
			$$(ID_GALLERY_CONTEXT_MENU),
			downloadSelectedImagesButton,
			downloadFilteredImagesButton,
			null,
			imageWindowZoomButtons,
			null, // leftLandImageWindowZoomButton
			null, // rightLandImageWindowZoomButton
			imageWindowTemplate,
			imageWindowTemplateWithoutControls,
			this.enlargeContextMenu
		);
	}

	async ready() {
		const image = this.getRoot().$scope.getParam("image");
		if (util.isMobilePhone()) {
			this.app.show(`${constants.PATH_GALLERY_MOBILE}?image=${image}`);
		}
		const dataviewYCountSelection = this.getDataviewYCountSelection();
		const yCountSelectionValue = dataviewYCountSelection.getValue();
		const doNotCallUpdatePager = true;
		dataviewYCountSelection.callEvent("onChange", [yCountSelectionValue, null, doNotCallUpdatePager]);
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
		else if (!util.isMobilePhone()) {
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

		const that = this;
		const resizeHandler = util.debounce(() => {
			const galleryBodyWidth = that.getGalleryBody().$width;
			const dataWindowView = that.getGalleryDataview();
			const leftPanelWithCollapser = that.getLeftPanelWithCollapser();
			const galleryEmptySpace = that.getGalleryEmptySpace();
			if (window.innerWidth < leftPanelWithCollapser.$width + galleryBodyWidth) {
				galleryEmptySpace.config.gravity = 1;
				dataWindowView.config.width = window.innerWidth - leftPanelWithCollapser.$width - 40;
				galleryEmptySpace.config.width = galleryBodyWidth - dataWindowView.config.width;
				dataWindowView.resize();
				galleryEmptySpace.resize();
			}
			else {
				galleryEmptySpace.config.gravity = 0;
				dataWindowView.config.width = 0;
				galleryEmptySpace.config.width = 0;
				dataWindowView.resize();
				galleryEmptySpace.resize();
			}
		});
		this.windowResizeEvent = webix.event(window, "resize", resizeHandler);
		const galleryDataview = this.getGalleryDataview();
		this.galleryContextMenu.attachTo(galleryDataview);
		if (util.isMobilePhone()) {
			this.app.show(`${constants.PATH_GALLERY_MOBILE}?image=${image}`);
		}
		else if (image) {
			if (this.imageWindow) {
				const templateViewer = $$(imageWindow.getViewerId());
				templateViewer?.setValues({imageId: image});
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
		}
		const imgTemplateView = this.imageWindow.queryView({id: imageWindow.getViewerId()}).$view;
		this.enlargeContextMenu.attachTo(imgTemplateView);
		this.enlargeContextMenu.setContext(
			{
				obj: this.imageWindowTemplate
			}
		);
		// this.galleryContextMenu.attachTo(galleryDataview.$view);
	}

	destroy() {
		webix.eventRemove(this.windowResizeEvent);
	}

	getSelectAllImagesOnAllPagesTemplate() {
		return this.getRoot().queryView({name: NAME_SELECT_ALL_IMAGES_ON_ALL_PAGES_TEMPLATE});
	}

	getCreateStudyButton() {
		return this.getRoot().queryView({name: "createStudyButtonName"});
	}

	getDataviewYCountSelection() {
		return this.getRoot().queryView({name: "dataviewYCountSelctionName"});
	}

	getAllPagesSelector() {
		return this.getRoot().queryView({name: "allPagesSelector"});
	}

	getGalleryHeader() {
		return this.getRoot().queryView({name: NAME_GALLERY_HEADER});
	}

	getGalleryCartList() {
		return this.getRoot().queryView({name: cartList.getCartListName()});
	}

	getToggleButton() {
		return this.getRoot().queryView({name: "toggleSelectAllButtonName"});
	}

	getLeftPanelToggleButton() {
		return this.getRoot().queryView({name: filterPanel.getSwitchButtonName()});
	}

	getClonedPagerForNameSearch() {
		return this.getRoot().queryView({name: NAME_CLONED_PAGER_FOR_NAME_SEARCH});
	}

	getCartListCollapsedView() {
		return this.getRoot().queryView({name: "cartListViewCollapsed"});
	}

	getLeftPanelWithCollapser() {
		return this.getRoot().queryView({name: "leftPanelWithCollapser"});
	}

	getGalleryBody() {
		return this.getRoot().queryView({name: "galleryBodyName"});
	}

	getGalleryDataview() {
		return this.getRoot().queryView({name: "galleryImagesDataviewName"});
	}

	getGalleryEmptySpace() {
		return this.getRoot().queryView({name: "content-empty-space"});
	}

	getGalleryContextMenu() {
		return this.getRoot().queryView({id: ID_GALLERY_CONTEXT_MENU});
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

	getAppliedFiltersList() {
		return this.getRoot().queryView({id: filterPanel.getAppliedFiltersListID()});
	}

	getFiltersForm() {
		return this.getRoot().queryView({name: filterPanel.getFiltersFormName()});
	}

	showList(afterInit) {
		let collapserState;
		let wasCollapsedListClosed = util.getHiddenGalleryCartList();
		if (wasCollapsedListClosed && afterInit) {
			collapserState = "wasOpened";
		}
		else {
			collapserState = "wasClosed";
		}
		this.listCollapsedView.show();
		const listCollapser = this.listCollapsedView.queryView({state: collapserState});
		listCollapser.config.onClick["collapser-btn"](listCollapser);
	}

	hideList() {
		this.listCollapsedView.hide();
		this.changeDataviewYCount();
	}

	changeDataviewYCount() {
		let gallerySelectionId = util.getDataviewSelectionId();
		const galleryRichselect = $$(constants.ID_GALLERY_RICHSELECT);
		const doNotCallUpdatePager = true;
		galleryRichselect.callEvent("onChange", [gallerySelectionId, null, doNotCallUpdatePager]);
	}

	updatePagerSize(initial) {
		const currentPager = this.$$(ID_PAGER);
		const dataWindowView = this.getGalleryDataview();
		let galleryDataviewWidth = dataWindowView.$width;
		const dataviewYCountSelection = this.getDataviewYCountSelection();
		const galleryDataviewHeight = dataWindowView.$height;
		const galleryLeftPanel = this.getLeftPanelWithCollapser();
		const galleryRightPanel = this.getCartListCollapsedView();
		const galleryCartList = this.getGalleryCartList();
		let cols = 1;
		const yCountSelectionValue = dataviewYCountSelection.getValue();
		let multiplier = constants.DEFAULT_GALLERY_IMAGE_HEIGHT / constants.DEFAULT_GALLERY_IMAGE_WIDTH;
		switch (yCountSelectionValue) {
			case constants.TWO_DATAVIEW_COLUMNS: {
				cols = 2;
				break;
			}
			case constants.THREE_DATAVIEW_COLUMNS: {
				cols = 3;
				break;
			}
			case constants.FOUR_DATAVIEW_COLUMNS: {
				cols = 4;
				break;
			}
			case constants.FIVE_DATAVIEW_COLUMNS: {
				cols = 5;
				break;
			}
			case constants.SIX_DATAVIEW_COLUMNS: {
				cols = 6;
				break;
			}
			case constants.DEFAULT_DATAVIEW_COLUMNS: {
				const minGalleryWidth = window.innerWidth
					- this.$$(ID_LEFT_PANEL).config.width
					- galleryCartList.config.width;
				cols = Math.floor(minGalleryWidth / constants.DEFAULT_GALLERY_IMAGE_WIDTH);
				break;
			}
			default: {
				break;
			}
		}
		const currentCol = Math.floor(galleryDataviewWidth / dataWindowView.type.width);
		const maxGalleryWidth = galleryDataviewWidth
			+ galleryLeftPanel.$width
			+ (galleryRightPanel?.isVisible() ? galleryRightPanel?.$width : 0);
		const maxImageWidth = Math.floor(maxGalleryWidth / cols);
		const downloadingMenu = this.$$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
		const maxDataviewHeight = galleryDataviewHeight
			+ (downloadingMenu.isVisible() ? downloadingMenu.$height : 0);
		const maxImageHeight = Math.floor(maxImageWidth * multiplier);
		const rows = Math.floor(maxDataviewHeight / maxImageHeight);
		const elementWidth = util.getDataviewItemWidth();
		const elementHeight = Math.round(galleryDataviewHeight / rows);
		dataWindowView.define("type", {width: elementWidth, height: elementHeight});
		util.setDataviewItemDimensions(elementWidth, elementHeight);
		if (currentCol !== cols) {
			const doNotCallUpdatePager = true;
			dataviewYCountSelection.callEvent(
				"onChange",
				[yCountSelectionValue, null, doNotCallUpdatePager]
			);
		}
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

	removeParam() {
		const image = this.getParam("image");
		if (image) {
			this.setParam("image", "", true);
		}
	}
}
