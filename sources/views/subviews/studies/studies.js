import {JetView} from "webix-jet";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import "../../components/activeDataview";
import StudiesService from "../../../services/studies/studies";
import constants from "../../../constants";
import studyProgressWindow from "./windows/studyProgressWindow";
import authService from "../../../services/auth";
import util from "../../../utils/util";

const DATAVIEW_ID = "study-items-dataview";
const TOOLBAR_ID = "toolbar-id";
const PROGRESS_WINDOW_ID = "progress-window";

export default class StudiesView extends JetView {
	config() {
		const filtersToolbar = {
			view: "toolbar",
			id: TOOLBAR_ID,
			type: "clean",
			borderless: true,
			css: "studies-filter-toolbar",
			cols: [
				{},
				{
					view: "checkbox",
					css: "checkbox-ctrl",
					labelRight: "Ongoing Studies",
					width: 150,
					labelWidth: 0,
					name: "ongoing"
				},
				{
					view: "checkbox",
					css: "checkbox-ctrl",
					labelRight: "Past Studies",
					width: 125,
					labelWidth: 0,
					name: "complited"
				},
				{
					view: "checkbox",
					css: "checkbox-ctrl",
					labelRight: "My Studies",
					width: 115,
					labelWidth: 0,
					name: "my"
				},
				{// for now  it is not maintened on the server side. So this control is hidden
					view: "checkbox",
					css: "checkbox-ctrl",
					labelRight: "20 Last Seen Studies",
					width: 160,
					labelWidth: 0,
					hidden: true,
					name: "last20"
				}
			]
		};

		const dataview = {
			view: "activeDataview",
			id: DATAVIEW_ID,
			css: "study-items",
			borderless: true,
			type: {
				height: 156,
				width: "auto"
			},
			template: (obj, common) => {
				let complitedHtml = "";
				let buttonsHtml;
				let isPartisipationRequested;
				// check if user partisipates in study
				const user = authService.getUserInfo();
				if (obj.participationRequests && obj.participationRequests.length) {
					isPartisipationRequested = obj.participationRequests.find((item) => {
						return item._id === user._id;
					});
				}
				if (typeof obj.userCompletion[user._id] !== "undefined") {
					buttonsHtml = common.goToStudyButton(obj, common);
					buttonsHtml += common.studiesProgressButton(obj, common);
				}
				else {
					const infoHtml = "Participation request has been sent";
					buttonsHtml = isPartisipationRequested ? infoHtml : common.studiesParticipateButton(obj, common);
				}
				if (obj.state === "complete") {
					complitedHtml = "<span class='study-item-completed'>COMPLETED</span>";
					buttonsHtml = common.studiesViewDataButton(obj, common);
				}
				return `<div class="study-item">
							<div class="study-items-btn-container">
								${buttonsHtml}
							</div>
							<div class="study-item-content">
								<div class="study-item-title">
									${complitedHtml}
									<span class='study-item-title-txt'>${obj.name}</span>
								</div>
								<div class='study-item-text'>${obj.description}</div>
							</div>
						</div>`;
			},
			on: {
				onAfterLoad() {
					if (!this.count()) { // if no data is available
						webix.extend(this, webix.OverlayBox);
						this.showOverlay("<div style='overlay'>There is no data</div>");
						this.define("autoheight", true); // hide scroll
					}
					else {
						this.define("autoheight", false); // see result with scroll
					}
					this.refresh();
				}
			},
			activeContent: {
				goToStudyButton: {
					view: "button",
					css: "studies-participate-btn btn",
					label: "Go to Study",
					width: 108,
					on: {
						onItemClick(id, e) {
							const dataview = $$(DATAVIEW_ID);
							const itemId = dataview.locate(e);
							const item = dataview.getItem(itemId);
							StudiesService.getFirstAnnotationId(item)
								.then((annotationId) => {
									if (annotationId) {
										util.openInNewTab(`${constants.URL_ANNOTATIONS_TOOL}${study._id}`);
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
				},
				studiesParticipateButton: {
					view: "button",
					css: "studies-participate-btn btn",
					label: "Participate",
					width: 108,
					on: {
						onItemClick(id, e) {
							const thisDataview = $$(DATAVIEW_ID);
							const itemId = $$(DATAVIEW_ID).locate(e);
							const item = thisDataview.getItem(itemId);
							thisDataview.$scope.studiesService.participateStudy(item);
						}
					}
				},
				studiesProgressButton: {
					view: "button",
					css: "studies-participate-btn btn-contour",
					label: "My Progress",
					width: 116,
					on: {
						onItemClick(id, e) {
							const thisDataview = $$(DATAVIEW_ID);
							const itemId = thisDataview.locate(e);
							const item = thisDataview.getItem(itemId);
							thisDataview.$scope.studiesService.updateChart(item);
							$$(PROGRESS_WINDOW_ID).show();
						}
					}
				},
				studiesViewDataButton: {
					view: "button",
					css: "studies-view-data-btn btn-contour",
					label: "View Data",
					width: 247,
					on: {
						onItemClick(id, e) {
							const thisDataview = $$(DATAVIEW_ID);
							const itemId = thisDataview.locate(e);
							const item = thisDataview.getItem(itemId);
							thisDataview.$scope.app.show(`${constants.PATH_MULTIRATER}?studyId=${item._id}`);
						}
					}
				}
			}
		};

		const ui = {
			type: "clean",
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("studies"),
				{height: 15},
				filtersToolbar,
				dataview
			]
		};
		return ui;
	}

	init(view) {
		this.ui(studyProgressWindow.getConfig(PROGRESS_WINDOW_ID));
		this.studiesService = new StudiesService(
			view,
			$$(DATAVIEW_ID),
			$$(TOOLBAR_ID),
			$$(studyProgressWindow.getChartIdFromConfig())
		);
	}

	urlChange() {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_STUDIES}]);
		if (authService.isLoggedin()) {
			// check term of use
			if (authService.isTermsOfUseAccepted()) {
				this.studiesService.load();
			}
			else {
				authService.showTermOfUse(() => {
					this.studiesService.load();
				});
			}
		}
		else {
			authService.showMainPage();
		}
	}
}
