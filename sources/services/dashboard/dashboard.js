// import ajaxActions from "../ajaxActions";
import auth from "../auth";
import constants from "../../constants";
import state from "../../models/state";
import dashboardStats from "../../dashboardStats/dashboardStats.json";
import util from "../../utils/util";

const colsElementsCount = 8;

class DashboardService {
	constructor(
		view,
		panelAdminStudies,
		panelAdminDataset,
		panelPartisipantStudies,
		templatePartisipateStadies,
		listPartisipateStudies,
		panelPartisipantTasks,
		templatePartisipantTasks,
		listPartisipateTasks,
		// buttonManagementUI,
		buttonInviteUser,
		accordionItemSegmentationTask,
		accordionItemParticipantStudy,
		accordionItemAdminDataset,
		accordionItemAdminStudy
	) {
		this._view = view;
		this._panelAdminStudies = panelAdminStudies;
		this._panelAdminDataset = panelAdminDataset;
		this._panelPartisipantStudies = panelPartisipantStudies;
		this._templatePartisipateStadies = templatePartisipateStadies;
		this._listPartisipateStudies = listPartisipateStudies;
		this._panelPartisipantSegmentationTasks = panelPartisipantTasks;
		this._templatePartisipantSegmentationTasks = templatePartisipantTasks;
		this._listPartisipateSegmentationTasks = listPartisipateTasks;
		// this._buttonManagementUI = buttonManagementUI;
		this._buttonInviteUser = buttonInviteUser;
		this._accordionItemSegmentationTask = accordionItemSegmentationTask;
		this._accordionItemParticipantStudy = accordionItemParticipantStudy;
		this._accordionItemAdminDataset = accordionItemAdminDataset;
		this._accordionItemAdminStudy = accordionItemAdminStudy;
		this._init();
	}

	_init() {
		setTimeout(() => {
			const accordionViews = [
				this._accordionItemSegmentationTask,
				this._accordionItemParticipantStudy,
				this._accordionItemAdminDataset,
				this._accordionItemAdminStudy
			];
			this._attachOnAfterExpandEvent(accordionViews);
		});

		this._infoTemplate = this._view.$scope.getInfoTemplate();
		// this._buttonManagementUI.show();
		this._buttonInviteUser.show();
		// this._buttonManagementUI.attachEvent("onItemClick", () => {
		// 	this._view.$scope.app.show(constants.PATH_MANAGEMENT_UI_ABOUT);
		// });
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
		state.dashboard.selectedAdminAccordionItemsIdsSet.forEach((item) => {
			this._expandAccordionItem(item);
		});
		// expand previously expanded accordion items
		state.dashboard.selectedParticipateAccordionItemsIdsSet.forEach((item) => {
			this._expandAccordionItem(item);
		});

		if (auth.hasSegmentationSkill()) {
			this._accordionItemSegmentationTask.show();
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
				default: {
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
										<p class="info-text"> ${infoText} </p>`;
				}
			};

			if (index <= 3) {
				firstRowOfStatsToDisplay[0].cols.push(
					objectOfInfoTemplateToPush,
					{}
				);
			}
			else {
				secondRowOfStatsToDisplay[0].cols.push(
					objectOfInfoTemplateToPush,
					{}
				);
			}
		});

		while (secondRowOfStatsToDisplay[0].cols.length < colsElementsCount) {
			secondRowOfStatsToDisplay[0].cols.push({width: 190}, {});
		}
		webix.ui([firstRowOfStatsToDisplay[0], secondRowOfStatsToDisplay[0]], this._infoTemplate);
	}

	_attachOnAfterExpandEvent(accordionViews) {
		accordionViews.forEach((accordionView) => {
			accordionView.getParentView().detachEvent("onAfterExpand");
			accordionView.getParentView().attachEvent("onAfterExpand", (id) => {
				const accordionItem = $$(id);
				accordionItem.$view.scrollIntoView({behavior: "smooth", inline: "start"});
			});
		});
	}
}

export default DashboardService;
