import {JetView, plugins} from "webix-jet";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import ajaxActions from "../../../services/ajaxActions";
import datasetModel from "../../../models/dataset";
import dates from "../../../utils/formats";
import authService from "../../../services/auth";
import accessControlWindow from "./windows/accessControl";
import util from "../../../utils/util";
import constants from "../../../constants";
import state from "../../../models/state";

const DATASET_ACCORDION_ID = "dataset-accordion-id";
const PAGER_ID = "pager-id";
const CLONE_PAGER_ID = "clone-pager-id";
const CONTENT_HEADER_TEMPLATE_ID = "content-header-template";
const ACCESS_CONTROL_WINDOW_ID = "access-control-window";

export default class DatasetView extends JetView {

	config() {

		function _prepareUsersListData(data) {
			data.users.forEach((item) => {
				item._modelType = "user";
			});
			data.groups.forEach((item) => {
				item._modelType = "group";
			});
			return data.groups.concat(data.users);
		}

		function createActionsPanel(item) {
			const isNeedShowButton = authService.getUserInfo()._accessLevel >= 1;
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
						margin: 10,
						cols: [
							{
								view: "button",
								css: "btn",
								value: "Register metadata",
								width: 150,
								height: 32,
								hidden: !isNeedShowButton,
								on: {
									onItemClick() {
										//const url = `${constants.URL_ISIC_SITE}#dataset/${item._id}/metadata/register`;
										const url = `${constants.URL_API}/redirects/registerMetadata?datasetId=${item._id}`;
										util.openInNewTab(url);
									}
								}
							},
							{
								view: "button",
								css: "btn",
								value: "Apply metadata",
								width: 150,
								height: 32,
								hidden: !isNeedShowButton,
								on: {
									onItemClick() {
										//const url = `${constants.URL_ISIC_SITE}#dataset/${item._id}/metadata/apply`;
										const url = `${constants.URL_API}/redirects/applyMetadata?datasetId=${item._id}`;
										util.openInNewTab(url);
									}
								}
							},
							{
								view: "button",
								css: "btn",
								value: "Set access",
								width: 110,
								height: 32,
								on: {
									onItemClick() {
										const win = $$(ACCESS_CONTROL_WINDOW_ID);
										ajaxActions.getDatasetAccess(item._id).then((data) => {
											if (!data) {
												return;
											}
											const list = $$(accessControlWindow.getListId());
											const form = $$(accessControlWindow.getFormId());
											form.config.datasetId = item._id;
											const template = $$(accessControlWindow.getTemplateId());
											template.setValues({name: item.name});

											const values = form.getCleanValues();
											values.public = data.public.toString();
											form.setValues(values);

											list.clearAll();
											const users = _prepareUsersListData(data.access);
											list.parse(users);
											win.show();
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

		const accordion = {
			id: DATASET_ACCORDION_ID,
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
					ajaxActions.getDatasetItem(accordionItem.config.elementId).then((item) => {
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

										</div>
										<div class="item-content-header">Description</div>
										<div class="item-content-block">
											<div class="item-content-row">
												<span class="item-content-label">Owner</span>
												<span class="item-content-value">${item.owner ? item.owner : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Description</span>
												<span class="item-content-value">${item.description ? item.description : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">License</span>
												<span class="item-content-value">${item.license ? item.license : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Attribution</span>
												<span class="item-content-value">${item.anonimus ? "Anonymous" : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Signature</span>
												<span class="item-content-value">${item.signature ? item.signature : ""}</span>
											</div>
										</div>
									</div>`;
						accordionItem.getChildViews()[0].addView({
							template: html,
							autoheight: true,
							borderless: true
						});
						if (authService.isStudyAdmin()) {
							accordionItem.getChildViews()[0].addView(createActionsPanel(item));
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
					const portion = datasetModel.getData(this.data.size, offset);
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
				let addButtomHtml = authService.canCreateDataset() ? "<span class='site-btn add-dataset-btn'>+</span>" : "";
				return `<div class='page-header-info'><h2 class='main-subtitle2'>Datasets</h2> ${addButtomHtml} <div class='page-header-item'>${data.count} items</div></div>`;
			},
			borderless: true,
			autoheight: true,
			data: {count: ""},
			onClick: {
				"add-dataset-btn": () => {
					this.app.show(constants.PATH_CREATE_DATASET);
				}
			}
		};

		const ui = {
			margin: 10,
			rows: [
				//BreadcrumbsManager.getBreadcrumbsTemplate("dataset"),
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
			return data.map(item => ({
				css: "accordion-item",
				// function is used because we can have # as variable value. # is reserved for webix template
				header: () => (item.name),
				id: `accordion-item-${item._id}`,
				body: {
					rows: []
				},
				elementId: item._id,
				headerAltHeight: 35,
				headerHeight: 35
			}));
		}
		return [];
	}

		_buildAccordion(dataset) {
		const accordion = $$(DATASET_ACCORDION_ID);
		if (Array.isArray(dataset)) {
			const items = this._prepareAccordionItems(dataset);
			webix.ui(items, accordion);
			this.rendered = true; // set the mark that accordion has been built
			$$(CONTENT_HEADER_TEMPLATE_ID).setValues({count: items.length});
		}
		else {
			throw new Error("Data set is not Array");
		}
	}

	_load(page, selectedDatasetIdsSet) {
		const params = {
			sort: "name",
			sortdir: 1
		};
		// after finish data loading we set total count for pager, clone it to displaying it bottom and build accordion
		datasetModel.load(params).then(() => {

			const pager = $$(PAGER_ID);
			const clonePager = $$(CLONE_PAGER_ID);
			pager.define({count: datasetModel.getCount()});
			pager.refresh();
			pager.clone(clonePager);
			pager.select(page);

			const offset = pager.data.page * pager.data.size;
			const portion = datasetModel.getData(pager.data.size, offset);
			this._buildAccordion(portion);

			if (selectedDatasetIdsSet) {
				for (let item of selectedDatasetIdsSet) {
					let accordionItem = $$(item);
					if (accordionItem) {
						accordionItem.expand();
					}
				}
			}
		});
	}

	init() {
		this._setAccessWindow = this.ui(accessControlWindow.getConfig(ACCESS_CONTROL_WINDOW_ID));
		this.use(plugins.UnloadGuard, () => {
			const parentViewName = this.getParentView().getName();
			let selectedDatasetIdsSet = new Set();
			// dataset is a part of dashboard page
			if (parentViewName === constants.NAME_VIEW_DASHBOARD) {
				state.dashboard.datasetPage = $$(PAGER_ID).data.page;
				selectedDatasetIdsSet = state.dashboard.selectedDatasetIdsSet;
			}
			const accordion = $$(DATASET_ACCORDION_ID);
			accordion.getChildViews().forEach((accordionItem) => {
				if (!accordionItem.config.collapsed) {
					selectedDatasetIdsSet.add(accordionItem.config.id);
				}
			});
		});
	}

	urlChange() {
		// remain previous state of accordion
		const parentViewName = this.getParentView().getName();
		let pageNumber = 0;
		let selectedDatasetIdsSet;
		// dataset may be a part of dashboard page
		if (parentViewName === constants.NAME_VIEW_DASHBOARD) {
			pageNumber = state.dashboard.datasetPage || 0;
			selectedDatasetIdsSet = state.dashboard.selectedDatasetIdsSet;
			this._load(pageNumber, selectedDatasetIdsSet);
		}
		// then it is separate dataset page and we should check terms of use
		else if (authService.isTermsOfUseAccepted()) {
			this._load(pageNumber, selectedDatasetIdsSet);
		}
		else {
			authService.showTermOfUse(() => {
				this._load(pageNumber, selectedDatasetIdsSet);
			});
		}
	}
}
