import state from "../../models/state";

const NULL_OPTION_VALUE = "unknown";

function _findCurrentCount(array, valueThatLookingFor, key) {
	let foundItem;
	if (Array.isArray(array)) {
		foundItem = array.find((element, index, array) => prepareOptionName(element.label, key) === prepareOptionName(valueThatLookingFor, key));
	}
	return foundItem ? foundItem.count : null;
}

function _setFilterCounts(controlView, totalCount, currentCount) {
	const oldLabel = controlView.config.labelRight;
	const lastBracketIndex = oldLabel.lastIndexOf("("); // counts is in () in label. We should remove old counts and set new counts
	const baseLabelText = lastBracketIndex === -1 ? oldLabel : oldLabel.substring(0, lastBracketIndex);
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

function getOptionId(filterId, optionValue) {
	return `${filterId || ""}|${optionValue || ""}`;
}

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
				return value.label !== null ? value.label : NULL_OPTION_VALUE;
			}
		}
	}
	return value;
}


function updateFiltersFormControl(data) {
	if (!data) {
		return;
	}
	switch (data.view) {
		case "rangeCheckbox":
		case "checkbox":
		{
			const controlId = getOptionId(data.key, data.value);
			const control = $$(controlId);
			// we do not need to call onChange event for the control. so we block event
			control.blockEvent();
			// remove key is from "filtersChanged" event parameters. Its value is inverse for checkbox value
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

// if countsAfterFiltration == undefined that we have all applied filters
// and current counts are the same as counts without filtration
function updateFiltersCounts(countsAfterFiltration) {
	//  state.imagesTotalCounts has been init after gettting histogram(data with counts) response
	for (let filterKey in state.imagesTotalCounts) {
		if (state.imagesTotalCounts.hasOwnProperty(filterKey)) {
			let values = state.imagesTotalCounts[filterKey];
			values.forEach((value) => {
				let currentCount;
				if (countsAfterFiltration && countsAfterFiltration[filterKey]) {
					currentCount = _findCurrentCount(countsAfterFiltration[filterKey], value.label, filterKey);
				}
				else {
					currentCount = value.count;
				}
				const controlId = getOptionId(filterKey, prepareOptionName(value.label, filterKey));
				const controlView = $$(controlId);
				if (controlView) {
					_setFilterCounts(controlView, value.count, currentCount);
				}
			});
		}
	}
}

export default {
	NULL_OPTION_VALUE,
	prepareOptionName,
	updateFiltersCounts,
	getOptionId,
	updateFiltersFormControl
};
