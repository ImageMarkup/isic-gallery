import {JetView, plugins} from "webix-jet";
import authService from "../../../services/auth";
import DashboardService from "../../../services/dashboard/dashboard";
import Dataset from "../dataset/dataset";
import StudiesManagement from "../studiesManagement/studiesManagement";
import util from "../../../utils/util";
import StudiesService from "../../../services/studies/studies";
import constants from "../../../constants";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import state from "../../../models/state";

const ID_BUTTON_INVITE_USER = "invite-user-button";
const ID_BUTTON_MANAGEMENT_UI = "management-ui-button";

const ID_PANEL_ADMIN_STUDIES = "admin-studies-panel";
const ID_PANEL_ADMIN_DATASET = "admin-dataset-panel";
const ID_PANEL_PARTISIPANT_STUDIES = "partisipant-studies-panel";
const ID_PANEL_PARTISIPANT_TASKS_SEGMENTATION = "partisipant-segmentation-tasks-panel";

const ID_TEMPLATE_PARTISIPATE_STUDIES = "partisipate-studies-template";
const ID_LIST_PARTISIPATE_STUDIES = "partiipate-studies-list";

const ID_TEMPLATE_PARTISIPANT_TASKS_SEGMENTATION = "partisipant-segmentation-tasks-template";
const ID_LIST_PARTISIPANT_TASKS_SEGMENTATION = "partisipant-segmentation-tasks-list";

const ID_ACCORDION_ITEM_SEGMENTATION_TASKS = "accordion-item-segmentation-task";
const ID_ACCORDION_ITEM_PARTICIPANT_STUDY = "accordion-item-participant-study";
const ID_ACCORDION_ITEM_ADMIN_STUDY = "accordion-item-admin-study";
const ID_ACCORDION_ITEM_ADMIN_DATASET = "accordion-item-admin-dataset";

const ID_PARTICIPANT_ACCORDION = "dashboard-participant-accordion";
const ID_ADMIN_ACCORDION = "dashboard-admin-accordion";

export default class DashboardView extends JetView {

	config() {
		const adminStudiesPanel = {
			view: "scrollview",
			id: ID_PANEL_ADMIN_STUDIES,
			css: "dashboard-panel",
			height: 500,
			body: {
				paddingX: 15,
				rows: [
					StudiesManagement
				]
			}

		};

		const adminDatasetPanel = {
			view: "scrollview",
			id: ID_PANEL_ADMIN_DATASET,
			css: "dashboard-panel",
			height: 500,
			body: {
				paddingX: 15,
				rows: [
					Dataset
				]
			}
		};

		const partisipantStudiesPanel = {
			view: "scrollview",
			id: ID_PANEL_PARTISIPANT_STUDIES,
			css: "dashboard-panel",
			height: 500,
			body: {
				padding: 15,
				rows: [
					{
						id: ID_TEMPLATE_PARTISIPATE_STUDIES,
						template(data) {
							return `<div class='page-header-info'><h2 class='main-subtitle2'>Studies</h2> <div class='page-header-item'>${data.count} items</div></div>`;
						},
						borderless: true,
						autoheight: true,
						data: {count: ""}
					},
					{
						view: "list",
						id: ID_LIST_PARTISIPATE_STUDIES,
						autoheight: true,
						template: "#name#",
						on: {
							onItemClick(id) {
								const currentStudy = this.getItem(id);
								StudiesService.getFirstAnnotationId(currentStudy)
									.then((annotationId) => {
										if (annotationId) {
											util.openInNewTab(`${constants.URL_ANNOTATIONS_TOOL}${annotationId}`);
										}
										else {
											webix.message({
												type: "error",
												text: "There no annotations for this study"
											});
										}
									});
							}
						}
					}
				]
			}
		};

		const partisipantTasksSegmentationPanel = {
			view: "scrollview",
			id: ID_PANEL_PARTISIPANT_TASKS_SEGMENTATION,
			css: "dashboard-panel",
			height: 500,
			body: {
				padding: 15,
				rows: [
					{
						id: ID_TEMPLATE_PARTISIPANT_TASKS_SEGMENTATION,
						template(data) {
							return `<div class='page-header-info'><h2 class='main-subtitle2'>Segmentation</h2> <div class='page-header-item'>${data.count} items</div></div>`;
						},
						borderless: true,
						autoheight: true,
						data: {count: ""}
					},
					{
						view: "list",
						id: ID_LIST_PARTISIPANT_TASKS_SEGMENTATION,
						autoheight: true,
						template: "<div class='task-info'>#dataset.name#<span class='tasks-count'>#count#</span> </div>",
						on: {
							onItemClick(id) {
								const currentStudy = this.getItem(id);
								// todo: click behaviour
							}
						}
					}

				]
			}
		};

		const adminToolbar = {
			margin: 15,
			cols: [
				{
					view: "button",
					id: ID_BUTTON_MANAGEMENT_UI,
					css: "btn",
					value: "Management UI",
					width: 120,
					hidden: true,
				},
				{
					view: "button",
					id: ID_BUTTON_INVITE_USER,
					hidden: true,
					css: "btn",
					value: "Invite user",
					width: 120
				}
			]

		};

		const adminAccordion = {
			view: "accordion",
			id: ID_ADMIN_ACCORDION,
			multi: true,
			rows: [
				{
					header: "Studies",
					id: ID_ACCORDION_ITEM_ADMIN_STUDY,
					collapsed: true,
					body: {
						rows: [
							adminStudiesPanel
						]
					}
				},
				{
					header: "Dataset",
					id: ID_ACCORDION_ITEM_ADMIN_DATASET,
					collapsed: true,
					body: {
						rows: [
							adminDatasetPanel
						]
					}
				}
			]
		};

		const participantAccordion = {
			view: "accordion",
			id: ID_PARTICIPANT_ACCORDION,
			multi: true,
			rows: [
				{
					header: "Studies",
					id: ID_ACCORDION_ITEM_PARTICIPANT_STUDY,
					collapsed: true,
					body: {
						rows: [
							partisipantStudiesPanel
						]
					}
				},
				{
					header: "Segmentation Tasks",
					collapsed: true,
					hidden: true,
					id: ID_ACCORDION_ITEM_SEGMENTATION_TASKS,
					body: {
						rows: [
							partisipantTasksSegmentationPanel
						]
					}
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("dashboard"),
				{
					name: "infoTemplateName",
					rows: []
				},
				{
					paddingY: 20,
					margin: 10,
					type: "clean",
					rows: [
						{
							cols: [
								{
									template: "As Administrator",
									css: "main-subtitle3",
									borderless: true,
									autoheight: true
								},
								adminToolbar
							]
						},
						adminAccordion
					]
				},
				{
					template: "As Participant",
					css: "main-subtitle3",
					borderless: true,
					autoheight: true
				},
				participantAccordion,
				{}
			]
		};
		return ui;
	}

	init(view) {
		this.use(plugins.UnloadGuard, () => {
			state.dashboard.selectedAdminAccordionItemsIdsSet = new Set();
			state.dashboard.selectedParticipateAccordionItemsIdsSet = new Set();
			$$(ID_PARTICIPANT_ACCORDION).getChildViews().forEach((accordionItem) => {
				if (!accordionItem.config.collapsed) {
					state.dashboard.selectedParticipateAccordionItemsIdsSet.add(accordionItem.config.id);
				}
			});
			$$(ID_ADMIN_ACCORDION).getChildViews().forEach((accordionItem) => {
				if (!accordionItem.config.collapsed) {
					state.dashboard.selectedAdminAccordionItemsIdsSet.add(accordionItem.config.id);
				}
			});
		});
		this.dashboardService = new DashboardService(
			view,
			$$(ID_PANEL_ADMIN_STUDIES),
			$$(ID_PANEL_ADMIN_DATASET),
			$$(ID_PANEL_PARTISIPANT_STUDIES),
			$$(ID_TEMPLATE_PARTISIPATE_STUDIES),
			$$(ID_LIST_PARTISIPATE_STUDIES),
			$$(ID_PANEL_PARTISIPANT_TASKS_SEGMENTATION),
			$$(ID_TEMPLATE_PARTISIPANT_TASKS_SEGMENTATION),
			$$(ID_LIST_PARTISIPANT_TASKS_SEGMENTATION),
			$$(ID_BUTTON_MANAGEMENT_UI),
			$$(ID_BUTTON_INVITE_USER),
			$$(ID_ACCORDION_ITEM_SEGMENTATION_TASKS)
		);
	}

	urlChange() {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_DASHBOARD}]);
		if (authService.isLoggedin()) {
			// check term of use
			if (authService.isTermsOfUseAccepted()) {
				this.dashboardService.load();
			}
			else {
				authService.showTermOfUse(() => {
					this.dashboardService.load();
				});
			}
		}
		else {
			authService.showMainPage();
		}
	}

	getInfoTemplate() {
		return this.getRoot().queryView({name: "infoTemplateName"});
	}
}
