import constants from "../../constants";
import appliedFiltersModel from "../../models/appliedFilters";
import collectionsModel from "../../models/collectionsModel";
import diagnosisModel from "../../models/diagnosis";
import state from "../../models/state";
import util from "../../utils/util";

const NULL_OPTION_VALUE = "unknown";

function prepareOptionName(value, key) {
	switch (key) {
		case "meta.datasetId":
		{
			if (state.datasetMapForFilters) {
				return state.datasetMapForFilters[value];
			}
			break;
		}
		default:
		{
			if (value === null) {
				return NULL_OPTION_VALUE;
			}
			else if (typeof value === "object") {
				return value.key !== null ? value.key : NULL_OPTION_VALUE;
			}
		}
	}
	return value;
}

function _findCurrentCount(facets, valueThatLookingFor, key) {
	let foundItem;
	if (Array.isArray(facets.buckets)) {
		if (key === constants.COLLECTION_KEY) {
			const pinnedCollections = collectionsModel.getPinnedCollections();
			foundItem = facets.buckets.find((element) => {
				const collection = pinnedCollections.find(item => element.key === item.id);
				return valueThatLookingFor === collection?.id;
			});
		}
		else if (valueThatLookingFor === constants.MISSING_KEY_VALUE) {
			return facets.meta.missing_count;
		}
		else {
			// eslint-disable-next-line max-len
			foundItem = facets.buckets.find(element => prepareOptionName(element.key, key) === prepareOptionName(valueThatLookingFor, key));
		}
	}
	return foundItem ? foundItem.doc_count : null;
}

function _setFilterCounts(controlView, totalCount, currentCount) {
	const oldLabel = controlView.config.labelRight;
	const lastBracketIndex = oldLabel.lastIndexOf("("); // counts is in () in label. We should remove old counts and set new counts
	const baseLabelText = lastBracketIndex === -1
		? oldLabel
		: oldLabel.substring(0, lastBracketIndex);
	let firstNumberHtml;
	if (totalCount === currentCount) {
		firstNumberHtml = "";
	}
	else if (!currentCount) {
		firstNumberHtml = "0 / ";
	}
	else {
		firstNumberHtml = `${currentCount} / `;
	}
	const newLabel = `${baseLabelText}(${firstNumberHtml}${totalCount})`;
	controlView.define("labelRight", newLabel);
	controlView.getNode().setAttribute("title", newLabel);
	controlView.refresh();
}

function _setDiagnosisFilterCounts(treeView, option, totalCount, currentCount) {
	const oldLabel = option.name;
	const lastBracketIndex = oldLabel.lastIndexOf("("); // counts is in () in label. We should remove old counts and set new counts
	const baseLabelText = lastBracketIndex === -1
		? oldLabel
		: oldLabel.substring(0, lastBracketIndex);
	let firstNumberHtml;
	if (totalCount === currentCount) {
		firstNumberHtml = "";
	}
	else if (!currentCount) {
		firstNumberHtml = "0 / ";
	}
	else {
		firstNumberHtml = `${currentCount} / `;
	}
	const newLabel = `${baseLabelText} (${firstNumberHtml}${totalCount})`;
	option.name = newLabel;
	treeView.updateItem(option.id, option);
}

function updateFiltersFormControl(data) {
	if (!data) {
		return;
	}
	switch (data.view) {
		case "rangeCheckbox":
		case "checkbox":
		{
			const controlId = util.getOptionId(data.key, data.value);
			const control = $$(controlId);
			if (control) {
				// we do not need to call onChange event for the control. so we block event
				control.blockEvent();
				/* remove key is from "filtersChanged" event parameters.
				   Its value is inverse for checkbox value */
				control.setValue(!data.remove);
				control.unblockEvent();
			}
			break;
		}
		case constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX:
		{
			updateTreeCheckboxControl(data);
			break;
		}
		case "rangeFilter":
		{
			break;
		}
		default:
		{
			break;
		}
	}
}

function updateTreeCheckboxControl(data) {
	const treeView = $$(data.viewId);
	if (treeView) {
		// we do not need to call onChange event for the control. so we block event
		treeView.blockEvent();
		/* remove key is from "filtersChanged" event parameters.
		   Its value is inverse for checkbox value */
		if (!treeView.isVisible()) {
			treeView.show();
		}
		treeView.checkItem(data.id);
		treeView.open(data.id);
		const parentId = treeView.getParentId(data.id);
		if (parentId) {
			const parent = treeView.getItem(parentId);
			changeParentState(treeView, parent);
		}
		treeView.unblockEvent();
	}
}

function changeParentState(treeView, option) {
	treeView.open(option.id);
	const parentId = treeView.getParentId(option.id);
	if (parentId) {
		const parentOption = treeView.getItem(parentId);
		changeParentState(treeView, parentOption);
	}
}

function _setLabelCount(foundCurrentCount, docCount) {
	const appliedFiltersArray = appliedFiltersModel.getFiltersArray();
	const flatFiltersArray = appliedFiltersArray.filter(f => f.view !== "treeCheckbox");
	const filtersKeys = [];
	flatFiltersArray.forEach((filter) => {
		if (!filtersKeys.includes(filter.key)) {
			filtersKeys.push(filter.key);
		}
	});
	filtersKeys.forEach((filterKey) => {
		const labelView = $$(util.getFilterLabelId(filterKey));
		const template = labelView.config.template();
		let newTemplate;
		if (docCount[filterKey]) {
			newTemplate = filterKey === constants.MISSING_KEY_VALUE
				? `${template} (${docCount[filterKey]})`
				: `${template} (${foundCurrentCount[filterKey]} / ${docCount[filterKey]})`;
		}
		else {
			newTemplate = template;
		}
		labelView.define("template", newTemplate);
		labelView.refresh();
	});
}

// if countsAfterFiltration == undefined that we have all applied filters
// and current counts are the same as counts without filtration
function updateFiltersCounts(countsAfterFiltration) {
	//  state.imagesTotalCounts has been init after getting facets(data with counts) response
	const filterKeys = Object.keys(state.imagesTotalCounts);
	const filteredCounts = {};
	const docCounts = {};
	filterKeys.forEach((filterKey) => {
		if (filterKey !== "passedFilters") {
			const values = state.imagesTotalCounts[filterKey];
			filteredCounts[filterKey] = 0;
			docCounts[filterKey] = 0;
			const diagnosisRegex = /^diagnosis_\d$/;
			if (diagnosisRegex.test(filterKey)) {
				const controlKey = "diagnosis";
				const diagnosisValues = diagnosisModel.getDiagnosisValuesByLevel(filterKey);
				const displayDiagnosis = diagnosisModel.getDisplayDiagnosis();
				const treeView = $$(`treeTable-${controlKey}`);
				diagnosisValues.forEach((v) => {
					let value = values.find(item => item.key === v);
					if (!value) {
						value = {
							key: v,
							doc_count: 0
						};
					}
					let currentCount;
					value.fullKey = value.key !== constants.MISSING_KEY_VALUE
						? diagnosisModel.getDiagnosisConcatenateValue(value.key)
						: constants.MISSING_KEY_VALUE;
					if (countsAfterFiltration && countsAfterFiltration[filterKey]) {
						currentCount = _findCurrentCount(
							countsAfterFiltration[filterKey],
							value.key,
							filterKey
						);
					}
					else {
						currentCount = value.doc_count;
					}
					if (value.key !== constants.MISSING_KEY_VALUE) {
						filteredCounts[filterKey] += currentCount;
					}
					docCounts[filterKey] += value.key !== constants.MISSING_KEY_VALUE
						? value.doc_count
						: 0;
					const optionId = prepareOptionName(value.fullKey, filterKey);
					const option = treeView?.getItem(optionId);
					if (option) {
						_setDiagnosisFilterCounts(treeView, option, value.doc_count, currentCount);
						if (!displayDiagnosis.find(item => item === v)) {
							treeView.remove(optionId);
						}
					}
				});
			}
			else {
				values.forEach((value) => {
					let currentCount;
					if (countsAfterFiltration && countsAfterFiltration[filterKey]) {
						currentCount = _findCurrentCount(
							countsAfterFiltration[filterKey],
							value.key,
							filterKey
						);
					}
					else {
						currentCount = value.doc_count;
					}
					if (value.key !== constants.MISSING_KEY_VALUE) {
						filteredCounts[filterKey] += currentCount;
					}
					docCounts[filterKey] += value.key !== constants.MISSING_KEY_VALUE
						? value.doc_count
						: 0;
					const controlId = util.getOptionId(filterKey, prepareOptionName(value.key, filterKey));
					const controlView = $$(controlId);
					if (controlView) {
						if (filterKey !== constants.COLLECTION_KEY) {
							_setFilterCounts(controlView, value.doc_count, currentCount);
						}
					}
				});
			}
		}
	});
	_setLabelCount(filteredCounts, docCounts);
}

export default {
	NULL_OPTION_VALUE,
	prepareOptionName,
	updateFiltersCounts,
	updateFiltersFormControl,
	changeParentState,
};
