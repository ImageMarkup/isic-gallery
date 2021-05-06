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
import imageWindowConfigs from "../../views/subviews/gallery/windows/imageWindow";
import galleryImagesUrls from "../../models/galleryImagesUrls";
import searchButtonModel from "./searchButtonModel";
import AsyncQueue from "../asyncQueue";
import "wheelzoom";
import DataviewService from "./dataview";


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

		this._annotatedImages = new Map();

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
		this._reloadViewByFilters(filtersInfo);
	}

	_searchHandlerByName(afterFilterSelected) {
		let searchValue = this._searchInput.getValue();
		searchValue = searchValue.trim();
		if (searchValue && searchValue.length < 9) {
			webix.alert("You should type minimum 9 characters");
			return;
		}

		appliedFilterModel.setFilterByName(searchValue);

		if (!searchValue) {
			this._reload();
			return;
		}

		this._view.$scope.setParam("name", searchValue, true);
		this._view.$scope.setParam("filter", "[]", true);

		const sourceParams = {
			limit: this._pager.data.size,
			sort: "name",
			detail: "false",
			name: searchValue
		};

		this._view.showProgress();
		ajax.getImages(sourceParams)
			.then((images) => {
				this._parseImages(images, 0, images.length);

				const currentCount = images.length;
				if (currentCount > 0) {
					const rangeFinish = this._pager.data.size;
					const headerValues = {
						rangeStart: 1,
						rangeFinish,
						currentCount,
						filtered: true
					};
					this._contentHeaderTemplate.setValues(headerValues, true);
				}
				else {
					if (afterFilterSelected) {
						this._imagesDataview.clearAll();
						const headerValues = {
							rangeStart: 0,
							rangeFinish: 0,
							filtered: true,
							currentCount
						};
						this._contentHeaderTemplate.setValues(headerValues, true);
						this._imagesDataview.showOverlay(`<div style="font-size: 17px; font-weight: bold;">Nothing Has Found With Name "${searchValue}"</div>`);
					}
					webix.alert(`Nothing has found with name ${searchValue}`);
				}
				this._view.hideProgress();
			})
			.catch(() => {
				webix.message("Something went wrong");
				this._view.hideProgress();
			});
	}

	_init() {
		webix.extend(this._imagesDataview, webix.OverlayBox);
		this._createStudyButton = this._view.$scope.getCreateStudyButton();
		this._dataviewYCountSelection = this._view.$scope.getDataviewYCountSelection();
		this._imageTemplate = $$(imageWindowConfigs.getViewerId());
		this._activeCartList = this._view.$scope.getActiveGalleryCartList();
		this._toggleButton = this._view.$scope.getToggleButton();
		this._buttonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
		this._leftPanelToggleButton = this._view.$scope.getLeftPanelToggleButton();
		this._leftPanel = this._view.$scope.getLeftPanel();

		this._getImagesQueue = new AsyncQueue(this._getImagesByPageChange, this);
		this._dataviewService = new DataviewService(this._imagesDataview, this._pager);
		this._resizeDataviewGrid();

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

		this._activeCartList.attachEvent("onViewShow", () => {
			this._resizeDataviewGrid();
		});

		this._activeCartList.attachEvent("onViewHide", () => {
			this._resizeDataviewGrid();
		});
		this._leftPanel.attachEvent("onViewShow", () => {
			this._resizeDataviewGrid();
		});
		this._leftPanel.attachEvent("onViewHide", () => {
			this._resizeDataviewGrid();
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
		}
		else {
			selectedImagesArray = selectedImages.getSelectedImagesForDownload();
		}
		if (selectedImagesArray.length > 0) {
			this._activeCartList.parse(selectedImagesArray);
			webix.delay(() => {
				this._view.$scope.showList(true);
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
			});
			let studyFlag = selectedImages.getStudyFlag();
			this._resizeButtonsLayout(layoutHeightAfterShow, studyFlag, true);
		}

		this._searchEventsMethods(this._searchHandlerByFilter.bind(this));

		this._leftPanelToggleButton.attachEvent("onChange", (searchByNameCondition, oldValue) => {
			if (searchByNameCondition !== oldValue) {
				let tooltipText;
				let inputNode = this._searchInput.$view.getElementsByClassName("webix_el_box")[0];
				this._searchInput.setValue("");
				searchButtonModel.removeTimesSearchButton(inputNode);
				if (searchByNameCondition) { // filter by name
					this._filtersForm.disable();
					this._appliedFiltersList.disable();
					if (appliedFilterModel.count()) {
						this._appliedFiltersList.clearAll();
						appliedFilterModel.clearAll();
						this._reload();
					}

					tooltipText = "Clear name filter";
					this._searchEventsMethods(this._searchHandlerByName.bind(this));
					searchButtonModel.createTimesSearchButton(this._searchInput, inputNode, tooltipText, true);
				}
				else { // filter by hardcoded filter values
					this._filtersForm.enable();
					this._appliedFiltersList.enable();

					this._view.$scope.setParam("name", "", true);
					tooltipText = "Clear search value";
					if (appliedFilterModel.getFilterByName()) {
						appliedFilterModel.setFilterByName();
						this._clearNameFilter();
					}
					this._searchEventsMethods(this._searchHandlerByFilter.bind(this));
					searchButtonModel.createTimesSearchButton(this._searchInput, inputNode, tooltipText);
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

		let dataviewSelectionId = util.getDataviewSelectionId() ?
			util.getDataviewSelectionId() : constants.DATAVIEW_IMAGE_MULTIPLIERS.keys().next();
		this._dataviewYCountSelection.blockEvent();
		this._dataviewYCountSelection.setValue(dataviewSelectionId);
		this._dataviewYCountSelection.unblockEvent();

		window.addEventListener("resize", (event) => {
			const minCurrentTargenInnerWidth = searchButtonModel.getMinCurrentTargenInnerWidth();
			if (event.currentTarget.innerWidth >= minCurrentTargenInnerWidth) {
				this._dataviewService.onResizeDataview();
			}
		});

		this._dataviewYCountSelection.attachEvent("onChange", (id) => {
			this._dataviewService.setImageSizeByMultiplier(id);
			this._resizeDataviewGrid();
			util.setDataviewSelectionId(id);
		});

		this._imagesDataview.attachEvent("onAfterLoad", () => {
			let dataviewSelectionId = util.getDataviewSelectionId();
			if (dataviewSelectionId) {
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
				default: {
					break;
				}
			}
		});
		this._imagesDataview.attachEvent("onDataRequest", (offset, limit) => {
			this._getImagesQueue.addJobToQueue();
		});

		this._pager.attachEvent("onAfterPageChange", (page) => {
			this._updatePageCounts();
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

				limit = this._pager.config.size;
				page = this._pager.config.page;

				const offset = limit * page;
				this._view.showProgress();
				webix.delay(() => {
					const pageImages = this._imagesDataview.data.getRange();
					pageImages.forEach((item, index) => {
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
					detail: "false",
					filter
				};
				if (arrayOfImagesLength === imagesLimit) {
					webix.alert({
						text: "You have selected maximum amount of images"
					});
					return;
				}

				this._view.showProgress();
				ajax.getImages(sourceParams)
					.catch(() => {
						this._view.hideProgress();
						webix.message("Unable to select images");
					})
					.then((images) => {
						images.forEach((imageObj) => {
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
						this._parseImages(images, 0);
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
			this._reloadViewByFilters(data);
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
						if (util.findItemInList(item._id, this._activeCartList)) {
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
		let appliedFiltersArray = appliedFilterModel.getFiltersArray();
		let parsedURLFilters = [];
		let nameURLFilter = "";

		try {
			const paramFilters = this._view.$scope.getParam("filter");
			parsedURLFilters = JSON.parse(paramFilters || "[]");
			nameURLFilter = this._view.$scope.getParam("name");
		}
		catch (e) {
			this._view.$scope.setParam("filter", "[]", true);
		}

		const loadByParamFilters = nameURLFilter || (parsedURLFilters.length && !appliedFiltersArray.length);
		if (loadByParamFilters) {
			this._loadByURLParams(nameURLFilter, parsedURLFilters);
			return;
		}

		this._view.showProgress();
		const filter = appliedFilterModel.getConditionsForApi();
		const imagesParams = {
			offset: 0,
			limit: this._pager.data.size,
			filter
		};

		const getDataPromises = [
			ajax.getHistogram(),
			this._getAnnotatedImages(),
			filtersData.getDatasetForFilters(true),
			ajax.getImages(imagesParams)
		];

		if (appliedFiltersArray.length) {
			getDataPromises.push(ajax.getHistogram(filter));
		}

		Promise.all(getDataPromises)
			.then(([histogram, annotatedImages, dataset, images, filteredHistogram]) => {
				this._annotatedImages = new Map(Object.entries(annotatedImages));
				state.imagesTotalCounts = histogram;
				this._createFilters(appliedFiltersArray).then(() => {
					this._updateFiltersFormControls(appliedFiltersArray);
					this._updateImagesCounts(histogram, true); // update filters, images, pager counts

					if (filteredHistogram) {
						this._updateImagesCounts(filteredHistogram);
						const paramFilters = appliedFilterModel.convertAppliedFiltersToParams();
						this._view.$scope.setParam("filter", paramFilters, true);
					}
				});

				const totalCount = filteredHistogram ?
					filteredHistogram.__passedFilters__[0].count : histogram.__passedFilters__[0].count;

				this._parseImages(images, 0, totalCount);
				this._view.hideProgress();
			})
			.catch(() => {
				webix.message("Something went wrong");
				this._view.hideProgress();
			});
	}

	_loadByURLParams(nameURLFilter, parsedURLFilters) {
		this._view.showProgress();
		Promise.all([
			ajax.getHistogram(),
			this._getAnnotatedImages(),
			filtersData.getDatasetForFilters(true)
		]).then(([histogram, annotatedImages]) => {
			this._annotatedImages = new Map(Object.entries(annotatedImages));
			state.imagesTotalCounts = histogram;
			this._createFilters()
				.then(() => {
					this._updateImagesCounts(histogram, true); // update filters, images, pager counts
					if (nameURLFilter) {
						this._searchHandlerByName();
					}
					else {
						const appliedFiltersArray = appliedFilterModel.getFiltersFromURL(parsedURLFilters);
						this._reloadViewByFilters(appliedFiltersArray);
					}
				});
			this._view.hideProgress();
		});
	}

	_reload() {
		// save promise to object. we need wait for its result before rendering images dataview
		const appliedFiltersArray = appliedFilterModel.getFiltersArray();
		this._createFilters(appliedFiltersArray)
			.then(() => {
				this._updateFiltersFormControls(appliedFiltersArray);
			});

		const paramFilters = appliedFilterModel.convertAppliedFiltersToParams();
		this._view.$scope.setParam("filter", paramFilters, true);
		this._view.$scope.setParam("name", "", true);

		this._view.showProgress();
		this._getAndUpdateCounts()
			.then((imagesCount) => {
				this._imagesDataview.clearAll();
				this._parseImages([], 0, imagesCount);
				if (!imagesCount) {
					this._imagesDataview.showOverlay("<div style=\"font-size: 17px; font-weight: bold;\">Nothing Has Found</div>");
				}
			})
			.finally(() => {
				this._view.hideProgress();
			});
	}

	_updateContentHeaderTemplate(ranges) {
		const values = webix.copy(ranges);
		values.filtered = appliedFilterModel.count();
		this._contentHeaderTemplate.setValues(values, true); // true -> unchange existing values
	}

	_getAndUpdateCounts() {
		const filter = appliedFilterModel.getConditionsForApi();
		return ajax.getHistogram(filter).then((data) => {
			if (data) {
				const imagesCount = data.__passedFilters__[0].count;
				this._updateContentHeaderTemplate({
					rangeStart: 1,
					rangeFinish: this._pager.data.size,
					currentCount: imagesCount
				});
				filterService.updateFiltersCounts(data);
				return imagesCount;
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
		this._resizeDataviewGrid();
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
		else {
			toShow ? this._downloadingMenu.show() : this._downloadingMenu.hide();
		}
		this._resizeDataviewGrid();
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
		let filtersInfo = appliedFilterModel.getFiltersArray();
		if (filtersInfo.length > 0) {
			this._reloadViewByFilters(filtersInfo);
		}
		else {
			this._reload();
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

	_getImagesByPageChange() {
		const {index, pageIndex, limit} = this._getNotLoadedItemIndex();
		if (pageIndex > -1) {
			return this._getImages(index, limit)
				.then((images) => {
					this._parseImages(images, index);
					this._view.hideProgress();
				});
		}
		return Promise.resolve(false);
	}

	_getNotLoadedItemIndex() {
		const pData = this._pager.data;
		const offset = pData.size * pData.page;
		const last = offset + pData.size;
		const items = this._imagesDataview.data.serialize();
		const pageItems = items.slice(offset, last);
		const pageIndex = pageItems.findIndex(item => !item);
		const index = pageIndex + offset;
		const limit = pData.size - pageIndex;

		return {index, pageIndex, limit};
	}

	// eslint-disable-next-line class-methods-use-this
	_getImages(offset, limit) {
		const filter = appliedFilterModel.getConditionsForApi();
		const params = {
			offset,
			limit,
			filter
		};
		return ajax.getImages(params);
	}

	_getAnnotatedImages() {
		return ajax.getStudies({
			sort: "lowerName",
			sortdir: "1",
			detail: true
		}).then(data => this._prepareAnnotatedImagesList(data));
	}

	_updateImagesCounts(histogram, isInitial) {
		if (!histogram) {
			return;
		}
		const imagesCount = histogram.__passedFilters__[0].count;

		const imageCountsTemplateData = {
			rangeStart: 1,
			rangeFinish: this._pager.data.size,
			currentCount: imagesCount
		};

		if (isInitial) {
			imageCountsTemplateData.totalCount = imagesCount;
		}
		this._updateContentHeaderTemplate(imageCountsTemplateData);

		filterService.updateFiltersCounts(isInitial ? null : histogram);
	}

	_parseImages(images = [], pos = 0, totalCount) {
		let studyFlag = selectedImages.getStudyFlag();
		images.forEach((item) => {
			// markCheckbox - active content in dataview.
			if (studyFlag) {
				item.markCheckbox = selectedImages.isSelectedInStudies(item._id);
			}
			else {
				item.markCheckbox = selectedImages.isSelected(item._id);
			}
			const annotatedImage = this._annotatedImages.get(item._id);
			if (annotatedImage) {
				item.hasAnnotations = true;
				item.studyId = annotatedImage.studyId;
			}
		});
		this._imagesDataview.parse({
			data: images,
			pos,
			total_count: totalCount || this._pager.data.count
		});
	}

	_reloadViewByFilters(filters = []) {
		// add (or remove) filters data to model
		appliedFilterModel.processNewFilters(filters);
		// refresh data in list
		this._updateAppliedFiltersList(appliedFilterModel.prepareDataForList());
		this._reload();
	}

	_resizeDataviewGrid() {
		this._dataviewService.onResizeDataview();
		this._updatePageCounts();
	}

	_updatePageCounts() {
		const pData = this._pager.data;
		this._updateContentHeaderTemplate({
			rangeStart: (pData.page * pData.size) + 1,
			rangeFinish: Math.min((pData.page + 1) * pData.size, pData.count)
		});
	}
}

export default GalleryService;
