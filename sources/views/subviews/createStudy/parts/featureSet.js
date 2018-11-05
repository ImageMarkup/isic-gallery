import {JetView} from "webix-jet";
import "../../../components/activeList";
import featureSetDataModel from "../../../../models/featureSetDataModel";

let skinObjectValue;
let objectPropertyValue;
let listItemData;
let listDataToParse;

export default class FeatureSet extends JetView {
	config() {
		const skinObjectSelection = {
			view: "richselect",
			label: "Skin Object",
			name: "skinObjectSelectionName",
			css: "select-field",
			placeholder: "Select object",
			options: {
				data: [
					"Lines",
					"Globules / Clods",
					"Dots",
					"Circles & Semicircles",
					"Structureless",
					"Vessels",
					"Network",
					"Pattern",
					"Regression structures",
					"Shiny white structures",
					"Facial Skin",
					"Volar lesions",
					"Nail lesions",
					"Miscellaneous"
				],
				body: {
					template: obj => obj.id || ""
				}
			},
			on: {
				onChange: (id) => {
					skinObjectValue = id;
					let objectPropertyData = this.getObjectProperties();
					let propertyList = this.objectPropertySelection.getList();
					propertyList.clearAll();
					propertyList.parse({
						data: objectPropertyData
					});
					if (!this.objectPropertySelection.isEnabled()) {
						this.objectPropertySelection.enable();
					}
				}
			}
		};

		const objectPropertySelection = {
			view: "richselect",
			label: "Object property",
			name: "objectPropertyName",
			css: "select-field",
			placeholder: "Select property",
			disabled: true,
			options: {
				body: {
					template: obj => obj.id || ""
				}
			},
			on: {
				onChange: (id) => {
					objectPropertyValue = id;
					listItemData = `${skinObjectValue} : ${objectPropertyValue}`;
					let synonymsArray = this.getFeatureSynonyms();
					let synonymsLength = synonymsArray.length;
					if (!synonymsLength) {
						listDataToParse = listItemData;
					}
					else {
						listDataToParse = synonymsArray;
					}
				}
			}
		};

		const addFeatureButton = {
			view: "button",
			css: "btn",
			value: "Add Feature",
			width: 110,
			height: 32,
			click: () => {
				if (listDataToParse === undefined) {
					webix.alert({
						title: "Attention",
						text: "You have to select skin object and object property to add feature."
					});
				}
				else {
					this.activeList.parse({
						data: listDataToParse
					});
					this.activeList.callEvent("onAfterPropertyUpdated");
				}
			}
		};

		const featureSetForm = {
			view: "form",
			css: "feature-set-form",
			elements: [
				skinObjectSelection,
				objectPropertySelection,
				{
					css: {"padding-top": "3px;", "padding-left": "1px;"},
					cols: [
						addFeatureButton,
						{}
					]
				}
			],
			elementsConfig: {
				labelPosition: "top"
			}
		};

		const featureSetList = {
			view: "activeList",
			css: "feature-set-list",
			activeContent: {
				deleteButton: {
					view: "button",
					type: "icon",
					css: "delete-icon-button",
					icon: "times",
					width: 25,
					height: 25,
					click: (id) => {
						const deleteButton = $$(id);
						let listItemId = deleteButton.config.$masterId;
						this.activeList.remove(listItemId);
						this.activeList.callEvent("onAfterPropertyUpdated");
					}
				}
			},
			template: (obj, common) => `<div>
						<div class='active-list-delete-button'>${common.deleteButton(obj, common)}</div>
 						<div class='active-list-name'>${obj.value}</div>
					</div>`
		};

		return {
			width: 348,
			name: "featureSetClass",
			rows: [
				featureSetForm,
				featureSetList
			]
		};
	}

	init() {
		this.skinObjectSelection = this.getSkinObjectSelection();
		this.objectPropertySelection = this.getObjectPropertySelection();
		this.addFeatureButton = this.getAddFeatureButton();
		this.form = this.getFeatureSetForm();
		this.activeList = this.getFeatureSetList();
	}

	getSkinObjectSelection() {
		return this.getRoot().queryView({name: "skinObjectSelectionName"});
	}

	getObjectPropertySelection() {
		return this.getRoot().queryView({name: "objectPropertyName"});
	}

	getAddFeatureButton() {
		return this.getRoot().queryView({view: "button"});
	}

	getFeatureSetForm() {
		return this.getRoot().queryView({view: "form"});
	}

	getFeatureSetList() {
		return this.getRoot().queryView({view: "activeList"});
	}

	getObjectProperties() {
		let objectProperties = [];
		const featureSetData = featureSetDataModel.getFeatureSetData();
		featureSetData.forEach((featureSet) => {
			if (featureSet.parent === skinObjectValue) {
				objectProperties.push(...featureSet.data);
			}
		});
		return objectProperties;
	}

	getFeatureSynonyms() {
		let featureSynonyms = [];
		const featureSynonymsArray = featureSetDataModel.getFeatureSetSynonymsArray();
		featureSynonymsArray.forEach((synonymsArray) => {
			synonymsArray.forEach((featureSetValue) => {
				if (featureSetValue === listItemData) {
					featureSynonyms.push(...synonymsArray);
				}
			});
		});
		return featureSynonyms;
	}
}
