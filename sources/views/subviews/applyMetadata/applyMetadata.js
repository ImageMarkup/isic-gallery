import {JetView} from "webix-jet";
import authService from "../../../services/auth";
import ApplyMetadataService from "../../../services/applyMetadata/applyMetadata";
import formats from "../../../utils/formats";

const ID_TEMPLATE_DATASET_INFO = "dataset-info-template";
const ID_PANEL_VALIDATION_RESULTS = "validation-results-panel";
const ID_TEMPLATE_VALIDATION_RESULTS = "validation-results-template";
const ID_FORM = "apply-metadata-form";
const ID_FILE_SELECTION = "apply-metadata-file-selection";

export default class ApplyMetadataView extends JetView {

	config() {

		function prepareFileInfoTemplate(fileInfo) {
			if (!fileInfo) {
				return "";
			}
			const userName = `${fileInfo.user.name}${fileInfo.user.firstName}[${fileInfo.user.lastName}(${fileInfo.user.login}])`;
			return `${formats.formatDateString(fileInfo.time)} - ${fileInfo.file.name} - ${userName}`;

		}

		function prepareHtmlList(data, type) {
			let result = "";
			if (data && data.forEach) {
				result += `<ul class="${type}">`;
				data.forEach((item) => {
					result += `<li>${item.description}</li>`;
				});
				result += "<ul>";
			}
			return result;
		}

		const validationResultsPanel = {
			id: ID_PANEL_VALIDATION_RESULTS,
			multi: true,
			hidden: true,
			type: "wide",
			css: {"margin-top": "20px !important;"},
			view: "accordion",
			rows: [
				{
					header: "<span class='main-subtitle3'>Results</span>",
					autoheight: true,
					css: "accordion-item",
					collapsed: true,
					headerAltHeight: 35,
					headerHeight: 35,
					body: {
						id: ID_TEMPLATE_VALIDATION_RESULTS,
						view: "template",
						template(data) {
							const name = prepareFileInfoTemplate(data.fileInfo);
							const status = data.errors && !data.errors.length ? "valid-file" : "invalid-file";
							let errorsHtml = prepareHtmlList(data.errors, "validation-errors");
							let warningsHtml = prepareHtmlList(data.warnings, "validation-warnings");
							return `<div class='validation-results-block'>
									<div class="validation-results-header ${status}">${name}</div>
									<div class="validation-results-content">
									 	Errors: ${data.errors && data.errors.length ? data.errors.length : "0"}
									 	${errorsHtml}
									</div>
									<div class="validation-results-content">
									 	Warnings: ${data.warnings && data.warnings.length ? data.warnings.length : "0"}
									 	${warningsHtml}
									</div>
								</div>`;
						},
						borderless: true,
						autoheight: true
					},
				},
				{
					paddingY: 15,
					cols: [
						{},
						{
							view: "button",
							css: "btn",
							width: 240,
							disabled: true,
							value: "Save",
							name: "save"
						},
						{}
					]
				}
			]
		};

		const form = {
			view: "form",
			id: ID_FORM,
			type: "clean",
			borderless: true,
			elementsConfig: {
				labelWidth: 250
			},
			margin: 30,
			elements: [
				{
					view: "fieldset",
					label: "Dataset",
					css: "dataset-fieldset",
					body: {
						view: "template",
						id: ID_TEMPLATE_DATASET_INFO,
						autoheight: true,
						borderless: true,
						template(data) {
							return `<div class="item-content-table">
											<div class="item-content-row">
												<span class="item-content-label">Name</span>
												<span class="item-content-value">${data.name ? data.name : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Description</span>
												<span class="item-content-value">${data.description ? data.description : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">License</span>
												<span class="item-content-value">${data.license ? data.license : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Attribution</span>
												<span class="item-content-value">${data.attribution ? data.attribution : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Owner</span>
												<span class="item-content-value">${data.owner ? data.owner : ""}</span>
											</div>
										</div>`;
						}
					}
				},
				{
					view: "fieldset",
					label: "Select metadata file",
					css: "dataset-fieldset",
					body: {
						paddingY: 15,
						margin: 15,
						type: "clean",
						rows: [
							{
								view: "richselect",
								css: "select-field",
								id: ID_FILE_SELECTION,
								label: "Select the metadata file to apply:",
								name: "metadataFile",
								labelPosition: "top",
								placeholder: "Select a file...",
								options: {
									body: {
										template(item) {
											return prepareFileInfoTemplate(item);
										}
									}
								}
							},
							{
								paddingY: 5,
								cols: [
									{},
									{
										view: "button",
										css: "btn-contour",
										width: 140,
										disabled: true,
										value: "Download",
										name: "download"
									}
								]
							}

						]
					}
				},
				{
					view: "fieldset",
					label: "Validate metadata",
					css: "dataset-fieldset",
					body: {
						paddingY: 15,
						type: "clean",
						rows: [
							{
								template: "This section displays any problems with the metadata. Press the button below to validate the metadata. Once validation succeeds, you will be given an option to save the metadata.",
								autoheight: true,
								borderless: true
							},
							{height: 15},
							{
								paddingY: 5,
								cols: [
									{},
									{
										view: "button",
										css: "btn",
										width: 240,
										disabled: true,
										value: "Validate",
										name: "validate"
									},
									{}
								]
							},
							validationResultsPanel
						]
					}
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				{
					template: "<div class='page-header-info'><div class='main-subtitle2'>Apply metadata</div></div>",
					autoheight: true,
					borderless: true
				},
				form,
				{}
			]
		};
		return ui;
	}

	init(view) {
		this.registerMetadataService = new ApplyMetadataService(
			view,
			$$(ID_TEMPLATE_DATASET_INFO),
			$$(ID_FORM),
			$$(ID_TEMPLATE_VALIDATION_RESULTS),
			$$(ID_PANEL_VALIDATION_RESULTS),
			$$(ID_FILE_SELECTION)
		);
	}

	urlChange(view, url) {
		if (!authService.canCreateDataset()) {
			authService.showMainPage();
		}
		else {
			const id = url[url.length - 1].params.datasetId;
			this.registerMetadataService.load(id);
		}
	}
}
