import {createZoomableImage, zoomImage} from "app-services/zoomImages";

import constants from "../../constants";
import appliedFilterModel from "../../models/appliedFilters";
import collectionsModel from "../../models/collectionsModel";
import diagnosisModel from "../../models/diagnosis";
import galleryImagesUrls from "../../models/galleryImagesUrls";
import filtersData from "../../models/imagesFilters";
import lesionsModel from "../../models/lesionsModel";
import selectedImages from "../../models/selectedGalleryImages";
import state from "../../models/state";
import logger from "../../utils/logger";
import util from "../../utils/util";
import filtersFormElements from "../../views/subviews/gallery/parts/filtersFormElements";
import metadataPart from "../../views/subviews/gallery/parts/metadata";
import ajax from "../ajaxActions";
import authService from "../auth";
import filterService from "./filter";
import searchButtonModel from "./searchButtonModel";
import searchSuggestService from "./searchSuggest";
import suggestService from "./suggest";

const layoutHeightAfterHide = 1;
const layoutHeightAfterShow = 32;
const filtersBySearchCollection = appliedFilterModel.getAppliedFilterBySearchCollection();

let modifiedObjects = new webix.DataCollection();
let imagesArray = [];
let selectedImagesArray = [];

class GalleryService {
	constructor(
		view,
		pager,
		imagesDataview,
		contentHeaderTemplate,
		imageWindowInstance,
		imageWindowViewer,
		imageWindowSlideButton,
		imageWindowMetadataContainer,
		imageWindowMetadata,
		metadataWindow,
		metadataWindowMetadata,
		multiImageLesionWindow,
		filtersForm,
		appliedFiltersList,
		unselectLink,
		downloadingMenu,
		searchInput,
		clearAllFiltersTemplate,
		allPagesTemplate,
		filterScrollView,
		galleryLeftPanel,
		galleryContextMenu,
		downloadSelectedImagesButton,
		downloadFilteredImagesButton,
		appliedFiltersLayout,
		imageWindowZoomButtons,
		leftLandImageWindowZoomButton,
		rightLandImageWindowZoomButton,
		imageWindowTemplate,
		imageWindowTemplateWithoutControls,
		enlargeContextMenu,
		portraitClearAllFiltersTemplate,
		landscapeClearAllFiltersTemplate,
		searchSuggest,
		leftPanelResizer,
	) {
		this._view = view;
		this._pager = pager;
		this._imagesDataview = imagesDataview;
		this._contentHeaderTemplate = contentHeaderTemplate;
		this._imageWindow = imageWindowInstance;
		this._imageWindowViewer = imageWindowViewer;
		this._imageWindowSlideButton = imageWindowSlideButton;
		this._imageWindowMetadataContainer = imageWindowMetadataContainer;
		this._imageWindowMetadata = imageWindowMetadata;
		this._metadataWindow = metadataWindow;
		this._metadataWindowMetadata = metadataWindowMetadata;
		this._multiImageLesionWindow = multiImageLesionWindow;
		this._filtersForm = filtersForm;
		this._appliedFiltersList = appliedFiltersList;
		this._imagesSelectionTemplate = unselectLink;
		this._downloadingMenu = downloadingMenu;
		/** @type {webix.ui.search} */
		this._searchInput = searchInput;
		this._clearAllFiltersTemplate = clearAllFiltersTemplate;
		this._allPagesTemplate = allPagesTemplate;
		this._filterScrollView = filterScrollView;
		this._galleryLeftPanel = galleryLeftPanel;
		this._galleryContextMenu = galleryContextMenu;
		this._downloadSelectedImagesButton = downloadSelectedImagesButton;
		this._downloadFilteredImagesButton = downloadFilteredImagesButton;
		this._appliedFiltersLayout = appliedFiltersLayout;
		this._imageWindowZoomButtons = imageWindowZoomButtons;
		this._leftLandImageWindowZoomButton = leftLandImageWindowZoomButton;
		this._rightLandImageWindowZoomButton = rightLandImageWindowZoomButton;
		this._imageWindowTemplate = imageWindowTemplate;
		this._imageWindowTemplateWithoutControls = imageWindowTemplateWithoutControls;
		this._enlargeContextMenu = enlargeContextMenu;
		this._portraitClearAllFiltersTemplate = portraitClearAllFiltersTemplate;
		this._landscapeClearAllFiltersTemplate = landscapeClearAllFiltersTemplate;
		/** @type {webix.ui.suggest} */
		this._searchSuggest = searchSuggest;
		this._leftPanelResizer = leftPanelResizer;
		this._init();
	}

	_searchHandlerByFilter() {
		let searchValue = this._searchInput.getValue().trim().replace(/\s+/g, " ");
		this._searchInput.setValue(searchValue);
		if (searchValue.length < 3) {
			webix.alert("You should type minimum 3 characters");
			return;
		}
		this._appliedFiltersList.clearAll();
		appliedFilterModel.clearAll();
		const filtersInfo = [];
		const filterFormElements = Object.keys(this._filtersForm.elements);
		filterFormElements.forEach((key) => {
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
					params.optionId = element.config.attributes.dataOptionId;
					filtersInfo.push(params);
				}
			}
		});
		const treeDataElements = this._filtersForm.queryView({view: "treetable"}, "all");
		let foundTreeDataElementFlag = false;
		treeDataElements.forEach((e) => {
			e.data.each((i) => {
				const labelLowerCase = i.name.replace(/\([\/ 0-9]*\)$/, "");
				if (labelLowerCase.indexOf(searchValue.toLowerCase()) > -1) {
					e.checkItem(i.id);
					foundTreeDataElementFlag = true;
				}
			});
		});
		if (filtersInfo.length > 0) {
			filtersBySearchCollection.parse(filtersInfo);
		}
		else if (!foundTreeDataElementFlag) {
			webix.alert(`"There are no filters which include "${searchValue}"`);
		}
		this._view.$scope.app.callEvent("filtersChanged", [filtersInfo]);
	}

	_searchHandlerByName(/* afterFilterSelected */) {
		let searchValue = this._searchInput.getValue().trim().split(" ").join("");
		if (searchValue === "" && this._view.$scope.getParam("name") === "") {
			return;
		}
		if (searchValue === "" && this._view.$scope.getParam("name") !== "") {
			this._view.$scope.setParam("name", "", true);
			this._clearNameFilter();
			this._reload();
			return;
		}
		if (searchValue.length < 9) {
			webix.alert("You should type minimum 9 characters");
			return;
		}
		this._searchInput.setValue(searchValue);
		let filteredImages = [];
		const sourceParams = {
			limit: this._pager.data.size,
			conditions: ""
		};
		if (searchValue) {
			sourceParams.conditions += `isic_id:${searchValue}`;
		}

		this._view.$scope.setParam("name", searchValue, true);
		appliedFilterModel.setFilterByName(true);
		this._view.showProgress();

		ajax.searchImages(sourceParams)
			.then((foundImages) => {
				const allImagesArray = webix.copy(foundImages.results);
				const foundImagesCount = foundImages.count;
				allImagesArray.forEach((imageObj) => {
					filteredImages.push(imageObj);
				});
				if (foundImagesCount > 0) {
					this._imagesDataview.clearAll();
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
			.catch(() => {
				if (!this._view.$destructed) {
					webix.alert(`Image with name "${searchValue}" was not found`);
					webix.message("Search Images: Something went wrong");
					this._view.hideProgress();
				}
			});
	}

	_init() {
		const self = this;
		webix.extend(this._imagesDataview, webix.OverlayBox);
		this._searchInput.disable();
		this._createStudyButton = this._view.$scope.getCreateStudyButton();
		this._dataviewYCountSelection = this._view.$scope.getDataviewYCountSelection();
		if (this._imageWindow) {
			[this._imageWindowZoomPlusButtons, this._imageZoomMunusButtons] = this._imageWindow?.$view.getElementsByClassName("zoom-btn");
		}
		this._imageWindowMetadataLayout = this._imageWindow?.$view.getElementsByClassName("metadata-layout");
		this._activeCartList = this._view.$scope.getGalleryCartList();
		this._toggleButton = this._view.$scope.getToggleButton();
		this._buttonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
		this._leftPanelToggleButton = this._view.$scope.getLeftPanelToggleButton();
		this._clonedPagerForNameSearch = this._view.$scope.getClonedPagerForNameSearch();
		this._leftPanelWithCollapser = this._view.$scope.getLeftPanelWithCollapser();
		this._rightPanelWithCollapser = this._view.$scope.getCartListCollapsedView();

		this._activeCartList.attachEvent("onAfterRender", () => {
			if (modifiedObjects.count() > 0) {
				// eslint-disable-next-line array-callback-return
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
			if (authService.getUserInfo()) {
				selectedImagesArray = selectedImages.getSelectedImagesForDownload();
			}
		}
		else {
			selectedImagesArray = selectedImages.getSelectedImagesForDownload();
		}
		if (selectedImagesArray.length > 0) {
			this._activeCartList.parse(selectedImagesArray);
			this._view.$scope.showList(true);
			let studyFlag = selectedImages.getStudyFlag();
			this._resizeButtonsLayout(layoutHeightAfterShow, studyFlag, true);
			this._imagesSelectionTemplate?.refresh();
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
					clearAllFilters();

					tooltipText = "Clear name filter";
					this._searchEventsMethods(this._searchHandlerByName.bind(this), true);
					searchButtonModel.createTimesSearchButton(
						this._searchInput,
						appliedFilterModel,
						inputNode,
						tooltipText,
						true
					);
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
					searchButtonModel.createTimesSearchButton(
						this._searchInput,
						appliedFilterModel,
						inputNode,
						tooltipText
					);
				}
			}
		});

		const nameParam = this._view.$scope.getParam("name");
		if (nameParam) {
			this._leftPanelToggleButton.setValue(1);
			this._searchInput.setValue(nameParam);
		}

		this._toggleButton?.attachEvent("onChange", (value, oldValue) => {
			if (value !== oldValue) {
				if (value) {
					this._onChangeForStudy();
				}
				else {
					this._onChangeForDownload();
				}
			}
		});

		// Suggest start
		if (this._searchSuggest) {
			searchSuggestService.attachEvents(
				this._searchSuggest,
				this._searchInput,
				this._leftPanelToggleButton
			);
		}
		// Suggest end

		let dataviewSelectionId = util.getDataviewSelectionId()
			? util.getDataviewSelectionId() : constants.DEFAULT_DATAVIEW_COLUMNS;
		this._dataviewYCountSelection?.blockEvent();
		this._dataviewYCountSelection?.setValue(dataviewSelectionId);
		this._dataviewYCountSelection?.unblockEvent();

		const dataTableResizeHandler = util.debounce((/* event */) => {
			dataviewSelectionId = util.getDataviewSelectionId();
			this._dataviewYCountSelection?.callEvent("onChange", [dataviewSelectionId, dataviewSelectionId, true]);
		});
		const dataTableResizeObserver = new ResizeObserver(dataTableResizeHandler);
		const dataTableNode = this._imagesDataview.getNode();
		dataTableResizeObserver.observe(dataTableNode);

		this._dataviewYCountSelection?.attachEvent("onChange", (id, oldId, callUpdatePager = true) => {
			let newItemWidth;
			let newImageWidth;
			const previousItemHeight = this._imagesDataview.type.height;
			let multiplier = constants.DEFAULT_GALLERY_IMAGE_HEIGHT
				/ constants.DEFAULT_GALLERY_IMAGE_WIDTH;
			let dataviewWidth = this._imagesDataview.$width;

			switch (id) {
				case constants.TWO_DATAVIEW_COLUMNS: {
					newItemWidth = Math.round(dataviewWidth / 2) - 5;
					newImageWidth = newItemWidth - 10;
					break;
				}
				case constants.THREE_DATAVIEW_COLUMNS: {
					newItemWidth = Math.round(dataviewWidth / 3) - 5;
					newImageWidth = newItemWidth - 10;
					break;
				}
				case constants.FOUR_DATAVIEW_COLUMNS: {
					newItemWidth = Math.round(dataviewWidth / 4) - 5;
					newImageWidth = newItemWidth - 10;
					break;
				}
				case constants.FIVE_DATAVIEW_COLUMNS: {
					newItemWidth = Math.round(dataviewWidth / 5) - 5;
					newImageWidth = newItemWidth - 10;
					break;
				}
				case constants.SIX_DATAVIEW_COLUMNS: {
					newItemWidth = Math.round(dataviewWidth / 6) - 5;
					newImageWidth = newItemWidth - 10;
					break;
				}
				case constants.DEFAULT_DATAVIEW_COLUMNS: {
					const minGalleryWidth = window.innerWidth
						- this._galleryLeftPanel.config.maxWidth ?? this._galleryLeftPanel.config.width
						- this._activeCartList.config.width;
					const cols = Math.floor(minGalleryWidth / constants.DEFAULT_GALLERY_IMAGE_WIDTH);
					newItemWidth = Math.floor(dataviewWidth / cols);
					newImageWidth = newItemWidth - 10;
					break;
				}
				default: {
					newItemWidth = constants.DEFAULT_GALLERY_IMAGE_WIDTH;
					newImageWidth = constants.DEFAULT_GALLERY_IMAGE_WIDTH;
					break;
				}
			}

			const newImageHeight = Math.round(multiplier * newImageWidth);
			util.setDataviewSelectionId(id);
			this._setDataviewColumns(newItemWidth, previousItemHeight, newImageWidth, newImageHeight);
			if (callUpdatePager) {
				this._imagesDataview.$scope.updatePagerSize();
			}
		});

		this._imagesDataview.attachEvent("onAfterLoad", () => {
			this._imagesDataview.hideOverlay();
		});

		this._downloadingMenu?.attachEvent("onMenuItemClick", (id) => {
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
				const url = galleryImagesUrls.getCurrImagesUrl();
				await this._updateImagesDataview(offset, limit, url);
				galleryImagesUrls.setCurrImagesUrl(null);
				const currentCount = state.imagesTotalCounts.passedFilters.currentCount
					|| null;
				const count = state.imagesTotalCounts.passedFilters.count;
				const filtered = state.imagesTotalCounts.passedFilters.filtered;
				this._updateContentHeaderTemplate({
					rangeStart: offset + 1,
					rangeFinish: currentCount && offset + limit >= currentCount
						? currentCount
						: offset + limit,
					totalCount: count,
					currentCount,
					filtered
				});
			}
			catch (error) {
				logger.error(error);
				if (!this._view.$destructed) {
					webix.message("DataRequest: Something went wrong");
				}
			}
		});

		this._imageWindow?.getNode().addEventListener("keyup", (e) => {
			this._keyPressed(e.keyCode);
		});

		this._imageWindow?.attachEvent("onKeyPress", (keyCode) => {
			this._keyPressed(keyCode);
		});

		this._imageWindowTemplate?.attachEvent("onBeforeRender", async (obj) => {
			if (typeof galleryImagesUrls.getNormalImageUrl(obj.imageId) === "undefined") {
				const item = await ajax.getImageItem(obj.imageId);
				galleryImagesUrls.setNormalImageUrl(obj.imageId, item.files.full.url);
				this._imageWindowTemplate.refresh();
			}
			return true;
		});

		this._imageWindowTemplateWithoutControls?.attachEvent("onBeforeRender", async (obj) => {
			if (obj.imageId && typeof galleryImagesUrls.getNormalImageUrl(obj.imageId) === "undefined") {
				const item = await ajax.getImageItem(obj.imageId);
				galleryImagesUrls.setNormalImageUrl(obj.imageId, item.files.full.url);
				this._imageWindowTemplateWithoutControls?.refresh();
			}
			return true;
		});

		const getZoomableImageNode = () => this._imageWindow.$view.getElementsByClassName("zoomable-image")[0];

		const initZoomableImage = async () => {
			this._zoomableImageProperties = await createZoomableImage(getZoomableImageNode());
		};

		this._imageWindowTemplate?.attachEvent("onAfterRender", initZoomableImage);
		this._imageWindowTemplateWithoutControls?.attachEvent("onAfterRender", initZoomableImage);

		this._imageWindowSlideButton?.attachEvent("onChange", (shouldShowMetadata) => {
			if (shouldShowMetadata) {
				this._imageWindowMetadataContainer.show();
			}
			else {
				this._imageWindowMetadataContainer.hide();
			}
		});

		this._imagesDataview.on_click["resize-icon"] = (e, id) => {
			this._imageWindowTemplateWithoutControls?.hide();
			this._imageWindowTemplate?.show();
			const currentItem = this._imagesDataview.getItem(id);
			this._setImageWindowValues(currentItem);
			if (this._imageWindow) {
				this._eventForHideMessages(this._imageWindow);
				this._imageWindow.show();
			}
		};

		this._imageWindowTemplate?.define("onClick", {
			next: () => {
				this._showNextImage();
			},
			prev: () => {
				this._showPrevImage();
			},
			"mobile-window-close-button": function () {
				this.getTopParentView().hide();
			},
			"close-window": function () {
				this.getTopParentView().hide();
			}
		});

		this._imageWindowZoomButtons?.define("onClick", {
			"btn-plus": () => {
				zoomImage(this._zoomableImageProperties, true);
			},
			"btn-minus": () => {
				zoomImage(this._zoomableImageProperties, false);
			}
		});

		this._leftLandImageWindowZoomButton?.define("onClick", {
			"land-btn-plus": () => {
				zoomImage(this._zoomableImageProperties, true);
			},
			"land-btn-minus": () => {
				zoomImage(this._zoomableImageProperties, false);
			}
		});

		this._rightLandImageWindowZoomButton?.define("onClick", {
			"land-btn-plus": () => {
				zoomImage(this._zoomableImageProperties, true);
			},
			"land-btn-minus": () => {
				zoomImage(this._zoomableImageProperties, false);
			}
		});

		this._imagesDataview.on_click["info-icon"] = async (e, id) => {
			try {
				const currentItem = this._imagesDataview.getItem(id);
				const image = await ajax.getImageItem(currentItem.isic_id);
				if (this._metadataWindowMetadata) {
					webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)], this._metadataWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
				}
				else {
					webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)]); // [] - because we rebuild only rows of this._imageWindowMetadata
				}
				if (this._metadataWindow) {
					this._eventForHideMessages(this._metadataWindow);
					this._metadataWindow.show();
				}
			}
			catch (error) {
				logger.error(error);
				if (!this._view.$destructed) {
					webix.message("ShowMetadata: Something went wrong");
				}
			}
		};

		this._imagesDataview.on_click["diagnosis-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			const url = `${constants.URL_MULTIRATER}?id=${currentItem.isic_id}&sid=${currentItem.studyId}&uid=${authService.getToken()}`;
			util.openInNewTab(url);
		};
		webix.extend(this._view, webix.ProgressBar);

		this._imagesDataview.on_click["batch-icon"] = async (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			const currentItemId = currentItem.isic_id;
			const url = await ajax.getDownloadUrl(
				constants.DOWNLOAD_ZIP_SINGLE_IMAGE,
				`isic_id:${currentItemId}`,
				currentItemId
			);
			if (url) {
				util.downloadByLink(url, `${currentItemId}.zip`);
			}
		};

		this._imagesDataview.on_click["layer-group"] = (e, id) => {
			if (this._multiImageLesionWindow) {
				const currentItem = this._imagesDataview.getItem(id);
				this._view.$scope.setMultiLesionMode(
					currentItem,
				);
				this._multiImageLesionWindow.show();
			}
		};

		// -->add onClick property for template
		this._imagesSelectionTemplate?.define("onClick", {
			"unselect-images-link": () => {
				this._resizeButtonsLayout(layoutHeightAfterHide, false, false);
				this._clearActiveListData();
				this._unselectImages(constants.SELECTED_BY_ALL_ON_PAGE);
			},
			"gallery-select-all-images": () => {
				imagesArray = [];
				let isNeedShowAlert = true;
				this._view.showProgress();
				webix.delay(() => {
					this._imagesDataview.data.each((item, index) => {
						if (item.markCheckbox) {
							return;
						}
						if (index >= state.imagesTotalCounts.passedFilters.count) {
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
					if (this._imagesSelectionTemplate) {
						this._removeTooltipForDataview(this._imagesSelectionTemplate);
					}
					this._view.hideProgress();
				});
			}
		});

		this._imagesDataview.attachEvent("onAfterSelectAllChanged", (checkboxValue) => {
			// eslint-disable-next-line array-callback-return
			this._imagesDataview.find((obj) => {
				if (selectedImages.isSelectedInStudies(obj.isic_id)) {
					obj.markCheckbox = checkboxValue;
				}
			});
		});

		this._allPagesTemplate?.define("onClick", {
			"gallery-select-all-images-on-all-pages": () => {
				let isNeedShowAlert = true;
				let countSelectedFilteredImages = 0;
				let filter = appliedFilterModel.getConditionsForApi();
				const collections = appliedFilterModel.getAppliedCollectionsForApi();
				let imagesLimit = constants.MAX_COUNT_IMAGES_SELECTION;
				let arrayOfImagesLength = selectedImages.countForStudies();
				const sourceParams = {
					limit: imagesLimit,
					sort: "name",
					detail: "false",
					filter,
					collections
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
							if (item.markCheckbox
								|| selectedImages.countForStudies() >= constants.MAX_COUNT_IMAGES_SELECTION) {
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
						if (this._allPagesTemplate) {
							this._removeTooltipForDataview(this._allPagesTemplate);
						}
						this._view.hideProgress();
					});
				}
				else {
					this._view.showProgress();
					ajax.getAllImages(sourceParams)
						.then((allImagesData) => {
							allImagesData.forEach((imageObj) => {
								if (selectedImages.isSelectedInStudies(imageObj.isic_id)) {
									countSelectedFilteredImages++;
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
							if (countSelectedFilteredImages === imagesLimit) {
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
								if (this._allPagesTemplate) {
									this._removeTooltipForDataview(this._allPagesTemplate);
								}
							}
							this._view.hideProgress();
						})
						.catch(() => {
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
			this._imagesSelectionTemplate?.refresh();
		});

		this._view.$scope.on(this._view.$scope.app, "changedAllSelectedImagesCount", () => {
			this._allPagesTemplate?.refresh();
		});
		this._view.$scope.on(this._view.$scope.app, "filtersChanged", async (data/* , selectNone */) => {
			// add (or remove) filters data to model
			appliedFilterModel.processNewFilters(data);
			// refresh data in list
			this._updateAppliedFiltersList(appliedFilterModel.prepareDataForList());
			webix.delay(() => {
				// update checkboxes values
				const appliedFiltersArray = appliedFilterModel.getFiltersArray();
				this._updateFiltersFormControls(appliedFiltersArray);
			});
			const item = Array.isArray(data) ? data[0] : data;
			const element = item?.treeCheckboxFlag
				? this._filtersForm.queryView({id: `${item?.viewId}`})?.getItem(item?.optionId)
				: this._filtersForm.queryView({id: `${item?.key}|${item?.value}`})?.config;
			await this._reload(0, this._pager?.data?.size || 10);
			if (util.isMobilePhone()) {
				// Fix scrollView
				this.resizeFilterScrollView();
				if (element) {
					this._scrollToFilterFormElement(element);
				}
			}
			else if (item?.treeCheckboxFlag) {
				const treeView = $$(item?.viewId);
				if (treeView) {
					this._scrollToFilterFormElementFromTree(element, treeView);
				}
			}
		});

		const clearAllFilters = () => {
			this._downloadFilteredImagesButton?.hide();
			this._appliedFiltersList.clearAll();
			this._appliedFiltersList.callEvent("onAfterLoad");
			this._appliedFiltersLayout?.hide();
			appliedFilterModel.clearAll();
			this._reload();
		};

		this._clearAllFiltersTemplate?.define("onClick", {
			"clear-all-filters": clearAllFilters
		});

		this._portraitClearAllFiltersTemplate?.attachEvent("onTouchEnd", clearAllFilters);

		this._landscapeClearAllFiltersTemplate?.attachEvent("onTouchEnd", clearAllFilters);

		this._createStudyButton?.attachEvent("onItemClick", () => {
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
				// eslint-disable-next-line array-callback-return
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
				else if (!items[0].markCheckbox
					&& util.findItemInList(items[0].isic_id, this._activeCartList)) {
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
				itemId = params;
				item = this._activeCartList.getItem(params);
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
				// eslint-disable-next-line array-callback-return
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
			// eslint-disable-next-line array-callback-return
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

		this._galleryContextMenu?.attachEvent("onItemClick", function (id) {
			if (id === constants.ID_GALLERY_CONTEXT_MENU_SAVE_IMAGE) {
				const context = this.getContext();
				if (context.isic_id) {
					const fileName = context.isic_id;
					const fullFileUrl = context.files.full.url;
					self.downloadImage(fullFileUrl, fileName);
				}
				else {
					const contextView = context.obj;
					const itemId = context.id;
					const currentItem = contextView.getItem(itemId);
					const fullFileUrl = currentItem.files?.full?.url;
					const fileName = currentItem.isic_id;
					self.downloadImage(fullFileUrl, fileName);
				}
			}
		});

		this._enlargeContextMenu?.attachEvent("onItemClick", (id) => {
			if (id === constants.ID_GALLERY_CONTEXT_MENU_SAVE_IMAGE) {
				const obj = this._imageWindowTemplate?.getValues()
					?? this._imageWindowTemplateWithoutControls?.getValues();
				const fullFileUrl = obj.fullFileUrl;
				const fileName = obj.imageId;
				this.downloadImage(fullFileUrl, fileName);
			}
		});

		this._downloadSelectedImagesButton.attachEvent("onItemClick", async () => {
			const selectedItems = selectedImages.getSelectedImagesForDownload();
			const query = selectedItems.map(item => `isic_id:${item.isic_id}`)
				.join(" OR ");
			const url = await ajax.getDownloadUrl(constants.DOWNLOAD_SELECTED_IMAGES, query);
			if (url) {
				util.downloadByLink(url, "isic_data.zip");
			}
		});

		this._downloadFilteredImagesButton?.attachEvent("onItemClick", async () => {
			const query = appliedFilterModel.getConditionsForApi();
			const url = await ajax.getDownloadUrl(constants.DOWNLOAD_FILTERED_IMAGES, query);
			if (url) {
				util.downloadByLink(url, "isic_data.zip");
			}
		});

		window.matchMedia("(orientation: portrait)").addEventListener("change", async (/* e */) => {
			if (await state.auth.isTermsOfUseAccepted()) {
				const appliedFiltersArray = appliedFilterModel.getFiltersArray();
				this._view.$scope.app.callEvent("filtersChanged", [appliedFiltersArray]);
			}
		});

		if (this._leftPanelWithCollapser) {
			this._imagesDataview.attachEvent("onAfterRender", () => {
				if (this._galleryLeftPanel.isVisible()) {
					this._leftPanelResizer?.show();
					// resize left panel after initialization to fix the resizer
					const leftPanelWidth = this._leftPanelWithCollapser.$width;
					this._leftPanelWithCollapser.define("width", leftPanelWidth);
					this._leftPanelWithCollapser.define("minWidth", 451);
					this._leftPanelWithCollapser.define("maxWidth", 700);
					this._leftPanelWithCollapser.resize();
					this._leftPanelResizer.resize();
				}
				else {
					this._leftPanelResizer?.hide();
					// resize left panel after initialization to fix the resizer
					this._leftPanelWithCollapser.define("width", 0);
					this._leftPanelWithCollapser.define("minWidth", 0);
					this._leftPanelWithCollapser.define("maxWidth", 0);
					this._leftPanelWithCollapser.resize();
					this._leftPanelResizer.resize();
				}
			});

			// resize left panel after initialization to fix the resizer
			const leftPanelWidth = this._leftPanelWithCollapser.$width;
			this._leftPanelWithCollapser.define("width", leftPanelWidth);
			this._leftPanelWithCollapser.define("minWidth", leftPanelWidth);
			this._leftPanelWithCollapser.define("maxWidth", 700);
			this._leftPanelWithCollapser.resize();
			this._leftPanelResizer.resize();
		}
	}

	async load() {
		try {
			state.imagesTotalCounts = {};
			state.imagesTotalCounts.passedFilters = {};
			const images = await ajax.getImages();
			state.imagesTotalCounts.passedFilters.count = images.count ? images.count : 0;
			this._updateContentHeaderTemplate(
				{
					rangeStart: 1,
					rangeFinish: this._pager?.data?.size || 10,
					totalCount: state.imagesTotalCounts.passedFilters.count
				}
			);
			this._updatePagerCount(state.imagesTotalCounts.passedFilters.count);
			await this._loadFacetsAndCollectionsIntoState();
			if (this._searchSuggest) {
				await suggestService.buildSuggestionsForFilter();
				const suggestions = suggestService.getSuggestionsForFilter();
				this._searchSuggest.getList().parse(suggestions);
			}
			this._searchInput.enable();
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
								if (appliedFiltersArray) {
									this._view.$scope.app.callEvent("filtersChanged", [appliedFiltersArray]);
								}
							}
							catch (err) {
								this._view.$scope.setParam("filter", "[]", true);
								this._view.$scope.app.callEvent("filtersChanged", [[]]);
							}
						}
					}); // create filters form controls from config
			}
			filterService.updateFiltersCounts();
			const image = this._view.$scope.getParam("image");
			if (image) {
				const isTermsOfUseAccepted = await authService.isTermsOfUseAccepted();
				if (this._imageWindow && isTermsOfUseAccepted) {
					this._imageWindowTemplate?.hide();
					this._imageWindowTemplateWithoutControls?.show();
					const item = await ajax.getImageItem(image);
					this._imageWindowTemplateWithoutControls?.setValues({
						imageId: image,
						fullFileUrl: item.files.full.url
					});
					if (this._imageWindowMetadata) {
						webix.ui([metadataPart.getConfig("image-window-metadata", item, item)], this._imageWindowMetadata);
					}
					this._imageWindow.show();
				}
			}
			if (!paramFilters && !appliedFiltersArray.length) this._reload();
		}
		catch (error) {
			logger.error(error);
			if (!this._view.$destructed) {
				webix.message("Load: Something went wrong");
			}
		}
	}

	async _loadFacetsAndCollectionsIntoState() {
		const pinnedCollectionOptions = {
			limit: 0,
			pinned: true,
			sort: "name",
		};
		const pinnedCollectionsData = await ajax.getCollections(pinnedCollectionOptions);
		collectionsModel.clearPinnedCollections();
		collectionsModel.setPinnedCollections(pinnedCollectionsData);
		state.imagesTotalCounts[constants.COLLECTION_KEY] = pinnedCollectionsData.results.map(pc => ({
			key: pc.id,
			name: pc.name,
		}));

		const diagnosisRegex = /^diagnosis_\d$/;
		const facets = await ajax.getFacets();
		Object.entries(facets).forEach(([id, facet]) => {
			state.imagesTotalCounts[id] = [
				...webix.copy(facet.buckets),
				{
					key: constants.MISSING_KEY_VALUE,
					doc_count: facet?.meta?.missing_count || 0,
				}
			];

			if (diagnosisRegex.test(id)) {
				const diagnosisKeys = facet.buckets.map(bucket => bucket.key);
				diagnosisModel.addDisplayDiagnosis(diagnosisKeys);
			}
		});
	}

	async _reload(offsetSource, limitSource) {
		if (await state.auth.isTermsOfUseAccepted()) {
			let limit = limitSource || this._pager.data.size;
			let offset = offsetSource || 0;
			const appliedFiltersArray = appliedFilterModel.getFiltersArray();
			this._createFilters(appliedFiltersArray);
			this._updateCounts();
			const paramFilters = appliedFilterModel.convertAppliedFiltersToParams();
			// set params to url
			this._view.$scope.setParam("filter", paramFilters, true);
			await this._updateImagesDataview(offset, limit); // load images first time
		}
	}

	_updateContentHeaderTemplate(ranges) {
		state.imagesOffset = ranges.rangeStart - 1;
		if (ranges.filtered) {
			state.filteredImages.isImagesFiltered = true;
			if (ranges.currentCount) {
				state.filteredImages.filteredImagesCount = ranges.currentCount;
			}
			else if (ranges.currentCount === 0) {
				state.filteredImages.filteredImagesCount = 0;
			}
		}
		const values = webix.copy(ranges);
		this._contentHeaderTemplate?.setValues(values, true); // true -> unchange existing values
		this._contentHeaderTemplate?.refresh();
	}

	async _updateCounts() {
		try {
			const filterQuery = appliedFilterModel.getConditionsForApi();
			const appliedCollections = appliedFilterModel.getAppliedCollectionsForApi();
			const params = {};
			params.conditions = filterQuery;
			params.collections = appliedCollections;
			const facets = await ajax.getFacets(params);
			filterService.updateFiltersCounts(facets);
		}
		catch (error) {
			logger.error(error);
			if (!this._view.$destructed) {
				webix.message("UpdateCount: Something went wrong");
			}
		}
	}

	// update form controls values(true/false for checkboxes, etc)
	_updateFiltersFormControls(data) {
		if (Array.isArray(data)) {
			// For treetable elements sorting from highest level to lowest
			[...data].sort((a, b) => a.diagnosisLevel > b.diagnosisLevel).forEach((item) => {
				filterService.updateFiltersFormControl(item);
			});
		}
		else if (data) {
			filterService.updateFiltersFormControl(data);
		}
	}

	_updateAppliedFiltersList(data) {
		this._appliedFiltersList = this._view.$scope.getAppliedFiltersList();
		this._appliedFiltersList.clearAll();
		this._appliedFiltersList.parse(data);
		if (data.length > 0) {
			this._downloadFilteredImagesButton?.show();
		}
		else {
			this._downloadFilteredImagesButton?.hide();
		}
	}

	// appliedFilters - array of filter that should be initially expanded
	_createFilters(appliedFilters, forceRebuild) {
		const appliedFiltersKeys = (appliedFilters || []).map(item => item.key);
		return filtersData.getFiltersData(forceRebuild).then((data) => {
			const elements = filtersFormElements.transformToFormFormat(data, appliedFiltersKeys);
			this.clearFilterForm();
			this._filtersForm = this._view.$scope.getFiltersForm();
			webix.ui(elements, this._filtersForm);
			const firstItemToScroll = filtersBySearchCollection.getItem(
				filtersBySearchCollection.getFirstId()
			);
			if (firstItemToScroll) {
				const elementsToScroll = elements.find((element) => {
					if (element.rows) {
						return element.rows[0].template === firstItemToScroll.filterName;
					}
					return false;
				}, true);
				this._scrollToFilterFormElement(elementsToScroll);
				filtersBySearchCollection.clearAll();
			}
		});
	}

	_updatePagerCount(count) {
		count = count || 1;
		if (count) {
			if (!this._pager?.$master?.setPage) {
				this._pager.$master.setPage = () => {};
			}
			this._pager.define("count", count);
			this._pager.refresh();
		}
	}

	async _updateImagesDataview(offset, limit, url) {
		try {
			this._view.showProgress();
			if (offset === 0) {
				this._pager.define("page", 0);
			}
			const parseDataToDataview = util.debounce((images) => {
				try {
					this._imagesDataview.clearAll();
					this._imagesDataview.parse(images.results);
					this._view.hideProgress();
				}
				catch (e) {
					if (!this._imagesDataview.$destructed) {
						this._view.hideProgress();
					}
				}
			}, 300);
			const leftPanelToggleButtonValue = this._leftPanelToggleButton.getValue();
			const nameParam = this._view.$scope.getParam("name");
			if (nameParam) {
				this._leftPanelToggleButton.setValue(1);
				this._searchInput.setValue(nameParam);
			}
			const searchValue = this._searchInput.getValue();
			if (leftPanelToggleButtonValue !== 0 && searchValue.length > 8 && nameParam) {
				this._searchHandlerByName(true);
				return;
			}
			const filter = appliedFilterModel.getConditionsForApi();
			const collections = appliedFilterModel.getAppliedCollectionsForApi();
			const images = url
				? await ajax.getImagesByUrl(url)
				: await ajax.getImages({
					limit,
					filter,
					collections
				});
			state.imagesTotalCounts.passedFilters.currentCount = images.count;
			const start = offset > 0 ? offset : 1;
			if (filter || collections) {
				state.imagesTotalCounts.passedFilters.filtered = true;
				state.imagesTotalCounts.passedFilters.currentCount = images.count;
				this._updateContentHeaderTemplate({
					rangeStart: start,
					rangeFinish: start + this._pager.data.size - 1,
					currentCount: images.count,
					totalCount: state.imagesTotalCounts.passedFilters.count,
					filtered: true
				});
			}
			else {
				state.imagesTotalCounts.passedFilters.filtered = false;
				this._updateContentHeaderTemplate({
					rangeStart: start,
					rangeFinish: start + this._pager.data.size - 1,
					totalCount: state.imagesTotalCounts.passedFilters.count,
					filtered: false
				});
			}
			galleryImagesUrls.setNextImagesUrl(images.next);
			galleryImagesUrls.setPrevImagesUrl(images.previous);
			if (images && images.results.length > 0) {
				for await (const item of images.results) {
					item.markCheckbox = selectedImages.isSelected(item.isic_id);
					const lesionID = lesionsModel.getItemLesionID(item);
					const lesion = lesionID ? await lesionsModel.getLesionByID(lesionID) : null;
					if (lesionID && !lesion) {
						const newLesion = await ajax.getLesionByID(lesionID);
						if (newLesion) {
							await lesionsModel.setLesionByID(lesionID, newLesion);
						}
					}
				}
				parseDataToDataview(images);
			}
			else {
				this._imagesDataview.clearAll();
				this._imagesDataview.showOverlay("<div style=\"font-size: 17px; font-weight: bold;\">Nothing was found</div>");
				this._view.hideProgress();
			}
			this._updatePagerCount(images.count);
		}
		catch (error) {
			logger.error(error);
			if (!this._view.$destructed) {
				this._view.hideProgress();
			}
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
			if (this._allPagesTemplate) {
				this._disableTemplateByCss(this._allPagesTemplate);
			}
			if (this._imagesSelectionTemplate) {
				this._enableTemplateByCss(this._imagesSelectionTemplate);
			}
		}
		else {
			if (this._imagesSelectionTemplate) {
				this._disableTemplateByCss(this._imagesSelectionTemplate);
			}
			if (this._allPagesTemplate) {
				this._enableTemplateByCss(this._allPagesTemplate);
			}
		}
	}

	async _setImageWindowValues(currentItem) {
		this._currentItem = currentItem;
		this._imageWindowViewer?.setValues({
			imageId: currentItem.isic_id,
			fullFileUrl: currentItem.files?.full?.url
		});
		const image = await ajax.getImageItem(currentItem.isic_id);
		if (this._imageWindowMetadata) {
			webix.ui([metadataPart.getConfig("image-window-metadata", image, currentItem)], this._imageWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
		}
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

	_setDataviewColumns(width, height, imageWidth, imageHeight) {
		this._imagesDataview.customize({
			width,
			height
		});
		galleryImagesUrls.clearPreviewUrls();
		util.setDataviewItemDimensions(width, height);
		util.setImageDimensions(imageWidth, imageHeight);
		this._imagesDataview.refresh();
	}

	_clearActiveListData(clearModifyObjects) {
		this._activeCartList.data.each((item) => {
			item.imageShown = false;
		});
		this._activeCartList.clearAll();
		if (!clearModifyObjects) modifiedObjects.clearAll();
		this._view.$scope.hideList();
	}

	_resizeButtonsLayout(height, studyFlag, toShow) {
		this._buttonsLayout?.define("height", height);
		this._buttonsLayout?.resize();
		if (studyFlag) {
			if (toShow) {
				this._createStudyButton?.show();
			}
			else {
				this._createStudyButton?.hide();
			}
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

	_searchEventsMethods(eventMethod, attachEnterFlag) {
		this._searchInput.detachEvent("onEnter");
		this._searchInput.on_click["gallery-search-filter"] = eventMethod;
		if (attachEnterFlag) {
			this._searchInput.attachEvent("onEnter", eventMethod);
		}
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
		const currentFilterScrollView = this._view.$scope.getFilterScrollView
			? this._view.$scope.getFilterScrollView()
			: this._filterScrollView;
		const elementView = $$(element.id);
		const elementOffsetTop = elementView.$view.offsetTop;
		const filterScrollViewOffsetTop = currentFilterScrollView.$view.offsetTop;
		const positionToScroll = elementOffsetTop - filterScrollViewOffsetTop;
		currentFilterScrollView.scrollTo(0, positionToScroll);
		currentFilterScrollView.callEvent("onAfterScroll");
	}

	_scrollToFilterFormElementFromTree(element, tree) {
		const currentFilterScrollView = this._view.$scope.getFilterScrollView
			? this._view.$scope.getFilterScrollView()
			: this._filterScrollView;
		const elementNode = tree.getItemNode(element.id);
		const elementOffsetTop = elementNode.offsetTop;
		const filterScrollViewOffsetTop = currentFilterScrollView.$view.offsetTop / 2;
		const positionToScroll = elementOffsetTop - filterScrollViewOffsetTop;
		currentFilterScrollView.scrollTo(0, positionToScroll);
	}

	resizeFilterScrollView() {
		const currentFilterScrollView = this._view.$scope.getFilterScrollView
			? this._view.$scope.getFilterScrollView()
			: this._filterScrollView;
		const filterScrollViewChildren = currentFilterScrollView.getChildViews();
		const scrollViewWidth = currentFilterScrollView.$width;
		let scrollViewHeight = 0;
		filterScrollViewChildren?.forEach((childView) => {
			scrollViewHeight += childView.$height;
		});
		if (scrollViewHeight && scrollViewWidth) {
			currentFilterScrollView?.$setSize(
				scrollViewWidth,
				scrollViewHeight
			);
		}
		currentFilterScrollView.resize();
	}

	clearFilterForm() {
		const elements = this._filtersForm.getChildViews();
		for (let i = 0; i < elements.length; i++) {
			let element = elements[i];
			i--;
			this._filtersForm.removeView(element);
		}
	}

	downloadImage(fullFileUrl, fileName) {
		if (fullFileUrl) {
			if (util.isIOS()) {
				ajax.downloadImage(fullFileUrl, fileName);
			}
			else {
				util.downloadByLink(fullFileUrl, fileName);
			}
			// TODO: alternative
			// ajax.downloadImage(fullFileUrl, fileName);
		}
	}
}

export default GalleryService;
