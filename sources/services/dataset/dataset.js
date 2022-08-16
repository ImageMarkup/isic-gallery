import {plugins} from "webix-jet";
import constants from "../../constants";
import datasetModel from "../../models/dataset";
import state from "../../models/state";
import accView from "../../views/subviews/dataset/parts/accordionView";
import createDatasetModel from "../../models/createDatasetModel";
import util from "../../utils/util";

class DatasetViewService {
	constructor(view, pager, clonePager, headerTemplate, accordion, setAccessWindow) {
		this._view = view;
		this._pager = pager;
		this._clonePager = clonePager;
		this._headerTemplate = headerTemplate;
		this._accordion = accordion;
		this._setAccessWindow = setAccessWindow;
		this._init();
	}

	_init() {
		this._scrollView = $$("admin-dataset-panel");

		this._pager.attachEvent("onItemClick", (id) => {
			this.clickPagerItem(id);
		});

		this._clonePager.attachEvent("onItemClick", (id) => {
			this.clickPagerItem(id);
		});

		this._headerTemplate.define("onClick", {
			"add-dataset-btn": () => {
				let clicked = "dashboard";
				createDatasetModel.setCreateDatasetClicked(clicked);
				this._view.$scope.app.show(constants.PATH_CREATE_DATASET);
			}
		});

		this._accordion.attachEvent("onAfterExpand", (id) => {
			const accordionItem = $$(id);
			// if contentLoaded == true we do not need to send query again
			if (accordionItem.contentLoaded) {
				this._showAccordionItem(accordionItem.getNode());
			}
		});

		this._view.$scope.use(plugins.UnloadGuard, () => {
			const parentViewName = this._view.$scope.getParentView().getName();
			let selectedDatasetIdsSet = new Set();
			// dataset is a part of dashboard page
			if (parentViewName === constants.NAME_VIEW_DASHBOARD) {
				state.dashboard.datasetPage = this._pager.data.page;
				selectedDatasetIdsSet = state.dashboard.selectedDatasetIdsSet;
			}
			this._accordion.getChildViews().forEach((accordionItem) => {
				if (!accordionItem.config.collapsed) {
					selectedDatasetIdsSet.add(accordionItem.config.id);
				}
			});
		});

		this._setAccessWindow.attachEvent("onShow", () => {
			this._comboUserSearch = this._setAccessWindow.queryView({name: "q"});
			// to detach because of webix bug
			this._comboUserSearch.detachEvent("onBlur");
			this._comboUserSearch.attachEvent("onBlur", () => {
				this._comboUserSearch.$setValue("");
				this._comboUserSearch.getList().clearAll();
			});

			this._comboUserSearch.attachEvent("onEnter", () => {
				let userId = this._comboUserSearch.getValue();
				if (userId) {
					this._comboUserSearch.getList().callEvent("onItemClick", [userId]);
				}
			});
		});

		this._setAccessWindow.attachEvent("onHide", () => {
			this._comboUserSearch.detachEvent("onBlur");
			this._comboUserSearch.detachEvent("onEnter");
		});
	}

	clickPagerItem(id) {
		let offset;
		const lastPage = Math.ceil(this._pager.data.count / this._pager.data.size);
		const prevClickHandler = util.debounce(() => {
			const nextPage = this._pager.data.page > 0 ? this._pager.data.page : 0;
			offset = nextPage * this._pager.data.size;
			const portion = datasetModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});
		const nextClickHandler = util.debounce(() => {
			const nextPage = this._pager.data.page < lastPage ? this._pager.data.page : lastPage;
			offset = nextPage * this._pager.data.size;
			const portion = datasetModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});

		const lastClickHandler = util.debounce(() => {
			if (lastPage > 1) {
				offset = (lastPage - 1) * this._pager.data.size;
			}
			else {
				offset = lastPage * this._pager.data.size;
			}
			const portion = datasetModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accView.buildAccordion(portion, this._accordion, this._headerTemplate);
			}
		});
		const firstClickHandler = util.debounce(() => {
			offset = 0;
			const portion = datasetModel.getData(this._pager.data.size, offset);
			if (portion && portion.length) {
				accView.buildAccordion(portion, this._accordion, this._headerTemplate);
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

	load(page, selectedDatasetIdsSet) {
		const params = {
			sortdir: -1
		};
		/* after finish data loading we set total count for pager,
		   clone it to displaying it bottom and build accordion */
		datasetModel.load(params).then(() => {
			const pager = this._pager;
			const clonePager = this._clonePager;
			pager.define({count: datasetModel.getCount()});
			pager.refresh();
			pager.clone(clonePager);

			const offset = pager.data.page * pager.data.size;
			const portion = datasetModel.getData(pager.data.size, offset);
			accView.buildAccordion(portion, this._accordion, this._headerTemplate);

			if (selectedDatasetIdsSet) {
				selectedDatasetIdsSet.forEach((item) => {
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
		this._scrollView.scrollTo(0, topPos);
	}
}

export default DatasetViewService;
