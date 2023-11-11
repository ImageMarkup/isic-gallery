import constants from "../../constants";
import appliedFiltersModel from "../../models/appliedFilters";
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
		// eslint-disable-next-line max-len
		foundItem = facets.buckets.find(element => prepareOptionName(element.key, key) === prepareOptionName(valueThatLookingFor, key));
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
			// we do not need to call onChange event for the control. so we block event
			control.blockEvent();
			/* remove key is from "filtersChanged" event parameters.
			   Its value is inverse for checkbox value */
			control.setValue(!data.remove);
			control.unblockEvent();
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

function _setLabelCount(foundCurrentCount, docCount) {
	const appliedFiltersArray = appliedFiltersModel.getFiltersArray();
	const filtersKeys = [];
	appliedFiltersArray.forEach((filter) => {
		if (!filtersKeys.includes(filter.key)) {
			filtersKeys.push(filter.key);
		}
	});
	filtersKeys.forEach((filterKey) => {
		const labelView = $$(util.getFilterLabelId(filterKey));
		const template = labelView.config.template();
		const newTemplate = filterKey === constants.MISSING_KEY_VALUE
			? `${template} (${docCount[filterKey]})`
			: `${template} (${foundCurrentCount[filterKey]} / ${docCount[filterKey]})`;
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
			values.forEach((value) => {
				let currentCount;
				if (countsAfterFiltration && countsAfterFiltration[filterKey]) {
					currentCount = _findCurrentCount(countsAfterFiltration[filterKey], value.key, filterKey);
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
					_setFilterCounts(controlView, value.doc_count, currentCount);
				}
			});
		}
	});
	_setLabelCount(filteredCounts, docCounts);
}

export default {
	NULL_OPTION_VALUE,
	prepareOptionName,
	updateFiltersCounts,
	updateFiltersFormControl
};
