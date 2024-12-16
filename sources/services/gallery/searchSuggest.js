import appliedFiltersModel from "../../models/appliedFilters";
import util from "../../utils/util";

function attachEvents(searchSuggest, searchInput, toggleButton) {
	const suggestList = searchSuggest.getList();

	const foundCountTemplateID = webix.uid();

	const foundCountTemplateConfig = {
		view: "template",
		css: "gallery__filter_suggest_result-template",
		id: foundCountTemplateID,
		template: obj => `Match ${obj.count} values`,
	};

	const foundCountPopup = webix.ui({
		view: "popup",
		css: "gallery__filter_suggest_result-popup",
		id: webix.uid(),
		width: searchSuggest.config.width,
		height: 50,
		body: foundCountTemplateConfig,
	});

	foundCountPopup.attachEvent("onShow", () => {
		foundCountPopup.define("width", searchSuggest.$width);
		foundCountPopup.resize();
	});

	const foundCountTemplate = webix.$$(foundCountTemplateID);

	searchSuggest.attachEvent("onBeforeShow", () => {
		const list = searchSuggest.getList();
		const texts = [];
		list.data.each((obj) => {
			texts.push(obj.value);
		});
		const masterView = $$(searchSuggest.config.master);
		const width = Math.max(
			webix.html.getTextSize(texts, "webix_list_item").width + 30,
			masterView.getInputNode().getBoundingClientRect().width
		);
		searchSuggest.define("width", width);
		searchSuggest.resize();
		const searchValue = searchInput.getValue();
		if (searchValue.length < 3 || toggleButton.getValue() === 1) {
			searchSuggest.hide();
			return false;
		}
		return true;
	});

	// remove default behavior
	suggestList.detachEvent("onItemClick");

	// add new behavior
	suggestList.attachEvent("onItemClick", (id, event) => {
		const item = suggestList.getItem(id);
		if (item.key === "diagnosis") {
			/** @type {webix.ui.treetable} */
			const diagnosisTree = $$(`treeTable-${item.key}`);
			const controlId = item.optionId;
			const control = diagnosisTree.getItem(controlId);
			if (control) {
				if (diagnosisTree.isChecked(controlId)) {
					diagnosisTree.uncheckItem(controlId);
				}
				else {
					diagnosisTree.checkItem(controlId);
				}
			}
		}
		else {
			const controlId = util.getOptionId(item.key, item.value);
			/** @type {webix.ui.checkbox} */
			const control = $$(controlId);
			if (control) {
				const controlValue = control.getValue();
				control.setValue(!controlValue);
			}
		}
		if (!event.metaKey && !event.ctrlKey) {
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
		searchInput.focus();
	});
}

const searchSuggestService = {
	attachEvents,
};

export default searchSuggestService;
