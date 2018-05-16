import ajaxActions from "../ajaxActions";
import state from "../../models/state";
import authService from "../auth";
import {plugins} from "webix-jet";

class StudiesService {
	constructor(view, dataview, toolbar, progressChart) {
		this._view = view;
		this._dataview = dataview;
		this._toolbar = toolbar;
		this._progressChart = progressChart;
		this._init();
	}

	_init() {
		for (let key in this._toolbar.elements) {
			if (this._toolbar.elements.hasOwnProperty(key)) {
				this._toolbar.elements[key].attachEvent("onItemClick", () => {
					const values = this._toolbar.getValues();
					this.updateDataview(values);
				});
			}
		}

		this._view.$scope.use(plugins.UnloadGuard, () => {
			state.studies.toolbarValues = this._toolbar.getValues();
		});

		webix.extend(this._dataview, webix.OverlayBox);
		webix.extend(this._view, webix.ProgressBar);

		this._dataview.attachEvent("onAfterLoad", () => {
			this._dataview.enable();
			this._view.hideProgress();
			if (!this._dataview.count()) { // if no data is available
				this._dataview.showOverlay("<div style='overlay'>There is no data</div>");
				this._dataview.define("autoheight", true); // hide scroll
			}
			else {
				this._dataview.define("autoheight", false); // see result with scroll
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

		// TODO: change this code if api call response will have state for every study
		if (!params.state) {
			const activeStudiesPromise = ajaxActions.getStudies(webix.copy(params, {state: "active"}));
			const completedStudiesPromise = ajaxActions.getStudies(webix.copy(params, {state: "complete"}));
			webix.promise.all([
				activeStudiesPromise,
				completedStudiesPromise
			]).then((results) => {
				const [active, completed] = results;
				active.forEach((activeStudy) => {
					activeStudy.state = "active";
				});
				completed.forEach((completedStudy) => {
					completedStudy.state = "complete";
				});
				const studies = active.concat(completed);
				this._parseStudiesTODatataview(studies);
			});
		}
		else {
			ajaxActions.getStudies(params).then((studies) => {
				studies.forEach((study) => {
					study.state = params.state;
				});
				this._parseStudiesTODatataview(studies);
			});
		}
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

	participateStudy(study) {
		//study._id - id in DB, study.id - inner id for dataview
		ajaxActions.participateStudy(study._id).then(() => {
			if (!Array.isArray(study.participationRequests)) {
				study.participationRequests = [];
			}
			study.participationRequests.push(authService.getUserInfo());
			this._dataview.updateItem(study.id);
			webix.message("Request has been sent");
		});
	}

	static getFirstAnnotationId(study) {
		return new Promise((resolve, reject) => {
			if (study && study._id) {
				const user = authService.getUserInfo();
				ajaxActions.getAnnotations({
					userId: user._id,
					studyId: study._id
				}).then((annotations) => {
					if (annotations.length) {
						resolve(annotations[0]._id);
					}
					else {
						resolve(null);
					}
				});
			}
			else {
				resolve(null);
			}
		});
	}
}

export default StudiesService;
