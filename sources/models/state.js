/*
 this object we use for saving state for pages. For example, userinfo after authentification
 */
const state = {
	app: null, // init in app.js
	auth: null, // init in auth.js
	datasetMapForFilters: {}, // init in models/imagesFilters
	dashboard: { // state of dashboard page
		selectedDatasetIdsSet: new Set(),
		datasetPage: 0,
		selectedAdminAccordionItemsIdsSet: new Set(),
		selectedParticipateAccordionItemsIdsSet: new Set(),
		selectedAdminStudiesIdsSet: new Set(),
		adminStudiesPage: 0
	},
	studies: {
		toolbarValues: {}
	},
	clear() {
		this.dashboard = { // state of dashboard page
			selectedDatasetIdsSet: new Set(),
			datasetPage: 0,
			selectedAdminAccordionItemsIdsSet: new Set(),
			selectedParticipateAccordionItemsIdsSet: new Set(),
			selectedAdminStudiesIdsSet: new Set(),
			adminStudiesPage: 0
		};
		this.studies = {
			toolbarValues: {}
		};
	},
	imagesOffset: 0,
	filteredImages: {
		isImagesFiltered: false,
		filteredImagesCount: 0
	}
};

export default state;
