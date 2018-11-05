import {JetView} from "webix-jet";
import authService from "../../../services/auth";
import Breadcrumbs from "../../../services/breadcrumbs";
import BatchUploadService from "../../../services/batchUpload/batchUpload";
import termsOfUseHTML from "../../templates/termsOfUse.html";
import termsOfUseDownloadingPanel from "../../parts/termsOfUseLinks";
import constants from "../../../constants";

const ID_DATASET_INFO_PANEL = "batch-dataset-info";
const ID_UPLOADER = "batch-uploader";
const ID_TEMPLATE_UPLOADER_BODY = "batch-uploader-template";
const ID_BUTTON_DELETE_FILE = "batch-upload-delete-file";
const ID_FORM = "batch-upload-form";
const WIDTH_LABEL = 150;

export default class BatchUploadView extends JetView {

	config() {

		const leftPanel = {
			type: "clean",
			margin: 15,
			rows: [
				{
					template: "<span class='main-subtitle2'>Batch Upload</span>",
					borderless: true,
					autoheight: true
				},
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
							upload: "", // will be setted in BatchUploadService
							urlData: {
								filename: "", // will be setted in BatchUploadService
								signature: "" // will be setted in BatchUploadService
							},
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
				},
				{
					cols: [
						{
							view: "button",
							id: ID_BUTTON_DELETE_FILE,
							css: "btn-contour",
							width: 136,
							disabled: true,
							value: "Remove File"
						},
						{}
					]
				}
			]
		};

		const rightPanel = {
			gravity: 3,
			margin: 15,
			rows: [
				{
					template: "<span class='main-subtitle2'>Basic Information</span>",
					borderless: true,
					autoheight: true
				},
				{
					view: "richselect",
					css: "select-field",
					name: "dataset",
					label: "Dataset",
					invalidMessage: "Choose Dataset",
					options: {
						body: {
							template: "#name#"
						}
					}
				},
				{
					paddingX: 5,
					rows: [
						{
							template: () => {
								let createNewDatasetTemplate = authService.canCreateDataset() ? "<span class='create-new-dataset-link link'>Create new dataset</span>" : "";
								return createNewDatasetTemplate;
							},
							autoheight: true,
							borderless: true,
							width: 160,
							onClick: {
								"create-new-dataset-link": () => {
									this.app.show(constants.PATH_CREATE_DATASET);
								}
							}
						}
					]
				},
				{
					id: ID_DATASET_INFO_PANEL,
					hidden: true,
					rows: [
						{
							cols: [
								{view: "label", css: "left-label", label: "Dataset owner", width: WIDTH_LABEL},
								{view: "label", name: "owner"} // label will be set after form.setValue
							]
						},
						{
							cols: [
								{view: "label", css: "left-label", label: "Dataset description", width: WIDTH_LABEL},
								{view: "label", name: "description"} // label will be set after form.setValue
							]
						}
					]
				},
				{
					margin: 15,
					type: "clean",
					rows: [
						{
							margin: 2,
							cols: [
								{
									template: "Contributor license agreement",
									css: "left-label-template",
									autoheight: true,
									borderless: true,
									width: WIDTH_LABEL
								},
								{
									rows: [
										{
											align: "absolute",
											body: {
												view: "scrollview",
												height: 250,
												body: {
													width: 700,
													rows: [
														{
															view: "template",
															template: termsOfUseHTML,
															autoheight: true,
															borderless: true
														}
													]
												}
											}
										},
										termsOfUseDownloadingPanel.getDownloadingPanel()
									]
								}

							]
						},
						{
							view: "text",
							label: "Electronic <br> signature",
							name: "signature",
							css: "text-field multiline-label",
							invalidMessage: "Enter your name"
						}
					]
				},
				{
					paddingY: 10,
					cols: [
						{},
						{
							view: "button",
							css: "btn",
							width: 150,
							name: "submit",
							value: "Submit"
						}
					]
				}
			]
		};

		const form = {
			view: "form",
			id: ID_FORM,
			type: "clean",
			borderless: true,
			rules: {
				dataset: webix.rules.isNotEmpty,
				signature: webix.rules.isNotEmpty
			},
			elementsConfig: {
				labelWidth: WIDTH_LABEL
			},
			elements: [
				{
					margin: 50,
					cols: [
						leftPanel,
						rightPanel
					]
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				Breadcrumbs.getBreadcrumbsTemplate("batchUploader"),
				{height: 3},
				form,
				{}
			]
		};
		return ui;
	}

	init(view) {
		this._batchUploadService = new BatchUploadService(
			view,
			$$(ID_FORM),
			$$(ID_UPLOADER),
			$$(ID_BUTTON_DELETE_FILE),
			$$(ID_DATASET_INFO_PANEL)
		);
	}

	urlChange() {
		if (!authService.canCreateDataset()) {
			authService.showMainPage();
		}
	}
}
