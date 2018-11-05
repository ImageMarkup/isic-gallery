import {JetView} from "webix-jet";
import pager from "./parts/galleryPager";
import collapser from "../../components/collapser";
import dataview from "./parts/galleryDataview";
import GalleryService from "../../../services/gallery/gallery";
import imageWindow from "./windows/imageWindow";
import metadataWindow from "./windows/metadataWindow";
import appliedFiltersList from "./parts/appliedFiltersList";
import constants from "../../../constants";
import authService from "../../../services/auth";
import selectedImages from "../../../models/selectedGalleryImages";
import "../../components/activeList";
import utils from "../../../utils/util";


const PAGER_ID = "gallery-pager-id";
const DATAVIEW_ID = "gallery-dataview-id";
const LEFT_PANEL_ID = "gallery-left-panel";
const IMAGE_WINDOW_ID = "image-window-id";
const METADATA_WINDOW_ID = "metadata-window";
const FILTERS_FORM_ID = "filters-form";
const APPLIED_FILTERS_LIST_ID = "applied-filters-list";
const CONTENT_HEADER_ID = "content-header";
const IMAGES_SELECTION_TEMPLATE_ID = "gallery-images-selection-template";
const DOWNLOADING_MENU_ID = constants.DOWNLOAD_MENU_ID;
const SEARCH_ID = "search-field";
const CLEAR_ALL_FILTERS_TEMPLATE_ID = "clear-all-template";

export default class GalleryView extends JetView {
	config() {
		const clearNamesFilterTemplate = {
			template: "<span class='link clear-name-filters'>Clear name filter</span>",
			name: "clearNamesFilterTemplateName",
			autoheight: true,
			width: 105,
			borderless: true
		};

		const leftPanelSwitchButton = {
			view: "switch",
			name: "leftPanelSwitchButtonName",
			css: "switch-search-gallery-button",
			label: "Search by filters",
			labelRight: "Search by name",
			width: 285,
			labelWidth: 112,
			height: 30
		};

		const leftPanel = {
			id: LEFT_PANEL_ID,
			width: 400,
			paddingX: 15,
			paddingY: 15,
			margin: 20,
			rows: [
				{
					cols: [
						{},
						leftPanelSwitchButton,
						{}
					]
				},
				{
					view: "search",
					id: SEARCH_ID,
					css: "gallery-search-block",
					placeholder: "Search images",
					width: 270
				},
				{
					css: {"margin-left": "0px !important;", "margin-top": "5px !important;"},
					name: "clearNamesFilterLayoutName",
					hidden: true,
					cols: [
						{},
						clearNamesFilterTemplate,
						{width: 9}
					]
				},
				{
					margin: 10,
					css: {"margin-top": "10px !important;"},
					rows: [
						{
							cols: [
								{width: 10},
								{
									template: "APPLIED FILTERS",
									css: "gallery-sidebar-title",
									autoheight: true,
									borderless: true
								},
								{},
								{
									id: CLEAR_ALL_FILTERS_TEMPLATE_ID,
									template: "<span class='link clear-all-filters'>Clear all filters</span>",
									autoheight: true,
									borderless: true
								}
							]
						},
						appliedFiltersList.getConfig(APPLIED_FILTERS_LIST_ID)
					]
				},
				{
					view: "scrollview",
					scroll: "y",
					css: "gallery-sidebar-attr",
					body: {
						rows: [
							{
								id: FILTERS_FORM_ID,
								view: "form",
								paddingX: 7,
								margin: 0,
								elements: []// elements will be setted after init, in gallery service
							}
						]
					}
				}
			]
		};

		const downloadingMenu = {
			view: "menu",
			hidden: true,
			id: DOWNLOADING_MENU_ID,
			css: "downloading-menu",
			width: 150,
			submenuConfig: {
				width: 300
			},
			data: [
				{
					id: "download-menu-item",
					value: "Download as ZIP",
					submenu: [
						{id: constants.ID_MENU_DOWNLOAD_SEL_IMAGES_METADATA, value: "Download Selected Images and Metadata"},
						{id: constants.ID_MENU_DOWNLOAD_SEL_IMAGES, value: "Download Selected Images only"},
						{id: constants.ID_MENU_DOWNLOAD_SEL_METADATA, value: "Download Selected Metadata only"},
						{id: constants.ID_MENU_DOWNLOAD_IMAGES_METADATA, value: "Download Images and Metadata"},
						{id: constants.ID_MENU_DOWNLOAD_IMAGES, value: "Download Images only"},
						{id: constants.ID_MENU_DOWNLOAD_METADATA, value: "Download Metadata only"}
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

		const dataviewYCountSelction = {
			view: "richselect",
			css: "select-field",
			hidden: true,
			name: "dataviewYCountSelctionName",
			id: constants.ID_GALLERY_RICHSELECT,
			width: 245,
			height: 36,
			placeholder: "Select number of columns",
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
			width: 70,
			value: 0
		};

		const galleryHeader = {
			name: "galleryHeaderName",
			rows: [
				{height: 15},
				{
					cols: [
						{
							css: "centered",
							id: CONTENT_HEADER_ID,
							template(obj) {
								const rangeHtml = `Shown images: <b>${obj.rangeStart || ""}</b>-<b>${obj.rangeFinish || ""}</b>.`;
								const totalAmountHtml = `Total amount of images: <b>${obj.totalCount || ""}</b>.`;
								const filterdAmountHtml = `Filtered images: <b>${obj.currentCount || ""}</b>`;
								let result = "";
								if (obj.filtered) {
									result = ` ${filterdAmountHtml} ${totalAmountHtml}`;
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
					css: {"overflow": "visible;"},
					cols: [
						{
							view: "template",
							css: "gallery-main-header",
							id: IMAGES_SELECTION_TEMPLATE_ID,
							template() {
								let text = `<span class='gallery-select-all-images link'> Select All on the Page for Download <span class="tooltipdownload"> You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images for download.</span> </span>`;
								const selectedImagesCount = selectedImages.count();
								if (selectedImagesCount) {
									this.width = 360;
									return `${text} <span class='unselect-images-link link'>Unselect ${selectedImagesCount} ${selectedImagesCount === 1 ? 'image' : "images"}</span>`;
								} else {
									this.width = 240;
								}
								return text;
							},
							borderless: true,
							autoheight: true,
						},
						{width: 15},
						switchView,
						{
							name: "allPagesSelector",
							height: 36,
							css: {"overflow": "visible;"},
							cols: [
								{
									css: "gallery-main-header",
									name: "selectAllImagesOnAllPagesTemplate",
									hidden: true,
									template() {
										let text = `<span class='gallery-select-all-images-on-all-pages link'> Select First ${constants.MAX_COUNT_IMAGES_SELECTION} images for Study Creation<span class="tooltipstudy">You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images for creating a study.</span></span>`;
										const selectedImagesCount = selectedImages.countForStudies();
										if (selectedImagesCount) {
											this.width = 410;
											return `${text} <span class='unselect-images-on-all-pages link'>Unselect ${selectedImagesCount} ${selectedImagesCount === 1 ? 'image' : "images"}</span>`;
										} else {
											this.width = 270;
										}
										return text;
									},
									borderless: true
								},
								{},
								{width: 13},
								dataviewYCountSelction,
								{width: 15},
								pager.getConfig(PAGER_ID, DATAVIEW_ID),
								{width: 10}
							]
						}
					]
				}
			]
		};

		const cartList = {
			view: "activeList",
			css: "cart-list-view",
			hidden: true,
			name: "activeGalleryCartListName",
			width: 170,
			activeContent: {
				deleteButton: {
					view: "button",
					type: "icon",
					icon: "times",
					width: 25,
					height: 25,
					click: (...args) => {
						this.getActiveGalleryCartList().callEvent("onDeleteButtonClick", args);
					}
				}
			}
		};

		const content = {
			css: "gallery-main",
			paddingX: 15,
			rows: [
				galleryHeader,
				{
					cols: [
						dataview.getConfig(DATAVIEW_ID),
						cartList
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

		const leftCollapser = collapser.getConfig(LEFT_PANEL_ID, {
			type: "left"
		});

		const ui = {
			type: "clean",
			rows: [
				{
					cols: [
						leftPanel,
						leftCollapser,
						content
					]
				}
			]
		};
		return ui;
	}

	init(view) {
		this.imageWindow = this.ui(imageWindow.getConfig(IMAGE_WINDOW_ID));
		this.metadataWindow = this.ui(metadataWindow.getConfig(METADATA_WINDOW_ID));
		this.allPagesTemplate = this.getSelectAllImagesOnAllPagesTemplate();
		this.allPagesSelector = this.getAllPagesSelector();
		this.galleryHeader = this.getGalleryHeader();
		this.createStudyButton = this.getCreateStudyButton();
		this.dataviewYCountSelection = this.getDataviewYCountSelection();
		this.activeGalleryList = this.getActiveGalleryCartList();
		this.toggleButton = this.getToggleButton();
		this._galleryService = new GalleryService(
			view,
			$$(PAGER_ID),
			$$(DATAVIEW_ID),
			$$(CONTENT_HEADER_ID),
			this.imageWindow,
			$$(imageWindow.getViewerId()),
			$$(imageWindow.getMetadataLayoutId()),
			this.metadataWindow,
			$$(metadataWindow.getMetadataLayoutId()),
			$$(FILTERS_FORM_ID),
			$$(appliedFiltersList.getIdFromConfig()),
			$$(IMAGES_SELECTION_TEMPLATE_ID),
			$$(DOWNLOADING_MENU_ID),
			$$(SEARCH_ID),
			$$(CLEAR_ALL_FILTERS_TEMPLATE_ID),
			this.allPagesTemplate,
		);
	}

	urlChange() {
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
			if (authService.getUserInfo().permissions.adminStudy){
				this.allPagesTemplate.show();
				this.toggleButton.show();
			}
		}
	}

	getSelectAllImagesOnAllPagesTemplate() {
		return this.getRoot().queryView({name: "selectAllImagesOnAllPagesTemplate"});
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
		return this.getRoot().queryView({name: "galleryHeaderName"});
	}

	getActiveGalleryCartList() {
		return this.getRoot().queryView({name: "activeGalleryCartListName"});
	}

	getToggleButton() {
		return this.getRoot().queryView({name: "toggleSelectAllButtonName"});
	}

	getLeftPanelToggleButton() {
		return this.getRoot().queryView({name: "leftPanelSwitchButtonName"});
	}

	getClearNamesFilterLayout() {
		return this.getRoot().queryView({name: "clearNamesFilterLayoutName"});
	}

	getClearNamesFilterTemplate() {
		return this.getRoot().queryView({name: "clearNamesFilterTemplateName"});
	}

	showList() {
		this.activeGalleryList.show();
		this.changeDataviewYCount();
	}

	hideList() {
		this.activeGalleryList.hide();
		this.changeDataviewYCount();
	}

	changeDataviewYCount() {
		let gallerySelectionId = utils.getDataviewSelectionId();
		if (gallerySelectionId && gallerySelectionId !== constants.DEFAULT_DATAVIEW_COLUMNS) {
			const galleryRichselect = $$(constants.ID_GALLERY_RICHSELECT);
			galleryRichselect.callEvent("onChange", [gallerySelectionId]);
		}
	}

}
