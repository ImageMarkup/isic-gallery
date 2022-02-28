import ajax from "../ajaxActions";
import metadataPart from "../../views/subviews/gallery/parts/metadata";
import filtersData from "../../models/imagesFilters";
import filtersFormElements from "../../views/subviews/gallery/parts/filtersFormElements";
import state from "../../models/state";
import filterService from "./filter";
import appliedFilterModel from "../../models/appliedFilters";
import selectedImages from "../../models/selectedGalleryImages";
import constants from "../../constants";
import util from "../../utils/util";
import authService from "../auth";
import imageWindow from "../../views/subviews/gallery/windows/imageWindow";
import galleryImagesUrls from "../../models/galleryImagesUrls";
import searchButtonModel from "./searchButtonModel";

const layoutHeightAfterHide = 1;
const layoutHeightAfterShow = 32;
const filtersBySearchCollection = appliedFilterModel.getAppliedFilterBySearchCollection();

let modifiedObjects = new webix.DataCollection();
let imagesArray = [];
let selectedImagesArray = [];

class GalleryService {
	constructor(view, pager, imagesDataview, contentHeaderTemplate, imageWindow,
		imageWindowViewer, imageWindowMetadata, metadataWindow, metadataWindowMetadata,
		filtersForm, appliedFiltersList, unselectLink, downloadingMenu,
		searchInput, clearAllFiltersTemplate, allPagesTemplate, filterScrollView) {
		this._view = view;
		this._pager = pager;
		this._imagesDataview = imagesDataview;
		this._contentHeaderTemplate = contentHeaderTemplate;
		this._imageWindow = imageWindow;
		this._imageWindowViewer = imageWindowViewer;
		this._imageWindowMetadata = imageWindowMetadata;
		this._metadataWindow = metadataWindow;
		this._metadataWindowMetadata = metadataWindowMetadata;
		this._filtersForm = filtersForm;
		this._appliedFiltersList = appliedFiltersList;
		this._imagesSelectionTemplate = unselectLink;
		this._downloadingMenu = downloadingMenu;
		this._searchInput = searchInput;
		this._clearAllFiltersTemplate = clearAllFiltersTemplate;
		this._allPagesTemplate = allPagesTemplate;
		this._filterScrollView = filterScrollView;
		this._init();
	}

	_searchHandlerByFilter() {
		let searchValue = this._searchInput.getValue();
		searchValue = searchValue.trim();
		searchValue = searchValue.replace(/\s+/g, " ");
		this._searchInput.setValue(searchValue);
		if (searchValue.length < 3) {
			webix.alert("You should type minimum 3 characters");
			return;
		}
		this._appliedFiltersList.clearAll();
		appliedFilterModel.clearAll();
		const filtersInfo = [];
		for (let key in this._filtersForm.elements) {
			if (this._filtersForm.elements.hasOwnProperty(key)) {
				appliedFilterModel.setFilterValue(searchValue);
				let element = this._filtersForm.elements[key];
				let labelLowercase = element.config.labelRight.toLowerCase();
				labelLowercase = labelLowercase.replace(/\([\/ 0-9]*\)$/, ""); // delete count of images
				if (labelLowercase.indexOf(searchValue.toLowerCase()) > -1) {
					element.blockEvent(); // block events for checkbox
					element.setValue(1);// mark checkbox
					element.unblockEvent();
					filtersInfo.push();
					let params = webix.copy(element.config.filtersChangedData);
					params.remove = 0;
					filtersInfo.push(params);
				}
			}
		}
		if (filtersInfo.length > 0) {
			filtersBySearchCollection.parse(filtersInfo);
		}
		else {
			webix.alert(`"There are no filters which include "${searchValue}"`);
		}
		this._view.$scope.app.callEvent("filtersChanged", [filtersInfo]);
	}

	_searchHandlerByName(afterFilterSelected) {
		let searchValue = this._searchInput.getValue();
		searchValue = searchValue.trim();
		searchValue = searchValue.replace(/\s+/g, " ");
		this._searchInput.setValue(searchValue);
		if (searchValue && searchValue.length < 9) {
			webix.alert("You should type minimum 9 characters");
			return;
		}
		else if (searchValue === "") {
			this._clearNameFilter();
			this._reload();
			return;
		}
		const valueOfMarkedCheckbox = 1;
		let filteredImages = [];
		let studyFlag = selectedImages.getStudyFlag();
		const sourceParams = {
			limit: this._pager.data.size,
			offset: 0,
			conditions: ""
		};
		if (searchValue) {
			sourceParams.conditions += `isic_id:${searchValue}`;
		}

		this._view.$scope.setParam("name", searchValue, true);
		// TODO: delete setFilterByName after study endpoint will be implemented
		// begin setFilterByName
		appliedFilterModel.setFilterByName(true);
		// end setFilterByName
		this._view.showProgress();
		// TODO: will be uncomment after study endpoint will be implemented in new API
		// this.studiesPromise
		// 	.then(annotatedImages => ajax.getAllImages(sourceParams, annotatedImages))
		// 	.then((valuesArray) => {
		// 		const annotatedImages = valuesArray.annotatedImages;
		// 		const allImagesArray = webix.copy(valuesArray.allImages);
		// 		const totalCount = allImagesArray.length;
		// 		allImagesArray.forEach((imageObj) => {
		// 			if (annotatedImages[imageObj.isic_id]) {
		// 				imageObj.hasAnnotations = true;
		// 				imageObj.studyId = annotatedImages[imageObj.isic_id].studyId;
		// 			}
		// 			if (studyFlag && selectedImages.isSelectedInStudies(imageObj.isic_id)) {
		// 				imageObj.markCheckbox = valueOfMarkedCheckbox;
		// 			}
		// 			else if (!studyFlag && selectedImages.isSelected(imageObj.isic_id)) {
		// 				imageObj.markCheckbox = valueOfMarkedCheckbox;
		// 			}
		// 			filteredImages.push(imageObj);
		// 		});
		// 		const currentCount = filteredImages.length;
		// 		if (currentCount > 0) {
		// 			this._imagesDataview.clearAll();
		// 			let page = 0;
		//			let pagerCount = this._pager.data.size;
		// 			this._updatePagerCount(pagerCount, page);
		// 			// connecting pager to data view
		// 			this._imagesDataview.define("pager", this._clonedPagerForNameSearch);
		// 			this._pager.hide();
		// 			this._clonedPagerForNameSearch.show();
		// 			this._imagesDataview.parse(filteredImages);
		//
		// 			const rangeFinish = this._pager.data.size;
		// 			const headerValues = {
		// 				rangeStart: 1,
		// 				rangeFinish,
		// 				currentCount,
		// 				filtered: true,
		// 				totalCount
		// 			};
		// 			this._contentHeaderTemplate.setValues(headerValues);
		// 			this._contentHeaderTemplate.refresh();
		// 			appliedFilterModel.setFilterByName(true);
		// 		}
		// 		else {
		// 			if (afterFilterSelected) {
		// 				this._imagesDataview.clearAll();
		// 				const headerValues = {
		// 					rangeStart: 0,
		// 					rangeFinish: 0,
		// 					filtered: true,
		// 					currentCount,
		// 					totalCount
		// 				};
		// 				this._contentHeaderTemplate.setValues(headerValues);
		// 				this._contentHeaderTemplate.refresh();
		// 				this._imagesDataview.showOverlay(`<div style="font-size: 17px; font-weight: bold;">Nothing Has Found With Name "${searchValue}"</div>`);
		// 			}
		// 			webix.alert(`Nothing has found with name "${searchValue}"`);
		// 		}
		// 		this._view.hideProgress();
		// 	})
		// 	.fail(() => {
		// 		webix.message("Something went wrong");
		// 		this._view.hideProgress();
		// 	});

		ajax.searchImages(sourceParams)
			.then((foundImages) => {
				const allImagesArray = webix.copy(foundImages.results);
				const foundImagesCount = foundImages.count;
				allImagesArray.forEach((imageObj) => {
					filteredImages.push(imageObj);
				});
				if (foundImagesCount > 0) {
					this._imagesDataview.clearAll();
					let page = 0;
					let pagerCount = this._pager.data.size;
					this._updatePagerCount(pagerCount, page);
					// connecting pager to data view
					this._imagesDataview.define("pager", this._clonedPagerForNameSearch);
					this._pager.hide();
					this._clonedPagerForNameSearch.show();
					this._updateContentHeaderTemplate({
						rangeStart: 1,
						rangeFinish: this._pager.data.size,
						totalCount: foundImagesCount
					});
					filteredImages.forEach((item) => {
						item.markCheckbox = selectedImages.isSelected(item.isic_id);
					});
					this._imagesDataview.parse(filteredImages);
				}
				else {
					webix.alert(`Image with name "${searchValue}" was not found`);
				}
				this._view.hideProgress();
			})
			.fail(() => {
				webix.message("Something went wrong");
				this._view.hideProgress();
			});
	}

	_init() {
		webix.extend(this._imagesDataview, webix.OverlayBox);
		this._createStudyButton = this._view.$scope.getCreateStudyButton();
		this._dataviewYCountSelection = this._view.$scope.getDataviewYCountSelection();
		this._imageTemplate = $$(imageWindow.getViewerId());
		this._imageWindowZoomButtons = $$(imageWindow.getZoomButtonTemplateId());
		[this._imageWindowZoomPlusButtons, this._imageZoomMunusButtons] = this._imageWindow.$view.getElementsByClassName("zoom-btn");
		this._imageWindowMetadataLayout = this._imageWindow.$view.getElementsByClassName("metadata-layout");
		this._activeCartList = this._view.$scope.getActiveGalleryCartList();
		this._toggleButton = this._view.$scope.getToggleButton();
		this._buttonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
		this._leftPanelToggleButton = this._view.$scope.getLeftPanelToggleButton();
		this._clonedPagerForNameSearch = this._view.$scope.getClonedPagerForNameSearch();

		this._activeCartList.attachEvent("onAfterRender", () => {
			if (modifiedObjects.count() > 0) {
				modifiedObjects.find((obj) => {
					const itemNode = this._activeCartList.getItemNode(obj.id);
					if (itemNode) {
						const listTextNode = itemNode.firstChild.children[2];
						itemNode.setAttribute("style", "height: 130px !important; color: #0288D1;");
						listTextNode.setAttribute("style", "margin-left: 17px; width: 91px;");
					}
				});
			}
		});

		if (authService.isLoggedin()) {
			if (authService.getUserInfo().permissions.adminStudy) {
				let studyFlag = selectedImages.getStudyFlag();
				if (!studyFlag) {
					this._onChangeForDownload(true);
					selectedImagesArray = selectedImages.getSelectedImagesForDownload();
				}
				else {
					let newValue = 1;
					this._toggleButton.setValue(newValue);
					this._onChangeForStudy(true);
					selectedImagesArray = selectedImages.getStudyImagesId();
				}
			}
			else {
				selectedImagesArray = selectedImages.getSelectedImagesForDownload();
			}
		}
		else {
			selectedImagesArray = selectedImages.getSelectedImagesForDownload();
		}
		if (selectedImagesArray.length > 0) {
			this._activeCartList.parse(selectedImagesArray);
			webix.delay(() => {
				this._view.$scope.showList(true);
			});
			let studyFlag = selectedImages.getStudyFlag();
			this._resizeButtonsLayout(layoutHeightAfterShow, studyFlag, true);
			this._imagesSelectionTemplate.refresh();
		}

		this._searchEventsMethods(this._searchHandlerByFilter.bind(this));

		this._leftPanelToggleButton.attachEvent("onChange", (newValue, oldValue) => {
			if (newValue !== oldValue) {
				let tooltipText;
				let inputNode = this._searchInput.$view.getElementsByClassName("webix_el_box")[0];
				this._searchInput.setValue("");
				searchButtonModel.removeTimesSearchButton(inputNode);
				if (newValue) {
					this._filtersForm.disable();
					this._appliedFiltersList.disable();
					if (appliedFilterModel.count()) {
						this._appliedFiltersList.clearAll();
						appliedFilterModel.clearAll();
						this._reload();
					}

					tooltipText = "Clear name filter";
					this._searchEventsMethods(this._searchHandlerByName.bind(this));
					searchButtonModel.createTimesSearchButton(this._searchInput, appliedFilterModel, inputNode, tooltipText, true);
				}
				else {
					this._filtersForm.enable();
					this._appliedFiltersList.enable();

					this._view.$scope.setParam("name", "", true);
					tooltipText = "Clear search value";
					if (appliedFilterModel.getFilterByName()) {
						appliedFilterModel.setFilterByName(false);
						this._clearNameFilter();
					}
					this._searchEventsMethods(this._searchHandlerByFilter.bind(this));
					searchButtonModel.createTimesSearchButton(this._searchInput, appliedFilterModel, inputNode, tooltipText);
				}
			}
		});

		const nameParam = this._view.$scope.getParam("name");
		if (nameParam) {
			this._leftPanelToggleButton.setValue(1);
			this._searchInput.setValue(nameParam);
		}

		this._toggleButton.attachEvent("onChange", (value, oldValue) => {
			if (value !== oldValue) {
				if (value) {
					this._onChangeForStudy();
				}
				else {
					this._onChangeForDownload();
				}
			}
		});

		this._searchInput.attachEvent("onAfterRender", () => {

		});

		let dataviewSelectionId = util.getDataviewSelectionId()
			? util.getDataviewSelectionId() : constants.DEFAULT_DATAVIEW_COLUMNS;
		this._dataviewYCountSelection.blockEvent();
		this._dataviewYCountSelection.setValue(dataviewSelectionId);
		this._dataviewYCountSelection.unblockEvent();

		const resizeHandler = util.debounce((event) => {
			const contentWidth = event[0].contentRect.width;
			const minCurrentTargenInnerWidth = searchButtonModel.getMinCurrentTargenInnerWidth();
			if (contentWidth >= minCurrentTargenInnerWidth) {
				dataviewSelectionId = util.getDataviewSelectionId();
				this._dataviewYCountSelection.callEvent("onChange", [dataviewSelectionId]);
			}
		});
		const resizeObserver = new ResizeObserver(resizeHandler);
		const galleryNode = this._view.getNode();
		resizeObserver.observe(galleryNode);

		this._dataviewYCountSelection.attachEvent("onChange", (id) => {
			let newitemWidth;
			let newItemHeight;
			let newInnerImageNameSize;
			const previousItemWidth = this._imagesDataview.type.width;
			const previousItemHeight = this._imagesDataview.type.height;
			let multiplier = previousItemHeight / previousItemWidth;
			let dataviewWidth = this._imagesDataview.$width;
			let fontSizeMultiplier = this._getInitialFontSizeMultiplier();

			switch (id) {
				case constants.TWO_DATAVIEW_COLUMNS: {
					newitemWidth = Math.round(dataviewWidth / 2) - 5;
					break;
				}
				case constants.THREE_DATAVIEW_COLUMNS: {
					newitemWidth = Math.round(dataviewWidth / 3) - 5;
					break;
				}
				case constants.FOUR_DATAVIEW_COLUMNS: {
					newitemWidth = Math.round(dataviewWidth / 4) - 5;
					break;
				}
				case constants.FIVE_DATAVIEW_COLUMNS: {
					newitemWidth = Math.round(dataviewWidth / 5) - 5;
					break;
				}
				case constants.SIX_DATAVIEW_COLUMNS: {
					newitemWidth = Math.round(dataviewWidth / 6) - 5;
					break;
				}
				case constants.DEFAULT_DATAVIEW_COLUMNS: {
					newitemWidth = 180;
					newItemHeight = 123;
					newInnerImageNameSize = 14;
					break;
				}
				default: {
					newitemWidth = constants.DEFAULT_GALLERY_IMAGE_WIDTH;
					newItemHeight = constants.DEFAULT_GALLERY_IMAGE_HEIGHT;
					break;
				}
			}
			if (id !== constants.DEFAULT_DATAVIEW_COLUMNS) {
				newItemHeight = Math.round(newitemWidth * multiplier);
				newInnerImageNameSize = Math.round(newItemHeight * fontSizeMultiplier);
			}
			util.setNewThumnailsNameFontSize(newInnerImageNameSize);
			util.setDataviewSelectionId(id);
			this._setDataviewColumns(newitemWidth, newItemHeight);
			this._imagesDataview.$scope.updatePagerSize();
		});

		this._imagesDataview.attachEvent("onAfterLoad", () => {
			this._imagesDataview.hideOverlay();
		});

		this._imagesDataview.attachEvent("onAfterLoad", webix.once(() => {
			this._dataviewYCountSelection.callEvent("onChange", [dataviewSelectionId]);
		}));

		this._downloadingMenu.attachEvent("onMenuItemClick", (id) => {
			switch (id) {
				case constants.ID_MENU_DOWNLOAD_SEL_IMAGES_METADATA: {
					this.downloadZip("all", true);
					break;
				}
				case constants.ID_MENU_DOWNLOAD_SEL_IMAGES: {
					this.downloadZip("images", true);
					break;
				}
				case constants.ID_MENU_DOWNLOAD_SEL_METADATA: {
					this.downloadZip("metadata", true);
					break;
				}
				case constants.ID_MENU_DOWNLOAD_IMAGES_METADATA: {
					this.downloadZip("all");
					break;
				}
				case constants.ID_MENU_DOWNLOAD_IMAGES: {
					this.downloadZip("images");
					break;
				}
				case constants.ID_MENU_DOWNLOAD_METADATA: {
					this.downloadZip("metadata");
					break;
				}
				default: {
					break;
				}
			}
		});
		this._imagesDataview.attachEvent("onDataRequest", async (offset, limit) => {
			try {
				await this._updateImagesDataview(offset, limit);
				const totalCount = state.imagesTotalCounts.passedFilters.count;
				this._updateContentHeaderTemplate({
					rangeStart: offset + 1,
					rangeFinish: offset + limit >= totalCount ? totalCount : offset + limit
				});
			}
			catch (error) {}
		});

		this._imageWindow.getNode().addEventListener("keyup", (e) => {
			this._keyPressed(e.keyCode);
		});

		this._imageWindow.attachEvent("onKeyPress", (keyCode) => {
			this._keyPressed(keyCode);
		});

		this._imagesDataview.on_click["resize-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			this._setImageWindowValues(currentItem);
			this._eventForHideMessages(this._imageWindow);
			this._imageWindow.show();
			this._imageTemplate.attachEvent("onAfterRender", () => {
				if (this._imageInstance) {
					this._imageInstance.dispatchEvent(new CustomEvent("wheelzoom.destroy"));
				}
				this._imageInstance = this._imageWindow.$view.getElementsByClassName("zoomable-image")[0];
				window.wheelzoom(this._imageInstance);
			});
		};

		this._imageTemplate.define("onClick", {
			next: () => {
				this._showNextImage();
			},
			prev: () => {
				this._showPrevImage();
			}
		});

		this._imageWindowZoomButtons.define("onClick", {
			"btn-plus": () => {
				this._zoomImage("plus");
			},
			"btn-minus": () => {
				this._zoomImage("minus");
			}
		});

		this._imagesDataview.on_click["info-icon"] = async (e, id) => {
			try {
				const currentItem = this._imagesDataview.getItem(id);
				const image = await ajax.getImageItem(currentItem.isic_id);
				webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)], this._metadataWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
				this._eventForHideMessages(this._metadataWindow);
				this._metadataWindow.show();
			}
			catch (error) {}
		};

		this._imagesDataview.on_click["diagnosis-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			const url = `${constants.URL_MULTIRATER}?id=${currentItem.isic_id}&sid=${currentItem.studyId}&uid=${authService.getToken()}`;
			util.openInNewTab(url);
		};
		webix.extend(this._view, webix.ProgressBar);

		// -->add onClick property for template
		this._imagesSelectionTemplate.define("onClick", {
			"unselect-images-link": () => {
				this._resizeButtonsLayout(layoutHeightAfterHide, false, false);
				this._clearActiveListData();
				this._unselectImages(constants.SELECTED_BY_ALL_ON_PAGE);
			},
			"gallery-select-all-images": () => {
				imagesArray = [];
				let isNeedShowAlert = true;
				let limit;
				let page;
				const filterByName = appliedFilterModel.getFilterByName();
				if (filterByName) {
					limit = this._clonedPagerForNameSearch.config.size;
					page = this._clonedPagerForNameSearch.config.page;
				}
				else {
					limit = this._pager.config.size;
					page = this._pager.config.page;
				}
				const offset = limit * page;
				this._view.showProgress();
				webix.delay(() => {
					this._imagesDataview.data.each((item, index) => {
						if (item.markCheckbox) {
							return;
						}
						if (index >= offset + limit) {
							return;
						}
						if (selectedImages.count() < constants.MAX_COUNT_IMAGES_SELECTION) {
							if (selectedImages.count() === 0) {
								this._resizeButtonsLayout(layoutHeightAfterShow, false, true);
							}
							selectedImages.add(item);
							item.markCheckbox = 1;
							imagesArray.push(item);
						}
						else if (isNeedShowAlert) {
							isNeedShowAlert = false;
							webix.alert({
								text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
							});
						}
					});
					if (imagesArray.length > 0) {
						this._imagesDataview.callEvent("onCheckboxItemClick", [imagesArray, 1]);
						this._imagesDataview.refresh();
						this._view.$scope.app.callEvent("changedSelectedImagesCount");
					}
					this._removeTooltipForDataview(this._imagesSelectionTemplate);
					this._view.hideProgress();
				});
			}
		});

		this._imagesDataview.attachEvent("onAfterSelectAllChanged", (checkboxValue) => {
			this._imagesDataview.find((obj) => {
				if (selectedImages.isSelectedInStudies(obj.isic_id)) {
					obj.markCheckbox = checkboxValue;
				}
			});
		});

		this._allPagesTemplate.define("onClick", {
			"gallery-select-all-images-on-all-pages": () => {
				let isNeedShowAlert = true;
				let countSelectedFiltredImages = 0;
				let filter = appliedFilterModel.getConditionsForApi();
				let imagesLimit = constants.MAX_COUNT_IMAGES_SELECTION;
				let arrayOfImagesLength = selectedImages.countForStudies();
				const sourceParams = {
					limit: imagesLimit,
					sort: "name",
					detail: "false",
					filter
				};
				if (arrayOfImagesLength === imagesLimit) {
					webix.alert({
						text: "You have selected maximum amount of images"
					});
					return;
				}
				const filterByName = appliedFilterModel.getFilterByName();
				if (filterByName && this._clonedPagerForNameSearch.isVisible()) {
					this._view.showProgress();
					webix.delay(() => {
						this._imagesDataview.data.each((item) => {
							if (item.markCheckbox || selectedImages.countForStudies() >= constants.MAX_COUNT_IMAGES_SELECTION) {
								return;
							}
							if (selectedImages.countForStudies() === 0) {
								this._resizeButtonsLayout(layoutHeightAfterShow, true, true);
							}
							selectedImages.addForStudy({
								_id: item.isic_id,
								name: item.isic_id
							});
							item.markCheckbox = 1;
							imagesArray.push(item);
						});
						if (imagesArray.length > 0) {
							this._imagesDataview.callEvent("onCheckboxItemClick", [imagesArray, 1]);
							this._imagesDataview.refresh();
							this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
						}
						this._removeTooltipForDataview(this._allPagesTemplate);
						this._view.hideProgress();
					});
				}
				else {
					this._view.showProgress();
					ajax.getAllImages(sourceParams)
						.fail(() => {
							this._view.hideProgress();
							webix.message("Unable to select images");
						})
						.then((allImagesData) => {
							allImagesData.forEach((imageObj) => {
								if (selectedImages.isSelectedInStudies(imageObj.isic_id)) {
									countSelectedFiltredImages++;
									return;
								}
								if (selectedImages.countForStudies() < constants.MAX_COUNT_IMAGES_SELECTION) {
									if (selectedImages.countForStudies() === 0) {
										this._resizeButtonsLayout(layoutHeightAfterShow, true, true);
									}
									selectedImages.addForStudy({
										_id: imageObj.isic_id,
										name: imageObj.isic_id
									});
									imageObj.markCheckbox = 1;
									imagesArray.push(imageObj);
								}
								else if (isNeedShowAlert) {
									isNeedShowAlert = false;
									webix.alert({
										text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
									});
								}
							});
							if (countSelectedFiltredImages === imagesLimit) {
								webix.alert({
									text: "All filtered images have been selected"
								});
								this._view.hideProgress();
								return;
							}
							if (imagesArray.length > 0) {
								this._imagesDataview.callEvent("onCheckboxItemClick", [imagesArray, 1]);
								this._imagesDataview.refresh();
								this._imagesDataview.callEvent("onAfterSelectAllChanged", [1]);
								this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
								this._removeTooltipForDataview(this._allPagesTemplate);
							}
							this._view.hideProgress();
						});
				}
			},
			"unselect-images-on-all-pages": () => {
				this._resizeButtonsLayout(layoutHeightAfterHide, true, false);
				this._clearActiveListData();
				this._unselectImages(constants.SELECTED_BY_ON_ALL_PAGES, imagesArray);
			}
		});

		this._view.$scope.on(this._view.$scope.app, "changedSelectedImagesCount", () => {
			this._imagesSelectionTemplate.refresh();
		});

		this._view.$scope.on(this._view.$scope.app, "changedAllSelectedImagesCount", () => {
			this._allPagesTemplate.refresh();
		});
		this._view.$scope.on(this._view.$scope.app, "filtersChanged", (data, selectNone) => {
			// add (or remove) filters data to model
			appliedFilterModel.processNewFilters(data);
			// refresh data in list
			this._updateAppliedFiltersList(appliedFilterModel.prepareDataForList());
			webix.delay(() => {
				// update checkboxes values
				const appliedFiltersArray = appliedFilterModel.getFiltersArray();
				this._updateFiltersFormControls(appliedFiltersArray);
			});
			this._reload(0, this._pager.data.size);
		});

		this._clearAllFiltersTemplate.define("onClick", {
			"clear-all-filters": () => {
				this._appliedFiltersList.clearAll();
				appliedFilterModel.clearAll();
				this._reload();
			}
		});

		this._createStudyButton.attachEvent("onItemClick", () => {
			let studyImagesCount = selectedImages.countForStudies();
			if (studyImagesCount > 0) {
				let appliedFiltersConditionsForApi = appliedFilterModel.getConditionsForApi();
				appliedFilterModel.setAppliedFiltersToLocalStorage(appliedFiltersConditionsForApi);
				this._view.$scope.app.show(constants.PATH_CREATE_STUDY);
			}
			else {
				webix.alert({
					title: "Warning!",
					text: "You have to select at least one image to create a study.",
					type: "confirm-warning"
				});
			}
		});

		this._activeCartList.on_click["template-angle"] = (e, id, node) => {
			let item = this._activeCartList.getItem(id);
			let itemNode = this._activeCartList.getItemNode(id);
			let listTextNode = itemNode.firstChild.children[2];
			if (!item.imageShown) {
				itemNode.setAttribute("style", "height: 130px !important; color: #0288D1;");
				listTextNode.setAttribute("style", "margin-left: 17px; width: 95px;");
				node.setAttribute("class", "webix_icon template-angle fas fa-angle-down");
				item.imageShown = true;
				modifiedObjects.add(item);
				this._activeCartList.parse(item);
				this._activeCartList.showItem(item.id);
			}
			else {
				itemNode.setAttribute("style", "height: 30px !important; color: rgba(0, 0, 0, 0.8);");
				listTextNode.setAttribute("style", "margin-left: 12px; width: 91px;");
				node.setAttribute("class", "webix_icon template-angle fas fa-angle-right");
				item.imageShown = false;
				modifiedObjects.remove(item.id);
			}
		};

		this._imagesDataview.attachEvent("onCheckboxItemClick", (items, value) => {
			if (!Array.isArray(items)) {
				items = [items];
			}
			items.forEach((item) => {
				this._imagesDataview.find((obj) => {
					if (obj.isic_id === item.isic_id) {
						item.id = obj.id;
						this._imagesDataview.updateItem(item.id, item);
					}
				});
			});

			if (util.isObjectEmpty(this._activeCartList.data.pull) && value) {
				this._view.$scope.showList();
			}
			if (items.length === 1) {
				if (items[0].markCheckbox) {
					this._activeCartList.add(items[0]);
				}
				else if (!items[0].markCheckbox && util.findItemInList(items[0].isic_id, this._activeCartList)) {
					this._activeCartList.callEvent("onDeleteButtonClick", [items[0]]);
				}
			}
			else if (items.length > 1) {
				if (value) {
					this._activeCartList.parse(items);
				}
				else {
					items.forEach((item) => {
						if (util.findItemInList(item.isic_id, this._activeCartList)) {
							this._activeCartList.callEvent("onDeleteButtonClick", [item]);
						}
					});
					if (util.isObjectEmpty(this._activeCartList.data.pull)) {
						this._view.$scope.hideList();
					}
				}
			}
		});

		this._activeCartList.attachEvent("onDeleteButtonClick", (params) => {
			let item;
			let itemId;
			if (params.isic_id) {
				item = params;
				itemId = params.id;
			}
			else {
				this.deleteButton = $$(params);
				itemId = this.deleteButton.config.$masterId;
				item = this._activeCartList.getItem(itemId);
			}
			if (item.imageShown) {
				item.imageShown = false;
				modifiedObjects.remove(item.id);
			}
			this._activeCartList.data.callEvent("onAfterDeleteItem", [itemId]);
		});

		this._activeCartList.data.attachEvent("onAfterDeleteItem", (id) => {
			const value = 0;
			let item;
			let wasUpdated;
			let wasRemovedFromStudies;
			let studyFlag = selectedImages.getStudyFlag();
			let dataviewItem = this._imagesDataview.getItem(id);
			let listItem = this._activeCartList.getItem(id);
			if (dataviewItem) {
				item = dataviewItem;
				item.markCheckbox = value;
				item.id = id;
				if (studyFlag) {
					selectedImages.removeImageFromStudies(item.isic_id);
					this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
					wasRemovedFromStudies = true;
				}
				this._imagesDataview.updateItem(id, item);
			}
			else {
				item = listItem;
				this._imagesDataview.find((obj) => {
					if (obj && obj.isic_id === item.isic_id && !wasUpdated) {
						obj.markCheckbox = value;
						if (studyFlag) {
							selectedImages.removeImageFromStudies(item.isic_id);
							this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
							wasRemovedFromStudies = true;
						}
						this._imagesDataview.updateItem(obj.id, obj);
						wasUpdated = true;
					}
				});
			}
			if (!studyFlag) {
				selectedImages.remove(item.isic_id);
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
			}
			else if (studyFlag && !wasRemovedFromStudies) {
				selectedImages.removeImageFromStudies(item.isic_id);
				this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
			}
			this._activeCartList.find((obj) => {
				if (obj.isic_id === item.isic_id) {
					this._activeCartList.remove(obj.id);
				}
			});
			if (util.isObjectEmpty(this._activeCartList.data.pull)) {
				this._view.$scope.hideList();
				this._resizeButtonsLayout(layoutHeightAfterHide, studyFlag, false);
			}
		});
	}

	_prepareAnnotatedImagesList(studies) {
		let result = {};
		if (studies) {
			studies.forEach((study) => {
				study.images.forEach((image) => {
					result[image.isic_id] = {
						studyId: study._id
					};
				});
			});
		}
		return result;
	}

	downloadZip(type, onlySelected) {
		let url = `${ajax.getBaseApiUrl()}image/download?include=${type}`;
		if (onlySelected) {
			if (!selectedImages.count()) {
				webix.alert({
					text: "There are no images selected for downloading",
					type: "alert-error"
				});
				return;
			}
			const checkedIds = selectedImages.getURIEncoded();
			url += `&imageIds=${checkedIds}`;
		}
		else if (appliedFilterModel.count()) {
			url += `&filter=${appliedFilterModel.getConditionsForApi()}`;
		}
		util.downloadByLink(url, `${type}.zip`);
	}

	async load() {
		state.imagesTotalCounts = {};
		state.imagesTotalCounts.passedFilters = {};
		const images = await ajax.getImages();
		state.imagesTotalCounts.passedFilters.count = images.count ? images.count : 0;
		this._updateContentHeaderTemplate(
			{
				rangeStart: 1,
				rangeFinish: this._pager.data.size,
				totalCount: state.imagesTotalCounts.passedFilters.count
			}
		);
		this._updatePagerCount(state.imagesTotalCounts.passedFilters.count);
		const facets = await ajax.getFacets();
		const ids = Object.keys(facets);
		ids.forEach((id) => {
			state.imagesTotalCounts[id] = facets[id].buckets;
		});
		let appliedFiltersArray = appliedFilterModel.getFiltersArray();
		const paramFilters = this._view.$scope.getParam("filter");
		if (appliedFiltersArray.length) {
			webix.delay(() => {
				this._view.$scope.app.callEvent("filtersChanged", [appliedFiltersArray]);
			});
		}
		else {
			this._createFilters([], true)
				.then(() => {
					if (paramFilters) {
						try {
							const parsedFilters = JSON.parse(paramFilters);
							appliedFiltersArray = appliedFilterModel.getFiltersFromURL(parsedFilters);
							this._view.$scope.app.callEvent("filtersChanged", [appliedFiltersArray]);
						}
						catch (err) {
							this._view.$scope.setParam("filter", "[]", true);
							this._view.$scope.app.callEvent("filtersChanged", [[]]);
						}
					}
				}); // create filters form controls from config
		}
		filterService.updateFiltersCounts();
		if (!paramFilters && !appliedFiltersArray.length) this._reload();
	}

	_reload(offsetSource, limitSource) {
		let limit = limitSource || this._pager.data.size;
		let offset = offsetSource || 0;
		// save promise to object. we need wait for its result before rendering images dataview
		// TODO: uncomment when study endpoint will be implemented
		// this.studiesPromise = ajax.getStudies({
		// 	sort: "lowerName",
		// 	sortdir: "1",
		// 	detail: true
		// }).then(data => this._prepareAnnotatedImagesList(data));
		const appliedFiltersArray = appliedFilterModel.getFiltersArray();
		this._createFilters(appliedFiltersArray);
		this._updateCounts();
		const paramFilters = appliedFilterModel.convertAppliedFiltersToParams();
		this._view.$scope.setParam("filter", paramFilters, true);
		this._updateImagesDataview(offset, limit); // load images first time
	}

	_updateContentHeaderTemplate(ranges) {
		const values = webix.copy(ranges);
		values.filtered = appliedFilterModel.count();
		this._contentHeaderTemplate.setValues(values, true); // true -> unchange existing values
		this._contentHeaderTemplate.refresh();
	}

	async _updateCounts() {
		try {
			const filterQuery = appliedFilterModel.getConditionsForApi();
			const params = {};
			params.conditions = filterQuery;
			const facets = await ajax.getFacets(params);
			filterService.updateFiltersCounts(facets);
			this._updatePagerCount(null, 0);
		}
		catch (error) {}
	}

	// update form controls values(true/false for checkboxes, etc)
	_updateFiltersFormControls(data) {
		if (Array.isArray(data)) {
			data.forEach((item) => {
				filterService.updateFiltersFormControl(item);
			});
		}
		else if (data) {
			filterService.updateFiltersFormControl(data);
		}
	}

	_updateAppliedFiltersList(data) {
		this._appliedFiltersList.clearAll();
		this._appliedFiltersList.parse(data);
	}

	// expandedFilters - array of filter that should be initially expanded
	_createFilters(expandedFilters, forceRebuild) {
		let expandedFiltersKeys = [];
		if (expandedFilters && expandedFilters.length) {
			expandedFiltersKeys = expandedFilters.map(item => item.key);
		}
		return filtersData.getFiltersData(forceRebuild).then((data) => {
			const elements = filtersFormElements.transformToFormFormat(data, expandedFiltersKeys);
			webix.ui(elements, this._filtersForm);
			const firstItemToScroll = filtersBySearchCollection.getItem(filtersBySearchCollection.getFirstId());
			if (firstItemToScroll) {
				const elementsToScroll = elements.find((element) => {
					if (element.rows) {
						return element.rows[0].template === firstItemToScroll.filterName;
					}
				}, true);
				this._scrollToFilterFormElement(elementsToScroll);
				filtersBySearchCollection.clearAll();
			}
		});
	}

	_updatePagerCount(count, page) {
		count = count || 1;
		if (page !== undefined) {
			this._pager.select(page);
		}
		if (count) {
			this._pager.define("count", count);
			this._pager.refresh();
		}
	}

	async _updateImagesDataview(offset, limit) {
		this._imagesDataview.clearAll();
		const filter = appliedFilterModel.getConditionsForApi();
		const leftPanelToggleButtonValue = this._leftPanelToggleButton.getValue();
		const searchValue = this._searchInput.getValue();
		if (leftPanelToggleButtonValue !== 0 && searchValue.length > 8) {
			this._searchHandlerByName(true);
			return;
		}
		else if (searchValue > 0 && searchValue < 9) {
			webix.alert("You should type minimum 9 characters for name search");
		}
		this._view.showProgress();
		try {
			const images = await ajax.getImages({
				offset,
				limit,
				filter
			});
			const start = offset !== 0 ? offset : 1;
			if (images.count < state.imagesTotalCounts.passedFilters.count) {
				this._updateContentHeaderTemplate({
					rangeStart: start,
					rangeFinish: start + this._pager.data.size - 1,
					currentCount: images.count
				});
			}
			else {
				this._updateContentHeaderTemplate({
					rangeStart: start,
					rangeFinish: start + this._pager.data.size - 1,
					totalCount: state.imagesTotalCounts.passedFilters.count
				});
			}
			this._updatePagerCount(images.count);
			if (images && images.results.length > 0) {
				images.results.forEach((item) => {
					item.markCheckbox = selectedImages.isSelected(item.isic_id);
				});
				this._imagesDataview.parse(images.results);
			}
			else {
				this._imagesDataview.showOverlay("<div style=\"font-size: 17px; font-weight: bold;\">Nothing Has Found</div>");
			}
			this._view.hideProgress();
		}
		catch (error) {
			this._view.hideProgress();
		}
	}

	_unselectImages(selectedBy, allImagesArray) {
		if (selectedBy === constants.SELECTED_BY_ALL_ON_PAGE) {
			// clear checkbox state in dataview for current page
			this._imagesDataview.data.each((item) => {
				item.markCheckbox = 0;
			});
			this._imagesDataview.refresh();
			selectedImages.clearImagesForDownload();
			this._view.$scope.app.callEvent("changedSelectedImagesCount");
		}
		else if (selectedBy === constants.SELECTED_BY_ON_ALL_PAGES) {
			allImagesArray.forEach((imageObj) => {
				imageObj.markCheckbox = 0;
			});
			imagesArray = [];
			this._imagesDataview.callEvent("onAfterSelectAllChanged", [0]);
			selectedImages.clearImagesForStudies();
			this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
			this._imagesDataview.refresh();
		}
	}

	_toggleHeaders(forStudies) {
		this._resizeButtonsLayout(layoutHeightAfterHide, !forStudies, false);
		if (!forStudies) {
			this._disableTemplateByCss(this._allPagesTemplate);
			this._enableTemplateByCss(this._imagesSelectionTemplate);
		}
		else {
			this._disableTemplateByCss(this._imagesSelectionTemplate);
			this._enableTemplateByCss(this._allPagesTemplate);
		}
	}

	async _setImageWindowValues(currentItem) {
		this._currentItem = currentItem;
		this._imageWindowViewer.setValues({imageId: currentItem.isic_id});
		const image = await ajax.getImageItem(currentItem.isic_id);
		webix.ui([metadataPart.getConfig("image-window-metadata", image, currentItem)], this._imageWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
	}

	_showNextImage() {
		let nextItem;
		let nextItemId = this._imagesDataview.getNextId(this._currentItem.id);
		if (nextItemId === undefined) {
			nextItem = this._imagesDataview.getItem(this._imagesDataview.getFirstId());
		}
		else {
			nextItem = this._imagesDataview.getItem(nextItemId);
		}
		this._setImageWindowValues(nextItem);
	}

	_showPrevImage() {
		let prevItem;
		let prevItemId = this._imagesDataview.getPrevId(this._currentItem.id);
		if (prevItemId === undefined) {
			prevItem = this._imagesDataview.getItem(this._imagesDataview.getLastId());
		}
		else {
			prevItem = this._imagesDataview.getItem(prevItemId);
		}
		this._setImageWindowValues(prevItem);
	}

	_keyPressed(keyCode) {
		switch (keyCode) {
			case 27: {
				this._imageWindow.hide();
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

	_setDataviewColumns(width, height) {
		this._imagesDataview.customize({
			width,
			height
		});
		galleryImagesUrls.clearPreviewUrls();
		util.setDataviewItemDimensions(width, height);
		this._imagesDataview.refresh();
	}

	_getInitialFontSizeMultiplier() {
		const initialFontSize = constants.DEFAULT_GALLERY_IMAGE_NAME_FONT_SIZE;
		const initialImageWidth = constants.DEFAULT_GALLERY_IMAGE_WIDTH;
		return initialFontSize / initialImageWidth;
	}

	_clearActiveListData(clearModifyObjects) {
		this._activeCartList.clearAll();
		if (!clearModifyObjects) modifiedObjects.clearAll();
		this._view.$scope.hideList();
	}

	_resizeButtonsLayout(height, studyFlag, toShow) {
		this._buttonsLayout.define("height", height);
		this._buttonsLayout.resize();
		if (studyFlag) {
			toShow ? this._createStudyButton.show() : this._createStudyButton.hide();
		}
		// TODO: uncomment when donwload will be implemented
		// else {
		// 	toShow ? this._downloadingMenu.show() : this._downloadingMenu.hide();
		// }
	}

	_disableTemplateByCss(templateToDisable) {
		templateToDisable.$view.children[0].style["pointer-events"] = "none";
		setTimeout(() => {
			templateToDisable.$view.children[0].children[0].classList.remove("link");
		});
	}

	_enableTemplateByCss(templateToEnable) {
		templateToEnable.$view.children[0].style["pointer-events"] = "all";
		setTimeout(() => {
			templateToEnable.$view.children[0].children[0].classList.add("link");
		});
	}

	_onChangeForStudy(clearModifyObjects) {
		this._clearActiveListData(clearModifyObjects);
		this._unselectImages(constants.SELECTED_BY_ALL_ON_PAGE);
		selectedImages.setStudyFlag(true);
		this._toggleHeaders(true);
	}

	_onChangeForDownload(clearModifyObjects) {
		this._clearActiveListData(clearModifyObjects);
		this._unselectImages(constants.SELECTED_BY_ON_ALL_PAGES, imagesArray);
		selectedImages.setStudyFlag(false);
		this._toggleHeaders(false);
	}

	_searchEventsMethods(eventMethod) {
		this._searchInput.detachEvent("onEnter");
		this._searchInput.on_click["fa-search"] = eventMethod;
		this._searchInput.attachEvent("onEnter", eventMethod);
	}

	_clearNameFilter() {
		this._clonedPagerForNameSearch.hide();
		this._pager.show();
		let filtersInfo = appliedFilterModel.getFiltersArray();
		if (filtersInfo.length > 0) {
			this._view.$scope.app.callEvent("filtersChanged", [filtersInfo]);
		}
		else {
			this.load();
		}
	}

	_zoomImage(buttonIcon) {
		const eventWheel = new CustomEvent("wheel");
		const offsetTop = this._imageInstance.getBoundingClientRect().top;
		const offsetLeft = this._imageInstance.getBoundingClientRect().left;
		const imageWidth = this._imageInstance.clientWidth;
		const imageHeight = this._imageInstance.clientHeight;
		const pageY = Math.floor(offsetTop + imageHeight / 2);
		const pageX = Math.floor(offsetLeft + imageWidth / 2);
		eventWheel.pageX = pageX;
		eventWheel.pageY = pageY;
		if (buttonIcon === "plus") {
			eventWheel.deltaY = -100;
			eventWheel.wheelDelta = 120;
		}
		else if (buttonIcon === "minus") {
			eventWheel.deltaY = 100;
			eventWheel.wheelDelta = -120;
		}
		this._imageInstance.dispatchEvent(eventWheel);
	}

	_removeTooltipForDataview(templateView) {
		const tooltipClassName = constants.TOOLTIP_CLASS_NAME_FOR_DATAVIEW;
		Array.from(templateView.$view.querySelectorAll("span")).forEach((element) => {
			searchButtonModel.removeTootipDiv(element, tooltipClassName);
		});
	}

	_eventForHideMessages(windowView) {
		windowView.attachEvent("onHide", () => {
			webix.message.hideAll();
			windowView.detachEvent("onHide");
		});
	}

	_scrollToFilterFormElement(element) {
		const elementView = $$(element.id);
		const elementOffsetTop = elementView.$view.offsetTop;
		const filterScrollViewOffsetTop = this._filterScrollView.$view.offsetTop;
		const positionToScroll = elementOffsetTop - filterScrollViewOffsetTop;
		this._filterScrollView.scrollTo(0, positionToScroll);
	}
}

export default GalleryService;
