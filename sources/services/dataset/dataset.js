import {plugins} from "webix-jet"
import ajaxActions from "../ajaxActions";
import constants from "../../constants";
import datasetModel from "../../models/dataset";
import state from "../../models/state";
import accItem from "../../views/subviews/dataset/parts/accordionItem";
import accView from "../../views/subviews/dataset/parts/accordionView";

class DatasetViewService {
	constructor(view, pager, clonePager, headerTemplate, accordion) {
		this._view = view;
		this._pager = pager;
		this._clonePager = clonePager;
		this._headerTemplate = headerTemplate;
		this._accordion = accordion;
		this._init();
	}

	_init() {
		this._pager.attachEvent("onItemClick", (id) => {
			this.clickPagerItem(id);
		});

		this._clonePager.attachEvent("onItemClick", (id) => {
			this.clickPagerItem(id)
		});

		this._headerTemplate.define("onClick", {
			"add-dataset-btn": () => {
				this._view.$scope.app.show(constants.PATH_CREATE_DATASET);
			}
		});

		this._accordion.attachEvent("onAfterExpand", (id) => {
			const accordionItem = $$(id);
			// if contentLoaded == true we do not need to send query again
			if (accordionItem.contentLoaded) {
				return;
			}
			ajaxActions.getDatasetItem(accordionItem.config.elementId).then((item) => {
				accItem.createAccordion(item, accordionItem)
			});
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
	}

	clickPagerItem(id) {
		let offset;
		const lastPage = Math.floor(this._pager.data.count / this._pager.data.size);
		switch (id) {
			case "prev": {
				const nextPage = this._pager.data.page > 0 ? this._pager.data.page - 1 : 0;
				offset = nextPage * this._pager.data.size;
				break;
			}
			case "next": {
				const nextPage = this._pager.data.page < lastPage ? this._pager.data.page + 1 : lastPage;
				offset = nextPage * this._pager.data.size;
				break;
			}
			case "first": {
				offset = 0;
				break;
			}
			case "last": {
				offset = lastPage * this._pager.data.size;
				break;
			}
			default: {
				offset = 0;
				break;
			}
		}
		const portion = datasetModel.getData(this._pager.data.size, offset);
		if (portion && portion.length) {
			accView.buildAccordion(portion, this._accordion, this._headerTemplate);
		}
	}

	load(page, selectedDatasetIdsSet) {
		const params = {
			sort: "name",
			sortdir: 1
		};
		// after finish data loading we set total count for pager, clone it to displaying it bottom and build accordion
		datasetModel.load(params).then(() => {
			const pager = this._pager;
			const clonePager = this._clonePager;
			pager.define({count: datasetModel.getCount()});
			pager.refresh();
			pager.clone(clonePager);
			pager.select(page);

			const offset = pager.data.page * pager.data.size;
			const portion = datasetModel.getData(pager.data.size, offset);
			accView.buildAccordion(portion, this._accordion);

			if (selectedDatasetIdsSet) {
				for (let item of selectedDatasetIdsSet) {
					let accordionItem = $$(item);
					if (accordionItem) {
						accordionItem.expand();
					}
				}
			}
		});
	}
}

export default DatasetViewService;