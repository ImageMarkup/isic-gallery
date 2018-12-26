import authService from "../../../../services/auth";
import ajaxActions from "../../../../services/ajaxActions";
import addUserWindow from "../windows/addAnnotator";
import prepareData from "../../../../services/studiesManagement/annotatorsAndParticipationData";
import datatables from "./studiesDataTables";

const ADD_USER_WINDOW_ID = "user-adding-window";

function getAnnotatorsCount(obj, item) {
	if (obj.users) {
		return obj.users;
	} else {
		return item.users ? item.users.length : 0
	}
}

function createAnnotatorsPanel(item) {
	const template = {
		template(obj) {
			let addButtomHtml = authService.isStudyAdmin() ? "<span class='site-btn add-annotator-btn'>+</span>" : "";
			return `<div class="item-content-header">Annotators (${getAnnotatorsCount(obj, item)}) ${addButtomHtml}</div>`;
		},
		autoheight: true,
		borderless: true,
		onClick: {
			"add-annotator-btn": function () {
				const template = this;
				const okCallback = function (userId) {
					const usersDatatable = $$(item.usersDatatableId);
					let existingUsers = usersDatatable.find(user => userId === user.id);
					if (!existingUsers.length) {
						ajaxActions.addAnnotatorsToStudy(item._id, [userId]).then(() => {
							webix.message("User has been added to study");
							updateUsersAndRequestsTables(item._id, null, item.usersDatatableId);
							template.parse({
								users: item.users.length + 1
							})
						});
						return true;
					}
					else {
						webix.alert({type: "alert-warning", text: "User is already in study"});
						return false;
					}
				};
				const win = webix.ui(addUserWindow.getConfig(ADD_USER_WINDOW_ID, okCallback));
				win.attachEvent("onHide", () => {
					win.destructor();
					win.detachEvent("onHide");
				});
				$$(addUserWindow.getTemplateId()).setValues({studyName: item.name});
				// clear form ->
				const form = $$(addUserWindow.getFormId());
				form.setValues({
					q: "",
					mode: "prefix"
				});
				if (form.elements.q) {
					form.elements.q.getList().clearAll();
				}
				// <-
				win.show();
			}
		}
	};
	item.usersDatatableId = `users-datatable-${webix.uid()}`;
	item.requestsDatatableId = `participation-requests-datatable-${webix.uid()}`;

	return {
		rows: [
			template,
			{
				paddingX: 17,
				paddingY: 10,
				rows: [
					datatables.createUsersDatatable(item),
					{
						hidden: !authService.isStudyAdmin(),
						rows: [
							{height: 15},
							{
								template: "<span class='main-subtitle4 '>Participation Requests</span>",
								autoheight: true,
								borderless: true
							},
							{height: 10},
							datatables.createRequestsDatatable(item)
						]
					}
				]
			}

		]
	};
}

function updateUsersAndRequestsTables(studyId, reqDatatableId, usersDatatableId) {
	ajaxActions.getStudy(studyId).then((study) => {
		const usersDatatable = $$(usersDatatableId);
		if (study && study.users && usersDatatable) {
			usersDatatable.clearAll();
			usersDatatable.parse(prepareData.prepareAnnotatorsData(study));
		}
		const reqDatatable = $$(reqDatatableId);
		if (study && study.participationRequests && reqDatatable) {
			reqDatatable.clearAll();
			reqDatatable.parse(prepareData.prepareParticipationReqData(study));
		}
	});
}

export default {
	createAnnotatorsPanel,
	updateUsersAndRequestsTables
};

