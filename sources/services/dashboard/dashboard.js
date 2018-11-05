import ajaxActions from "../ajaxActions";
import auth from "../auth";
import constants from "../../constants";
import state from "../../models/state";

class DashboardService {
	constructor(view, panelAdminStudies, panelAdminDataset, panelPartisipantStudies, templatePartisipateStadies, listPartisipateStudies, panelPartisipantTasks, templatePartisipantTasks, listPartisipateTasks, buttonInviteUser, accordionItemSegmentationTask) {
		this._view = view;
		this._panelAdminStudies = panelAdminStudies;
		this._panelAdminDataset = panelAdminDataset;
		this._panelPartisipantStudies = panelPartisipantStudies;
		this._templatePartisipateStadies = templatePartisipateStadies;
		this._listPartisipateStudies = listPartisipateStudies;
		this._panelPartisipantSegmentationTasks = panelPartisipantTasks;
		this._templatePartisipantSegmentationTasks = templatePartisipantTasks;
		this._listPartisipateSegmentationTasks = listPartisipateTasks;
		this._buttonInviteUser = buttonInviteUser;
		this._accordionItemSegmentationTask = accordionItemSegmentationTask;
		this._init();
	}

	_init() {
		if (auth.isStudyAdmin()) {
			this._buttonInviteUser.show();
		}
		this._buttonInviteUser.attachEvent("onItemClick", () => {
			this._view.$scope.app.show(constants.PATH_INVITE_USER);
		});
	}

	_expandAccordionItem(item) {
		let accordionItem = $$(item);
		if (accordionItem) {
			accordionItem.expand();
		}
	}
	load() {
		// expand previously expanded accordion items
		for (let item of state.dashboard.selectedAdminAccordionItemsIdsSet) {
			this._expandAccordionItem(item);
		}
		// expand previously expanded accordion items
		for (let item of state.dashboard.selectedParticipateAccordionItemsIdsSet) {
			this._expandAccordionItem(item);
		}

		ajaxActions.getStudies({userId: "me"}).then((studies) => {
			if (studies) {
				this._templatePartisipateStadies.setValues({count: studies.length});
				this._listPartisipateStudies.parse(studies);
			}
		});
		if (auth.hasSegmentationSkill()) {
			this._accordionItemSegmentationTask.show();
			ajaxActions.getTaskSegmentation().then((tasks) => {
				if (tasks) {
					const count = tasks.reduce((sum, current) => sum + current.count, 0);
					this._templatePartisipantSegmentationTasks.setValues({count});
					this._listPartisipateSegmentationTasks.parse(tasks);
				}
			});
		}
	}
}

export default DashboardService;
