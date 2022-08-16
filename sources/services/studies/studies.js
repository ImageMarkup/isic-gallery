import {plugins} from "webix-jet";
import state from "../../models/state";
import authService from "../auth";
import utils from "../../utils/util";

class StudiesService {
	constructor(view, dataview, toolbar, progressChart) {
		this._view = view;
		this._dataview = dataview;
		this._toolbar = toolbar;
		this._progressChart = progressChart;
		this._init();
	}

	_init() {
		const toolbarElements = Object.keys(this._toolbar.elements);
		toolbarElements.forEach((key) => {
			if (this._toolbar.elements.hasOwnProperty(key)) {
				this._toolbar.elements[key].attachEvent("onItemClick", () => {
					const values = this._toolbar.getValues();
					this.updateDataview(values);
				});
			}
		});

		this._view.$scope.use(plugins.UnloadGuard, () => {
			state.studies.toolbarValues = this._toolbar.getValues();
		});

		webix.extend(this._dataview, webix.OverlayBox);
		webix.extend(this._view, webix.ProgressBar);

		this._dataview.attachEvent("onAfterLoad", () => {
			this._dataview.enable();
			this._view.hideProgress();
			let dataviewNode = this._dataview.getNode();
			let dataviewOverflown = utils.isOverflown(dataviewNode);
			if (dataviewOverflown) {
				this._dataview.define("scroll", "true");
			}
			else {
				this._dataview.define("scroll", "false");
			}
			if (!this._dataview.count()) { // if no data is available
				this._dataview.showOverlay("<div style='height: 200px; font-size: 17px; font-weight: bold;'>There is no data</div>");
			}
			else {
				this._dataview.hideOverlay();
			}
			this._dataview.refresh();
		});
	}

	load() {
		const params = state.studies.toolbarValues || {};
		this._toolbar.setValues(params);
		this.updateDataview(params);
	}

	updateDataview(sourceParams) {
		let params = {
			detail: true
		};
		if (sourceParams && !sourceParams.ongoing && sourceParams.complited) {
			params.state = "complete";
		}
		else if (sourceParams && sourceParams.ongoing && !sourceParams.complited) {
			params.state = "active";
		}
		if (sourceParams && sourceParams.my) {
			params.userId = "me";
		}
		if (sourceParams && sourceParams.last20) {
			params.limit = 20;
			params.sortdir = -1;
			params.sort = "updated";
		}

		this._view.showProgress({type: "icon"});
		this._dataview.disable();
	}

	_parseStudiesTODatataview(studies) {
		this._dataview.clearAll();
		this._dataview.parse(studies);
	}

	updateChart(study) {
		if (study) {
			const imagesTotalCount = study.images ? study.images.length : 0;
			const user = authService.getUserInfo();
			const completedImagesCount = study.userCompletion[user._id];
			const totalInt = parseInt(imagesTotalCount);
			const completedInt = parseInt(completedImagesCount);
			const activePersent = Math.round((totalInt - completedInt) / totalInt * 100);
			const completedPersent = Math.round(completedInt / totalInt * 100);
			this._progressChart.clearAll();
			this._progressChart.parse([
				{active: activePersent, completed: completedPersent}
			]);
		}
	}

	// eslint-disable-next-line no-unused-vars
	participateStudy(study) {}

	static getFirstAnnotationId(study) {
		return new Promise((resolve) => {
			if (study && study._id) {
				// eslint-disable-next-line no-unused-vars
				const user = authService.getUserInfo();
				resolve(null);
			}
			else {
				resolve(null);
			}
		});
	}
}

export default StudiesService;
