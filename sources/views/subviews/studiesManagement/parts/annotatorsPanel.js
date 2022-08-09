import authService from "../../../../services/auth";
import addUserWindow from "../windows/addAnnotator";
import datatables from "./studiesDataTables";

const ADD_USER_WINDOW_ID = "user-adding-window";

function getAnnotatorsCount(obj, item) {
	if (obj.users) {
		return obj.users;
	}
	return item.users ? item.users.length : 0;
}

function createAnnotatorsPanel(item) {
	item.templateId = `template-id-${webix.uid()}`;
	const template = {
		template(obj) {
			let addButtomHtml = authService.isLoggedin() ? "<span class='site-btn add-annotator-btn'>+</span>" : "";
			return `<div class="item-content-header">Annotators (${getAnnotatorsCount(obj, item)}) ${addButtomHtml}</div>`;
		},
		autoheight: true,
		borderless: true,
		id: item.templateId,
		onClick: {
			"add-annotator-btn": function () {
				// eslint-disable-next-line no-unused-vars
				const thisTemplate = this;
				const okCallback = function (userId) {
					const usersDatatable = $$(item.usersDatatableId);
					let existingUsers = usersDatatable.find(user => userId === user.id);
					if (!existingUsers.length) {
						return true;
					}
					webix.alert({type: "alert-warning", text: "User is already in study"});
					return false;
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
						hidden: true,
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

function updateUsersAndRequestsTables(/* studyId, reqDatatableId, usersDatatableId */) {
}

export default {
	createAnnotatorsPanel,
	updateUsersAndRequestsTables
};

