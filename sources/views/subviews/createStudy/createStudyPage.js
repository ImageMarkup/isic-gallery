import {JetView} from "webix-jet";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import studyDataview from "./parts/imagesDataview";
import featureSet from "./parts/featureSet";
import studyQuestions from "./parts/questions";
import CreateStudyService from "../../../services/createStudy/createStudy";
import annotators from "./parts/annotators";
import constants from "../../../constants";
import authService from "../../../services/auth";

export default class CreateStudyPage extends JetView {
	config() {
		const crateNewStudyTextView = {
			view: "text",
			css: "text-field",
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
			template: obj => `<div style="margin-left: 5px; font-size: 13px; color: #fd595f;">${obj.message}</div>`
		};

		const headerSelectedImagesTemplate = {
			borderless: true,
			view: "template",
			name: "headerDataviewTemplate",
			css: {background: "white"},
			template: obj => `<div class="header-template" style="border-left-width: 0px !important;">Selected Images <span style='color: red;'>*</span> ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`,
			type: "header",
			height: 35
		};

		const headerFeatureSetTemplate = {
			borderless: true,
			view: "template",
			name: "headerFeatureSetTemplate",
			css: {background: "white"},
			template: obj => `<div class="header-template">Feature Set <span style='color: red;'>*</span> ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`,
			type: "header",
			height: 35
		};

		const headerQuestionsTemplate = {
			borderless: true,
			view: "template",
			name: "headerQuestionsTemplate",
			css: {background: "white"},
			template: obj => `<div class="header-template">Questions <span style='color: red;'>*</span> ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`,
			type: "header",
			height: 35
		};

		const headerAnnotatorsTemplate = {
			borderless: true,
			view: "template",
			name: "headerAnnotatorsTemplate",
			css: {background: "white", width: "100% !important;"},
			template: obj => `<div class="header-template">Annotators <span style='color: red;'>*</span> ${this.getCountForHeaders(obj.count)} ${this.showTemplateAlert(obj.part)}</div>`,
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
						{},
						{
							rows: [
								headerQuestionsTemplate,
								studyQuestions
							]
						},
						{},
						{
							rows: [
								headerAnnotatorsTemplate,
								annotators
							]
						},
						{width: 3}
					]
				},
				{height: 25},
				{
					cols: [
						{
							template: "<div style=\"padding-top: 11px;\"><span style=\"color: red;\">*</span> Indicates required field</div>",
							borderless: true
						},
						{},
						cancelButton,
						{width: 15},
						createStudyButton
					]
				},
				{height: 15}
			]

		};
	}

	init() {
		this.appGuardMethod = (url, view, nav) => {
			const studyCreatedValue = this.createStudyService._getStudyCreatedValue();
			if (!studyCreatedValue) {
				webix.confirm({
					title: "Attention!",
					text: "Are you sure you want to cancel study creation?",
					type: "confirm-warning",
					cancel: "Yes",
					ok: "No",
					callback: (result) => {
						if (!result) {
							this.app.detachEvent("app:guard", this.appGuardMethod);
							this.app.show(url);
						}
						this.app.unblockEvent();
					}
				});
				this.app.blockEvent();
				history.forward();
				nav.confirm = Promise.reject();
			}
			else {
				this.app.detachEvent("app:guard", this.appGuardMethod);
				this.createStudyService._setStudyCreatedValue(false);
			}
		};

		this.app.attachEvent("app:guard", this.appGuardMethod);
	}

	destroy() {
		this.createStudyService._clearQuestionPanel();
		this.app.detachEvent("app:guard", this.appGuardMethod);
	}

	ready(view) {
		const studyDataview = this.getStudyDataview();
		const studyFeatureSet = this.getStudyFeatureSet();
		const questionsView = this.getQuestionsView();
		const studyAnnotators = this.getStudyAnnotators();
		const createNewStudyButton = this.getCreateNewStudyButton();
		const studyNameTextView = this.getStudyNameTextView();
		const headerQuestionsTemplate = this.getHeaderQuestionsTemplate();

		setTimeout(() => {
			const scrollViewWidth = headerQuestionsTemplate.$view.offsetWidth;
			headerQuestionsTemplate.$view.style.width = `${scrollViewWidth - 1}px`;
		});

		this.createStudyService = new CreateStudyService(
			view,
			studyDataview,
			studyFeatureSet,
			questionsView,
			studyAnnotators,
			createNewStudyButton,
			studyNameTextView
		);
	}

	urlChange() {
		authService.showMainPage();
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
		}
		return `(${count})`;
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
		return `<div style="color: rgb(253, 89, 95); font-size:13px; font-weight: normal !important; margin-top: -17px; margin-left: ${marginLeft}px">${alertText}</div>`;
	}
}
