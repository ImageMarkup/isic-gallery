import constants from "../constants";
import util from "../utils/util";
import collectionsModel from "./collectionsModel";
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
			case constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX:
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
			// eslint-disable-next-line no-use-before-define
			processNewFilter(item);
		});
	}
	else if (data) {
		// eslint-disable-next-line no-use-before-define
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
			let checkboxId = util.getOptionId(filter.key, filter.optionId ?? filter.value);
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
		case constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX: {
			const optionId = filter.optionId;
			if (filter.remove) {
				if (appliedFilters.exists(optionId)) {
					appliedFilters.remove(optionId);
				}
			}
			else {
				filter.id = optionId;
				if (!appliedFilters.exists(optionId)) {
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
			if (name === constants.NULL_OPTION_VALUE) {
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
				if (currentFilterValue === constants.MISSING_KEY_VALUE) {
					result.push({
						key: `-${filter.key}`,
						value: "*",
						operator: "",
						openingBracket: "(",
						closingBracket: "",
						type: "boolean"
					});
				}
				else {
					result.push({
						key: filter.key,
						value: currentFilterValue,
						operator: "",
						openingBracket: "(",
						closingBracket: "",
						type: filter.datatype
					});
				}
			}
			else if (valueIndex === valuesLastIndex) {
				if (currentFilterValue === constants.MISSING_KEY_VALUE) {
					result.push({
						key: `-${filter.key}`,
						value: "*",
						operator: "OR",
						openingBracket: "",
						closingBracket: ")",
						type: "boolean"
					});
				}
				else {
					result.push({
						key: filter.key,
						value: currentFilterValue,
						operator: "OR",
						openingBracket: "",
						closingBracket: ")",
						type: filter.datatype
					});
				}
			}
			else if (currentFilterValue === constants.MISSING_KEY_VALUE) {
				result.push({
					key: `-${filter.key}`,
					value: "*",
					operator: "OR",
					openingBracket: "",
					closingBracket: "",
					type: "boolean"
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
	else if (filter.values[0] === constants.MISSING_KEY_VALUE) {
		result.push({
			key: `-${filter.key}`,
			value: "*",
			operator: "",
			openingBracket: "",
			closingBracket: "",
			type: "boolean"
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
				if (currentFilterValue.label === constants.MISSING_KEY_VALUE) {
					result.push({
						key: `-${filter.key}`,
						value: "*",
						operator: "",
						openingBracket: "(",
						closingBracket: "",
						type: "boolean"
					});
				}
				else {
					result.push({
						key: filter.key,
						value: `[${currentFilterValue.from} TO ${currentFilterValue.to}}`,
						operator: "",
						openingBracket: "(",
						closingBracket: "",
						type: filter.datatype
					});
				}
			}
			else if (valueIndex === valuesLastIndex) {
				if (currentFilterValue.label === constants.MISSING_KEY_VALUE) {
					result.push({
						key: `-${filter.key}`,
						value: "*",
						operator: "OR",
						openingBracket: "",
						closingBracket: ")",
						type: "boolean"
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
			}
			else if (currentFilterValue.label === constants.MISSING_KEY_VALUE) {
				result.push({
					key: `-${filter.key}`,
					value: "*",
					operator: "OR",
					openingBracket: "",
					closingBracket: "",
					type: "boolean"
				});
			}
			else {
				result.push({
					key: filter.key,
					value: `[${currentFilterValue.from} TO ${currentFilterValue.to}}`,
					operator: "OR",
					openingBracket: "",
					closingBracket: "",
					type: filter.datatype
				});
			}
		});
	}
	else if (filter.values[0].label === "missing key") {
		result.push({
			key: `-${filter.key}`,
			value: "*",
			operator: "",
			openingBracket: "",
			closingBracket: "",
			type: "boolean"
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
			case constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX: {
				let itemFromResult = result.find(comparedItem => comparedItem.key === `${item.key}_${item.diagnosisLevel}`, true);
				if (!itemFromResult) {
					itemFromResult = {
						view: item.view,
						key: `${item.key}_${item.diagnosisLevel}`,
						datatype: item.datatype,
						values: []
					};
					result.push(itemFromResult);
				}
				itemFromResult.values.push(_prepareOptionNameForApi(item.value, `${item.key}_${item.diagnosisLevel}`));
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
		case constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX:
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
	const diagnosisRegex = /^diagnosis_\d$/;
	const diagnosisFilters = _groupFiltersByKey().filter(f => diagnosisRegex.test(f.key));
	const groupedFilters = _groupFiltersByKey()
		.filter(groupedFilter => groupedFilter.key !== constants.COLLECTION_KEY
			&& !diagnosisRegex.test(groupedFilter.key));
	if (diagnosisFilters.length !== 0) {
		conditions.operator = diagnosisFilters.length > 1 ? "OR" : "";
		diagnosisFilters.forEach((d) => {
			conditions.operands.push(...(_prepareCondition(d)));
		});
	}
	let query = diagnosisFilters.length > 0 ? "(" : "";
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
	query += query === "" ? "" : ")";
	conditions.operands.length = 0;
	if (groupedFilters.length !== 0) {
		query += query === "" ? "" : " AND ";
		conditions.operator = groupedFilters.length > 1 ? "AND" : "";
		groupedFilters.forEach((groupedFilter) => {
			conditions.operands.push(...(_prepareCondition(groupedFilter)));
		});
	}
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
	const filtersFromUrl = filtersArray
		.map((filter) => {
			let filterId;
			if (typeof filter === "object") {
				if (filter.type === constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX) {
					const view = $$(filter.viewId);
					const item = view.getItem(filter.optionId);
					const treeData = state.filtersTreeData.get(filter.viewId);
					const data = getFiltersChangeTreeItemData(
						treeData,
						item,
						item.datatype,
						false,
					);
					return data;
				}
				return null;
			}
			else if (filter.includes(constants.COLLECTION_KEY)) {
				const pinnedCollections = collectionsModel.getPinnedCollections();
				const id = Number(filter.substring(filter.indexOf("|") + 1));
				const collection = pinnedCollections?.find(c => c.id === id);
				filterId = `${constants.COLLECTION_KEY}|${collection?.name}`;
			}
			else {
				filterId = filter;
			}
			const control = $$(filterId);
			if (control) {
				const data = control.config.filtersChangedData;
				data.id = util.getOptionId(data.key, data.value);
				data.remove = false;
				return data;
			}
			return null;
		});
	return filtersFromUrl.filter(f => f !== null);
}

function convertAppliedFiltersToParams() {
	return JSON.stringify(getFiltersArray().map((filter) => {
		if (filter.view === constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX) {
			return {type: filter.view, viewId: filter.viewId, optionId: filter.optionId};
		}
		return filter.id;
	}));
}

function getAppliedCollectionsForApi() {
	const filtersArray = getFiltersArray();
	const appliedCollections = filtersArray
		.filter(filter => filter.key === constants.COLLECTION_KEY);
	const result = appliedCollections.map(collection => collection.optionId);
	return result.length > 0 ? result.join(",") : "";
}

/**
 * Get filters changed data for checkboxes
 * @param {object} data
 * @param {object} currentOption
 * @param {String} optionName
 */
function getFiltersChangedData(data, currentOption, optionName) {
	const filtersChangedData = {};
	filtersChangedData.view = data.type;
	filtersChangedData.datatype = data.datatype;
	filtersChangedData.key = data.id;
	filtersChangedData.filterName = data.name;
	filtersChangedData.value = optionName;
	filtersChangedData.optionId = currentOption.optionId;
	filtersChangedData.status = "equals";
	if (currentOption && data.type === "rangeCheckbox") {
		filtersChangedData.to = currentOption.to;
		filtersChangedData.from = currentOption.from;
	}
	return filtersChangedData;
}

/**
 *
 * @param {object} data
 * @param {object} item
 * @param {String} datatype
 * @param {boolean} state
 */
function getFiltersChangeTreeItemData(data, item, datatype, remove) {
	const filtersChangedData = {};
	filtersChangedData.view = data.type;
	filtersChangedData.datatype = datatype;
	filtersChangedData.key = data.labelId;
	filtersChangedData.filterName = data.name;
	filtersChangedData.value = getTreeOptionValueById(item.id);
	filtersChangedData.status = "equals";
	filtersChangedData.treeCheckboxFlag = true;
	filtersChangedData.diagnosisLevel = item.$level;
	filtersChangedData.optionId = item.id;
	filtersChangedData.viewId = `treeTable-${data.id}`;
	filtersChangedData.remove = remove;
	return filtersChangedData;
}

function getTreeOptionValueById(id) {
	const separator = "|";
	const array = id.split(separator);
	return array.at(array.length - 1);
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
	convertAppliedFiltersToParams,
	getAppliedCollectionsForApi,
	getFiltersChangedData,
	getFiltersChangeTreeItemData,
};

// TODO: rewrite example
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
