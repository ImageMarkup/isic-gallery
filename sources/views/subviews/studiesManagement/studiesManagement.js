import {JetView} from "webix-jet";
import authService from "../../../services/auth";
import "../../components/activeDatatable";
import state from "../../../models/state";
import constants from "../../../constants";
import StudiesManagementService from "../../../services/studiesManagement/studiesManagement";

const STUDIES_MANAGEMENT_ACCORDION_ID = "studies-management-accordion-id";
const PAGER_ID = "studies-management-pager-id";
const CLONE_PAGER_ID = "clone-studies-management-pager-id";
const CONTENT_HEADER_TEMPLATE_ID = "studies-management-content-header-template";

export default class StudiesManagementView extends JetView {
	config() {
		const accordion = {
			id: STUDIES_MANAGEMENT_ACCORDION_ID,
			view: "accordion",
			type: "wide",
			collapsed: true,
			multi: true,
			rows: []
		};

		const pager = {
			view: "pager",
			id: PAGER_ID,
			master: false,
			size: 8,
			template: "{common.prev()} {common.next()}}"

		};

		// we need all the same properties for cloned pager. we will clone it in init method
		const clonePager = webix.extend({
			id: CLONE_PAGER_ID,
			css: {"margin-top": "0 !important"}
		}, pager, false);

		const headerTemplate = {
			id: CONTENT_HEADER_TEMPLATE_ID,
			template(data) {
				return `<div class='page-header-info'><h2 class='main-subtitle2'>Manage Studies</h2> <div class='page-header-item'>${data.count} items</div></div>`;
			},
			borderless: true,
			autoheight: true,
			data: {count: ""}
		};

		const ui = {
			margin: 10,
			rows: [
				headerTemplate,
				pager,
				accordion,
				{
					rows: [
						{},
						clonePager,
						{height: 5}
					]
				}
			]
		};
		return ui;
	}

	init(view) {
		this.studiesManagementService = new StudiesManagementService(
			view,
			$$(PAGER_ID),
			$$(CLONE_PAGER_ID),
			$$(CONTENT_HEADER_TEMPLATE_ID),
			$$(STUDIES_MANAGEMENT_ACCORDION_ID)
		);
	}

	urlChange() {
		// for remaining previous state of accordion
		const parentViewName = this.getParentView().getName();
		let pageNumber = 0;
		let selectedAdminStudiesIdsSet;
		// satadiesManagement may be a part of dashboard page
		if (parentViewName === constants.NAME_VIEW_DASHBOARD) {
			pageNumber = state.dashboard.adminStudiesPage || 0;
			selectedAdminStudiesIdsSet = state.dashboard.selectedAdminStudiesIdsSet;
			this.studiesManagementService.load(pageNumber, selectedAdminStudiesIdsSet);
		}
		// then it is separate  page and we should check terms of use
		else if (authService.isTermsOfUseAccepted()) {
			this.studiesManagementService.load(pageNumber, selectedAdminStudiesIdsSet);
		}
		else {
			authService.showTermOfUse(() => {
				this.studiesManagementService.load(pageNumber, selectedAdminStudiesIdsSet);
			});
		}
	}
}
