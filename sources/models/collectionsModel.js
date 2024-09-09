import filtersModel from "./appliedFilters";

const allCollections = [];
let allCollectionsNextLink = null;
let allCollectionsPrevLink = null;
const pinnedCollections = [];
let pinnedCollectionsNextLink = null;
let pinnedCollectionsPrevLink = null;

function getAllCollections() {
	return allCollections;
}

function getAllCollectionsNextLink() {
	return allCollectionsNextLink;
}

function getAllCollectionsPrevLink() {
	return allCollectionsPrevLink;
}

function setAllCollectionsData(collectionsData) {
	allCollections.push(...collectionsData.results);
	allCollectionsNextLink = collectionsData.next;
	allCollectionsPrevLink = collectionsData.previous;
}

function clearAllCollections() {
	allCollections.length = 0;
}

function getPinnedCollections() {
	return pinnedCollections;
}

function getPinnedCollectionsNextLink() {
	return pinnedCollectionsNextLink;
}

function getPinnedCollectionsPrevLink() {
	return pinnedCollectionsPrevLink;
}

function setPinnedCollections(collectionsData) {
	pinnedCollections.push(...collectionsData.results);
	pinnedCollectionsNextLink = collectionsData.next;
	pinnedCollectionsPrevLink = collectionsData.previous;
}

function clearPinnedCollections() {
	pinnedCollections.length = 0;
}

function updateCollections(buckets) {
	pinnedCollections.forEach((collection) => {
		const bucketCollection = buckets.find(bucket => bucket.key === collection.id);
		collection.doc_count = bucketCollection.doc_count;
	});
}

function getAppliedCollectionsForApi() {
	const appliedFilters = filtersModel.getFiltersArray();
	const appliedCollections = appliedFilters.filter(filter => filter.key === "collections");
	const result = appliedCollections.map(collection => collection.optionId);
	return result.length > 0 ? result.join(",") : "";
}

export default {
	getAllCollections,
	getAllCollectionsNextLink,
	getAllCollectionsPrevLink,
	setAllCollectionsData,
	clearAllCollections,
	getPinnedCollections,
	getPinnedCollectionsNextLink,
	getPinnedCollectionsPrevLink,
	setPinnedCollections,
	clearPinnedCollections,
	updateCollections,
	getAppliedCollectionsForApi
};
