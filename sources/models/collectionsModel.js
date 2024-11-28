const pinnedCollections = [];
let pinnedCollectionsNextLink = null;
let pinnedCollectionsPrevLink = null;

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

export default {
	getPinnedCollections,
	getPinnedCollectionsNextLink,
	getPinnedCollectionsPrevLink,
	setPinnedCollections,
	clearPinnedCollections,
	updateCollections,
};
