import {JetView} from "webix-jet";
import createStudyModel from "../../../../models/createStudyModel";
import "../../../components/activeList";

const oneLineHeight = 41;
let initialView;
let textViewNameNumber;
let questionLabelNumber;
let answersCount;

export default class StudyQuestions extends JetView {
	config() {
		this.setInitialView(true);

		const addQuestionButton = {
			view: "button",
			css: "btn",
			value: "Add Question",
			width: 110,
			height: 32,
			click: () => {
				const answersToAddCount = this.layoutOfAnswersToAdd.getChildViews().length;
				if (answersToAddCount <= 1) {
					return this.showClientValidationError("You have to add at least 2 answers.");
				}
				const answerValues = this.getAnswerValuesToAdd().map(answer => (answer || "").trim());
				const questionValue = this.getQuestionValue();
				const createdAddedQuestionLayout = this
					.createAddedQuestionsLayout(answerValues, questionValue);
				this.layoutOfAddedQuestions.addView(createdAddedQuestionLayout);
				this.setQuestionLabel();
				this.layoutOfQuestionToAdd.callEvent("onBeforeRefresh");
				this.layoutOfQuestionToAdd.setValue("");
				this.layoutOfQuestionToAdd.refresh();
				this.removeViewsAndClearValues();
				this.refreshLabelAndPlaceholderValues(true);
				createStudyModel.clearTextLayoutNames();
				this.layoutOfAnswersToAdd.callEvent("onAfterLayoutRender");
				this.layoutOfAddedQuestions.callEvent("onAfterQuestionsUpdated");
			}
		};

		const textOfQuestionToAdd = {
			view: "text",
			name: "questionToAddName",
			width: 430,
			placeholder: "Type your question",
			css: "text-field",
			label: `${this.getQuestionLabel()}`,
			labelAlign: "right",
			labelWidth: 30,
			on: {
				onBeforeRefresh: () => {
					this.layoutOfQuestionToAdd.config.label = `${this.getQuestionLabel()}`;
				}
			}
		};

		const layoutOfAnswersToAdd = {
			name: "layoutOfAnswersToAddName",
			scroll: true,
			rows: [
				this.getLayoutModel()
			]
		};

		const layoutOfAddedQuestions = {
			name: "layoutOfAddedQuestionsName",
			css: {"border-width": "1px;"},
			scroll: true,
			rows: []
		};

		const scrollview = {
			view: "scrollview",
			scroll: "y",
			css: "questions-scrollview-layout",
			width: 470,
			body: {
				css: {
					"border-left-width": "1px !important;",
					"border-radius": "3px !important;"
				},
				rows: [
					{
						css: "questions-add-button-layout",
						rows: [
							{height: 15},
							{
								cols: [
									{width: 20},
									addQuestionButton
								]
							},
							{height: 15}
						]
					},
					textOfQuestionToAdd,
					{height: 7},
					layoutOfAnswersToAdd,
					layoutOfAddedQuestions
				]
			}
		};

		return {
			name: "questionsViewClass",
			rows: [
				scrollview
			]
		};
	}

	ready() {
		this.layoutOfAnswersToAdd = this.getLayoutAnswersToAdd();
		this.layoutOfAnswersToAdd.attachEvent("onAfterLayoutRender", () => {
			createStudyModel.setTextLayoutNames(`textViewName-${questionLabelNumber}-${textViewNameNumber}`);
		});
		this.layoutOfQuestionToAdd = this.getQuestionToAdd();
		this.layoutOfAnswersToAdd.callEvent("onAfterLayoutRender");
		this.layoutOfAddedQuestions = this.getAddedQustions();
		this.questionsScrollView = this.getQuestionsScrollView();
	}

	getQuestionsScrollView() {
		return this.getRoot().queryView({view: "scrollview"});
	}

	getQuestionToAdd() {
		return this.getRoot().queryView({name: "questionToAddName"});
	}

	getAddedQustions() {
		return this.getRoot().queryView({name: "layoutOfAddedQuestionsName"});
	}

	setQuestionLabel(reduce) {
		reduce ? questionLabelNumber-- : questionLabelNumber++;
	}

	getQuestionLabel() {
		return questionLabelNumber;
	}

	getLayoutModel() {
		return {
			rows: [
				{
					height: 35,
					cols: [
						{
							view: "text", 
							css: "text-field",
							name: `textViewName-${this.getTextViewNameNumber()}`,
							placeholder: `Type answer ${this.getQuestionLabel()}${this.getAnswerLabel()}`,
							labelWidth: 50, 
							width: 430,
							labelAlign: "right",
							label: `${this.getAnswerLabel()}`
						},
						{width: 10},
						{
							rows: [
								{height: this.getPlusButtonTopSpacerHeight()},
								{
									view: "button",
									name: "plusButtonName",
									css: "btn",
									label: "+",
									width: 16,
									height: 16,
									click: () => {
										createStudyModel.setTextLayoutNames(`textViewName-${questionLabelNumber}-${textViewNameNumber + 1}`);
										this.setTextViewNameNumber();
										initialView = false;
										this.addNewView();
										let addedViews = this.getLayoutAnswersToAdd().getChildViews();
										let addedViewsLength = addedViews.length;
										let lastAddedViewIndex = addedViewsLength - 1;
										let lastAddedView = addedViews[lastAddedViewIndex];
										this.scrollToAddedQuestion(lastAddedView.config.id);
									}
								},
								{height: 3},	
								{
									view: "button",
									css: "btn",
									siblingTextNumber: `${this.getTextViewNameNumber()}`,
									label: "-",
									hidden: this.hideMinusInitButton(),
									width: 16,
									height: 16,
									click:(id) => {
										const minusButton = this.$$(id);
										const textNameNumber = minusButton.config.siblingTextNumber;
										const siblingTextView = this.getTextView(textNameNumber);
										const textViewName = siblingTextView.config.name;
										const layoutOfAnswersId = siblingTextView.getParentView().getParentView().config.id;
										createStudyModel.removeTextLayoutName(textViewName);
										this.layoutOfAnswersToAdd.removeView(layoutOfAnswersId);
										this.refreshLabelAndPlaceholderValues();
									}
								}
							]
						}
					]
				},
				{height: 7}
			]
		};
	}

	hideMinusInitButton(index) {
		if (index <= 1) {
			return true;
		}
		return initialView;
	}

	getLayoutAnswersToAdd() {
		return this.getRoot().queryView({name: "layoutOfAnswersToAddName"});
	}

	addNewView() {
		this.layoutOfAnswersToAdd.addView(this.getLayoutModel());
	}

	getAnswerLabel(index) {
		let letterIndex;
		if (initialView || index === 0) {
			return "a.";
		}
		else if (!index) {
			let linesHeight = this.layoutOfAnswersToAdd.$getSize()[2];
			letterIndex = Math.floor(linesHeight / (oneLineHeight - 1));
		}
		else if (index) {
			letterIndex = index;
		}
		let letter = String.fromCharCode(97 + letterIndex);
		return `${letter}.`;
	}

	getPlusButtonTopSpacerHeight(index) {
		if (index <= 1) {
			return 10;
		}
		return initialView ? 10 : 0;
	}

	setTextViewNameNumber() {
		textViewNameNumber++;
	}

	getTextViewNameNumber() {
		return `${this.getQuestionLabel()}-${textViewNameNumber}`;
	}

	getTextView(nameNumber, name) {
		let nameToPaste;
		name ? nameToPaste = name : nameToPaste = `textViewName-${nameNumber}`;
		return this.getRoot().queryView({name: nameToPaste});
	}

	getAnswerValuesToAdd() {
		let answerValues = [];
		let textViewNamesArray = createStudyModel.getTextLayoutNames();
		textViewNamesArray.forEach((textViewName) => {
			let textView = this.getTextView(false, textViewName);
			if (textView) {
				answerValues.push(textView.getValue());
			}
		});
		return answerValues;
	}

	refreshLabelAndPlaceholderValues(beforeAdd, namesArray, questionLabel) {
		let textViewNamesArray;
		let textQuestionLabel;
		if (namesArray && questionLabel) {
			textViewNamesArray = namesArray;
			textQuestionLabel = questionLabel;
		}
		else {
			textViewNamesArray = createStudyModel.getTextLayoutNames();
			textQuestionLabel = this.getQuestionLabel();
		}
		textViewNamesArray.forEach((textViewName, index) => {
			let textView = this.getTextView(false, textViewName);
			if (textView) {
				if (beforeAdd) {
					textView.config.name = `textViewName-${this.getTextViewNameNumber()}`;
				}
				textView.config.label = `${this.getAnswerLabel(index)}`;
				textView.config.placeholder = `Type answer ${textQuestionLabel}${this.getAnswerLabel(index)}`;
				textView.refresh();
			}
		});
	}

	removeViewsAndClearValues() {
		let textViewNamesArray = createStudyModel.getTextLayoutNames();
		textViewNamesArray.forEach((textViewName, index) => {
			let textView = this.getTextView(false, textViewName);
			if (textView && index !== 0) {
				this.layoutOfAnswersToAdd.removeView(textView.getParentView().getParentView().config.id);
			}
			else if (textView && index === 0) {
				textView.setValue("");
			}
		});
	}

	getQuestionValue() {
		let value = this.getQuestionToAdd().getValue();
		return value;
	}

	setAnswersCount() {
		answersCount++;
	}

	getAnswersCount() {
		return answersCount;
	}

	createAddedQuestionsLayout(answerValues, questionValue) {
		let answersLayoutRows = [];
		let answersNames = [];
		let questionLabel = this.getQuestionLabel();
		let answersCount = this.getAnswersCount();
		let questionTextViewName = `addedQuestion-${questionLabel}`;
		let layoutModelArray = [];

		const questionTextView = {
			view: "text",
			name: questionTextViewName,
			width: 430,
			placeholder: "Type your question",
			css: "text-field",
			label: `${this.getQuestionLabel()}`,
			labelAlign: "right",
			labelWidth: 30,
			value: questionValue
		};

		const deleteQuestionButton = {
			view: "button",
			type: "icon",
			icon: "fas fa-times",
			mainLayoutNamesNumber: answersCount,
			css: "delete-icon-button",
			width: 25,
			height: 25,
			click: (id) => {
				const deleteButton = this.$$(id);
				const mainQustionLayout = this.getRoot().queryView({name: `${questionTextViewName}-${deleteButton.config.mainLayoutNamesNumber}`});
				let mainQuestionLayoutId = mainQustionLayout.config.id;
				createStudyModel.removeAddedQustions(questionTextViewName);
				this.layoutOfAddedQuestions.removeView(mainQuestionLayoutId);
				this.setQuestionLabel(true);
				let addedQuestionArray = this.layoutOfAddedQuestions.getChildViews();

				addedQuestionArray.forEach((addedQuestionLayout, index) => {
					let questionTextView = this.getRoot().queryView({name: addedQuestionLayout.config.questionNameOfThisLayout});
					if (questionTextView) {
						let questionLabel = index + 1;
						questionTextView.config.label = questionLabel;
						questionTextView.refresh();
						let namesOfAddedQuestionArray = createStudyModel.getAddedQuestionsAndAnswersNames();
						namesOfAddedQuestionArray.forEach((addedQuestionName) => {
							if (addedQuestionName.questionName === questionTextView.config.name) {
								this.refreshLabelAndPlaceholderValues(false, addedQuestionName.answerNames, questionLabel);
							}
						});
					}
				});

				this.layoutOfQuestionToAdd.config.label = this.getQuestionLabel();
				this.layoutOfQuestionToAdd.refresh();
				let namesOfAnswersToAddArray = createStudyModel.getTextLayoutNames();
				this.refreshLabelAndPlaceholderValues(false, namesOfAnswersToAddArray, this.getQuestionLabel());

				this.layoutOfAddedQuestions.callEvent("onAfterQuestionsUpdated");
			}
		};

		answerValues.forEach((answerValue, index) => {
			let unpreparedAnswerName = `textViewNameAdded-${this.getQuestionLabel()}`;
			let newAnswerName = `${unpreparedAnswerName}-${index}`;
			this.setAnswersCount();
			const answersLayout = {
				rows: [
					{
						height: 35,
						cols: [
							{
								view: "text",
								css: "text-field",
								name: newAnswerName,
								placeholder: `Type answer ${this.getQuestionLabel()}${this.getAnswerLabel(index)}`,
								labelWidth: 50,
								width: 430,
								labelAlign: "right",
								label: `${this.getAnswerLabel(index)}`,
								value: answerValue
							},
							{width: 10},
							{
								rows: [
									{height: this.getPlusButtonTopSpacerHeight(index)},
									{
										view: "button",
										css: "btn",
										label: "+",
										siblingUnpreparedAnswerName: unpreparedAnswerName,
										siblingTextViewName: newAnswerName,
										questionLabel: `${this.getQuestionLabel()}`,
										width: 16,
										height: 16,
										click: (id) => {
											const plusButton = this.$$(id);
											let layoutOfAddedAnswers = this.getRoot().queryView({name: questionTextViewName}).getParentView().getParentView().getChildViews()[3];
											layoutOfAddedAnswers.addView(answersLayout);
											let answerLayoutsArray = this.getRoot().queryView({name: questionTextViewName}).getParentView().getParentView().getChildViews()[3].getChildViews();
											let answerLayoutArrayLength = answerLayoutsArray.length;
											let answerIndex = answerLayoutArrayLength - 1;
											let newAddedAnswer = answerLayoutsArray[answerIndex].getChildViews()[0].getChildViews()[0];
											const minusButton = newAddedAnswer.getParentView().getChildViews()[2].getChildViews()[3];
											const spacerHeight = newAddedAnswer.getParentView().getChildViews()[2].getChildViews()[0];
											let spacerHeightId = spacerHeight.config.id;
											spacerHeight.getParentView().removeView(spacerHeightId);
											minusButton.show();
											let newAddedAnswerName = `${plusButton.config.siblingUnpreparedAnswerName}-${this.getAnswersCount()}`;
											newAddedAnswer.config.name = newAddedAnswerName;
											newAddedAnswer.config.label = `${this.getAnswerLabel(answerIndex)}`;
											newAddedAnswer.config.placeholder = `Type answer ${plusButton.config.questionLabel}${this.getAnswerLabel(answerIndex)}`;
											newAddedAnswer.config.value = "";
											newAddedAnswer.refresh();
											this.scrollToAddedQuestion(newAddedAnswer.config.id);
											this.setAnswersCount();
											createStudyModel.addAnswerName(questionTextViewName, newAddedAnswerName);
										}
									},
									{height: 3},
									{
										view: "button",
										css: "btn",
										label: "-",
										hidden: this.hideMinusInitButton(index),
										width: 16,
										height: 16,
										click:(id) => {
											const minusButton = this.$$(id);
											let layoutOfAddedAnswers = this.getRoot().queryView({name: questionTextViewName}).getParentView().getParentView().getChildViews()[3];
											let layoutOfAnswerId = minusButton.getParentView().getParentView().getParentView().config.id;
											let siblingTextViewName = minusButton.getParentView().getParentView().getChildViews()[0].config.name;
											createStudyModel.removeAnswerName(questionTextViewName, siblingTextViewName);
											layoutOfAddedAnswers.removeView(layoutOfAnswerId);
											let addedAnswerNames = createStudyModel.getAddedAnswerNames(questionTextViewName);
											this.refreshLabelAndPlaceholderValues(false, addedAnswerNames, questionLabel);
										}
									}
								]
							}
						]
					},
					{height: 7}
				]
			};
			answersNames.push(newAnswerName);
			answersLayoutRows.push(answersLayout);
			answersLayoutRows.push();
		});

		layoutModelArray.push({
			questionName: questionTextViewName,
			answerNames: answersNames
		});

		createStudyModel.setAddedQuestionsAndAnswersNames(questionTextViewName, answersNames);

		return {
			questionNameOfThisLayout: questionTextViewName,
			name: `${questionTextViewName}-${answersCount}`,
			rows: [
				{height: 7},
				{
					cols: [
						questionTextView,
						{width: 6},
						{
							rows: [
								{},
								deleteQuestionButton,
								{}
							]
						}
					]
				},
				{height: 7},
				{
					rows: answersLayoutRows
				}
			]
		};
	}

	scrollToAddedQuestion(id) {
		const textViewOffsetTop = webix.$$(id).$view.offsetTop;
		const parentNodeOffsetTop = webix.$$(id).$view.parentNode.offsetTop;
		let topPos;
		if (textViewOffsetTop === parentNodeOffsetTop) {
			topPos = textViewOffsetTop - webix.$$(id).$view.parentNode.parentNode.parentNode.parentNode.offsetTop;
		}
		else {
			topPos = textViewOffsetTop - parentNodeOffsetTop;
		}
		this.questionsScrollView.scrollTo(0, topPos);
	}

	setInitialView() {
		initialView = true;
		textViewNameNumber = 0;
		questionLabelNumber = 1;
		answersCount = 0;
		createStudyModel.clearTextLayoutNames();
	}

	showClientValidationError(message) {
		webix.alert({
			title: "Attention!",
			text: message
		});
	}
}
