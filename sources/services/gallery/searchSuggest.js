import appliedFiltersModel from "../../models/appliedFilters";

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
		const searchValue = searchInput.getValue();
		list.filter(item => searchSuggest.config.filter.call(searchSuggest, item, searchValue));
		const texts = [];
		list.data.each((obj) => {
			texts.push(obj.value);
		});
		// searchSuggest.config.master does not work in some cases
		const masterView = searchInput;
		const maxWidth = Math.max(
			webix.html.getTextSize(texts, "webix_list_item").width + 30,
			masterView.getInputNode().getBoundingClientRect().width
		);
		const width = maxWidth < window.innerWidth
			? maxWidth
			: masterView.getInputNode().getBoundingClientRect().width;
		searchSuggest.define("width", width);
		searchSuggest.resize();
		if (searchValue.length < 3 || toggleButton.getValue() === 1) {
			searchSuggest.hide();
			return false;
		}
		return true;
	});

	// remove default behavior
	suggestList.detachEvent("onItemClick");

	const getAffectedSuggestTreeItems = (clickedItem, selectedIds) => {
		const suggestData = suggestList.serialize();
		const isClickedItemSelected = suggestList.isSelected(clickedItem.id);

		const itemParents = suggestData.filter(
			suggestItem => clickedItem.optionId.includes(suggestItem.optionId)
			&& suggestItem.optionId !== clickedItem.optionId
		).sort((a, b) => b.level - a.level);

		const itemChildren = suggestData.filter(
			suggestItem => suggestItem.optionId.includes(clickedItem.optionId)
			&& suggestItem.optionId !== clickedItem.optionId
		);

		if (isClickedItemSelected) {
			return [...itemParents, ...itemChildren];
		}

		const affectedParents = [];
		for (const parent of itemParents) {
			const nonSelectedChildren = suggestData.filter(item => item.optionId !== parent.optionId
					&& item.optionId !== clickedItem.optionId
					&& item.optionId.includes(parent.optionId)
					&& item.level === parent.level + 1
					&& !selectedIds.includes(item.id));
			if (!parent.hasHiddenOption && nonSelectedChildren.length === 0) {
				affectedParents.push(parent);
			}
			else {
				break;
			}
		}

		return [...affectedParents, ...itemChildren];
	};

	// add new behavior
	suggestList.attachEvent("onItemClick", (id, event) => {
		const clickedItem = suggestList.getItem(id);
		const isClickedItemSelected = suggestList.isSelected(id);
		const isTreeCheckbox = clickedItem.key === "diagnosis";

		if (isTreeCheckbox) {
			const suggestItemsToToggle =
				getAffectedSuggestTreeItems(clickedItem, suggestList.getSelectedId());
			const suggestIdsToToggle = suggestItemsToToggle.map(suggestItem => suggestItem.id);

			suggestList.blockEvent();
			if (!isClickedItemSelected) {
				suggestList.select(suggestIdsToToggle, true);
			}
			else {
				suggestIdsToToggle.forEach((suggestIdToToggle) => {
					suggestList.unselect(suggestIdToToggle);
				});
			}
			suggestList.unblockEvent();
		}

		const appliedFilters = appliedFiltersModel.getFiltersArray();
		const filterIds = appliedFilters.map(a => a.id);
		if (clickedItem.key === "diagnosis") {
			/** @type {webix.ui.treetable} */
			const diagnosisTree = $$(`treeTable-${clickedItem.key}`);
			const controlId = clickedItem.optionId;
			const control = diagnosisTree.getItem(controlId);
			if (control) {
				if (diagnosisTree.isChecked(controlId)) {
					diagnosisTree.uncheckItem(controlId);
				}
				else if (filterIds.includes(controlId)) {
					diagnosisTree.blockEvent();
					diagnosisTree.checkItem(controlId);
					diagnosisTree.unblockEvent();
					diagnosisTree.uncheckItem(controlId);
				}
				else {
					diagnosisTree.checkItem(controlId);
				}
			}
		}
		else {
			const controlId = clickedItem.optionId;
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

		const selectedTreeIds = filters
			.filter(filter => filter.view === "treeCheckbox")
			.map(filter => `${filter.key}|${filter.optionId}`);

		const suggestIdsToSelect = filters.flatMap((filter) => {
			const suggestItemToSelect = suggestData.find(item => item.optionId === filter.id);
			if (!suggestItemToSelect) return [];
			const isTreeCheckbox = filter.view === "treeCheckbox";
			if (!isTreeCheckbox) {
				return [suggestItemToSelect.id];
			}
			const suggestTreeItemsToSelect =
				[suggestItemToSelect, ...getAffectedSuggestTreeItems(suggestItemToSelect, selectedTreeIds)];
			return suggestTreeItemsToSelect.map(item => item.id);
		});

		suggestList.blockEvent();
		suggestList.select(suggestIdsToSelect);
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
