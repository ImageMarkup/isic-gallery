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

class GalleryService {
	constructor(view, pager, imagesDataview, contentHeaderTemplate, imageWindow, imageWindowViewer, imageWindowMetadata, metadataWindow, metadataWindowMetadata, filtersForm, appliedFiltersList, unselectLink, downloadingMenu, searchInput, clearAllFiltersTemplate) {
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
		this._init();
	}

	_searchHandler() {
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

	_init() {
		this._searchInput.attachEvent("onSearchIconClick", this._searchHandler.bind(this));
		this._searchInput.attachEvent("onEnter", this._searchHandler.bind(this));

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
		this._imagesDataview.on_click["resize-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);

			this._imageWindowViewer.setValues({imageId: currentItem._id});

			webix.promise.all([
				ajax.getImageItem(currentItem._id),
				ajax.getSegmentation({imageId: currentItem._id})
			]).then((results) => {
				let data;
				[data, data.segmentation] = results;
				webix.ui([metadataPart.getConfig("image-window-metadata", data)], this._imageWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
			});
			this._imageWindow.show();
		};
		this._imagesDataview.on_click["info-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			webix.promise.all([
				ajax.getImageItem(currentItem._id),
				ajax.getSegmentation({imageId: currentItem._id})
			]).then((results) => {
				const data = webix.copy(results[0]);
				data.segmentation = webix.copy(results[1]);
				webix.ui([metadataPart.getConfig("metadata-window-metadata", data)], this._metadataWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
			});
			this._metadataWindow.show();
		};
		this._imagesDataview.on_click["diagnosis-icon"] = (e, id) => {
			const currentItem = this._imagesDataview.getItem(id);
			const url = `http://dermannotator.org/multirater?id=${currentItem._id}&sid=${currentItem.studyId}&uid=${authService.getToken()}`;
			util.openInNewTab(url);
		};
		webix.extend(this._view, webix.ProgressBar);

		// -->add onClick property for template
		this._imagesSelectionTemplate.define("onClick", {
			"unselect-images-link": () => {
				selectedImages.clearAll();
				// clear checkbox state in dataview for current page
				this._imagesDataview.data.each((item) => {
					item.markCheckbox = 0;
				});
				this._imagesDataview.refresh();
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
			},
			"gallery-select-all-images": () => {
				let isNeedShowAlert = true;
				this._imagesDataview.data.each((item) => {
					if (item.markCheckbox) {
						return;
					}
					if (selectedImages.count() < constants.MAX_COUNT_IMAGES_SELECTION) {
						selectedImages.add(item._id);
						item.markCheckbox = 1;
					}
					else if (isNeedShowAlert) {
						isNeedShowAlert = false;
						webix.alert({
							text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
						});
					}
				});
				this._imagesDataview.refresh();
				this._view.$scope.app.callEvent("changedSelectedImagesCount");
			}
		});

		this._view.$scope.on(this._view.$scope.app, "changedSelectedImagesCount", () => {
			this._imagesSelectionTemplate.refresh();
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
		this._view.showProgress();
		webix.promise.all([
			this.studiesPromise,
			imagesPromise
		]).then((results) => {
			const [annotatedImages, images] = results;
			if (images) {
				images.forEach((item) => {
					item.markCheckbox = selectedImages.isSelected(item._id); // markCheckbox - active content in dataview.
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
}

export default GalleryService;
