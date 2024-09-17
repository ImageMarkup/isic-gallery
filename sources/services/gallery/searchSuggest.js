import constants from "../../constants";
import appliedFiltersModel from "../../models/appliedFilters";
import util from "../../utils/util";

function attachEvents(searchSuggest, searchInput, toggleButton) {
	const suggestList = searchSuggest.getList();

	const foundCountTemplateID = webix.uid();

	const foundCountTemplateConfig = {
		view: "template",
		css: "gallery__filter_suggest_result-template",
		id: foundCountTemplateID,
		template: obj => `Found ${obj.count} items`,
	};

	const foundCountPopup = webix.ui({
		view: "popup",
		css: "gallery__filter_suggest_result-popup",
		id: webix.uid(),
		width: searchSuggest.config.width,
		height: 50,
		body: foundCountTemplateConfig,
	});

	const foundCountTemplate = webix.$$(foundCountTemplateID);

	searchSuggest.attachEvent("onBeforeShow", () => {
		const searchValue = searchInput.getValue();
		if (searchValue.length < 3 || toggleButton.getValue() === 1) {
			searchSuggest.hide();
			return false;
		}
		return true;
	});


	suggestList.detachEvent("onItemClick");

	suggestList.attachEvent("onItemClick", (id, event) => {
		const item = suggestList.getItem(id);
		const controlId = item.key === constants.COLLECTION_KEY
			? util.getOptionId(item.key, item.optionId)
			: util.getOptionId(item.key, item.value);
		/** @type {webix.ui.checkbox} */
		const control = $$(controlId);
		if (control) {
			const controlValue = control.getValue();
			control.setValue(!controlValue);
		}
		if (!event.ctrlKey) {
			suggestList.hide();
		}
	});

	searchSuggest.attachEvent("onShow", () => {
		const filters = appliedFiltersModel.getFiltersArray();
		const suggestData = suggestList.serialize();
		const selectedItems = [];
		filters.forEach((f) => {
			const found = suggestData.find((item) => {
				if (f.id === item.id) {
					return true;
				}
				return false;
			});
			if (found) {
				selectedItems.push(f.id);
			}
		});
		suggestList.blockEvent();
		suggestList.select(selectedItems);
		suggestList.unblockEvent();
		foundCountTemplate.parse({count: suggestList.count()});
		foundCountPopup.define("width", searchSuggest.config.width);
		foundCountPopup.resize();
		foundCountPopup.show(searchSuggest.getNode());
	});

	searchSuggest.attachEvent("onHide", () => {
		searchInput.setValue("");
	});
}

const searchSuggestService = {
	attachEvents,
};

export default searchSuggestService;
