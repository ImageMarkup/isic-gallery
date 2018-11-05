import filterService from "../services/gallery/filter";
import state from "../models/state";

const appliedFilters = new webix.DataCollection();
let filterByName;

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
				appliedFilters.remove(checkboxId);
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
			for (let id in state.datasetMapForFilters) {
				if (state.datasetMapForFilters[id] === name) {
					return id;
				}
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

function _groupFiltersByKey() {
	const result = [];
	appliedFilters.data.each((item) => {
		switch (item.view) {
			case "checkbox":
			{
				let itemFromResult = result.find((comparedItem) => {
					return comparedItem.key === item.key;
				}, true);
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
				let itemFromResult = result.find((comparedItem) => {
					return comparedItem.key === item.key;
				}, true);
				if (!itemFromResult) {
					itemFromResult = {
						view: item.view,
						key: item.key,
						values: []
					};
					result.push(itemFromResult);
				}
				itemFromResult.values.push({
					label:_prepareOptionNameForApi(item.value, item.key),
					highBound: item.highBound,
					lowBound: item.lowBound
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
	let result;
	switch (filter.view) {
		case "checkbox":
		{
			result = {
				operator: "in",
				operands: [
					{
						identifier: filter.key,
						type: filter.datatype
					},
					filter.values
				]
			};
			break;
		}
		case "rangeCheckbox":
		{
			if (filter.values.length === 1) {
				result = _prepareRangeCondition(filter.key, filter.values[0], filter.datatype);
			}
			else if (filter.values.length !== 0) {
				result = {
					operator: "or",
					operands: [
						_prepareRangeCondition(filter.key, filter.values[0], filter.datatype)
					]
				};
				for (let i = 1; i < filter.values.length; i++) {
					if (i === 1) {
						result.operands[i] = _prepareRangeCondition(filter.key, filter.values[i], filter.datatype);
					}
					else {
						result = {
							operator: "or",
							operands: [
								_prepareRangeCondition(filter.key, filter.values[i], filter.datatype),
								result
							]
						};
					}
				}
			}
			break;
		}
		default:
		{
			break;
		}
	}
	return result;
}

function _prepareRangeCondition(key, value, datatype) {
	if (value.label === "__null__") {
		return {
			operator: "in",
			operands: [
				{
					identifier: key,
					type: datatype
				},
				[value.label]
			]
		};
	}
	return {
		operator: "and",
		operands: [{
			operator: ">=",
			operands: [
				{
					identifier: key,
					type: datatype
				},
				value.lowBound
			]
		}, {
			operator: "<",
			operands: [
				{
					identifier: key,
					type: datatype
				},
				value.highBound
			]
		}]
	};
}

// see conditions example in the bottom of this file
function getConditionsForApi() {
	let conditions;
	const groupedFilters = _groupFiltersByKey();
	if (groupedFilters.length === 1) {
		conditions = _prepareCondition(groupedFilters[0]);
	}
	else if (groupedFilters.length !== 0) {
		conditions = {
			operator: "and",
			operands: [
				_prepareCondition(groupedFilters[0])
			]
		};
		for (let i = 1; i < groupedFilters.length; i++) {
			if (i === 1) {
				conditions.operands[i] = _prepareCondition(groupedFilters[i]);
			}
			else {
				conditions = {
					operator: "and",
					operands: [
						_prepareCondition(groupedFilters[i]),
						conditions
					]
				};
			}
		}
	}
	return JSON.stringify(conditions);
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

export default {
	getFiltersArray,
	processNewFilters,
	prepareDataForList,
	getConditionsForApi,
	clearAll,
	count,
	getFilterByName,
	setFilterByName
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