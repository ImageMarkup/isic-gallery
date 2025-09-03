import appliedFiltersModel from "../../../../models/appliedFilters";
import searchButtonModel from "../../../../services/gallery/searchButtonModel";
import appliedFiltersList from "./appliedFiltersList";
import searchSuggest from "./searchSuggest";

const ID_SEARCH_FIELD = `search-field-id-${webix.uid()}`;
const ID_SEARCH_SUGGESTION = `search-suggestion-id-${webix.uid()}`;
const ID_DOWNLOAD_FILTERED_IMAGES_BUTTON = `download-filtered-images-button-id-${webix.uid()}`;
const ID_APPLIED_FILTERS_LIST = `applied-filters-list-id-${webix.uid()}`;
const ID_CLEAR_ALL_FILTERS_TEMPLATE = `clear-all-filters-template-id-${webix.uid()}`;
const ID_FILTERS_FORM = `filters-form-id-${webix.uid()}`;
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
		css: "gtm-selector switch-search-gallery-button",
		label: "Search by filters",
		labelRight: "Search by name",
		width: 285,
		labelWidth: 112,
		height: 30
	};

	const downloadFilteredImagesButton = {
		view: "button",
		value: "Download ZIP",
		css: "gtm-filtered-download",
		id: ID_DOWNLOAD_FILTERED_IMAGES_BUTTON,
		name: NAME_DOWNLOAD_FILTERED_IMAGES_BUTTON,
		hidden: true
	};

	const searchSuggestConfig = {
		id: ID_SEARCH_SUGGESTION,
		fitMaster: false,
		css: "gtm-search filters-suggest",
	};
	const searchSuggestView = searchSuggest.getConfig(searchSuggestConfig);
	searchSuggestView.body.template = (obj) => {
		if (obj.name) {
			return `${obj.name}: ${obj.value}`;
		}
		return `${obj.value}`;
	};
	searchSuggestView.filter = (obj, value) => {
		const result = `${obj.id}: ${obj.value}`.toLowerCase().includes(value.toLowerCase());
		return result;
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
		suggest: searchSuggestView,
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
				searchValue = searchValue.replace(/\s+/g, " ");
				this.setValue(searchValue);
			}
		}
	};

	const appliedFilters = {
		template: "APPLIED FILTERS",
		css: "gallery-sidebar-title",
		width: 115,
		autoheight: true,
		borderless: true
	};

	const clearAllFiltersTemplate = {
		id: ID_CLEAR_ALL_FILTERS_TEMPLATE,
		name: NAME_CLEAR_ALL_FILTERS_TEMPLATE,
		template: "<span class='link clear-all-filters'>Clear applied filters</span>",
		autoheight: true,
		width: 130,
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

	const filters = {
		view: "scrollview",
		scroll: "y",
		name: NAME_FILTER_SCROLL_VIEW,
		css: "gallery-sidebar-attr",
		body: {
			rows: [
				filtersForm
			]
		}
	};

	return {
		...config,
		rows: [
			{
				cols: [
					{gravity: 1},
					switchButton,
					{gravity: 1}
				]
			},
			searchField,
			{
				margin: 10,
				rows: [
					{
						cols: [
							{width: 10},
							appliedFilters,
							{gravity: 1},
							clearAllFiltersTemplate,
							{width: 10}
						]
					},
					appliedFiltersList.getConfig(ID_APPLIED_FILTERS_LIST)
				]
			},
			downloadFilteredImagesButton,
			filters
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

function getAppliedFiltersListID() {
	return ID_APPLIED_FILTERS_LIST;
}

function getSearchSuggestID() {
	return ID_SEARCH_SUGGESTION;
}

export default {
	getConfig,
	getFilterScrollViewName,
	getSwitchButtonName,
	getSearchFieldName,
	getFiltersFormName,
	getClearAllFiltersTemplateName,
	getDownloadFilteredImagesButtonName,
	getAppliedFiltersListID,
	getSearchSuggestID,
};
