import {JetView} from "webix-jet";
import authService from "../../../services/auth";
import RegisterMetadataService from "../../../services/registerMetadata/registerMetadata";

const ID_TEMPLATE_DATASET_INFO = "register-metadata-dataset-info-template";
const ID_UPLOADER = "register-metadata-uploader";
const ID_TEMPLATE_UPLOADER_BODY = "register-metadata-uploader-template";
const ID_REGISTER_METADATA_FORM = "register-metadata-form";
const ID_SUBMIT_BUTTON = "register-metadata-submit-button";

export default class RegisterMetadataView extends JetView {

	config() {

		const form = {
			view: "form",
			id: ID_REGISTER_METADATA_FORM,
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
					label: "Upload metadata",
					css: "dataset-fieldset",
					body: {
						paddingY: 15,
						type: "clean",
						rows: [
							{
								template: "Upload a CSV file of image metadata. The <i>filename</i> column should contain an image filename (including file extension). All other columns are considered to be clinical metadata; these other column names may not contain the period (.) character.",
								autoheight: true,
								borderless: true
							},
							{height: 15},
							{
								margin: 20,
								css: "uploader-panel",
								cols: [
									{
										view: "uploader",
										id: ID_UPLOADER,
										css: "btn-contour",
										width: 95,
										height: 28,
										value: "Choose File",
										link: ID_TEMPLATE_UPLOADER_BODY,
										multiple: false,
										autosend: false
									},
									{
										view: "template",
										id: ID_TEMPLATE_UPLOADER_BODY,
										css: "btn-hint selected-file-name",
										template(data) {
											const names = [];
											if (data.each) {
												data.each((obj) => {
													names.push(obj.name);
												});
											}
											return names.length ? names.join(", ") : "No file chosen";
										},
										autoheight: true,
										borderless: true
									}
								]
							}
						]
					}
				},
				{
					paddingY: 5,
					cols: [
						{},
						{
							view: "button",
							id: ID_SUBMIT_BUTTON,
							css: "btn",
							width: 140,
							value: "Submit",
							name: "submit"
							// on: {
							// 	onItemClick() {
							// 		webix.message("Not implemented yet");
							// 	}
							// }
						}
					]
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				{
					template: "<div class='page-header-info'><div class='main-subtitle2'>Register metadata</div></div>",
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
		this.registerMetadataService = new RegisterMetadataService(
			view,
			$$(ID_TEMPLATE_DATASET_INFO),
			$$(ID_REGISTER_METADATA_FORM),
			$$(ID_UPLOADER),
			$$(ID_TEMPLATE_UPLOADER_BODY),
			$$(ID_SUBMIT_BUTTON)
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
