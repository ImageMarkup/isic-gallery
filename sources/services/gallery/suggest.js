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
	else if (parent.id === "diagnosis") {
		parent.options?.forEach((o) => {
			const namesArray = o.id.split("|");
			const value = namesArray.reduce((name, currentValue, currentIndex) => {
				let result;
				switch (currentIndex) {
					case 0:
					case 1: {
						result = name === "" ? currentValue.toUpperCase() : `${name} | ${currentValue.toUpperCase()}`;
						break;
					}
					default: {
						result = `${name} | ${currentValue}`;
					}
				}
				return result;
			}, "");

			suggestions.push({
				id: `${parent.id}|${o.name}`,
				key: "diagnosis",
				value,
				level: o.level,
				optionId: o.id,
				hasHiddenOption: o.hasHiddenOption,
			});
			if (o.data) {
				suggestions.push(...formSuggestionsFromData(o));
			}
		});
	}
	else {
		parent.options?.forEach((o) => {
			suggestions.push({
				id: `${parent.id}|${o.key}`,
				key: parent.id,
				value: `${parent.name}: ${o.key}` ?? "",
				optionId: `${parent.id}|${o.key}`,
			});
			if (o.options) {
				suggestions.push(...formSuggestionsFromOptions(o));
			}
		});
	}
	return suggestions;
}

function formSuggestionsFromData(parent) {
	const suggestions = [];
	parent.data?.forEach((d) => {
		const valueArray = d.id.split("|").map((v, index) => {
			if (index < 2) {
				return v.toUpperCase();
			}
			return v;
		});
		suggestions.push({
			id: `diagnosis|${d.id}`,
			key: "diagnosis",
			optionId: d.id,
			value: valueArray.join("|") ?? "",
			level: d.level,
			hasHiddenOption: d.hasHiddenOption,
		});
		if (d.data) {
			suggestions.push(...formSuggestionsFromData(d));
		}
	});
	return suggestions;
}

const suggestService = {
	buildSuggestionsForFilter,
	getSuggestionsForFilter,
};

export default suggestService;
