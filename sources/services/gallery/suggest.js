import {TREE_MODELS_CONFIG, isTreeModel} from "app-models/treeModels";

import constants from "../../constants";
import collectionsModel from "../../models/collectionsModel";
import imagesFilters from "../../models/imagesFilters";

const filterSuggestions = [];

function getSuggestionsForFilter() {
	return filterSuggestions;
}

async function buildSuggestionsForFilter() {
	const filtersData = await imagesFilters.getFiltersData();
	const filters = [...filtersData.map(f => f.data)].flat(Infinity);
	const newSuggestions = getSuggestionsFromFacetsFilters(filters);
	if (newSuggestions.length > 0) {
		filterSuggestions.length = 0;
		filterSuggestions.push(...newSuggestions);
	}
}

function getSuggestionsFromFacetsFilters(filters) {
	const suggestions = [];
	filters.forEach((f) => {
		suggestions.push(...formSuggestionsFromOptions(f));
	});
	return suggestions;
}

function formSuggestionsFromOptions(parent) {
	const suggestions = [];
	if (parent.id === constants.COLLECTION_KEY) {
		parent?.options?.forEach((o) => {
			const collections = collectionsModel.getPinnedCollections();
			const currentCollection = collections.find(c => c.id === o.key);
			suggestions.push({
				id: `${parent.id}|${o.key}`,
				key: parent.id,
				name: "Collections",
				value: currentCollection.name ?? "",
				optionId: `${parent.id}|${currentCollection.id}`,
				isCollection: true,
			});
		});
	}
	else if (isTreeModel(parent.id)) {
		parent.options?.forEach((o) => {
			const suggestionValue = getSuggestionValue(o.id, parent.id);

			suggestions.push({
				id: `${parent.id}|${o.name}`,
				key: parent.id,
				value: `${parent.name} | ${suggestionValue}`,
				level: o.level,
				optionId: o.id,
				hasHiddenOption: o.hasHiddenOption,
			});
			if (o.data) {
				suggestions.push(...formSuggestionsFromData(o.data, parent.id, parent.name));
			}
		});
	}
	else {
		parent.options?.forEach((o) => {
			suggestions.push({
				id: `${parent.id}|${o.key}`,
				key: parent.id,
				value: `${parent.name} | ${o.key}`,
				optionId: `${parent.id}|${o.key}`,
			});
			if (o.options) {
				suggestions.push(...formSuggestionsFromOptions(o));
			}
		});
	}
	return suggestions;
}

function getSuggestionValue(id, parentId) {
	const isAnatomicSite = parentId === TREE_MODELS_CONFIG.anatom_site.key;
	return id.split("|").map((v, index) => {
		if (index < 2 && !isAnatomicSite) {
			return v.toUpperCase();
		}
		return v;
	}).join(" | ");
}

function formSuggestionsFromData(data, parentId, parentFilterName) {
	const suggestions = [];
	data.forEach((d) => {
		const suggestionValue = getSuggestionValue(d.id, parentId);
		suggestions.push({
			id: `${parentId}|${d.id}`,
			key: parentId,
			optionId: d.id,
			value: `${parentFilterName} | ${suggestionValue}`,
			level: d.level,
			hasHiddenOption: d.hasHiddenOption,
		});
		if (d.data) {
			suggestions.push(...formSuggestionsFromData(d.data, parentId, parentFilterName));
		}
	});
	return suggestions;
}

const suggestService = {
	buildSuggestionsForFilter,
	getSuggestionsForFilter,
};

export default suggestService;
