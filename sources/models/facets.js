const facets = {};

function getFacets() {
	return facets;
}

function addFacet(id, values) {
	facets[id] = values;
}

function getFacetOptions(facet) {
	return facet.options;
}

const facetsModel = {
	getFacets,
	addFacet,
	getFacetOptions,
};

export default facetsModel;
