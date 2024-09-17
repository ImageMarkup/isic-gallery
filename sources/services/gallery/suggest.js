import constants from "../../constants";
import collectionsModel from "../../models/collectionsModel";
import facetsModel from "../../models/facets";
import imagesFilters from "../../models/imagesFilters";

const filterSuggestions = [];

function getSuggestionsForFilter() {
	return filterSuggestions;
}

async function buildSuggestionsForFilter() {
	const facets = facetsModel.getFacets();
	const collections = collectionsModel.getAllCollections();
	const newSuggestions = [];
	const filtersData = await imagesFilters.getFiltersData();
	const filterArray = [];
	filterArray.push(...filtersData.map(f => f.data).flat(Infinity));
	const facetsKeys = filterArray.map(f => f.id);
	facetsKeys.forEach((key) => {
		const values = facets[key].map((v) => {
			if (key === constants.COLLECTION_KEY) {
				const item = collections.find(c => c.id === v);
				return {
					id: `${key}|${v}`,
					key,
					value: item.name,
					optionId: v,
					isCollection: true,
				};
			}
			return {
				id: `${key}|${v}`,
				key,
				value: v,
			};
		}).flat();
		newSuggestions.push(...values);
	});
	if (newSuggestions.length > 0) {
		filterSuggestions.length = 0;
		filterSuggestions.push(...newSuggestions);
	}
}

const suggestService = {
	buildSuggestionsForFilter,
	getSuggestionsForFilter,
};

export default suggestService;
