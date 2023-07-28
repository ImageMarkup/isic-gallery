import {JetView} from "webix-jet";

import constants from "../../../constants";
import authService from "../../../services/auth";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import "../../components/activeDataview";
import StudiesService from "../../../services/studies/studies";
import util from "../../../utils/util";
import studyProgressWindow from "./windows/studyProgressWindow";

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
				// check if user partisipates in study
				const user = authService.getUserInfo();
				if (typeof obj.userCompletion[user._id] !== "undefined") {
					buttonsHtml = common.goToStudyButton(obj, common);
					buttonsHtml += common.studiesProgressButton(obj, common);
				}
				else {
					buttonsHtml = common.studiesParticipateButton(obj, common);
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
			activeContent: {
				goToStudyButton: {
					view: "button",
					css: "studies-participate-btn btn",
					label: "Go to Study",
					width: 108,
					on: {
						onItemClick(id, e) {
							const thisDataview = $$(DATAVIEW_ID);
							const itemId = thisDataview.locate(e);
							const item = thisDataview.getItem(itemId);
							StudiesService.getFirstAnnotationId(item)
								.then((annotationId) => {
									if (annotationId) {
										// TODO: uncomment if study endpoint will be implemented
										// util.openInNewTab(`${constants.URL_ANNOTATIONS_TOOL}?studyId=${item._id}`);
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
					click: () => { window.open(constants.URL_PARTICIPATE_BUTTON); }
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
							const imageId = item && item.images.length ? item.images[0]._id : "";
							const token = authService.getToken();
							const url = `${constants.URL_MULTIRATER}?id=${imageId}&sid=${item._id}&uid=${token}`;
							util.openInNewTab(url);
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

	async urlChange() {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_STUDIES}]);
		if (authService.isLoggedin()) {
			// check term of use
			const isTermsOfUseAccepted = await authService.isTermsOfUseAccepted();
			if (isTermsOfUseAccepted) {
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
