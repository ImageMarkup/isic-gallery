import appliedFiltersModel from "../../../../models/appliedFilters";
import searchButtonModel from "../../../../services/gallery/searchButtonModel";
import appliedFiltersList from "./appliedFiltersList";

const ID_SEARCH_FIELD = `search-field-id-${webix.uid()}`;
const ID_DOWNLOAD_FILTERED_IMAGES_BUTTON = `download-filtered-images-button-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_LIST = `applied-filters-list-id-${webix.uid()}`;
const ID_CLEAR_ALL_FILTERS_TEMPLATE = `clear-all-filters-template-id-${webix.uid()}`;
const ID_FILTERS_FORM = `filters-form-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_LAYOUT = `filters-applied-filters-layout-id-${webix.uid()}`;
const NAME_FILTER_SCROLL_VIEW = `filterScrollViewName-${webix.uid()}`;
const NAME_SWITCH_BUTTON = `switchButtonName-${webix.uid()}`;
const NAME_SEARCH_FIELD = `searchFieldName-${webix.uid()}`;
const NAME_FILTERS_FORM = `filterFormName-${webix.uid()}`;
const NAME_CLEAR_ALL_FILTERS_TEMPLATE = `clearAllFiltersTemplateName-${webix.uid()}`;
const NAME_DOWNLOAD_FILTERED_IMAGES_BUTTON = `downloadFilteredImagesButtonName-${webix.uid()}`;

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
	};

	const searchField = {
		view: "search",
		icon: "fas fa-search",
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
				const searchInputWidth = $$(ID_SEARCH_FIELD).$width;
				const dataviewMinWidth = 800;
				searchButtonModel.setMinCurrentTargetInnerWidth(dataviewMinWidth + searchInputWidth);
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

	const filtersForm = {
		id: ID_FILTERS_FORM,
		name: NAME_FILTERS_FORM,
		view: "form",
		paddingX: 7,
		margin: 0,
		elements: [] // elements will be set after init, in gallery service
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
		}
	};

	const appliedFiltersView = appliedFiltersList.getMobileConfig(ID_APPLIED_FILTERS_LIST);

	return {
		...config,
		borderless: true,
		rows: [
			switchButton,
			searchField,
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
					{height: 10},
					appliedFiltersView
				]
			},
			filters,
			downloadFilteredImagesButton
		]
	};
}

function getFilterScrollViewName() {
	return NAME_FILTER_SCROLL_VIEW;
}

function getSwitchButtonName() {
	return NAME_SWITCH_BUTTON;
}

function getSearchFieldName() {
	return NAME_SEARCH_FIELD;
}

function getFiltersFormName() {
	return NAME_FILTERS_FORM;
}

function getClearAllFiltersTemplateName() {
	return NAME_CLEAR_ALL_FILTERS_TEMPLATE;
}

function getDownloadFilteredImagesButtonName() {
	return NAME_DOWNLOAD_FILTERED_IMAGES_BUTTON;
}

function isAppliedFiltersListEmpty() {
	const appliedFiltersListView = $$(ID_APPLIED_FILTERS_LIST);
	if (appliedFiltersListView?.count() > 0) {
		return false;
	}
	return true;
}

function getAppliedFiltersLisID() {
	return ID_APPLIED_FILTERS_LIST;
}

function getAppliedFiltersLayoutID() {
	return ID_APPLIED_FILTERS_LAYOUT;
}

export default {
	getConfig,
	getFilterScrollViewName,
	getSwitchButtonName,
	getSearchFieldName,
	getFiltersFormName,
	getClearAllFiltersTemplateName,
	getDownloadFilteredImagesButtonName,
	getAppliedFiltersLisID,
	getAppliedFiltersLayoutID,
	isAppliedFiltersListEmpty
};
