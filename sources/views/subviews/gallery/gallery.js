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


const PAGER_ID = "gallery-pager-id";
const DATAVIEW_ID = "gallery-dataview-id";
const LEFT_PANEL_ID = "gallery-left-panel";
const IMAGE_WINDOW_ID = "image-window-id";
const METADATA_WINDOW_ID = "metadata-window";
const FILTERS_FORM_ID = "filters-form";
const APPLIED_FILTERS_LIST_ID = "applied-filters-list";
const CONTENT_HEADER_ID = "content-header";
const IMAGES_SELECTION_TEMPLATE_ID = "gallery-images-selection-template";
const DOWNLOADING_MENU_ID = "download-menu";
const SEARCH_ID = "search-field";
const CLEAR_ALL_FILTERS_TEMPLATE_ID = "clear-all-template";

export default class GalleryView extends JetView {
	config() {

		const leftPanel = {
			id: LEFT_PANEL_ID,
			width: 400,
			paddingX: 15,
			paddingY: 30,
			margin: 20,
			rows: [
				{
					view: "search",
					id: SEARCH_ID,
					css: "gallery-search-block",
					placeholder: "Search images",
					width: 270
				},
				{
					margin: 10,
					rows: [
						{
							cols: [
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
			id: DOWNLOADING_MENU_ID,
			css: "downloading-menu",
			width: 150,
			height: 36,
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

		const galleryHeader = {
			height: 75,
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
					cols: [
						{
							css: "gallery-main-header",
							id: IMAGES_SELECTION_TEMPLATE_ID,
							template(obj) {
								let text = `<span class='gallery-select-all-images link'> Select All on the Page</span> You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images.`;
								const selectedImagesCount = selectedImages.count();
								if (selectedImagesCount) {
									return `${text} <span class='unselect-images-link link'>Unselect ${selectedImagesCount} ${selectedImagesCount === 1 ? 'image' : "images"}</span>`;
								}
								return text;
							},
							borderless: true,
							autoheight: true
						},
						{width: 15},
						downloadingMenu,
						{width: 15},
						{
							rows: [
								pager.getConfig(PAGER_ID, DATAVIEW_ID),
								{}
							]
						}
					]
				}
			]
		};

		const content = {
			css: "gallery-main",
			paddingX: 15,
			rows: [
				galleryHeader,
				dataview.getConfig(DATAVIEW_ID),
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
			$$(CLEAR_ALL_FILTERS_TEMPLATE_ID)
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
	}
}
