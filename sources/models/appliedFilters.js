import filterService from "../services/gallery/filter";
import state from "./state";

const appliedFilters = new webix.DataCollection();
const appliedFilterBySearch = new webix.DataCollection();
const showedFilters = new webix.DataCollection();
let filterValue = "";
let filterByName;

function getAppliedFilterBySearchCollection() {
	return appliedFilterBySearch;
}

function getShowedFiltersCollection() {
	return showedFilters;
}

function setAppliedFiltersToLocalStorage(appliedFiltersToStorage) {
	if (!appliedFiltersToStorage) webix.storage.local.remove("appliedFilters");
	else webix.storage.local.put("appliedFilters", appliedFiltersToStorage);
}

function getAppliedFiltersFromLocalStorage() {
	return webix.storage.local.get("appliedFilters");
}

function setFilterByName(filter) {
	filterByName = filter;
}

function getFilterByName() {
	return filterByName;
}

function prepareDataForList() {
	let result = [];
	appliedFilters.data.each((filter) => {
		switch (filter.view) {
			case "checkbox":
			case "rangeCheckbox":
			{
				result.push(webix.copy(filter));
				break;
			}
			case "rangeSlider":
			{
				break;
			}
			default:
			{
				break;
			}
		}
	});
	return result;
}

function processNewFilters(data) {
	if (Array.isArray(data)) {
		data.forEach((item) => {
			processNewFilter(item);
		});
	}
	else if (data) {
		processNewFilter(data);
	}
}

/* filter example : {
 view: "checkbox",
 key: "filterId",
 value: "optionValue",
 remove: 1,
 status: "equals",
 filterName: "filterName"
 } */

function processNewFilter(filter) {
	switch (filter.view) {
		case "checkbox":
		case "rangeCheckbox":
		{
			let checkboxId = filterService.getOptionId(filter.key, filter.value);
			if (filter.remove) {
				if (appliedFilters.exists(checkboxId)) {
					appliedFilters.remove(checkboxId);
				}
			}
			else {
				filter.id = checkboxId;
				if (!appliedFilters.exists(checkboxId)) {
					appliedFilters.add(filter);
				}
			}
			break;
		}
		case "rangeSlider":
		{
			break;
		}
		default:
		{
			break;
		}
	}
}

function _prepareOptionNameForApi(name, key) {
	switch (key) {
		case "meta.datasetId":
		{
			const datasetIds = Object.keys(state.datasetMapForFilters);
			const foundId = datasetIds.find((id) => {
				if (state.datasetMapForFilters[id] === name) {
					return id;
				}
				return false;
			});
			if (foundId) {
				return foundId;
			}
			break;
		}
		default:
		{
			if (name === filterService.NULL_OPTION_VALUE) {
				return "__null__";
			}
		}
	}
	return name;
}

function _prepareValuesCondition(filter, result) {
	if (filter.values.length > 1) {
		const valuesLastIndex = filter.values.length - 1;
		filter.values.forEach((currentFilterValue, valueIndex) => {
			if (valueIndex === 0) {
				result.push({
					key: filter.key,
					value: currentFilterValue,
					operator: "",
					openingBracket: "(",
					closingBracket: "",
					type: filter.datatype
				});
			}
			else if (valueIndex === valuesLastIndex) {
				result.push({
					key: filter.key,
					value: currentFilterValue,
					operator: "OR",
					openingBracket: "",
					closingBracket: ")",
					type: filter.datatype
				});
			}
			else {
				result.push({
					key: filter.key,
					value: currentFilterValue,
					operator: "OR",
					openingBracket: "",
					closingBracket: "",
					type: filter.datatype
				});
			}
		});
	}
	else {
		result.push({
			key: filter.key,
			value: filter.values[0],
			operator: "",
			openingBracket: "",
			closingBracket: "",
			type: filter.datatype
		});
	}
}

function _prepareRangeCondition(filter, result) {
	if (filter.values.length > 1) {
		const valuesLastIndex = filter.values.length - 1;
		filter.values.forEach((currentFilterValue, valueIndex) => {
			if (valueIndex === 0) {
				result.push({
					key: filter.key,
					value: `[${currentFilterValue.from} TO ${currentFilterValue.to}}`,
					operator: "",
					openingBracket: "(",
					closingBracket: "",
					type: filter.datatype
				});
			}
			else if (valueIndex === valuesLastIndex) {
				result.push({
					key: filter.key,
					value: `[${currentFilterValue.from} TO ${currentFilterValue.to}}`,
					operator: "OR",
					openingBracket: "",
					closingBracket: ")",
					type: filter.datatype
				});
			}
			else {
				result.push({
					key: filter.key,
					value: `[${currentFilterValue.from} TO ${currentFilterValue.to}}`,
					operator: "OR",
					openingBracket: "",
					closingBracket: ")",
					type: filter.datatype
				});
			}
		});
	}
	else {
		result.push({
			key: filter.key,
			value: `[${filter.values[0].from} TO ${filter.values[0].to}}`,
			operator: "",
			openingBracket: "",
			closingBracket: "",
			type: filter.datatype
		});
	}
}

function _groupFiltersByKey() {
	const result = [];
	appliedFilters.data.each((item) => {
		switch (item.view) {
			case "checkbox":
			{
				let itemFromResult = result.find(comparedItem => comparedItem.key === item.key, true);
				if (!itemFromResult) {
					itemFromResult = {
						view: item.view,
						key: item.key,
						datatype: item.datatype,
						values: []
					};
					result.push(itemFromResult);
				}
				itemFromResult.values.push(_prepareOptionNameForApi(item.value, item.key));
				break;
			}
			case "rangeCheckbox":
			{
				let itemFromResult = result.find(comparedItem => comparedItem.key === item.key, true);
				if (!itemFromResult) {
					itemFromResult = {
						view: item.view,
						key: item.key,
						values: []
					};
					result.push(itemFromResult);
				}
				itemFromResult.values.push({
					label: _prepareOptionNameForApi(item.value, item.key),
					to: item.to,
					from: item.from
				});
				break;
			}
			default:
			{
				break;
			}
		}
	});
	return result;
}

function _prepareCondition(filter) {
	let result = [];
	switch (filter.view) {
		case "checkbox":
		{
			_prepareValuesCondition(filter, result);
			break;
		}
		case "rangeCheckbox":
		{
			_prepareRangeCondition(filter, result);
			break;
		}
		default:
		{
			break;
		}
	}
	return result;
}

// see conditions example in the bottom of this file
function getConditionsForApi() {
	const conditions = {};
	conditions.operands = [];
	const groupedFilters = _groupFiltersByKey();
	if (groupedFilters.length !== 0) {
		conditions.operator = groupedFilters.length > 1 ? "AND" : "";
		groupedFilters.forEach((groupedFilter) => {
			conditions.operands.push(...(_prepareCondition(groupedFilter)));
		});
	}
	let query = "";
	conditions.operands.forEach((itemOfConditions, paramIndex) => {
		if (paramIndex > 0) {
			if (itemOfConditions.operator.toUpperCase() === "OR") {
				query += itemOfConditions.type === "number" || itemOfConditions.type === "boolean" || itemOfConditions.value.includes("[")
					? ` ${itemOfConditions.operator.toUpperCase()} ${itemOfConditions.key}:${itemOfConditions.value}${itemOfConditions.closingBracket}`
					: ` ${itemOfConditions.operator.toUpperCase()} ${itemOfConditions.key}:"${itemOfConditions.value}"${itemOfConditions.closingBracket}`;
			}
			else {
				query += itemOfConditions.type === "number" || itemOfConditions.type === "boolean" || itemOfConditions.value.includes("[")
					? ` ${conditions.operator.toUpperCase()} ${itemOfConditions.openingBracket}${itemOfConditions.key}:${itemOfConditions.value}`
					: ` ${conditions.operator.toUpperCase()} ${itemOfConditions.openingBracket}${itemOfConditions.key}:"${itemOfConditions.value}"`;
			}
		}
		else {
			query += itemOfConditions.type === "number" || itemOfConditions.type === "boolean" || itemOfConditions.value.includes("[")
				? `${itemOfConditions.openingBracket}${itemOfConditions.key}:${itemOfConditions.value}${itemOfConditions.closingBracket}`
				: `${itemOfConditions.openingBracket}${itemOfConditions.key}:"${itemOfConditions.value}"${itemOfConditions.closingBracket}`;
		}
	});
	return query;
}

function count() {
	return appliedFilters.count();
}

function clearAll() {
	appliedFilters.clearAll();
}

function getFiltersArray() {
	return Object.values(appliedFilters.data.pull);
}

function setFilterValue(value) {
	filterValue = value;
}

function getFilterValue() {
	return filterValue;
}

function getFiltersFromURL(filtersArray) {
	return filtersArray
		.map((filter) => {
			const filterId = typeof filter === "object" ? filter.id : filter;
			const control = $$(filterId);
			const data = control.config.filtersChangedData;
			data.id = filterService.getOptionId(data.key, data.value);
			data.remove = false;
			return data;
		});
}

function convertAppliedFiltersToParams() {
	return JSON.stringify(getFiltersArray().map(filter => filter.id));
}

export default {
	getFiltersArray,
	processNewFilters,
	prepareDataForList,
	getConditionsForApi,
	clearAll,
	count,
	getFilterByName,
	setFilterByName,
	setAppliedFiltersToLocalStorage,
	getAppliedFiltersFromLocalStorage,
	getAppliedFilterBySearchCollection,
	setFilterValue,
	getFilterValue,
	getShowedFiltersCollection,
	getFiltersFromURL,
	convertAppliedFiltersToParams
};

/* example of conditions for API */
/*
var k1 = {
	"operator": "and",
	"operands": [
		{
			"operator": "and",
			"operands": [{
				"operator": ">",
				"operands": [{"identifier": "meta.clinical.age_approx", "type": "number"}, 20]
			}, {
				"operator": "<",
				"operands": [{"identifier": "meta.clinical.age_approx", "type": "number"}, 30]
			}]
		},
		{
			"operator": "and",
			"operands": [
				{
					"operator": "not in",
					"operands": [{
						"identifier": "meta.clinical.personal_hx_mm"
					}, ["__null__"]]
				},
				{
					"operator": "and",
					"operands": [
						{
							"operator": "not in",
							"operands": [{
								"identifier": "meta.clinical.diagnosis_confirm_type"
							}, ["single image expert consensus"]]
						},
						{
							"operator": "not in",
							"operands": [{
								"identifier": "meta.clinical.benign_malignant"
							}, ["indeterminate/malignant"]]
						}
					]
				}
			]
		}
	]
}
 */
