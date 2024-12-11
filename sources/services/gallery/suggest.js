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
				value: currentCollection.name ?? "",
				optionId: currentCollection.id,
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
				key: parent.name,
				value: o.key ?? "",
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
		const valueArray = parent.id.split("|").map((v, index) => (index < 2 ? v.toUpperCase() : v));
		suggestions.push({
			id: `diagnosis|${parent.id}`,
			key: "",
			value: valueArray.join("|") ?? "",
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
