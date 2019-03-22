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
import authService from "../../services/auth";
import imageWindow from "../../views/subviews/gallery/windows/imageWindow";
import galleryImagesUrls from "../../models/galleryImagesUrls";
import "wheelzoom";


const layoutHeightAfterHide = 1;
const layoutHeightAfterShow = 32;
const collapsedRowsCollection = appliedFilterModel.getCollapsedRowsCollection();
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
		if (searchValue.length < 3) {
			webix.alert("You should type minimum 3 characters");
			return;
		}
		this._appliedFiltersList.clearAll();
		appliedFilterModel.clearAll();
		collapsedRowsCollection.clearAll();
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
			this._view.$scope.app.callEvent("filtersChanged", [filtersInfo]);
		}
		else {
			webix.alert(`Nothing has found with name ${searchValue}`);
		}
	}

	_searchHandlerByName(afterFilterSelected) {
		let searchValue = this._searchInput.getValue();
		searchValue = searchValue.trim();
		searchValue = searchValue.toLowerCase();
		if (searchValue.length < 9) {
			webix.alert("You should type minimum 9 characters");
			return;
		}
		const valueOfMarkedCheckbox = 1;
		let filteredImages = [];
		let studyFlag = selectedImages.getStudyFlag();
		let filter = appliedFilterModel.getConditionsForApi();
		const sourceParams = {
			limit: 0,
			sort: "name",
			detail: "false",
			filter
		};
		this._view.showProgress();
		this.studiesPromise
			.then(annotatedImages => ajax.getAllImages(sourceParams, annotatedImages))
			.then((valuesArray) => {
				let annotatedImages = valuesArray.annotatedImages;
				let imagesArray = webix.copy(valuesArray.allImages);
				imagesArray.forEach((imageObj) => {
					if (imageObj.name.toLowerCase().indexOf(searchValue) !== -1) {
						if (annotatedImages[imageObj._id]) {
							imageObj.hasAnnotations = true;
							imageObj.studyId = annotatedImages[imageObj._id].studyId;
						}
						if (studyFlag && selectedImages.isSelectedInStudies(imageObj._id)) {
							imageObj.markCheckbox = valueOfMarkedCheckbox;
						}
						else if (!studyFlag && selectedImages.isSelected(imageObj._id)) {
							imageObj.markCheckbox = valueOfMarkedCheckbox;
						}
						filteredImages.push(imageObj);
					}
				});
				if (filteredImages.length > 0) {
					this._imagesDataview.clearAll();
					let page = 0;
					this._updatePagerCount(80, page);
					// connecting pager to data view
					this._imagesDataview.define("pager", this._clonedPagerForNameSearch);
					this._pager.hide();
					this._clonedPagerForNameSearch.show();
					this._imagesDataview.parse(filteredImages);
					let totalCount = filteredImages.length;
					let rangeFinish = this._pager.data.size;
					let headerValues = {
						rangeStart: 1,
						rangeFinish,
						totalCount
					};
					if (totalCount < rangeFinish) {
						headerValues.filtered = totalCount;
						headerValues.currentCount = totalCount;
					}
					this._contentHeaderTemplate.setValues(headerValues);
					this._contentHeaderTemplate.refresh();
					appliedFilterModel.setFilterByName(true);
				}
				else {
					if (afterFilterSelected) {
						this._imagesDataview.clearAll();
						this._imagesDataview.showOverlay(`<div style="font-size: 17px; font-weight: bold;">Nothing Has Found With Name "${searchValue}"</div>`);
					}
					webix.alert(`Nothing has found with name ${searchValue}`);
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
		this._activeCartList = this._view.$scope.getActiveGalleryCartList();
		this._toggleButton = this._view.$scope.getToggleButton();
		this._buttonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
		this._leftPanelToggleButton = this._view.$scope.getLeftPanelToggleButton();
		this._clonedPagerForNameSearch = this._view.$scope.getClonedPagerForNameSearch();
		const removedFilterCollection = appliedFilterModel.getRemovedFiltersCollection();

		this._activeCartList.attachEvent("onAfterRender", () => {
			if (modifiedObjects.count() > 0) {
				modifiedObjects.find((obj) => {
					let itemNode = this._activeCartList.getItemNode(obj.id);
					if (itemNode) {
						let listTextNode = itemNode.firstChild.children[2];
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
					this._onChangeForDownload();
					selectedImagesArray = selectedImages.getSelectedImagesForDownload();
				}
				else {
					let newValue = 1;
					this._toggleButton.setValue(newValue);
					this._onChangeForStudy();
					selectedImagesArray = selectedImages.getStudyImagesId();
				}
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
		}

		this._searchEventsMethods(this._searchHandlerByFilter.bind(this));

		this._leftPanelToggleButton.attachEvent("onChange", (newValue, oldValue) => {
			if (newValue !== oldValue) {
				let tooltipText;
				let inputNode = this._searchInput.$view.getElementsByClassName("webix_el_box")[0];
				this._searchInput.setValue("");
				this._removeTimesSearchButton(inputNode);
				if (newValue) {
					tooltipText = "Clear name filter";
					this._searchEventsMethods(this._searchHandlerByName.bind(this));
					this._createTimesSearchButton(inputNode, tooltipText, true);
				}
				else {
					tooltipText = "Clear search value";
					appliedFilterModel.setFilterByName(false);
					this._clearNameFilter();
					this._searchEventsMethods(this._searchHandlerByFilter.bind(this));
					this._createTimesSearchButton(inputNode, tooltipText);
				}
			}
		});

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
			const searchInputWidth = this._searchInput.$width;
			const dataviewMinWidth = 800;
			this._minCurrentTargenInnerWidth = dataviewMinWidth + searchInputWidth;
			let inputNode = this._searchInput.$view.getElementsByClassName("webix_el_box")[0];
			const tooltipText = "Clear search value";
			this._createTimesSearchButton(inputNode, tooltipText);
		});

		let dataviewSelectionId = util.getDataviewSelectionId() ? util.getDataviewSelectionId() : constants.DEFAULT_DATAVIEW_COLUMNS;
		this._dataviewYCountSelection.blockEvent();
		this._dataviewYCountSelection.setValue(dataviewSelectionId);
		this._dataviewYCountSelection.unblockEvent();

		window.addEventListener("resize", (event) => {
			if (event.currentTarget.innerWidth >= this._minCurrentTargenInnerWidth) {
				const dataviewSelectionId = util.getDataviewSelectionId();
				if (dataviewSelectionId && dataviewSelectionId !== constants.DEFAULT_DATAVIEW_COLUMNS) {
					this._dataviewYCountSelection.callEvent("onChange", [dataviewSelectionId]);
				}
			}
		});

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
			}
			if (id !== constants.DEFAULT_DATAVIEW_COLUMNS) {
				newItemHeight = Math.round(newitemWidth * multiplier);
				newInnerImageNameSize = Math.round(newItemHeight * fontSizeMultiplier);
			}
			util.setNewThumnailsNameFontSize(newInnerImageNameSize);
			util.setDataviewSelectionId(id);
			this._setDataviewColumns(newitemWidth, newItemHeight);
		});

		this._imagesDataview.attachEvent("onAfterLoad", () => {
			let dataviewSelectionId = util.getDataviewSelectionId();
			if (dataviewSelectionId && dataviewSelectionId !== constants.DEFAULT_DATAVIEW_COLUMNS) {
				this._dataviewYCountSelection.callEvent("onChange", [dataviewSelectionId]);
			}
			this._imagesDataview.hideOverlay();
		});

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
			}
		});
		this._imagesDataview.attachEvent("onDataRequest", (offset, limit) => {
			this._updateImagesDataview(offset, limit);
			const totalCount = state.imagesTotalCounts.__passedFilters__[0].count;
			this._updateContentHeaderTemplate({
				rangeStart: offset + 1,
				rangeFinish: offset + limit >= totalCount ? totalCount : offset + limit
			});
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
			},
			"btn-plus": () => {
				this._zoomImage("plus");
			},
			"btn-minus": () => {
				this._zoomImage("minus");
			}
		});

		this._imagesDataview.on_click["info-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			webix.promise.all([
				ajax.getImageItem(currentItem._id),
				ajax.getSegmentation({imageId: currentItem._id})
			]).then((results) => {
				const data = webix.copy(results[0]);
				data.segmentation = webix.copy(results[1]);
				webix.ui([metadataPart.getConfig("metadata-window-metadata", data, currentItem)], this._metadataWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
			});
			this._eventForHideMessages(this._metadataWindow);
			this._metadataWindow.show();
		};
		this._imagesDataview.on_click["diagnosis-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			const url = `${constants.URL_MULTIRATER}?id=${currentItem._id}&sid=${currentItem.studyId}&uid=${authService.getToken()}`;
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
				let imagesArray = [];
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
							selectedImages.add({
								_id: item._id,
								name: item.name
							});
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
				if (selectedImages.isSelectedInStudies(obj._id)) {
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
								_id: item._id,
								name: item.name
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
								if (selectedImages.isSelectedInStudies(imageObj._id)) {
									countSelectedFiltredImages++;
									return;
								}
								if (selectedImages.countForStudies() < constants.MAX_COUNT_IMAGES_SELECTION) {
									if (selectedImages.countForStudies() === 0) {
										this._resizeButtonsLayout(layoutHeightAfterShow, true, true);
									}
									selectedImages.addForStudy({
										_id: imageObj._id,
										name: imageObj.name
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
			if (data.remove) {
				removedFilterCollection.add({
					id: data.key
				});
			}
			else if (selectNone) {
				removedFilterCollection.add({
					id: data[0].key
				});
			}

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
				node.setAttribute("class", "webix_icon template-angle fa-angle-down");
				item.imageShown = true;
				modifiedObjects.add(item);
				this._activeCartList.parse(item);
			}
			else {
				itemNode.setAttribute("style", "height: 30px !important; color: rgba(0, 0, 0, 0.8);");
				listTextNode.setAttribute("style", "margin-left: 12px; width: 91px;");
				node.setAttribute("class", "webix_icon template-angle fa-angle-right");
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
					if (obj._id === item._id) {
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
				else if (!items[0].markCheckbox && util.findItemInList(items[0]._id, this._activeCartList)) {
					this._activeCartList.callEvent("onDeleteButtonClick", [items[0]]);
				}
			}
			else if (items.length > 1) {
				if (value) {
					this._activeCartList.parse(items);
				}
				else {
					items.forEach((item) => {
						this._activeCartList.remove(item.id);
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
			if (params.name) {
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
					selectedImages.removeImageFromStudies(item._id);
					this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
					wasRemovedFromStudies = true;
				}
				this._imagesDataview.updateItem(id, item);
			}
			else {
				item = listItem;
				this._imagesDataview.find((obj) => {
					if (obj && obj._id === item._id && !wasUpdated) {
						obj.markCheckbox = value;
						if (studyFlag) {
							selectedImages.removeImageFromStudies(item._id);
							this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
							wasRemovedFromStudies = true;
						}
						this._imagesDataview.updateItem(obj.id, obj);
						wasUpdated = true;
					}
				});
			}
			if (!studyFlag) {
				selectedImages.remove(item._id);
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
			}
			else if (studyFlag && !wasRemovedFromStudies) {
				selectedImages.removeImageFromStudies(item._id);
				this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
			}
			this._activeCartList.find((obj) => {
				if (obj._id === item._id) {
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
					result[image._id] = {
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

	load() {
		// we should get maximum count of images once
		ajax.getHistogram().then((data) => {
			state.imagesTotalCounts = data;
			const imagesCount = state.imagesTotalCounts.__passedFilters__[0].count;
			this._updateContentHeaderTemplate(
				{
					rangeStart: 1,
					rangeFinish: this._pager.data.size,
					totalCount: imagesCount
				});
			this._updatePagerCount(imagesCount);
			filterService.updateFiltersCounts();
			const appliedFiltersArray = appliedFilterModel.getFiltersArray();
			if (appliedFiltersArray.length) {
				webix.delay(() => {
					this._view.$scope.app.callEvent("filtersChanged", [appliedFiltersArray]);
				});
			}
			else {
				this._createFilters([], true); // create filters form controls from config
			}
			this._reload();
		});
	}

	_reload(offsetSource, limitSource) {
		let limit = limitSource || this._pager.data.size;
		let offset = offsetSource || 0;
		// save promise to object. we need wait for its result before rendering images dataview
		this.studiesPromise = ajax.getStudies({
			sort: "lowerName",
			sortdir: "1",
			detail: true
		}).then(data => this._prepareAnnotatedImagesList(data));
		const appliedFiltersArray = appliedFilterModel.getFiltersArray();
		this._createFilters(appliedFiltersArray);
		this._updateCounts();
		this._updateImagesDataview(offset, limit); // load images first time
	}

	_updateContentHeaderTemplate(ranges) {
		const values = webix.copy(ranges);
		values.filtered = appliedFilterModel.count();
		this._contentHeaderTemplate.setValues(values, true); // true -> unchange existing values
	}

	_updateCounts() {
		const filter = appliedFilterModel.getConditionsForApi();
		ajax.getHistogram(filter).then((data) => {
			if (data) {
				const imagesCount = data.__passedFilters__[0].count;
				this._updateContentHeaderTemplate({
					rangeStart: 1,
					rangeFinish: this._pager.data.size,
					currentCount: imagesCount
				});
				this._updatePagerCount(imagesCount, 0);
				filterService.updateFiltersCounts(data);
			}
		});
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
		filtersData.getFiltersData(forceRebuild).then((data) => {
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

	_updateImagesDataview(offset, limit) {
		const imagesPromise = ajax.getImages({
			offset,
			limit,
			filter: appliedFilterModel.getConditionsForApi()
		});
		const studyFlag = selectedImages.getStudyFlag();
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
		webix.promise.all([
			this.studiesPromise,
			imagesPromise
		]).then((results) => {
			const [annotatedImages, images] = results;
			this._imagesDataview.clearAll();
			if (images && images.length > 0) {
				images.forEach((item) => {
					// markCheckbox - active content in dataview.
					if (studyFlag) {
						item.markCheckbox = selectedImages.isSelectedInStudies(item._id);
					}
					else {
						item.markCheckbox = selectedImages.isSelected(item._id);
					}
					if (annotatedImages[item._id]) {
						item.hasAnnotations = true;
						item.studyId = annotatedImages[item._id].studyId;
					}
				});
				this._imagesDataview.parse(images);
			}
			else {
				this._imagesDataview.showOverlay("<div style=\"font-size: 17px; font-weight: bold;\">Nothing Has Found</div>");
			}
			this._view.hideProgress();
		});
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

	_setImageWindowValues(currentItem) {
		this._currentItem = currentItem;
		this._imageWindowViewer.setValues({imageId: currentItem._id});
		webix.promise.all([
			ajax.getImageItem(currentItem._id),
			ajax.getSegmentation({imageId: currentItem._id})
		]).then((results) => {
			let data;
			[data, data.segmentation] = results;
			webix.ui([metadataPart.getConfig("image-window-metadata", data, currentItem)], this._imageWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
		});
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

	_clearActiveListData() {
		this._activeCartList.clearAll();
		modifiedObjects.clearAll();
		this._view.$scope.hideList();
	}

	_resizeButtonsLayout(height, studyFlag, toShow) {
		this._buttonsLayout.define("height", height);
		this._buttonsLayout.resize();
		if (studyFlag) {
			toShow ? this._createStudyButton.show() : this._createStudyButton.hide();
		}
		else {
			toShow ? this._downloadingMenu.show() : this._downloadingMenu.hide();
		}
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

	_onChangeForStudy() {
		this._clearActiveListData();
		this._unselectImages(constants.SELECTED_BY_ALL_ON_PAGE);
		selectedImages.setStudyFlag(true);
		this._toggleHeaders(true);
	}

	_onChangeForDownload() {
		this._clearActiveListData();
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

	_createTimesSearchButton(inputNode, tooltipText, nameFilter) {
		inputNode.lastChild.style.paddingRight = "26px";
		const timesSpan = document.createElement("span");
		inputNode.appendChild(timesSpan);
		let timesButtonNode = inputNode.lastChild;
		timesButtonNode.setAttribute("class", "search-times-button webix_input_icon fa-times");
		timesButtonNode.setAttribute("style", "height:26px; padding-top:6px;");
		const tootipTextForTimesButton = `${tooltipText}`;
		const tooltipClassNameForTimesButton = "tooltip";
		this._createHintForSearchTimesButton(timesButtonNode, tooltipClassNameForTimesButton, tootipTextForTimesButton);
		this._searchInput.on_click["fa-times"] = () => {
			this._searchInput.setValue("");
			if (nameFilter) {
				this._clearNameFilter();
			}
		};
	}

	_removeTimesSearchButton(inputNode) {
		inputNode.removeChild(inputNode.lastChild);
		inputNode.lastChild.style.paddingRight = "0px";
	}

	_createHintForSearchTimesButton(elementNodeForTooltip, tooltipClassName, tooltipText) {
		elementNodeForTooltip.addEventListener("mouseover", function () {
			const title = this.title;
			this.setAttribute("tooltip", title);
			const tooltipWrap = document.createElement("div"); // creates div
			tooltipWrap.className = tooltipClassName; // adds class
			const textDiv = document.createElement("div"); // creates another div
			textDiv.innerHTML = tooltipText;	// add the text node to the newly created span.
			tooltipWrap.appendChild(textDiv); // add text element to the tooltip

			const firstChild = document.body.firstChild;// gets the first elem after body
			firstChild.parentNode.insertBefore(tooltipWrap, firstChild); // adds tt before elem
			const padding = 5;
			const linkProps = this.getBoundingClientRect();
			const tooltipProps = tooltipWrap.getBoundingClientRect();
			const topPos = linkProps.top - (tooltipProps.height + padding);
			tooltipWrap.setAttribute("style", `top:${topPos}px;` + `left:${linkProps.left}px;`);
		});
		elementNodeForTooltip.addEventListener("mouseout", () => {
			this._removeTootipDiv(elementNodeForTooltip, tooltipClassName);
		});
	}

	_removeTootipDiv(elementNode, tooltipClassName) {
		elementNode.removeAttribute("tooltip");
		const tooltipDiv = document.querySelector(`.${tooltipClassName}`);
		if (tooltipDiv) {
			tooltipDiv.parentNode.removeChild(tooltipDiv);
		}
	}

	_removeTooltipForDataview(templateView) {
		const tooltipClassName = constants.TOOLTIP_CLASS_NAME_FOR_DATAVIEW;
		Array.from(templateView.$view.querySelectorAll("span")).forEach((element) => {
			this._removeTootipDiv(element, tooltipClassName);
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
