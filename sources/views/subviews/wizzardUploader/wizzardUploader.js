import {JetView} from "webix-jet";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import WizzardUploadService from "../../../services/wizzardUploader/wizzardUploader";
import auth from "../../../services/auth";
import wizardUploaderStorage from "../../../models/wizardUploaderStorage";
import constants from "../../../constants";
import "../../components/templateWithImages";
import termsOfUseDownloadingPanel from "jet-views/parts/termsOfUseLinks";
import termsOfUseHTML from "../../templates/termsOfUse.html";

const MARGIN_FORM = 15;

const ID_TEMPLATE_PREVIEW = "template-image-preview";
const ID_TEMPLATE_DROP_AREA = "drag-and-drop-area-template";
const ID_DROP_AREA_PANEL = "drop-area-panel";
const ID_TEMPLATE_UPLOADER_BODY = "uploader-body-template";
const ID_UPLOADER = "uploader-api-only";
const ID_FORM = "wizzard-uploader-form";
const ID_BUTTON_DELETE_FILE = "delete-file-button";
const ID_BUTTON_EXPORT_CSV = "export-csv-button";
const ID_BUTTON_CLEAR_SESSION = "clear-session-button";
const ID_CHECKBOX_SIGNATURE_APPROVE = "signature-approve-checkbox";

const WIDTH_LABEL = 135;

export default class WizzardUploaderView extends JetView {
	config() {
		const uploaderPanel = {
			margin: 15,
			css: "uploader-panel",
			rows: [
				{
					view: "multiview",
					cells: [
						{
							align: "absolute",
							css: "drag-and-drop-area",
							id: ID_DROP_AREA_PANEL,
							body: {
								id: ID_TEMPLATE_DROP_AREA,
								template: "<p class='drag-and-drop-area-inner'>Drop Image to Upload or <span class='link click-here-link'>Click Here</span></p>",
								width: 360,
								height: 360,
								onClick: {
									"click-here-link": () => {
										$$(ID_UPLOADER).fileDialog();
									}
								}
							}
						},
						{
							id: ID_TEMPLATE_PREVIEW,
							view: "templateWithImages",
							css: "image-width-100",
							template(data) {
								return `<img src="${data.src}" alt="">`;
							},
							borderless: true,
							autoheight: true
						}
					]
				},
				{
					template: "You can only choose one image to upload",
					autoheight: true,
					borderless: true
				},
				{
					margin: 20,
					cols: [
						{
							view: "button",
							css: "btn-contour",
							width: 95,
							height: 28,
							value: "Choose File",
							on: {
								onItemClick() {
									$$(ID_UPLOADER).fileDialog();
								}
							}
						},
						{
							view: "template",
							id: ID_TEMPLATE_UPLOADER_BODY,
							css: "btn-hint",
							template(data) {
								const names = [];
								if (data.each) {
									data.each((obj) => {
										names.push(obj.name);
									});
								}
								return `<div class='selected-file-name'>${names.length ? names.join(", ") : "No file chosen"}</div>`;
							},
							autoheight: true,
							borderless: true
						}
					]
				},
				{
					margin: 20,
					cols: [
						{
							view: "button",
							id: ID_BUTTON_DELETE_FILE,
							css: "btn-contour",
							width: 105,
							disabled: true,
							value: "Remove File"
						},
						{
							view: "button",
							id: ID_BUTTON_EXPORT_CSV,
							css: "btn-contour",
							width: 105,
							disabled: true,
							value: "Request CSV"
						},
						{
							view: "button",
							id: ID_BUTTON_CLEAR_SESSION,
							css: "btn-contour",
							width: 105,
							disabled: true,
							value: "Clear session"
						}
					]
				}
			]
		};

		// all restriction logic for controls are in service file
		const rightPanel = {
			gravity: 2,
			margin: MARGIN_FORM,
			rows: [
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
					view: "text",
					css: "text-field name-input-overflow",
					name: "filename",
					label: "Filename",
					disabled: true,
					invalidMessage: "Filename is required"
				},
				{
					view: "text",
					css: "text-field",
					name: "age",
					required: true,
					invalidMessage: "Incorrect value. Please enter whole number from 1 to 99, enter 0 if age is unknown",
					label: "Age"
				},
				{
					view: "richselect",
					css: "select-field",
					name: "sex",
					label: "Sex",
					options: [
						{id: "", value: "", $empty: true},
						{id: "male", value: "Male"},
						{id: "female", value: "Female"},
						{id: "unknown", value: "Unknown"}
					]
				},
				{
					view: "richselect",
					css: "select-field",
					name: "image_type",
					label: "Image Type",
					options: [
						{id: "", value: "", $empty: true},
						{id: "contact non polarized dermoscopy", value: "Contact Non-Polarized Dermoscopy"},
						{id: "contact polarized dermoscopy", value: "Contact Polarized Dermoscopy"},
						{id: "macroscopic", value: "Non-contact NPD (Macroscopic)"},
						{id: "non contact polarized dermoscopy", value: "Non-contact Polarized Dermoscopy"},
						{id: "unknown", value: "Unknown"}
					]
				},
				{
					view: "richselect",
					css: "select-field",
					name: "diagnosis_confirm_type",
					label: "Dx Confirm Type",
					options: [
						{id: "", value: "", $empty: true},
						{id: "single image expert consensus", value: "Expert Consensus (3 raters)"},
						{id: "histopathology", value: "Histopathology"},
						{id: "serial imaging showing no change", value: "Serial Imaging Showing No Change"},
						{id: "unknown", value: "Unknown"}
					]
				},
				{
					view: "richselect",
					css: "select-field",
					name: "diagnosis",
					required: true,
					label: "Diagnosis",
					invalidMessage: "Diagnosis is required",
					options: [
						{id: "", value: "", $empty: true},
						{id: "atypical melanocytic proliferation", value: "AMP"},
						{id: "AIMP", value: "AIMP"},
						{id: "melanoma", value: "Melanoma"},
						{id: "melanoma metastasis", value: "Melanoma Metastasis"},
						{id: "nevus", value: "Nevus"},
						{id: "other", value: "Other"},
						{id: "unknown", value: "Unknown"}
					]
				},
				{
					view: "richselect",
					css: "select-field",
					name: "benign_malignant",
					label: "Benign/Malignant",
					required: true,
					invalidMessage: "Benign/Malignant is required",
					options: [
						{id: "", value: "", $empty: true},
						{id: "benign", value: "Benign"},
						{id: "indeterminate", value: "Indeterminate"},
						{id: "indeterminate/benign", value: "Indeterminate favoring benign"},
						{id: "indeterminate/malignant", value: "Indeterminate favoring malignant"},
						{id: "malignant", value: "Malignant"},
						{id: "unknown", value: "Unknown"}
					]
				},
				{
					view: "richselect",
					css: "select-field",
					name: "nevus_type",
					label: "Nevus Type",
					options: [
						{id: "", value: "", $empty: true},
						{id: "blue", value: "Blue"},
						{id: "combined", value: "Combined"},
						{id: "deep penetrating", value: "Deep Penetrating"},
						{id: "halo", value: "Halo"},
						{id: "nevus nos", value: "Nevus NOS"},
						{id: "pigmented spindle cell of reed", value: "Pigmented Spindle Cell of Reed"},
						{id: "plexiform spindle cell", value: "Plexiform Spindle Cell"},
						{id: "recurrent", value: "Persistent/Recurrent"},
						{id: "special site", value: "Special Site"},
						{id: "spitz", value: "Spitz"},
						{id: "not applicable", value: "Not Applicable"},
						{id: "unknown", value: "Unknown"}
					]
				},
				{
					view: "text",
					css: "text-field",
					name: "camera_type",
					label: "Camera Type"
				},
				{
					template: "<span class='main-subtitle3'>Melanoma Type</span>",
					autoheight: true,
					borderless: true
				},
				{
					margin: 30,
					cols: [
						{
							margin: MARGIN_FORM,
							rows: [
								{
									view: "richselect",
									css: "select-field",
									name: "mel_class",
									label: "Melanoma Class",
									options: [
										{id: "", value: "", $empty: true},
										{id: "invasive melanoma", value: "Invasive Melanoma"},
										{id: "melanoma in situ", value: "Melanoma In Situ"},
										{id: "melanoma nos", value: "Melanoma NOS"},
										{id: "recurrent/persistent, in situ", value: "Recurrent/persistent, in situ"},
										{id: "recurrent/persistent, invasive", value: "Recurrent/persistent, Invasive"},
										{id: "not applicable", value: "Not Applicable"},
										{id: "unknown", value: "Unknown"}
									]
								},
								{
									view: "richselect",
									css: "select-field",
									name: "mel_mitotic_index",
									label: "Miltotic Index",
									options: [
										{id: "", value: "", $empty: true},
										{id: "0/mm^2", value: "0/mm^2"},
										{id: "<1/mm^2", value: "&lt;1/mm^2"},
										{id: "1/mm^2", value: "1/mm^2"},
										{id: "2/mm^2", value: "2/mm^2"},
										{id: "3/mm^2", value: "3/mm^2"},
										{id: "4/mm^2", value: "4/mm^2"},
										{id: ">5/mm^2", value: "&gt;5/mm^2"},
										{id: "not applicable", value: "Not Applicable"},
										{id: "unknown", value: "Unknown"}
									]
								},
								{
									view: "text",
									css: "text-field multiline-label",
									name: "mel_thick_mm",
									label: "Thickness <br> (in millimeters)",
									invalidMessage: "Incorrect value. Please enter number from 0 to 999. Can be fractional."
								}
							]
						},
						{
							margin: MARGIN_FORM,
							rows: [
								{
									view: "richselect",
									css: "select-field",
									name: "mel_type",
									label: "Melanoma Subtype",
									options: [
										{id: "", value: "", $empty: true},
										{id: "lentigo_maligna", value: "Lentigo Maligna Melanoma"},
										{id: "nodular", value: "Nodular"},
										{id: "nos", value: "Not Otherwise Specified"},
										{id: "spindle_cell", value: "Spindle Cell Features"},
										{id: "ssm", value: "Superficial Spreading"},
										{id: "not applicable", value: "Not Applicable"},
										{id: "unknown", value: "Unknown"}
									]
								},
								{
									view: "richselect",
									css: "select-field",
									name: "mel_ulcer",
									label: "Ulcer",
									options: [
										{id: "", value: "", $empty: true},
										{id: "yes", value: "Yes"},
										{id: "no", value: "No"},
										{id: "not applicable", value: "Not Applicable"},
										{id: "unknown", value: "Unknown"}
									]
								},
								{
									view: "richselect",
									css: "select-field multiline-label",
									name: "thickness_categorical",
									label: "Thickness <br> (categorical)",
									invalidMessage: "Thickness is required",
									options: [
										{id: "", value: "", $empty: true},
										{id: "less than 0.8", value: "&lt;= 0.8mm"},
										{id: "more than 0.8", value: "&gt; 0.8mm"},
										{id: "more than 1", value: "&gt; 1mm"},
										{id: "more than 2", value: "&gt; 2mm"},
										{id: "more than 3", value: "&gt; 3mm"},
										{id: "more than 4", value: "&gt; 4mm"},
										{id: "more than 5", value: "&gt; 5mm"},
										{id: "not applicable", value: "Not Applicable"},
										{id: "unknown", value: "Unknown"}
									]
								}
							]
						}
					]
				},
				{
					margin: 2,
					cols: [
						{
							template: "Contributor license agreement",
							css: "left-label-template wizard-tool-license-template",
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
										css: "wizard-tool-license-scrollview",
										height: 250,
										body: {
											rows: [
												{
													view: "template",
													template: termsOfUseHTML,
													autoheight: true
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
					cols: [
						{
							template: "<span class='main-subtitle3'>Electronic <span style='color: red;'>*</span> signature</span>",
							borderless: true,
							autoheight: true,
							width: WIDTH_LABEL
						},
						{
							view: "checkbox",
							id: ID_CHECKBOX_SIGNATURE_APPROVE,
							css: "checkbox-ctrl",
							name: "signature_approve",
							hidden: true,
							width: 35,
							value: 1
						},
						{
							view: "text",
							css: "text-field",
							name: "signature",
							value: webix.storage.session.get("signature") || "",
							placeholder: "Signature",
							invalidMessage: "Incorrect signature"
						}
					]
				},
				{
					cols: [
						{
							template: "<div style=\"padding-top: 11px;\"><span style=\"color: red;\">*</span> Indicates required field</div>",
							borderless: true
						},
						{},
						{
							view: "button",
							css: "btn wizard-tool-submit-button",
							width: 105,
							value: "Submit",
							name: "submit"
						}
					]
				}
			]
		};

		function thicknessRule(value, fields, name) {
			if (fields.diagnosis === "melanoma") {
				return webix.rules.isNotEmpty(value);
			}
			return true;
		}

		const form = {
			view: "form",
			id: ID_FORM,
			type: "clean",
			borderless: true,
			rules: {
				age: (value, fields, name) => {
					const pattern = new RegExp("^[0-9]{1,2}$");
					return pattern.test(value);
				},
				filename: webix.rules.isNotEmpty,
				dataset: webix.rules.isNotEmpty,
				signature: (value, fields, name) => {
					const pattern = new RegExp("^[a-zA-Z]+$");
					return pattern.test(value);
				},
				benign_malignant: webix.rules.isNotEmpty,
				diagnosis: webix.rules.isNotEmpty,
				mel_thick_mm: (value, fields, name) => {
					const pattern = new RegExp("^[0-9]{1,3}[\\.]?[0-9]*$");
					const num = parseFloat(value) || 0;
					return num >= 0 && num < 1000 && (value !== "" ? pattern.test(value) : true);
				},
				thickness_categorical: thicknessRule
			},
			elementsConfig: {
				labelWidth: WIDTH_LABEL
			},
			elements: [
				{
					cols: [
						uploaderPanel,
						{width: 30},
						{width: 30},
						rightPanel
					]
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("wizzardUploader"),
				form,
				{}
			]

		};
		return ui;
	}

	init() {
		this.uploader = this.ui({
			id: ID_UPLOADER,
			view: "uploader",
			upload: "",
			urlData: {
				filename: "", // setted in WizzardUploadService
				signature: "" // setted in WizzardUploadService
			},
			link: ID_TEMPLATE_UPLOADER_BODY,
			multiple: false,
			autosend: false,
			apiOnly: true,
			accept: "image/png, image/gif, image/jpeg"
		});
		$$(ID_UPLOADER).addDropZone($$(ID_TEMPLATE_DROP_AREA).$view, "");
		this.uploaderService = new WizzardUploadService(
			this,
			$$(ID_FORM),
			this.uploader,
			$$(ID_BUTTON_DELETE_FILE),
			$$(ID_BUTTON_EXPORT_CSV),
			$$(ID_BUTTON_CLEAR_SESSION),
			$$(ID_TEMPLATE_PREVIEW),
			$$(ID_DROP_AREA_PANEL)
		);
	}

	urlChange() {
		// we should mark "archive" item in header menu for this page
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_ARCHIVE}]);
		// if we set signature earlier we can't change it
		const signature = wizardUploaderStorage.getSignature();
		if (signature) {
			const form = $$(ID_FORM);
			const lastStoredFile = wizardUploaderStorage.getLastFile();
			form.elements.signature.disable();
			form.elements.signature_approve.show();
			form.setValues({
				signature,
				signature_approve: 1,
				image_type: lastStoredFile.image_type,
				diagnosis_confirm_type: lastStoredFile.diagnosis_confirm_type
			});
			$$(ID_BUTTON_CLEAR_SESSION).enable();
		}

		if (!auth.canCreateDataset()) {
			auth.showMainPage();
		}
	}

	getDiagnosisSelectView() {
		return this.getRoot().queryView({name: "diagnosis"});
	}
}
