import {JetView} from "webix-jet";
import authService from "../../../services/auth";
import Breadcrumbs from "../../../services/breadcrumbs";
import BatchUploadService from "../../../services/batchUpload/batchUpload";
import termsOfUseMD from "../../templates/termsOfUse.md";
import mdLoader from "../../../services/mdLoader";
import termsOfUseDownloadingPanel from "../../parts/termsOfUseLinks";
import constants from "../../../constants";
import createDatasetModel from "../../../models/createDatasetModel";

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
					template: "Zip archive should contain only <br> images with unique file names",
					height: 34,
					borderless: true
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
					required: true,
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
									let clicked = "batch-upload";
									createDatasetModel.setCreateDatasetClicked(clicked);
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
								{view: "template",
									name: "description",
									borderless: true,
									template: (obj) => {
										let objectLength = obj.length;
										let templateStyle;
										if (objectLength < 120) {
											templateStyle = "padding-top:" + "10px;";
										}
										else if (objectLength > 120 && objectLength < 240) {
											templateStyle = "";
										}
										else {
											templateStyle = "overflow:" + "scroll;" + "height:" + "55px;";
										}
										return `<div style=${templateStyle}>${obj}</div>`;
									}} // label will be set after form.setValue
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
												css: "terms-of-use-border-color",
												height: 250,
												body: {
													width: 700,
													rows: [
														{
															view: "template",
															template: () => `<div class='inner-page-content terms-of-use'>${mdLoader.render(termsOfUseMD)}</div>`,
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
							required: true,
							css: "text-field multiline-label",
							invalidMessage: "Enter your name"
						}
					]
				},
				{
					paddingY: 10,
					cols: [
						{
							template: "<div style=\"padding-top: 11px;\"><span style=\"color: red;\">*</span> Indicates required field</div>",
							borderless: true
						},
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
				signature: (value) => {
					const lettersRegex = /^[A-Za-z\s]+$/;
					const spacesRegex = /\s/g;
					if (value.replace(spacesRegex, "").length >= 3 && value.match(lettersRegex)) {
						return value;
					}
				}
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
		else {
			this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_ARCHIVE}]);
		}
	}

	getDescriptionTemplate() {
		return this.getRoot().queryView({name: "description"});
	}
}
