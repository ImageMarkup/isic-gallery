import LargeImageWindow from "../../views/subviews/gallery/windows/imageWindow";
import selectedGalleryImages from "../../models/selectedGalleryImages";
import imageSelectionWindow from "../../views/subviews/createStudy/windows/imagesSelectionWindow";
import createStudyModel from "../../models/createStudyModel";
import ajaxActions from "../ajaxActions";

const IMAGE_WINDOW_ID = "image-window-id";
let featureSetListItemsCount;
let questionsCount;
let imagesCount;
let annotatorsListItemsCount;

export default class CreatyStudyService {
    constructor(view, studyDataview, studyFeatureSet, questionsView, studyAnnotators, createStudyButton, studyNameTextView) {
        this._view = view;
        this._studyDataview = studyDataview;
        this._studyFeatureSet = studyFeatureSet;
        this._questionsView = questionsView;
        this._studyAnnotators = studyAnnotators;
        this._createStudyButton = createStudyButton;
        this._studyNameTextView = studyNameTextView;
        this._ready();
    }

    _ready() {
        this._headerFeatureSetTemplate = this._view.$scope.getHeaderFeatureSetTemplate();
        this._headerAnnotatorsTemplate = this._view.$scope.getHeaderAnnotatorsTemplate();
        this._headerDataviewTemplate = this._view.$scope.getHeaderDataviewTemplate();
        this._featureSetActiveList = this._studyFeatureSet.getFeatureSetList();
        this._annotatorsList = this._studyAnnotators.getAnnotatorsList();
        this._imageDataView = this._studyDataview.getDataView();
		this._largeImageWindow = this._view.$scope.ui(LargeImageWindow.getConfig(IMAGE_WINDOW_ID, "Study Image"));
        this._imageWindowViewer = $$(LargeImageWindow.getViewerId());
        this._addedQuestionsLayout = this._questionsView.getAddedQustions();
        this._headerQuestionsTemplate = this._view.$scope.getHeaderQuestionsTemplate();
        this._invalidMessageTemplate = this._view.$scope.getInvalidMessageTemplate();

        this._addedQuestionsLayout.attachEvent("onAfterQuestionsUpdated", () => {
        	questionsCount = this._addedQuestionsLayout.getChildViews().length;
        	this._headerQuestionsTemplate.parse({
				count: questionsCount
			});
		});

		this._imageSelectionWindow = this._view.$scope.ui(imageSelectionWindow);

        webix.extend(this._view, webix.ProgressBar);

        this._featureSetActiveList.attachEvent("onAfterPropertyUpdated", () => {
            featureSetListItemsCount = this._featureSetActiveList.data.order.length;
            this._headerFeatureSetTemplate.parse({
                count: featureSetListItemsCount
            });
        });

        this._annotatorsList.attachEvent("onAfterUserUpdated", () => {
			annotatorsListItemsCount = this._annotatorsList.data.order.length;
			this._headerAnnotatorsTemplate.parse({
				count: annotatorsListItemsCount
			});
        });

        this._imageDataView.attachEvent("onAfterDataviewRender", () => {

		});

        this._imageDataView.on_click["add-new-image"] = () => {
        	this._imageSelectionWindow.showWindow(this._imageDataView.$scope);
		};

        this._imageDataView.attachEvent("onAfterImagesUpdated", () => {
        	imagesCount = this._imageDataView.data.order.length - 1;
			this._headerDataviewTemplate.parse({
				count: imagesCount
			});
		});

		this._imageDataView.on_click["resize-icon"] = (e, id) => {
			const currentItem = this._imageDataView.getItem(id);
			this._setImageWindowValues(currentItem);
			const slideButton = $$(LargeImageWindow.getSliderButtonId());
			slideButton.config.height = 1;
			this._largeImageWindow.show();
        };

		this._imageDataView.on_click["trash-icon"] = (e, id) => {
				let objectIndex;
				const currentItem = this._imageDataView.getItem(id);
				selectedGalleryImages.removeImageFromStudies(currentItem._id);
				let localStorageArray = selectedGalleryImages.getImageObjectsFromLocalStorage();
				localStorageArray.findIndex((imageObject, index) => {
					if (imageObject.id === currentItem._id) {
						objectIndex = index;
					}
				});
				localStorageArray.splice(objectIndex, 1);
				selectedGalleryImages.setImageObjectsToLocalStorage(localStorageArray);
				this._imageDataView.remove(currentItem.id);
				this._imageDataView.callEvent("onAfterImagesUpdated");
        };

		this._largeImageWindow.getNode().addEventListener("keyup", (e) => {
			this._keyPressed(e.keyCode);
		});

		this._largeImageWindow.attachEvent("onKeyPress", (keyCode) => {
			this._keyPressed(keyCode);
		});

		this._imageWindowViewer.define("onClick", {
			"next": () => {
				this._showNextImage();
			},
			"prev": () => {
				this._showPrevImage();
			}
		});

		this._studyNameTextView.attachEvent("onKeyPress", () => {
			this._invalidMessageTemplate.hide();
		});

		this._createStudyButton.attachEvent("onItemClick", () => {
			let features = [];
			let annotatorsIds = [];
			let imageIds = [];
			let questions = [];
			let studyName = this._studyNameTextView.getValue();
			let studyNameLength = studyName.length;
			if (!featureSetListItemsCount || !imagesCount || !questionsCount || studyNameLength < 3 || !annotatorsListItemsCount) {
				if (studyNameLength === 0) {
					this._invalidMessageTemplate.parse({
						message: "Study name should not be empty"
					});
					this._invalidMessageTemplate.show();
				} else if (studyNameLength !==0 && studyNameLength < 3) {
					this._invalidMessageTemplate.parse({
						message: "Study name should contains at least 3 characters"
					});
					this._invalidMessageTemplate.show();
				}
				if (!featureSetListItemsCount) {
					this._headerFeatureSetTemplate.parse({
						part: "feature"
					});
				}
				if (!imagesCount) {
					this._headerDataviewTemplate.parse({
						part: "images"
					});
				}
				if (!questionsCount) {
					this._headerQuestionsTemplate.parse({
						part: "questions"
					});
				}
				if (!annotatorsListItemsCount) {
					this._headerAnnotatorsTemplate.parse({
						part: "annotators"
					})
				}
				this._showPageAlert();
				return false;
			} else {
				let questionsAndAnswersNamesArray = createStudyModel.getAddedQuestionsAndAnswersNames();
				questionsAndAnswersNamesArray.forEach((questionAndAnswerNames) => {
					let wasEmptyValue = false;
					let answerValues = [];
					let questionTextView = this._view.queryView({name: questionAndAnswerNames.questionName});
					let questionValue = questionTextView.getValue();
					if (!questionValue) {
						wasEmptyValue = true;
						this._changeInputNodeColor(questionTextView)
					}

					let answerNamesArray = questionAndAnswerNames.answerNames;
					answerNamesArray.forEach((answerName) => {
						let answerTextView = this._view.queryView({name: answerName});
						let answerValue = answerTextView.getValue();
						if (answerValue) {
							answerValues.push(answerValue);
						} else {
							wasEmptyValue = true;
							this._changeInputNodeColor(answerTextView);
						}
					});

					if (wasEmptyValue) {
						this._showPageAlert()
					} else {
						questions.push({
							choices: answerValues,
							id: questionValue,
							type: "select",
						});
					}
				});

				if (questions.length > 0) {
					let featuresArray = this._featureSetActiveList.data.order;
					featuresArray.forEach((feature) => {
						features.push({
							id: feature
						});
					});
				} else {
					return false;
				}
				let annotatorsItemsIdsArray = this._annotatorsList.data.order;
				annotatorsItemsIdsArray.forEach((annotatorItemId) => {
					let annotatorItem = this._annotatorsList.getItem(annotatorItemId);
					annotatorsIds.push(annotatorItem._id);
				});
				this._imageDataView.find((obj) => {
					if (obj._id) {
						imageIds.push(obj._id);
					}
				});

				const studyParams = {
					name: studyName,
					imageIds: imageIds,
					userIds: annotatorsIds,
					questions: questions,
					features: features
				};

				this._view.showProgress();
				ajaxActions.createNewStudy(studyParams)
					.then(() => {
						webix.message("New study was successfully created!");
						this._view.hideProgress();
					})
					.fail((error) => {
						let errorObject = JSON.parse(error.responseText);
						webix.alert({
							title: "Error!",
							text: errorObject.message,
							type: "alert-error"
						});
						this._view.hideProgress();
					})
			}
		});
    }

	_setImageWindowValues(currentItem) {
		this._currentItem = currentItem;
		this._imageWindowViewer.setValues({imageId: currentItem._id});
	}

	_showNextImage() {
		let nextItem;
		let nextItemId = this._imageDataView.getNextId(this._currentItem.id);
		if (nextItemId === undefined) {
			let firstItem = this._imageDataView.getItem(this._imageDataView.getFirstId());
			let secondItemId = this._imageDataView.getNextId(firstItem.id);
			nextItem = this._imageDataView.getItem(secondItemId);
		} else {
			nextItem = this._imageDataView.getItem(nextItemId);
		}
		this._setImageWindowValues(nextItem);
	}

	_showPrevImage() {
		let prevItem;
		let prevItemId = this._imageDataView.getPrevId(this._currentItem.id);
		prevItem = this._imageDataView.getItem(prevItemId);
		if (prevItem.name === "addImage") prevItem = this._imageDataView.getItem(this._imageDataView.getLastId());
		this._setImageWindowValues(prevItem);
	}

	_keyPressed(keyCode) {
		switch (keyCode) {
			case 27: {
				this._largeImageWindow.hide();
				break;
			}
			case 37: {
				this._showPrevImage();
				break;
			}
			case 39: {
				this._showNextImage();
				break;
			}
			default: {
				break;
			}
		}
	}

	_showPageAlert() {
		webix.alert({
			title: "Error",
			text: "Page forms are not valid. Please set them right.",
			type: "alert-error"
		});
	}

	_changeInputNodeColor(textView) {
		let inputNode = textView.getInputNode();
		textView.attachEvent("onKeyPress", () => {
			inputNode.style.backgroundColor = "#FFFFFF";
			inputNode.style.borderColor = "#BDC4D4";
		});
		inputNode.style.backgroundColor = "#fff6f6";
		inputNode.style.borderColor = "#fea5a8";
	}
}