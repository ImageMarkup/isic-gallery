import {JetView} from "webix-jet";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import ajaxActions from "../../../services/ajaxActions";
import featuresetModel from "../../../models/featureset";
import dates from "../../../utils/formats";
import authService from "../../../services/auth";

const FEATURESET_ACCORDION_ID = "featureset-accordion-id";
const PAGER_ID = "pager-id";
const CLONE_PAGER_ID = "clone-pager-id";
const CONTENT_HEADER_TEMPLATE_ID = "content-header-template";

function createGlobalFeaturesHtml(gFeatures){
	let globalFeaturesetHTML = "";
	if (gFeatures && gFeatures.length) {
		gFeatures.forEach((gFeature) => {
			let name = Array.isArray(gFeature.name) ? gFeature.name.join(" > ") : gFeature.name;
			let tableRows = "";
			const options = gFeature.options;
			options.forEach((option) => {
				tableRows += `	<tr>
									<td class="highlighted-item">${option.id}</td>
									<td>${option.name}</td>
								</tr>`;
			});

			globalFeaturesetHTML += `<div class="item-content-row">
											<div class="item-content-name">${name}</div>
										</div>
										<div>
											<div class="item-content-row">
												<div class="item-content-label">ID</div>
												<div class="item-content-value highlighted-item">${gFeature.id ? gFeature.id : ""}</div>
											</div>
											<div class="item-content-row">
												<div class="item-content-label">Type</div>
												<div class="item-content-value highlighted-item">${gFeature.type ? gFeature.type : ""}</div>
											</div>
											<div class="item-content-row">
												<div class="item-content-label">Values</div>
												<div class='item-content-value'>
													<table class="feature-options-table">
														<tr>
															<th>ID</th>
															<th>Name</th>
														</tr>
														${tableRows}
													</table>
												</div>
											</div>
										</div>`;
		});
	}
	else {
		globalFeaturesetHTML = "<span class='no-items-label'>None</span>";
	}
	return globalFeaturesetHTML;
}

function createLocalFeaturesHtml(lFeatures){
	let localFeaturesetHTML = "";
	if (lFeatures && lFeatures.length) {
		lFeatures.forEach((lFeature) => {
			let name = Array.isArray(lFeature.name) ? lFeature.name.join(" > ") : lFeature.name;
			localFeaturesetHTML += `<div class="item-content-row">
										<div class="item-content-name">${name}</div>
									</div>
									<div>
										<div class="item-content-row">
											<div class="item-content-label">ID</div>
											<div class="item-content-value highlighted-item">${lFeature.id ? lFeature.id : ""}</div>
										</div>
										<div class="item-content-row">
											<div class="item-content-label">Type</div>
											<div class="item-content-value">${lFeature.type ? lFeature.type : ""}</div>
										</div>
									</div>`;
		});
	}
	else {
		localFeaturesetHTML = "<span class='no-items-label'>None</span>";
	}
	return localFeaturesetHTML;
}

function createAccordionItemTemplate(item) {
	const globalFeaturesetHTML = createGlobalFeaturesHtml(item.globalFeatures);
	const localFeaturesetHTML = createLocalFeaturesHtml(item.localFeatures);
	const html = `	<div class="accordion-item-template">
						<div class="item-content-header">Info</div>
						<div class="item-content-block">
							<div class="item-content-row">
								<div class="item-content-label">Unique ID</div>
								<div class="item-content-value highlighted-item">${item._id ? item._id : ""}</div>
							</div>
							<div class="item-content-row">
								<div class="item-content-label">Version</div>
								<div class="item-content-value highlighted-item">${item.version ? item.version : ""}</div>
							</div>
							<div class="item-content-row">
								<div class="item-content-label">Creator</div>
								<div class="item-content-value">${item.creator && item.creator.name ? item.creator.name : ""}</div>
							</div>
							<div class="item-content-row">
								<div class="item-content-label">Created</div>
								<div class="item-content-value">${dates.formatDateString(item.created)}</div>
							</div>
						</div>
						<div class="item-content-header">Global Features</div>
						<div class="item-content-block">
							${globalFeaturesetHTML}
						</div>
						<div class="item-content-header">Local Features</div>
						<div class="item-content-block">
							${localFeaturesetHTML}
						</div>
					</div>`;
	return html;
}


export default class FeaturesetView extends JetView {
	config() {
		const accordion = {
			id: FEATURESET_ACCORDION_ID,
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
					switch (id){
						case "prev": {
							const nextPage = this.data.page > 0 ? this.data.page - 1 : 0;
							offset = nextPage * this.data.size;
							break;
						}
						case "next": {
							const nextPage = this.data.page < lastPage ? this.data.page + 1 : lastPage;
							offset = nextPage * this.data.size;
							break;
						}
						case "first": {
							offset = 0;
							break;
						}
						case "last": {
							offset = lastPage * this.data.size;
							break;
						}
						default: {
							offset = 0;
							break;
						}
					}
					const portion = featuresetModel.getData(this.data.size, offset);
					if (portion && portion.length){
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
			template: "<div class='page-header-info'><h2 class='main-subtitle2'>Featuresets </h2><div class='page-header-item'>#count# items</div></div>",
			borderless: true,
			autoheight: true,
			data: {count: ""}
		};

		const ui = {
			margin: 10,
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("featureset"),
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
				header: item.name,
				css: "accordion-item",
				body: {
					view: "template",
					autoheight: true,
					borderless: true
				},
				headerAltHeight: 35,
				headerHeight: 35,
				elementId: item._id
			}));
		}
		return [];
	}

	_buildAccordion(dataset) {
		const accordion = $$(FEATURESET_ACCORDION_ID);
		if (Array.isArray(dataset)) {
			const items = this._prepareAccordionItems(dataset);
			webix.ui(items, accordion);
			$$(CONTENT_HEADER_TEMPLATE_ID).setValues({count: items.length});
		}
		else {
			throw new Error("Data set is not Array");
		}
	}
	_load(){
		const params = {
			sort: "name",
			sortdir: 1
		};
		// after finish data loading we set total count for pager, clone it to displaying it bottom and build accordion
		featuresetModel.load(params).then(() => {

			const pager = $$(PAGER_ID);
			const clonePager = $$(CLONE_PAGER_ID);
			pager.define({count: featuresetModel.getCount()});
			pager.refresh();
			pager.clone(clonePager);

			const offset = pager.data.page * pager.data.size;
			const portion = featuresetModel.getData(pager.data.size, offset);
			this._buildAccordion(portion);
		});
	}

	urlChange() {
		if (authService.isLoggedin() || authService.isTermsOfUseAccepted()) {
			this._load();
		}
		else {
			authService.showTermOfUse(() => {
				this._load();
			});
		}

	}
}
