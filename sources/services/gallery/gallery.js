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


let modifiedObjects = new webix.DataCollection();
let imagesArray = [];

class GalleryService {
	constructor(view, pager, imagesDataview, contentHeaderTemplate, imageWindow,
				imageWindowViewer, imageWindowMetadata, metadataWindow, metadataWindowMetadata,
				filtersForm, appliedFiltersList, unselectLink, downloadingMenu,
				searchInput, clearAllFiltersTemplate, allPagesTemplate) {
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
		this._init();
	}

	_seachHandlerByFilter() {
		let searchValue = this._searchInput.getValue();
		searchValue = searchValue.trim();
		if (searchValue.length < 3) {
			webix.alert("You should type minimum 3 characters");
			return;
		}
		const filtersInfo = [];
		for (let key in this._filtersForm.elements) {
			if (this._filtersForm.elements.hasOwnProperty(key)) {
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
		appliedFilterModel.clearAll();
		this._view.$scope.app.callEvent("filtersChanged", [filtersInfo]);
		this._reload();
	}

	_seachHandlerByName() {
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
			filter: filter
		};
		this._view.showProgress();
		this.studiesPromise
			.then((annotatedImages) => {
				return ajax.getAllImages(sourceParams, annotatedImages)
			})
			.then((valuesObject) => {
				let annotatedImages = valuesObject.annotatedImages;
				let imagesArray = webix.copy(valuesObject.allImages);
				imagesArray.forEach((imageObj) => {
					if (imageObj.name.toLowerCase().indexOf(searchValue) !== -1) {
						if (annotatedImages[imageObj._id]) {
							imageObj.hasAnnotations = true;
							imageObj.studyId = annotatedImages[imageObj._id].studyId;
						}
						if (studyFlag && selectedImages.isSelectedInStudies(imageObj._id)) {
							imageObj.markCheckbox = valueOfMarkedCheckbox;
						} else if (!studyFlag && selectedImages.isSelected(imageObj._id)){
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
					this._pager.define("master", true);
					this._imagesDataview.define("pager", this._pager);
					this._imagesDataview.parse(filteredImages);
					let totalCount = filteredImages.length;
					let rangeFinish = this._pager.data.size;
					let headerValues = {
						rangeStart: 1,
						rangeFinish: rangeFinish,
						totalCount: totalCount
					};
					if (totalCount < rangeFinish) {
						headerValues.filtered = totalCount;
						headerValues.currentCount = totalCount;
					}
					this._contentHeaderTemplate.setValues(headerValues);
					this._contentHeaderTemplate.refresh();
					appliedFilterModel.setFilterByName(true);
				} else {
					webix.alert(`Nothing has found with name ${searchValue}`);
				}
				this._view.hideProgress();
			})
			.fail(() =>{
				webix.message("Something went wrong");
				this._view.hideProgress();
			})
	}

	_init() {
		this._createStudyButton = this._view.$scope.getCreateStudyButton();
		this._dataviewYCountSelection = this._view.$scope.getDataviewYCountSelection();
		this._imageTemplate = $$(imageWindow.getViewerId());
		this._activeCartList = this._view.$scope.getActiveGalleryCartList();
		this._toggleButton = this._view.$scope.getToggleButton();
		this._buttonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
		this._leftPanelToggleButton = this._view.$scope.getLeftPanelToggleButton();
		this._clearNamesFilterLayout = this._view.$scope.getClearNamesFilterLayout();
		this._clearNamesFilterTemplate = this._view.$scope.getClearNamesFilterTemplate();

		this._onChangeForDownload();
		this._searchEventsMethods(this._seachHandlerByFilter.bind(this));

		this._leftPanelToggleButton.attachEvent("onChange", (newValue, oldValue) => {
			if (newValue !== oldValue) {
				//this to disconnect pager from dataview
				this._searchInput.setValue("");
				if (newValue) {
					this._clearNamesFilterLayout.show();
					this._searchEventsMethods(this._seachHandlerByName.bind(this));
				} else {
					this._clearNamesFilterLayout.hide();
					appliedFilterModel.setFilterByName(false);
					this._clearNameFilter();
					this._searchEventsMethods(this._seachHandlerByFilter.bind(this));
				}
			}
		});

		this._toggleButton.attachEvent("onChange", (value, oldValue) => {
			if (value !== oldValue) {
				if (value) {
					this._onChangeForStudy();
				} else {
					this._onChangeForDownload()
				}
			}
		});

		this._searchInput.attachEvent("onAfterRender", () => {
			const searchInputWidth = this._searchInput.$width;
			const dataviewMinWidth = this._imagesDataview.config.minWidth;
			this._minCurrentTargenInnerWidth = dataviewMinWidth + searchInputWidth;
		});

		this._clearNamesFilterTemplate.define("onClick", {
			"clear-name-filters": () => {
				this._searchInput.setValue("");
				this._clearNameFilter();
			}
		});

		let dataviewSelectionId = util.getDataviewSelectionId();
		if (dataviewSelectionId && dataviewSelectionId !== constants.DEFAULT_DATAVIEW_COLUMNS) {
			this._dataviewYCountSelection.blockEvent();
			this._dataviewYCountSelection.setValue(dataviewSelectionId);
			this._dataviewYCountSelection.unblockEvent();
		}

		window.addEventListener("resize", (event) => {
			if (event.currentTarget.innerWidth >= this._minCurrentTargenInnerWidth) {
				const dataviewSelectionId = util.getDataviewSelectionId();
				if (dataviewSelectionId && dataviewSelectionId !== constants.DEFAULT_DATAVIEW_COLUMNS) {
					this._dataviewYCountSelection.callEvent("onChange", [dataviewSelectionId])
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
					newitemWidth =  Math.round(dataviewWidth / 3) - 5;
					break;
				}
				case constants.FOUR_DATAVIEW_COLUMNS: {
					newitemWidth =  Math.round(dataviewWidth / 4) - 5;
					break;
				}
				case constants.FIVE_DATAVIEW_COLUMNS: {
					newitemWidth =  Math.round(dataviewWidth / 5) - 5;
					break;
				}
				case constants.SIX_DATAVIEW_COLUMNS: {
					newitemWidth =  Math.round(dataviewWidth / 6) - 5;
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
			this._setDataviewColumns(newitemWidth, newItemHeight)
		});

		this._imagesDataview.attachEvent("onAfterLoad", () => {
			let dataviewSelectionId = util.getDataviewSelectionId();
			if (dataviewSelectionId && dataviewSelectionId !== constants.DEFAULT_DATAVIEW_COLUMNS) {
				this._dataviewYCountSelection.callEvent("onChange", [dataviewSelectionId])
			}
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
			this._imageWindow.show();
			this._imageTemplate.attachEvent("onAfterRender", () => {
				if (this._imageInstance) {
					this._imageInstance.dispatchEvent(new CustomEvent('wheelzoom.destroy'));
				}
				this._imageInstance = this._imageWindow.$view.getElementsByClassName("zoomable-image")[0];
				window.wheelzoom(this._imageInstance);
			})
		};

		this._imageTemplate.define("onClick", {
			"next": () => {
				this._showNextImage();
			},
			"prev": () => {
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
				this._imagesDataview.data.each((item, index) => {
					if (item.markCheckbox) {
						return;
					}
					let filterByName = appliedFilterModel.getFilterByName();
					if (filterByName && index >= 79) {
						return;
					}
					if (selectedImages.count() < constants.MAX_COUNT_IMAGES_SELECTION) {
						if (selectedImages.count() === 0) {
							this._resizeButtonsLayout(layoutHeightAfterShow, false, true);
						}
						selectedImages.add(item._id);
						item.markCheckbox = 1;
						imagesArray.push(item);
						this._imagesDataview.callEvent("onCheckboxItemClick", [item]);
					} else if (isNeedShowAlert) {
						isNeedShowAlert = false;
						webix.alert({
							text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
						});
					}
				});
				webix.delay(() => {
					this._activeCartList.parse(imagesArray);
					webix.delay(() => {
						this._view.$scope.showList();
					})
				});
				this._imagesDataview.refresh();
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
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
				let countSelectedFiltredImages = 0;
				let filter = appliedFilterModel.getConditionsForApi();
				let imagesLimit = constants.MAX_COUNT_IMAGES_SELECTION;
				let arrayOfImagesLength = imagesArray.length;
				const sourceParams = {
					limit: imagesLimit,
					sort: "name",
					detail: "false",
					filter: filter
				};
				if (arrayOfImagesLength === imagesLimit) {
					webix.alert({
						text: "You have selected maximum amount of images"
					});
					return
				}
				let filterByName = appliedFilterModel.getFilterByName();
				if (filterByName) {
					let isNeedShowAlert = true;
					this._imagesDataview.data.each((item) => {
						if (item.markCheckbox) {
							return;
						}
						if (selectedImages.countForStudies() < constants.MAX_COUNT_IMAGES_SELECTION) {
							if (selectedImages.countForStudies() === 0) {
								this._resizeButtonsLayout(layoutHeightAfterShow, true, true);
							}
							selectedImages.addForStudy({
								id: item._id,
								name: item.name
							});
							item.markCheckbox = 1;
							imagesArray.push(item);
							this._imagesDataview.callEvent("onCheckboxItemClick", [item]);
						} else if (isNeedShowAlert) {
							isNeedShowAlert = false;
							webix.alert({
								text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images for study creation`
							});
						}
					});
					webix.delay(() => {
						this._activeCartList.parse(imagesArray);
						webix.delay(() => {
							if (!this._activeCartList.isVisible) {
								this._view.$scope.showList();
							}
						})
					});
					this._imagesDataview.refresh();
					this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
				} else {
					this._view.showProgress();
					ajax.getAllImages(sourceParams)
						.then((allImagesData) => {
							allImagesData.forEach((imageObj) => {
								if (selectedImages.isSelectedInStudies(imageObj._id)) {
									countSelectedFiltredImages++;
									return;
								}
								if (selectedImages.countForStudies() === 0) {
									this._resizeButtonsLayout(layoutHeightAfterShow, true, true);
								}
								selectedImages.addForStudy({
									id: imageObj._id,
									name: imageObj.name
								});
								imageObj.markCheckbox = 1;
								imagesArray.push(imageObj);
							});
							this._activeCartList.parse(imagesArray);
							this._view.$scope.showList();
							if (countSelectedFiltredImages === imagesLimit) {
								webix.alert({
									text: "All filtered images have been selected"
								});
								this._view.hideProgress();
								return
							}
							this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
							this._imagesDataview.callEvent("onAfterSelectAllChanged", [1]);
							this._imagesDataview.refresh();
							this._view.hideProgress();
						})
						.fail(() => {
							this._view.hideProgress();
							webix.message("Unable to select images");
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
		this._view.$scope.on(this._view.$scope.app, "filtersChanged", (data) => {
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
				this._view.$scope.app.show(constants.PATH_CREATE_STUDY);
			} else {
				webix.alert({
					title: "Warning!",
					text: "You have to select at least one image to create a study.",
					type: "confirm-warning"
				})
			}
		});

		this._activeCartList.attachEvent("onAfterRender", () => {
			if (modifiedObjects.count() > 0) {
				modifiedObjects.find((obj) => {
					let itemNode = this._activeCartList.getItemNode(obj.id);
					if (itemNode) {
						let listTextNode = itemNode.firstChild.children[2];
						itemNode.setAttribute("style", "height: 140px !important; color: #0288D1;");
						listTextNode.setAttribute("style", "margin-left: 17px; width: 95px;");
					}
				});
			}
		});

		this._activeCartList.define("template", (obj, common) => {
			const IMAGE_HEIGHT = util.getDataviewItemHeight() - 10;
			const IMAGE_WIDTH = util.getDataviewItemWidth();
			if (typeof galleryImagesUrls.getPreviewImageUrl(obj._id) === "undefined") {
				galleryImagesUrls.setPreviewImageUrl(obj._id, ""); // to prevent sending query more than 1 time
				ajax.getImage(obj._id, IMAGE_HEIGHT, IMAGE_WIDTH).then((data) => {
					galleryImagesUrls.setPreviewImageUrl(obj._id, URL.createObjectURL(data));
				});
			}
			return `<div>
						<span class='webix_icon template-angle ${util.angleIconChange(obj)}' style="color: rgba(0, 0, 0, 0.8) !important;"></span>
						<div style='float: right'>${common.deleteButton(obj, common)}</div>
 						<div class='card-list-name'>${obj.name}</div>
 						<img src="${galleryImagesUrls.getPreviewImageUrl(obj._id) || ""}" class="cart-image">
					</div>`;
		});

		this._activeCartList.on_click["template-angle"] = (e, id, node) => {
			let item = this._activeCartList.getItem(id);
			let itemNode = this._activeCartList.getItemNode(id);
			let listTextNode = itemNode.firstChild.children[2];
			if (!item.imageShown) {
				itemNode.setAttribute("style", "height: 140px !important; color: #0288D1;");
				listTextNode.setAttribute("style", "margin-left: 17px; width: 95px;");
				node.setAttribute("class", "webix_icon template-angle fa-angle-down");
				item.imageShown = true;
				modifiedObjects.add(item);
				this._activeCartList.parse(item);
			} else {
				itemNode.setAttribute("style", "height: 30px !important; color: rgba(0, 0, 0, 0.8);");
				listTextNode.setAttribute("style", "margin-left: 12px; width: 95px;");
				node.setAttribute("class", "webix_icon template-angle fa-angle-right");
				item.imageShown = false;
				modifiedObjects.remove(item.id);
			}
		};

		this._imagesDataview.attachEvent("onCheckboxItemClick", (item) => {
			if (item.markCheckbox) {
				if (util.isObjectEmpty(this._activeCartList.data.pull)) {
					this._view.$scope.showList()
				}
				this._activeCartList.parse(item);
			} else if (!item.markCheckbox && util.findItemInList(item._id, this._activeCartList)) {
				this._activeCartList.callEvent("onDeleteButtonClick", [item]);
			}
		});

		this._activeCartList.attachEvent("onDeleteButtonClick", (params) => {
			let item;
			let itemId;
			if (params.name) {
				item = params;
				itemId = params.id;
			} else {
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
			let studyFlag = selectedImages.getStudyFlag();
			let dataviewItem = this._imagesDataview.getItem(id);
			let listItem = this._activeCartList.getItem(id);
			if (dataviewItem) {
				item = dataviewItem;
				item.markCheckbox = value;
				if (studyFlag) {
					selectedImages.removeImageFromStudies(item._id);
					this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
				}
				this._imagesDataview.updateItem(id, item);
			} else {
				item = listItem;
				this._imagesDataview.find((obj) => {
					if (obj._id === item._id) {
						obj.markCheckbox = value;
						if (studyFlag) {
							selectedImages.removeImageFromStudies(item._id);
							this._view.$scope.app.callEvent("changedAllSelectedImagesCount");
						}
						this._imagesDataview.updateItem(obj.id, obj);
					}
				});
			}
			if (!studyFlag) {
				selectedImages.remove(item._id);
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
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
		});
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
	}

	_reload(offsetSource, limitSource) {
		let limit = limitSource || this._pager.data.size;
		let offset = offsetSource || 0;
		// save promise to object. we need wait for its result before rendering images dataview
		this.studiesPromise = ajax.getStudies({
			sort: "lowerName",
			sortdir: "1",
			detail: true
		}).then((data) => {
			return this._prepareAnnotatedImagesList(data);
		});
		const appliedFiltersArray = appliedFilterModel.getFiltersArray();
		this._createFilters(appliedFiltersArray);
		this._updateCounts();
		this._updateImagesDataview(offset, limit); // load images first time
	}

	_updateContentHeaderTemplate(ranges) {
		const values = webix.copy(ranges);
		values.filtered = appliedFilterModel.count();
		this._contentHeaderTemplate.setValues(values,  true); // true -> unchange existing values
		this._allPagesTemplate.setValues(values, true)
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
		});
	}

	_updatePagerCount(count, page) {
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
		let studyFlag = selectedImages.getStudyFlag();
		this._view.showProgress();
		webix.promise.all([
			this.studiesPromise,
			imagesPromise
		]).then((results) => {
			const [annotatedImages, images] = results;
			if (images) {
				images.forEach((item) => {
					// markCheckbox - active content in dataview.
					if (studyFlag) {
						item.markCheckbox = selectedImages.isSelectedInStudies(item._id);
					} else {
						item.markCheckbox = selectedImages.isSelected(item._id);
					}
					if (annotatedImages[item._id]) {
						item.hasAnnotations = true;
						item.studyId = annotatedImages[item._id].studyId;
					}
				});
				this._imagesDataview.clearAll();
				this._imagesDataview.parse(images);
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
		} else if (selectedBy === constants.SELECTED_BY_ON_ALL_PAGES) {
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
		} else {
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
		} else {
			nextItem = this._imagesDataview.getItem(nextItemId);
		}
		this._setImageWindowValues(nextItem);
	}

	_showPrevImage() {
		let prevItem;
		let prevItemId = this._imagesDataview.getPrevId(this._currentItem.id);
		if (prevItemId === undefined) {
			prevItem = this._imagesDataview.getItem(this._imagesDataview.getLastId());
		} else {
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
			width: width,
			height: height
		});
		galleryImagesUrls.clearPreviewUrls();
		util.setDataviewItemDimensions(width, height);
		this._imagesDataview.refresh();
	}

	_getInitialFontSizeMultiplier() {
		const initialFontSize = 14;
		const initialImageHeight = 180;
		return initialFontSize / initialImageHeight;
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
		} else {
			toShow ? this._downloadingMenu.show() : this._downloadingMenu.hide();
		}
	}

	_disableTemplateByCss(templateToDisable) {
		templateToDisable.$view.children[0].style['pointer-events'] = "none";
		templateToDisable.$view.children[0].style['background'] = "#dddddd";
	}

	_enableTemplateByCss(templateToEnable) {
		templateToEnable.$view.children[0].style['pointer-events'] = "all";
		templateToEnable.$view.children[0].style['background'] = "none";
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
		this._searchInput.detachEvent("onSearchIconClick");
		this._searchInput.detachEvent("onEnter");
		this._searchInput.attachEvent("onSearchIconClick", eventMethod);
		this._searchInput.attachEvent("onEnter", eventMethod);
	}

	_clearNameFilter() {
		let filtersInfo = appliedFilterModel.getFiltersArray();
		if (filtersInfo.length > 0) {
			this._view.$scope.app.callEvent("filtersChanged", [filtersInfo]);
		} else {
			this.load();
		}
	}

	_zoomImage(buttonIcon) {
		let eventWheel = new Event('wheel');
		let offsetTop = this._imageInstance.getBoundingClientRect().top;
		let offsetLeft = this._imageInstance.getBoundingClientRect().left;
		let imageWidth = this._imageInstance.clientWidth;
		let imageHeight = this._imageInstance.clientHeight;
		let pageY = Math.floor(offsetTop + imageHeight/2);
		let pageX = Math.floor(offsetLeft + imageWidth/2);
		eventWheel.pageX = pageX;
		eventWheel.pageY = pageY;
		if (buttonIcon === "plus") {
			eventWheel.deltaY = -100;
			eventWheel.wheelDelta = 120;
		} else if (buttonIcon === "minus") {
			eventWheel.deltaY = 100;
			eventWheel.wheelDelta = -120;
		}
		this._imageInstance.dispatchEvent(eventWheel);
	}

}

export default GalleryService;
