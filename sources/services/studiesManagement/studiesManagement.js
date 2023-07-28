import {plugins} from "webix-jet";

import constants from "../../constants";
import state from "../../models/state";
import studiesManagementModel from "../../models/studiesForManagement";
import util from "../../utils/util";
import accordionView from "../../views/subviews/studiesManagement/parts/accordionView";

class StudiesManagementService {
	constructor(view, pager, clonePager, headerTemplate, accordion) {
		this._view = view;
		this._pager = pager;
		this._clonePager = clonePager;
		this._headerTemplate = headerTemplate;
		this._accordion = accordion;
		this._init();
	}

	_init() {
		this._studiesScrollView = $$("admin-studies-panel");

		this._accordion.attachEvent("onAfterExpand", (id) => {
			const accordionItem = $$(id);
			const accordionItemChildViews = accordionItem.getChildViews();
			const accordionLayouts = accordionItemChildViews[0].getChildViews();
			while (accordionLayouts.length !== 0) {
				accordionItemChildViews[0].removeView(accordionLayouts[0].config.id);
			}
		});

		this._pager.attachEvent("onItemClick", (id) => {
			this.clickPagerItem(id);
		});

		this._clonePager.attachEvent("onItemClick", (id) => {
			this.clickPagerItem(id);
		});

		this._headerTemplate.define("onClick", {
			"add-dataset-btn": () => {
				this._view.$scope.app.show(constants.PATH_CREATE_DATASET);
			}
		});

		this._view.$scope.use(plugins.UnloadGuard, () => {
			const parentViewName = this._view.$scope.getParentView().getName();
			let selectedAdminStudiesIdsSet = new Set();
			// satadiesManagement can be a part of dashboard page
			if (parentViewName === constants.NAME_VIEW_DASHBOARD) {
				state.dashboard.adminStudiesPage = this._pager.data.page;
				selectedAdminStudiesIdsSet = state.dashboard.selectedDatasetIdsSet;
			}
			this._accordion.getChildViews().forEach((accordionItem) => {
				if (!accordionItem.config.collapsed) {
					selectedAdminStudiesIdsSet.add(accordionItem.config.id);
				}
			});
		});
	}

	clickPagerItem(id) {
		let offset;
		const lastPage = Math.ceil(this._pager.data.count / this._pager.data.size);
		const prevClickHandler = util.debounce(() => {
			const nextPage = this._pager.data.page > 0 ? this._pager.data.page : 0;
			offset = nextPage * this._pager.data.size;
			const portion = studiesManagementModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accordionView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});
		const nextClickHandler = util.debounce(() => {
			const nextPage = this._pager.data.page < lastPage ? this._pager.data.page : lastPage;
			offset = nextPage * this._pager.data.size;
			const portion = studiesManagementModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accordionView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});
		const firstClickHandler = util.debounce(() => {
			offset = 0;
			const portion = studiesManagementModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accordionView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});
		const lastClickHandler = util.debounce(() => {
			if (lastPage > 1) {
				offset = (lastPage - 1) * this._pager.data.size;
			}
			else {
				offset = lastPage * this._pager.data.size;
			}
			const portion = studiesManagementModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accordionView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});
		switch (id) {
			case "prev": {
				prevClickHandler();
				break;
			}
			case "next": {
				nextClickHandler();
				break;
			}
			case "first": {
				firstClickHandler();
				break;
			}
			case "last": {
				lastClickHandler();
				break;
			}
			default: {
				offset = 0;
				break;
			}
		}
	}

	// TODO: check page when study will be implemented
	load(page, selectedAdminStudiesIdsSet) {
		const params = {
			limit: 26,
			offset: 0,
			sort: "name",
			sortdir: 1
		};
		studiesManagementModel.load(params).then(() => {
			const pager = this._pager;
			const clonePager = this._clonePager;
			pager.define({count: studiesManagementModel.getCount()});
			pager.refresh();
			pager.clone(clonePager);
			const offset = pager.data.page * pager.data.size;
			const portion = studiesManagementModel.getData(pager.data.size, offset);
			accordionView.buildAccordion(portion, this._accordion, this._headerTemplate);

			if (selectedAdminStudiesIdsSet) {
				selectedAdminStudiesIdsSet.forEach((item) => {
					let accordionItem = $$(item);
					if (accordionItem) {
						accordionItem.expand();
					}
				});
			}
		});
	}

	_showAccordionItem(id) {
		const topPos = webix.$$(id).$view.offsetTop;
		this._studiesScrollView.scrollTo(0, topPos);
	}
}

export default StudiesManagementService;
