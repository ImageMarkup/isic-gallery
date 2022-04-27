import updateData from "./annotatorsPanel";
import authService from "../../../../services/auth";
import ajaxActions from "../../../../services/ajaxActions";
import prepareData from "../../../../services/studiesManagement/annotatorsAndParticipationData";

function createUsersDatatable(item, template) {
	const usersTable = {
		view: "activeDatatable",
		id: item.usersDatatableId,
		css: "simple-datatable",
		scroll: "y",
		borderless: true,
		rowHeight: 25,
		rowLineHeight: 25,
		columns: [
			{id: "userName", header: {text: "", height: 25}, adjust: "data"},
			{
				id: "remove",
				header: "",
				width: 40,
				template: "<span class='link webix_icon fas fa-times'></span>"
			},
			{id: "completion", header: "Completion", fillspace: true}
		],
		data: prepareData.prepareAnnotatorsData(item),
		onClick: {
			"fa-times": (event, id, node) => {
				const selectedUser = $$(item.usersDatatableId).getItem(id);
				const template = $$(item.templateId);
				webix.confirm({
					text: `Permanently remove <b>"${selectedUser.userName}"</b> from study?`,
					type: "confirm-error",
					callback(result) {
						if (result) {
						}
					}
				});
			}
		},
		on: {
			onBeforeRender() {
				const count = this.count();
				if (count < 10) {
					this.define({autoheight: true, yCount: count});
				}
				else {
					this.define({yCount: 10, autoheight: false});
				}
				this.hideColumn("remove");
			}
		}
	};

	return usersTable;
}

function createRequestsDatatable(item) {
	const requestsDatatable = {
		view: "activeDatatable",
		id: item.requestsDatatableId,
		css: "simple-datatable",
		header: false,
		scroll: "y",
		borderless: true,
		minHeight: 50,
		rowHeight: 25,
		rowLineHeight: 25,
		columns: [
			{id: "userName", header: {text: "", height: 25}, adjust: "data"},
			{
				id: "approve",
				header: "",
				width: 40,
				template: "<span class='link webix_icon fas fa-check'></span>"
			},
			{
				id: "discard",
				header: "",
				width: 40,
				template: "<span class='link webix_icon fas fa-times'></span>"
			}
		],
		data: prepareData.prepareParticipationReqData(item),
		onClick: {
			"fa-check": (event, id, node) => {
				const selectedUser = $$(item.requestsDatatableId).getItem(id);
				const template = $$(item.templateId);
				webix.confirm({
					text: `Add user <b>"${selectedUser.userName}"</b> to the study?`,
					type: "confirm-error",
					callback(result) {
						if (result) {
							const usersIds = [selectedUser.id]; // because we need to send array to server
						}
					}
				});
			},
			"fa-times": (event, id, node) => {
				const selectedUser = $$(item.requestsDatatableId).getItem(id);
				webix.confirm({
					text: `Delete participation request from <b>"${selectedUser.userName}"</b>?`,
					type: "confirm-error",
					callback(result) {
						if (result) {
						}
					}
				});
			}
		},
		on: {
			onAfterLoad() {
				if (!this.count()) {
					this.showOverlay("There is no participation requests");
				}
				else {
					this.hideOverlay();
				}
			},
			onBeforeRender() {
				const count = this.count();
				if (count < 10) {
					this.define({autoheight: true, yCount: count});
				}
				else {
					this.define({yCount: 10, autoheight: false});
				}
				this.hideColumn("remove");
			}
		}
	};

	return requestsDatatable;
}

export default {
	createUsersDatatable,
	createRequestsDatatable
};
