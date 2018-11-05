import {JetView} from "webix-jet";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import studyDataview from "./parts/imagesDataview";
import featureSet from "./parts/featureSet";
import studyQuestions from "./parts/questions";
import CreateStudyService from "../../../services/createStudy/createStudy";
import annotators from "./parts/annotators";
import constants from "../../../constants";

export default class CreateStudyPage extends JetView {
	config() {
		const crateNewStudyTextView = {
			view: "text",
			css: "select-field",
			name: "studyNameTextView",
			placeholder: "Type study name here",
			height: 40
		};

		const invalidMessageTemplate = {
			view: "template",
			name: "invalidMessageTemplateName",
			height: 20,
			borderless: true,
			hidden: true,
			template: (obj) => {
				return `<div style="margin-left: 5px; font-size: 13px; color: #fd595f;">${obj.message}</div>`
			}
		};

		const headerSelectedImagesTemplate = {
			borderless: true,
			view: "template",
			name: "headerDataviewTemplate",
			css: {"background": "white"},
			template: (obj) => {
				return `<div class="header-template" style="border-left-width: 0px !important;">Selected Images ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`
			},
			type: "header",
			height: 35
		};

		const headerFeatureSetTemplate = {
			borderless: true,
			view: "template",
			name: "headerFeatureSetTemplate",
			css: {"background": "white"},
			template: (obj) => {
				return `<div class="header-template">Feature Set ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`
			},
			type: "header",
			height: 35
		};

		const headerQuestionsTemplate = {
			borderless: true,
			view: "template",
			name: "headerQuestionsTemplate",
			css: {
				"background": "white",
				"width": "488px !important"
			},
			template: (obj) => {
				return `<div class="header-template">Questions ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`
			},
			type: "header",
			height: 35
		};

		const headerAnnotatorsTemplate = {
			borderless: true,
			view: "template",
			name: "headerAnnotatorsTemplate",
			css: {"background": "white"},
			template: (obj) => {
				return `<div class="header-template">Annotators ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`
			},
			type: "header",
			height: 35
		};

		const createStudyButton = {
			view: "button",
			css: "btn",
			width: 120,
			name: "createStudyButton",
			value: "Create Study"
		};

		const cancelButton = {
			view: "button",
			css: "btn-contour",
			width: 120,
			name: "cancelButton",
			value: "Cancel",
			click: () => {
				this.app.show(constants.PATH_GALLERY);
			}
		};

		return {
			type: "clean",
			borderless: true,
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("createNewStudy"),
				{height: 10},
				crateNewStudyTextView,
				invalidMessageTemplate,
				{height: 10},
				{
					css: "study-dataview-top-layout",
					rows: [
						{
							css: "study-dataview-layout",
							rows: [
								headerSelectedImagesTemplate,
								studyDataview
							]
						},
						{height: 2}
					]
				},
				{height: 20},
				{
					cols: [
						{width: 3},
						{
							rows: [
								headerFeatureSetTemplate,
								featureSet
							]
						},
						{width: 17},
						{
							rows: [
								headerQuestionsTemplate,
								studyQuestions
							]
						},
						{width: 17},
						{
							rows: [
								headerAnnotatorsTemplate,
								annotators
							]
						}
					]
				},
				{height: 25},
				{
					cols: [
						createStudyButton,
						{width: 15},
						cancelButton,
					]
				},
				{height: 15}
			]

		}
	}

	ready(view) {
		this.studyDataview = this.getStudyDataview();
		this.studyFeatureSet = this.getStudyFeatureSet();
		this.questionsView = this.getQuestionsView();
		this.studyAnnotators = this.getStudyAnnotators();
		this.createNewStudyButton = this.getCreateNewStudyButton();
		this.studyNameTextView = this.getStudyNameTextView();

		this.creatyStudyService = new CreateStudyService(
			view,
			this.studyDataview,
			this.studyFeatureSet,
			this.questionsView,
			this.studyAnnotators,
			this.createNewStudyButton,
			this.studyNameTextView
		)
	}

	getStudyDataview() {
		return this.getRoot().queryView({name: "studyDataviewClass"}).$scope;
	}

	getStudyFeatureSet() {
		return this.getRoot().queryView({name: "featureSetClass"}).$scope;
	}

	getQuestionsView() {
		return this.getRoot().queryView({name: "questionsViewClass"}).$scope;
	}

	getStudyAnnotators() {
		return this.getRoot().queryView({name: "studyAnnotatorsClass"}).$scope;
	}

	getHeaderFeatureSetTemplate() {
		return this.getRoot().queryView({name: "headerFeatureSetTemplate"});
	}

	getHeaderAnnotatorsTemplate() {
		return this.getRoot().queryView({name: "headerAnnotatorsTemplate"});
	}

	getHeaderDataviewTemplate() {
		return this.getRoot().queryView({name: "headerDataviewTemplate"});
	}

	getHeaderQuestionsTemplate() {
		return this.getRoot().queryView({name: "headerQuestionsTemplate"});
	}

	getCountForHeaders(count) {
		if (count === 0 || !count) {
			return "";
		} else {
			return `(${count})`;
		}
	}

	getCreateNewStudyButton() {
		return this.getRoot().queryView({name: "createStudyButton"});
	}

	getStudyNameTextView() {
		return this.getRoot().queryView({name: "studyNameTextView"});
	}

	getInvalidMessageTemplate() {
		return this.getRoot().queryView({name: "invalidMessageTemplateName"});
	}

	showTemplateAlert(part) {
		let alertText;
		let marginLeft;
		switch (part) {
			case "images": {
				alertText = "Please, choose at least one image";
				marginLeft = 140;
				break;
			}
			case "feature": {
				alertText = "Please, choose at least one feature";
				marginLeft = 100;
				break;
			}
			case "questions": {
				alertText = "Please, set at least one question";
				marginLeft = 90;
				break;
			}
			case "annotators": {
				alertText = "Please, set at least one annotator";
				marginLeft = 100;
				break;
			}
			default: {
				alertText = "";
				marginLeft = 0;
				break;
			}
		}
		return `<div style="color: rgb(253, 89, 95); font-size:13px; font-weight: normal !important; margin-top: -17px; margin-left: ${marginLeft}px">${alertText}</div>`
	}
}