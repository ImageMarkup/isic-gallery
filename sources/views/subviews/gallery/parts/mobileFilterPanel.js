import appliedFiltersModel from "../../../../models/appliedFilters";
import searchButtonModel from "../../../../services/gallery/searchButtonModel";
import appliedFiltersList from "./appliedFiltersList";

const ID_SEARCH_FIELD = `search-field-id-${webix.uid()}`;
const ID_DOWNLOAD_FILTERED_IMAGES_BUTTON = `download-filtered-images-button-id-${webix.uid()}`;
const ID_LANDSCAPE_DOWNLOAD_FILTERED_IMAGES_BUTTON = `landscape-download-filtered-images-button-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_LIST = `applied-filters-list-id-${webix.uid()}`;
const ID_LANDSCAPE_APPLIED_FILTERS_LIST = `landscape-applied-filters-list-id-${webix.uid()}`;
const ID_CLEAR_ALL_FILTERS_TEMPLATE = `clear-all-filters-template-id-${webix.uid()}`;
const ID_LANDSCAPE_CLEAR_ALL_FILTERS_TEMPLATE = `landscape-clear-all-filters-template-id-${webix.uid()}`;
const ID_FILTERS_FORM = `filters-form-id-${webix.uid()}`;
const ID_LANDSCAPE_FILTERS_FORM = `landscape-filters-form-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_LAYOUT = `applied-filters-layout-id-${webix.uid()}`;
const ID_LANDSCAPE_APPLIED_FILTERS_LAYOUT = `landscape-applied-filters-layout-id-${webix.uid()}`;
const ID_SCROLL_UP_BUTTON = `scroll-up-button-id-${webix.uid()}`;
const ID_SCROLL_DOWN_BUTTON = `scroll-down-button-id-${webix.uid()}`;
const ID_SCROLL_LANDSCAPE_UP_BUTTON = `scroll-landscape-up-button-id-${webix.uid()}`;
const ID_SCROLL_LANDSCAPE_DOWN_BUTTON = `scroll-landscape-down-button-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_UP_MARK = `applied-filters-up-mark-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_DOWN_MARK = `applied-filters-down-mark-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_UP_MARK_LANDSCAPE = `applied-filters-up-mark-landscape-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_DOWN_MARK_LANDSCAPE = `applied-filters-down-mark-landscape-id-${webix.uid()}`;
const NAME_FILTER_SCROLL_VIEW = `filterScrollViewName-${webix.uid()}`;
const NAME_LANDSCAPE_FILTER_SCROLL_VIEW = `landscapeFilterScrollViewName-${webix.uid()}`;
const NAME_SWITCH_BUTTON = `switchButtonName-${webix.uid()}`;
const NAME_SEARCH_FIELD = `searchFieldName-${webix.uid()}`;
const NAME_FILTERS_FORM = `filterFormName-${webix.uid()}`;
const NAME_LANDSCAPE_FILTERS_FORM = `landscapeFilterFormName-${webix.uid()}`;
const NAME_CLEAR_ALL_FILTERS_TEMPLATE = `clearAllFiltersTemplateName-${webix.uid()}`;
const NAME_LANDSCAPE_CLEAR_ALL_FILTERS_TEMPLATE = `landscapeClearAllFiltersName-${webix.uid()}`;
const NAME_DOWNLOAD_FILTERED_IMAGES_BUTTON = `downloadFilteredImagesButtonName-${webix.uid()}`;
const NAME_LANDSCAPE_DOWNLOAD_FILTERED_IMAGES_BUTTON = `landscapeDownloadFilteredImagesButtonName-${webix.uid()}`;
const ID_PORTRAIT_FILTERS_LAYOUT = `portrait-filters-layout-${webix.uid()}`;
const ID_LANDSCAPE_FILTERS_LAYOUT = `landscape-filters-layout-${webix.uid()}`;

function getConfig(config) {
	const switchButton = {
		view: "switch",
		name: NAME_SWITCH_BUTTON,
		css: "switch-search-gallery-button",
		label: "Search by filters",
		labelRight: "Search by name",
		width: 285,
		labelWidth: 112,
		height: 30,
		hidden: true
	};

	const downloadFilteredImagesButton = {
		view: "button",
		value: "Download ZIP",
		id: ID_DOWNLOAD_FILTERED_IMAGES_BUTTON,
		name: NAME_DOWNLOAD_FILTERED_IMAGES_BUTTON,
		hidden: true
	};

	const landscapeDownloadFilteredImagesButton = {
		view: "button",
		value: "Download ZIP",
		id: ID_LANDSCAPE_DOWNLOAD_FILTERED_IMAGES_BUTTON,
		name: NAME_LANDSCAPE_DOWNLOAD_FILTERED_IMAGES_BUTTON,
		hidden: true
	};

	const searchField = {
		view: "search",
		icon: "fas fa-search gallery-search-filter",
		id: ID_SEARCH_FIELD,
		name: NAME_SEARCH_FIELD,
		value: `${appliedFiltersModel.getFilterValue()}`,
		css: "gallery-search-block",
		placeholder: "Search images",
		width: 270,
		// hidden for mobile
		hidden: true,
		on: {
			onAfterRender: () => {
				const inputNode = $$(ID_SEARCH_FIELD).$view.getElementsByClassName("webix_el_box")[0];
				const tooltipText = "Clear search value";
				searchButtonModel.createTimesSearchButton(
					$$(ID_SEARCH_FIELD),
					appliedFiltersModel,
					inputNode,
					tooltipText
				);
			},
			onChange() {
				let searchValue = this.getValue();
				searchValue = searchValue.trim();
				searchValue = searchValue.replace(/\s+/g, " ");
				this.setValue(searchValue);
			}
		}
	};

	const appliedFiltersTemplate = {
		gravity: 3,
		template: "APPLIED FILTERS",
		css: "mobile-gallery-sidebar-title",
		autoheight: true,
		borderless: true
	};

	const clearAllFiltersTemplate = {
		id: ID_CLEAR_ALL_FILTERS_TEMPLATE,
		name: NAME_CLEAR_ALL_FILTERS_TEMPLATE,
		template: "<span class='link clear-all-filters clear-all-filters-button fas fa-trash-alt'></span>",
		autoheight: true,
		borderless: true
	};

	const landscapeClearAllFiltersTemplate = {
		id: ID_LANDSCAPE_CLEAR_ALL_FILTERS_TEMPLATE,
		name: NAME_LANDSCAPE_CLEAR_ALL_FILTERS_TEMPLATE,
		template: "<span class='link clear-all-filters clear-all-filters-button fas fa-trash-alt'></span>",
		autoheight: true,
		borderless: true
	};

	const filtersForm = {
		id: ID_FILTERS_FORM,
		name: NAME_FILTERS_FORM,
		css: "gtm-filter",
		view: "form",
		paddingX: 7,
		margin: 0,
		elements: [] // elements will be set after init, in gallery service
	};

	const showUpButton = {
		view: "template",
		id: ID_APPLIED_FILTERS_UP_MARK,
		height: 20,
		template: "<span class='fas fa-angle-up'></span>",
		css: "applied-filters-mark"
	};

	const showDownButton = {
		view: "template",
		id: ID_APPLIED_FILTERS_DOWN_MARK,
		height: 20,
		template: "<span class='fas fa-angle-down'></span>",
		css: "applied-filters-mark"
	};

	const showUpLandscapeButton = {
		view: "template",
		id: ID_APPLIED_FILTERS_UP_MARK_LANDSCAPE,
		height: 20,
		template: "<span class='fas fa-angle-up'></span>",
		css: "applied-filters-mark"
	};

	const showDownLandscapeButton = {
		view: "template",
		id: ID_APPLIED_FILTERS_DOWN_MARK_LANDSCAPE,
		height: 20,
		template: "<span class='fas fa-angle-down'></span>",
		css: "applied-filters-mark"
	};

	const scrollUpButton = {
		view: "button",
		width: 40,
		height: 40,
		css: "filter-scroll-button",
		id: ID_SCROLL_UP_BUTTON,
		type: "icon",
		icon: "fas fa-angle-up",
		hidden: true
	};

	const scrollDownButton = {
		view: "button",
		width: 40,
		height: 40,
		css: "filter-scroll-button",
		id: ID_SCROLL_DOWN_BUTTON,
		type: "icon",
		icon: "fas fa-angle-down",
		hidden: true
	};

	const filters = {
		view: "scrollview",
		scroll: "y",
		name: NAME_FILTER_SCROLL_VIEW,
		css: "gallery-sidebar-attr",
		borderless: true,
		body: {
			rows: [
				filtersForm
			]
		},
		minWidth: 300
	};

	const landscapeFiltersForm = {
		id: ID_LANDSCAPE_FILTERS_FORM,
		name: NAME_LANDSCAPE_FILTERS_FORM,
		css: "gtm-filter",
		view: "form",
		paddingX: 7,
		margin: 0,
		elements: [] // elements will be set after init, in gallery service
	};

	const scrollLandscapeUpButton = {
		view: "button",
		id: ID_SCROLL_LANDSCAPE_UP_BUTTON,
		height: 30,
		type: "icon",
		icon: "fas fa-angle-up",
	};

	const scrollLandscapeDownButton = {
		view: "button",
		id: ID_SCROLL_LANDSCAPE_DOWN_BUTTON,
		height: 30,
		type: "icon",
		icon: "fas fa-angle-down",
	};

	const landscapeFilters = {
		view: "scrollview",
		scroll: "y",
		name: NAME_LANDSCAPE_FILTER_SCROLL_VIEW,
		css: "gallery-sidebar-attr",
		borderless: true,
		body: {
			rows: [
				landscapeFiltersForm
			]
		},
		minWidth: 300
	};

	const appliedFiltersView = appliedFiltersList.getMobileConfig(ID_APPLIED_FILTERS_LIST);
	const landscapeAppliedFiltersView = appliedFiltersList.getLandscapeMobileConfig(
		ID_LANDSCAPE_APPLIED_FILTERS_LIST
	);

	return {
		...config,
		borderless: true,
		rows: [
			switchButton,
			searchField,
			{
				id: ID_PORTRAIT_FILTERS_LAYOUT,
				hidden: true,
				rows: [
					{
						margin: 10,
						id: ID_APPLIED_FILTERS_LAYOUT,
						hidden: true,
						rows: [
							{
								cols: [
									{width: 10},
									appliedFiltersTemplate,
									clearAllFiltersTemplate,
									{width: 10}
								]
							},
							{
								cols: [
									{gravity: 1, height: 20},
									showUpButton,
									{gravity: 1, height: 20}
								]
							},
							appliedFiltersView,
							{
								cols: [
									{gravity: 1, height: 20},
									showDownButton,
									{gravity: 1, height: 20}
								]
							}
						]
					},
					{
						cols: [
							filters,
							{
								rows: [
									scrollUpButton,
									{width: 40},
									scrollDownButton
								]
							}
						]
					},
					downloadFilteredImagesButton
				]
			},
			{
				id: ID_LANDSCAPE_FILTERS_LAYOUT,
				hidden: true,
				cols: [
					{
						gravity: 1.5,
						rows: [
							{
								cols: [
									{gravity: 1, height: 20},
									scrollLandscapeUpButton,
									{gravity: 1, height: 20}
								]
							},
							landscapeFilters,
							{
								cols: [
									{gravity: 1, height: 20},
									scrollLandscapeDownButton,
									{gravity: 1, height: 20}
								]
							},
							landscapeDownloadFilteredImagesButton
						]
					},
					{
						margin: 10,
						id: ID_LANDSCAPE_APPLIED_FILTERS_LAYOUT,
						hidden: true,
						rows: [
							{
								cols: [
									{width: 10},
									appliedFiltersTemplate,
									landscapeClearAllFiltersTemplate,
									{width: 10}
								]
							},
							{height: 10},
							{
								cols: [
									{height: 20, gravity: 1},
									showUpLandscapeButton,
									{height: 20, gravity: 1}
								]
							},
							landscapeAppliedFiltersView,
							{
								cols: [
									{height: 20, gravity: 1},
									showDownLandscapeButton,
									{height: 20, gravity: 1}
								]
							}
						]
					}
				]
			}
		]
	};
}

function getFilterScrollViewName() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	return portrait ? NAME_FILTER_SCROLL_VIEW : NAME_LANDSCAPE_FILTER_SCROLL_VIEW;
}

function getPortraitFilterScrollViewName() {
	return NAME_FILTER_SCROLL_VIEW;
}

function getLandscapeFilterScrollViewName() {
	return NAME_LANDSCAPE_FILTER_SCROLL_VIEW;
}

function getSwitchButtonName() {
	return NAME_SWITCH_BUTTON;
}

function getSearchFieldName() {
	return NAME_SEARCH_FIELD;
}

function getFiltersFormName() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	return portrait ? NAME_FILTERS_FORM : NAME_LANDSCAPE_FILTERS_FORM;
}

function getPortraitFiltersFormName() {
	return NAME_FILTERS_FORM;
}

function getLandscapeFiltersFormName() {
	return NAME_LANDSCAPE_FILTERS_FORM;
}

function getClearAllFiltersTemplateName() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	return portrait ? NAME_CLEAR_ALL_FILTERS_TEMPLATE : NAME_LANDSCAPE_CLEAR_ALL_FILTERS_TEMPLATE;
}

function getPortraitClearAllFiltersTemplateName() {
	return NAME_CLEAR_ALL_FILTERS_TEMPLATE;
}

function getLandscapeClearAllFiltersTemplateName() {
	return NAME_LANDSCAPE_CLEAR_ALL_FILTERS_TEMPLATE;
}

function getDownloadFilteredImagesButtonName() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	return portrait
		? NAME_DOWNLOAD_FILTERED_IMAGES_BUTTON
		: NAME_LANDSCAPE_DOWNLOAD_FILTERED_IMAGES_BUTTON;
}

function isAppliedFiltersListEmpty() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	const appliedFiltersListView = portrait
		? $$(ID_APPLIED_FILTERS_LIST)
		: $$(ID_LANDSCAPE_APPLIED_FILTERS_LIST);
	if (appliedFiltersListView?.count() > 0) {
		return false;
	}
	return true;
}

function getAppliedFiltersListID() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	return portrait ? ID_APPLIED_FILTERS_LIST : ID_LANDSCAPE_APPLIED_FILTERS_LIST;
}

function getPortraitAppliedFiltersListID() {
	return ID_APPLIED_FILTERS_LIST;
}

function getLandscapeAppliedFiltersListID() {
	return ID_LANDSCAPE_APPLIED_FILTERS_LIST;
}

function getPortraitFiltersListID() {
	return ID_APPLIED_FILTERS_LIST;
}

function getLandscapeFiltersListID() {
	return ID_LANDSCAPE_APPLIED_FILTERS_LIST;
}

function getAppliedFiltersLayoutID() {
	const portrait = window.matchMedia("(orientation: portrait)").matches;
	return portrait ? ID_APPLIED_FILTERS_LAYOUT : ID_LANDSCAPE_APPLIED_FILTERS_LAYOUT;
}

function getPortraitFiltersLayoutID() {
	return ID_PORTRAIT_FILTERS_LAYOUT;
}

function getLandscapeFiltersLayoutID() {
	return ID_LANDSCAPE_FILTERS_LAYOUT;
}

function getScrollUpButtonID() {
	return ID_SCROLL_UP_BUTTON;
}

function getScrollDownButtonID() {
	return ID_SCROLL_DOWN_BUTTON;
}

function getScrollLandscapeUpButtonID() {
	return ID_SCROLL_LANDSCAPE_UP_BUTTON;
}

function getScrollLandscapeDownButtonID() {
	return ID_SCROLL_LANDSCAPE_DOWN_BUTTON;
}

function getAppliedFiltersUpMarkID() {
	return ID_APPLIED_FILTERS_UP_MARK;
}

function getAppliedFiltersDownMarkID() {
	return ID_APPLIED_FILTERS_DOWN_MARK;
}

function getAppliedFiltersUpLandscapeMarkID() {
	return ID_APPLIED_FILTERS_UP_MARK_LANDSCAPE;
}

function getAppliedFiltersDownLandscapeMarkID() {
	return ID_APPLIED_FILTERS_DOWN_MARK_LANDSCAPE;
}

export default {
	getConfig,
	getFilterScrollViewName,
	getPortraitFilterScrollViewName,
	getLandscapeFilterScrollViewName,
	getSwitchButtonName,
	getSearchFieldName,
	getFiltersFormName,
	getPortraitFiltersFormName,
	getLandscapeFiltersFormName,
	getClearAllFiltersTemplateName,
	getPortraitClearAllFiltersTemplateName,
	getLandscapeClearAllFiltersTemplateName,
	getDownloadFilteredImagesButtonName,
	getAppliedFiltersListID,
	getPortraitAppliedFiltersListID,
	getLandscapeAppliedFiltersListID,
	getAppliedFiltersLayoutID,
	isAppliedFiltersListEmpty,
	getPortraitFiltersLayoutID,
	getLandscapeFiltersLayoutID,
	getPortraitFiltersListID,
	getLandscapeFiltersListID,
	getScrollUpButtonID,
	getScrollDownButtonID,
	getScrollLandscapeUpButtonID,
	getScrollLandscapeDownButtonID,
	getAppliedFiltersUpMarkID,
	getAppliedFiltersDownMarkID,
	getAppliedFiltersUpLandscapeMarkID,
	getAppliedFiltersDownLandscapeMarkID
};
