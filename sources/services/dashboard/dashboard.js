import ajaxActions from "../ajaxActions";
import auth from "../auth";
import constants from "../../constants";
import state from "../../models/state";
import dashboardStats from "../../../sources/dashboardStats/dashboardStats.json";
import util from "../../utils/util";

const colsElementsCount = 8;

class DashboardService {
	constructor(view, panelAdminStudies, panelAdminDataset,
				panelPartisipantStudies, templatePartisipateStadies, listPartisipateStudies,
				panelPartisipantTasks, templatePartisipantTasks, listPartisipateTasks,
				buttonManagementUI, buttonInviteUser, accordionItemSegmentationTask) {
		this._view = view;
		this._panelAdminStudies = panelAdminStudies;
		this._panelAdminDataset = panelAdminDataset;
		this._panelPartisipantStudies = panelPartisipantStudies;
		this._templatePartisipateStadies = templatePartisipateStadies;
		this._listPartisipateStudies = listPartisipateStudies;
		this._panelPartisipantSegmentationTasks = panelPartisipantTasks;
		this._templatePartisipantSegmentationTasks = templatePartisipantTasks;
		this._listPartisipateSegmentationTasks = listPartisipateTasks;
		this._buttonManagementUI = buttonManagementUI;
		this._buttonInviteUser = buttonInviteUser;
		this._accordionItemSegmentationTask = accordionItemSegmentationTask;
		this._init();
	}

	_init() {
		this._infoTemplate = this._view.$scope.getInfoTemplate();
		if (auth.isStudyAdmin()) {
			this._buttonManagementUI.show();
			this._buttonInviteUser.show();
		}
		this._buttonManagementUI.attachEvent("onItemClick", () => {
			this._view.$scope.app.show(constants.PATH_MANAGEMENT_UI_ABOUT);
		});
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
		let firstRowOfStatsToDisplay = [{
			cols: []
		}];
		let secondRowOfStatsToDisplay = [{
			cols: []
		}];
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
		
		const dashboardStatsKeys = Object.keys(dashboardStats);
		dashboardStatsKeys.forEach((dashboardStatKey, index) => {
			let infoText;
			let infoNumber;
			switch (dashboardStatKey) {
				case "totalImageCount": {
					infoText = "Total number of images";
					infoNumber = dashboardStats.totalImageCount;
					break;
				}
				case "imagesByUser": {
					infoText = "Number of images contributed by me";
					infoNumber = dashboardStats.imagesByUser;
					break;
				}
				case "totalISICContributors": {
					infoText = "Total number of ISIC contributors";
					infoNumber = dashboardStats.totalISICContributors;
					break;
				}
				case "registeredUsers": {
					infoText = "Number of registered users on ISIC Archive";
					infoNumber = dashboardStats.registeredUsers;
					break;
				}
				case "numberOfStudies": {
					infoText = "Number of studies on ISIC";
					infoNumber = dashboardStats.numberOfStudies;
					break;
				}
				case "numberOfStudiesToComplete": {
					infoText = "Studies I need to complete";
					infoNumber = dashboardStats.numberOfStudiesToComplete;
					break;
				}
				case "numberOfParticipantsInChallenge": {
					infoText = "Participants in Challenge";
					infoNumber = dashboardStats.numberOfParticipantsInChallenge;
					break;
				}
			}

			let objectOfInfoTemplateToPush = {
				borderless: true,
				view: "template",
				width: 190,
				css: "dashboard-info-template",
				autoheight: true,
				template: () => {
					let stringNumber = infoNumber.toString();
					let separatedNumber = util.separateThousandsInNumber(stringNumber);
					return `<div class="number-text">${separatedNumber}</div>
										<p class="info-text"> ${infoText} </p>`
				}
			};

			if (index <= 3) {
				firstRowOfStatsToDisplay[0].cols.push(
					objectOfInfoTemplateToPush,
					{}
				);
			} else {
				secondRowOfStatsToDisplay[0].cols.push(
					objectOfInfoTemplateToPush, 
					{}
				);
			}
		});

		while (secondRowOfStatsToDisplay[0].cols.length < colsElementsCount) {
			secondRowOfStatsToDisplay[0].cols.push({width: 190}, {})
		}
		webix.ui([firstRowOfStatsToDisplay[0], secondRowOfStatsToDisplay[0]], this._infoTemplate)
	}
}

export default DashboardService;
