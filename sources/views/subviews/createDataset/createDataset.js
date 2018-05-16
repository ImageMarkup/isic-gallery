import {JetView} from "webix-jet";
import ajaxActions from "../../../services/ajaxActions";
import authService from "../../../services/auth";
import constants from "../../../constants";
import licensesWindow from "./windows/licenseInfo";

const ID_WINDOW_LICENSES = "licenses-window";
const LICENSE_TYPE_CC_0 = "CC-0";
const LICENSE_TYPE_CC_BY = "CC-BY";
const LICENSE_TYPE_CC_BY_NC = "CC-BY-NC";
const ATTRIBUTION_RADIO_ANONYMOUS = "Anonymous";
const ATTRIBUTION_RADIO_ATTRIBUTED = "Attributed";

export default class CreateDatasetView extends JetView {

	config() {

		const form = {
			view: "form",
			type: "clean",
			borderless: true,
			rules: {
				name: webix.rules.isNotEmpty,
				description: webix.rules.isNotEmpty,
				license: webix.rules.isNotEmpty,
				attribution: webix.rules.isNotEmpty,
				owner: webix.rules.isNotEmpty,
				attributedTo: webix.rules.isNotEmpty
			},
			elementsConfig: {
				labelWidth: 120
			},
			margin: 30,
			elements: [
				{
					view: "fieldset",
					label: "Basic information",
					css: "dataset-fieldset",
					body: {
						paddingY: 15,
						margin: 15,
						type: "clean",
						rows: [
							{
								template: "Enter the dataset's name, a detailed description and its owner. The owner may be an individual or an institution.",
								autoheight: true,
								borderless: true
							},
							{
								view: "text",
								css: "text-field",
								label: "Name",
								name: "name",
								invalidMessage: "Enter name"
							},
							{
								view: "textarea",
								css: "textarea-field",
								height: 100,
								label: "Description",
								name: "description",
								invalidMessage: "Enter description"
							},
							{
								view: "text",
								css: "text-field",
								label: "Owner",
								name: "owner",
								invalidMessage: "Enter owner"
							}
						]
					}
				},
				{
					view: "fieldset",
					label: "Licensing",
					css: "dataset-fieldset",
					body: {
						paddingY: 15,
						margin: 15,
						type: "clean",
						rows: [
							{
								template: "Select the license for the dataset.",
								autoheight: true,
								borderless: true
							},
							{
								view: "richselect",
								css: "select-field",
								label: "License",
								name: "license",
								invalidMessage: "Choose license",
								value: "CC-0",
								options: [
									{id: LICENSE_TYPE_CC_0, value: "CC-0 (No restriction)"},
									{id: LICENSE_TYPE_CC_BY, value: "CC-BY (Attribution)"},
									{id: LICENSE_TYPE_CC_BY_NC, value: "CC-BY-NC (Attribution-NonCommercial)"}
								],
								on: {
									onChange(newv, oldv) {
										const currentForm = this.getFormView();
										if (newv !== LICENSE_TYPE_CC_0) {
											currentForm.elements.attribution.setValue(ATTRIBUTION_RADIO_ATTRIBUTED);
										}
									}
								}
							},
							{
								template: "<span class='help-me-choose link'>Help me choose</span>",
								autoheight: true,
								borderless: true,
								onClick: {
									"help-me-choose": () => {
										const win = $$(ID_WINDOW_LICENSES) || webix.ui(licensesWindow.getConfig(ID_WINDOW_LICENSES));
										win.show();
									}
								}
							}
						]
					}
				},
				{
					view: "fieldset",
					label: "Attribution",
					css: "dataset-fieldset",
					body: {
						paddingY: 15,
						type: "clean",
						rows: [
							{
								template: 'Choose how to represent the dataset on the archive as being "contributed by".',
								autoheight: true,
								borderless: true
							},
							{height: 15},
							{
								view: "radio",
								name: "attribution",
								value: "Anonymous",
								vertical: true,
								options: [
									{id: ATTRIBUTION_RADIO_ANONYMOUS, value: "Anonymous"},
									{id: ATTRIBUTION_RADIO_ATTRIBUTED, value: "Attributed to:"}
								],
								on: {
									onChange(newv, oldv) {
										const currentForm = this.getFormView();
										const license = currentForm.elements.license.getValue();
										// to prevent selection of anonymous if has been selected attribution license
										if (license !== LICENSE_TYPE_CC_0) {
											this.blockEvent();
											this.setValue(ATTRIBUTION_RADIO_ATTRIBUTED);
											this.unblockEvent();
											currentForm.elements.attributedTo.enable();
											return;
										}
										if (newv === ATTRIBUTION_RADIO_ATTRIBUTED) {
											currentForm.elements.attributedTo.enable();
										} else {
											currentForm.elements.attributedTo.setValue("");
											currentForm.elements.attributedTo.disable();
										}
									}
								}
							},
							{
								view: "text",
								css: "text-field",
								disabled: true,
								name: "attributedTo",
								invalidMessage: "Enter attributed to"
							}

						]
					}
				},
				{
					paddingY: 10,
					cols: [
						{},
						{
							view: "button",
							css: "btn",
							width: 150,
							value: "Submit",
							on: {
								onItemClick() {
									const thisForm = this.getFormView();
									if (thisForm.validate()) {
										const values = thisForm.getValues();
										if (values.attribution !== "Anonymous") {
											values.attribution = values.attributedTo;
										}
										ajaxActions.createDataset(values).then(() => {
											webix.message("Dataset has been created");
											this.$scope.app.show(constants.PATH_DASHBOARD);
										});
									}
								}
							}
						}
					]
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				{
					template: "<div class='page-header-info'><div class='main-subtitle2'>Create dataset</div></div>",
					autoheight: true,
					borderless: true
				},
				form,
				{}
			]
		};
		return ui;
	}

	urlChange() {
		if (!authService.canCreateDataset()) {
			authService.showMainPage();
		}
	}
}
