/*
 this object we use for saving state for pages. For example, userinfo after authentification
 */
const state = {
	app: {}, // init in app.js
	auth: {}, // init in
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
	authorization_mode: process.env.AUTHORIZATION_MODE,
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
	}
};

export default state;
