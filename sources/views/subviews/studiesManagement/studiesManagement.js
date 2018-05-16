import {JetView, plugins} from "webix-jet";
import ajaxActions from "../../../services/ajaxActions";
import studiesManagementModel from "../../../models/studiesForManagement";
import dates from "../../../utils/formats";
import authService from "../../../services/auth";
import "../../components/activeDatatable";
import addUserWindow from "./windows/addAnnotator";
import state from "../../../models/state";
import constants from "../../../constants";

const STUDIES_MANAGEMENT_ACCORDION_ID = "studies-management-accordion-id";
const PAGER_ID = "studies-management-pager-id";
const CLONE_PAGER_ID = "clone-studies-management-pager-id";
const CONTENT_HEADER_TEMPLATE_ID = "studies-management-content-header-template";
const ADD_USER_WINDOW_ID = "user-adding-window";

export default class StudiesManagementView extends JetView {

	_prepareAnnotatorsData(item) {
		const imagesCount = item.images && item.images.length ? item.images.length : 0;
		let result = [];
		if (item.users && item.users.length) {
			item.users.forEach((user) => {
				const userCompletion = item.userCompletion[user._id];
				const completion = `${userCompletion}/${imagesCount} &emsp; ${Math.round(userCompletion / imagesCount * 100)}%`;
				let fullUserName = "";
				if (user.firstName || user.lastName || user.login) {
					fullUserName = `[${user.firstName} ${user.lastName} (${user.login})]`;
				}
				result.push({
					id: user._id,
					userName: `${user.name} ${fullUserName}`,
					completion
				});
			});
		}
		return result;
	}

	_prepareParticipationReqData(item) {
		let result = [];
		if (item.participationRequests && item.participationRequests.length) {
			item.participationRequests.forEach((user) => {
				let fullUserName = "";
				if (user.firstName || user.lastName || user.login) {
					fullUserName = `[${user.firstName} ${user.lastName} (${user.login})]`;
				}
				result.push({
					id: user._id,
					userName: `${user.name} ${fullUserName}`
				});
			});
		}
		return result;
	}

	_createInfoPanel(item) {
		const html = `	<div class='accordion-item-template'>
								<div class="item-content-header">Info</div>
								<div class="item-content-block">
									<div class="item-content-row">
										<span class="item-content-label">Unique ID</span>
										<span class="item-content-value highlighted-item">${item._id ? item._id : ""}</span>
									</div>
									<div class="item-content-row">
										<span class="item-content-label">Creator</span>
										<span class="item-content-value">${item.creator && item.creator.name ? item.creator.name : ""}</span>
									</div>
									<div class="item-content-row">
										<span class="item-content-label">Created</span>
										<span class="item-content-value">${dates.formatDateString(item.created)}</span>
									</div>
									<div class="item-content-row">
										<span class="item-content-label">Featureset</span>
										<span class="item-content-value">${item.featureset && item.featureset.name ? item.featureset.name : ""}</span>
									</div>
								</div>
							</div>`;
		return {
			view: "template",
			template: html,
			autoheight: true,
			borderless: true
		};
	}

	_updateUsersAndRequestsTables(studyId, reqDatatableId, usersDatatableId) {
		const view = this;
		ajaxActions.getStudy(studyId).then((study) => {
			const usersDatatable = $$(usersDatatableId);
			if (study && study.users && usersDatatable) {
				usersDatatable.clearAll();
				usersDatatable.parse(view._prepareAnnotatorsData(study));
			}
			const reqDatatable = $$(reqDatatableId);
			if (study && study.participationRequests && reqDatatable) {
				reqDatatable.clearAll();
				reqDatatable.parse(view._prepareParticipationReqData(study));
			}
		});
	}

	_createAnnotatorsPanel(item) {
		const view = this;
		const template = {
			template() {
				let addButtomHtml = authService.isStudyAdmin() ? "<span class='site-btn add-annotator-btn'>+</span>" : "";
				return `<div class="item-content-header">Annotators (${item.users ? item.users.length : 0}) ${addButtomHtml}</div>`;
			},
			autoheight: true,
			borderless: true,
			onClick: {
				"add-annotator-btn": (event, id, node) => {
					const okCallback = function (userId) {
						const usersDatatable = $$(item.usersDatatableId);
						let existingUsers = usersDatatable.find(user => userId === user.id);
						if (!existingUsers.length) {
							ajaxActions.addAnnotatorsToStudy(item._id, [userId]).then(() => {
								webix.message("User has been added to study");
								view._updateUsersAndRequestsTables(item._id, null, item.usersDatatableId);
							});
							return true;
						}
						else {
							webix.alert({type: "alert-warning", text: "User is already in study"});
							return false;
						}
					};
					const win = $$(ADD_USER_WINDOW_ID) || webix.ui(addUserWindow.getConfig(ADD_USER_WINDOW_ID, okCallback));
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
					template: "<span class='link webix_icon fa-times'></span>"
				},
				{id: "completion", header: "Completion", fillspace: true}
			],
			data: this._prepareAnnotatorsData(item),
			onClick: {
				"fa-times": (event, id, node) => {
					const selectedUser = $$(item.usersDatatableId).getItem(id);
					webix.confirm({
						text: `Permanently remove <b>"${selectedUser.userName}"</b> from study?`,
						type: "confirm-error",
						callback(result) {
							if (result) {
								ajaxActions.removeAnnotatorFromStudy(item._id, selectedUser.id).then(() => {
									webix.message("User has been removed from study");
									view._updateUsersAndRequestsTables(item._id, null, item.usersDatatableId);
								});
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
					if (!authService.isStudyAdmin()) {
						this.hideColumn("remove");
					}
				}
			}
		};
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
					template: "<span class='link webix_icon fa-check'></span>"
				},
				{
					id: "discard",
					header: "",
					width: 40,
					template: "<span class='link webix_icon fa-times'></span>"
				}
			],
			data: this._prepareParticipationReqData(item),
			onClick: {
				"fa-check": (event, id, node) => {
					const selectedUser = $$(item.requestsDatatableId).getItem(id);
					webix.confirm({
						text: `Add user <b>"${selectedUser.userName}"</b> to the study?`,
						type: "confirm-error",
						callback(result) {
							if (result) {
								const usersIds = [selectedUser.id]; // because we need to send array to server
								ajaxActions.addUsersToStudy(item._id, usersIds).then(() => {
									webix.message("User has been added to study");
									view._updateUsersAndRequestsTables(item._id, item.requestsDatatableId, item.usersDatatableId);
								});
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
								ajaxActions.removeParticipationRequest(item._id, selectedUser.id).then(() => {
									webix.message("Request has been removed");
									view._updateUsersAndRequestsTables(item._id, item.requestsDatatableId);
								});
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
					if (!authService.isStudyAdmin()) {
						this.hideColumn("remove");
					}
				}
			}
		};
		return {
			rows: [
				template,
				{
					paddingX: 17,
					paddingY: 10,
					rows: [
						usersTable,
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
								requestsDatatable
							]
						}
					]
				}

			]
		};
	}

	_createImagesPanel(item) {
		const template = {
			template() {
				return `<div class="item-content-header">Images (${item.images ? item.images.length : 0}) </div>`;
			},
			autoheight: true,
			borderless: true
		};
		const datatable = {
			view: "activeDatatable",
			css: "simple-datatable",
			scroll: "y",
			yCount: 10,
			borderless: true,
			rowHeight:	25,
			rowLineHeight: 25,
			columns: [
				{id: "name", header: {text: "Image Name", height: 25}},
				{id: "_id", header: "Image ID", width: 40, fillspace: true}
			],
			data: item.images,
			on: {
				onBeforeRender() {
					const count = this.count();
					if (count < 10) {
						this.define({autoheight: true, yCount: count});
					}
					else {
						this.define({yCount: 10, autoheight: false});
					}
				}
			}
		};
		return {
			rows: [
				template,
				{
					paddingX: 17,
					paddingY: 10,
					cols: [
						datatable
					]
				}
			]
		};
	}

	_createActionsPanel(item) {
		const view = this;
		return {
			rows: [
				{
					template() {
						return "<div class='item-content-header'>Actions</div>";
					},
					autoheight: true,
					borderless: true
				},
				{
					paddingX: 17,
					paddingY: 12,
					cols: [
						{
							view: "button",
							css: "btn",
							value: "Delete study",
							width: 120,
							height: 32,
							on: {
								onItemClick() {
									webix.confirm({
										text: `Permanently remove <b>"${item.name}"</b> study?`,
										type: "confirm-error",
										callback(result) {
											if (result) {
												ajaxActions.removeStudy(item._id).then(() => {
													webix.message("Study has been removed");
													view._load();
												});
											}
										}
									});
								}
							}
						},
						{}
					]
				}
			]
		};
	}

	config() {
		const accordion = {
			id: STUDIES_MANAGEMENT_ACCORDION_ID,
			view: "accordion",
			type: "wide",
			collapsed: true,
			multi: true,
			on: {
				onAfterExpand: (id) => {
					const accordionItem = $$(id);
					// if contentLoaded == true we do not need to send query again
					if (accordionItem.contentLoaded) {
						return;
					}
					const view = this;
					ajaxActions.getStudy(accordionItem.config.elementId).then((item) => {
						accordionItem.getChildViews()[0].addView(view._createInfoPanel(item));
						accordionItem.getChildViews()[0].addView(view._createAnnotatorsPanel(item));
						accordionItem.getChildViews()[0].addView(view._createImagesPanel(item));
						// add condition if studyAdmin, then add action panel
						if (authService.isStudyAdmin()) {
							accordionItem.getChildViews()[0].addView(view._createActionsPanel(item));
						}
						accordionItem.contentLoaded = true;
					});
				}
			},
			rows: []
		};

		const pager = {
			view: "pager",
			id: PAGER_ID,
			master: false,
			size: 8,
			template: "{common.first()} {common.prev()} <span class='pager-info'>{common.page()} page of #limit#</span> {common.next()} {common.last()}",
			on: {
				onItemClick(id, e, node) {
					let offset;
					const lastPage = Math.floor(this.data.count / this.data.size);
					switch (id) {
						case "prev":
						{
							const nextPage = this.data.page > 0 ? this.data.page - 1 : 0;
							offset = nextPage * this.data.size;
							break;
						}
						case "next":
						{
							const nextPage = this.data.page < lastPage ? this.data.page + 1 : lastPage;
							offset = nextPage * this.data.size;
							break;
						}
						case "first":
						{
							offset = 0;
							break;
						}
						case "last":
						{
							offset = lastPage * this.data.size;
							break;
						}
						default:
						{
							offset = 0;
							break;
						}
					}
					const portion = studiesManagementModel.getData(this.data.size, offset);
					if (portion && portion.length) {
						this.$scope._buildAccordion(portion);
					}
				}
			}
		};

		// we need all the same properties for cloned pager. we will clone it in init method
		const clonePager = webix.extend({
			id: CLONE_PAGER_ID
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
				clonePager,
				{}
			]
		};
		return ui;
	}

	_prepareAccordionItems(data) {
		if (data && typeof data.map === "function") {
			//const me = authService.getUserInfo();
			return data.map((item) => {
					/*const foundUser = item.users.find((item) => item._id === me._id);
					const enrolledHtml = foundUser ? "<div class='accordion-item-mark'>Enrolled</div>" : "";*/
					return {
						css: "accordion-item",
						id: `accordion-item-${item._id}`,
						header: `${item.name}`,
						body: {
							rows: []
						},
						elementId: item._id,
						headerAltHeight: 35,
						headerHeight: 35
					};
				}
			);
		}
		return [];
	}

	_buildAccordion(studies) {
		const accordion = $$(STUDIES_MANAGEMENT_ACCORDION_ID);
		if (Array.isArray(studies)) {
			const items = this._prepareAccordionItems(studies);
			webix.ui(items, accordion);
			$$(CONTENT_HEADER_TEMPLATE_ID).setValues({count: items.length});
		}
		else {
			throw new Error("Studies is not Array");
		}
	}

	_load(page, selectedAdminStudiesIdsSet) {
		const params = {
			limit: 26,
			offset: 0,
			sort: "name",
			sortdir: 1
		};
		// after finish data loading we set total count for pager, clone it to displaying it bottom and build accordion
		studiesManagementModel.load(params).then(() => {

			const pager = $$(PAGER_ID);
			const clonePager = $$(CLONE_PAGER_ID);
			pager.define({count: studiesManagementModel.getCount()});
			pager.refresh();
			pager.clone(clonePager);
			pager.select(page);

			const offset = pager.data.page * pager.data.size;
			const portion = studiesManagementModel.getData(pager.data.size, offset);
			this._buildAccordion(portion);

			if (selectedAdminStudiesIdsSet) {
				for (let item of selectedAdminStudiesIdsSet) {
					let accordionItem = $$(item);
					if (accordionItem) {
						accordionItem.expand();
					}
				}
			}
		});
	}

	init() {
		this.use(plugins.UnloadGuard, () => {
			const parentViewName = this.getParentView().getName();
			let selectedAdminStudiesIdsSet = new Set();
			// satadiesManagement can be a part of dashboard page
			if (parentViewName === constants.NAME_VIEW_DASHBOARD) {
				state.dashboard.adminStudiesPage = $$(PAGER_ID).data.page;
				selectedAdminStudiesIdsSet = state.dashboard.selectedDatasetIdsSet;
			}
			$$(STUDIES_MANAGEMENT_ACCORDION_ID).getChildViews().forEach((accordionItem) => {
				if (!accordionItem.config.collapsed) {
					selectedAdminStudiesIdsSet.add(accordionItem.config.id);
				}
			});
		});
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
			this._load(pageNumber, selectedAdminStudiesIdsSet);
		}
		// then it is separate  page and we should check terms of use
		else if (authService.isTermsOfUseAccepted()) {
			this._load(pageNumber, selectedAdminStudiesIdsSet);
		}
		else {
			authService.showTermOfUse(() => {
				this._load(pageNumber, selectedAdminStudiesIdsSet);
			});
		}
	}
}
