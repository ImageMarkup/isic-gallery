import constants from "../../constants";
import galleryImagesUrls from "../../models/galleryImagesUrls";
import lesionWindowImagesUrls from "../../models/lesionWindowImagesUrls";
import lesionsModel from "../../models/lesionsModel";
import util from "../../utils/util";
import metadataPart from "../../views/subviews/gallery/parts/metadata";
import multiImageLesionWindow from "../../views/subviews/gallery/windows/multiImageLesionWindow";
import ajax from "../ajaxActions";
import authService from "../auth";
import searchButtonModel from "./searchButtonModel";

export default class MultiLesionWindowService {
	constructor(
		galleryService,
	) {
		/** @type {import("./gallery").default} */
		this._galleryService = galleryService;
		this._window = $$(multiImageLesionWindow.getWindowID());
		/** @type {webix.ui.list} */
		this._topSlider = $$(multiImageLesionWindow.getTopSliderID());
		/** @type {webix.ui.list} */
		this._leftSlider = $$(multiImageLesionWindow.getLeftSliderID());
		/** @type {webix.ui.list} */
		this._rightSlider = $$(multiImageLesionWindow.getRightSliderID());
		this._leftFooter = $$(multiImageLesionWindow.getLeftFooterID());
		this._rightFooter = $$(multiImageLesionWindow.getRightFooterID());
		this._leftTimePointButton = $$(multiImageLesionWindow.getLeftTimePointButtonID());
		this._leftModalityButton = $$(multiImageLesionWindow.getLeftModalityButtonID());
		this._leftTotalButton = $$(multiImageLesionWindow.getLeftTotalButtonID());
		this._rightTimePointButton = $$(multiImageLesionWindow.getRightTimePointButtonID());
		this._rightModalityButton = $$(multiImageLesionWindow.getRightModalityButtonID());
		this._rightTotalButton = $$(multiImageLesionWindow.getRightTotalButtonID());
		this._leftSort = $$(multiImageLesionWindow.getLeftDropDownFilterID());
		this._rightSort = $$(multiImageLesionWindow.getRightDropDownFilterID());
		this._leftImageLabel = $$(multiImageLesionWindow.getLeftImageNameLabelID());
		this._rightImageLabel = $$(multiImageLesionWindow.getRightImageNameLabelID());
		this._resizer = $$(multiImageLesionWindow.getResizerID());
		this._rightContainer = $$(multiImageLesionWindow.getRightContainerID());
		/** @type {webix.ui.template} */
		this._leftImage = $$(multiImageLesionWindow.getLeftImageID());
		/** @type {webix.ui.template} */
		this._rightImage = $$(multiImageLesionWindow.getRightImageID());
		this._fullScreenButton = $$(multiImageLesionWindow.getFullScreenButtonID());
		this._windowedButton = $$(multiImageLesionWindow.getWindowedButtonID());
		/** @type {webix.ui.search} */
		this._searchInput = $$(multiImageLesionWindow.getSearchID());
		this._prevPageButton = $$(multiImageLesionWindow.getPrevPageButtonID());
		this._nextPageButton = $$(multiImageLesionWindow.getNextPageButtonID());
		/** @type {webix.ui.layout} */
		this._leftControls = $$(multiImageLesionWindow.getLeftControlsID());
		this._rightControls = $$(multiImageLesionWindow.getRightControlsID());
		this._leftAnchorIcon = $$(multiImageLesionWindow.getLeftAnchorIconID());
		this._rightAnchorIcon = $$(multiImageLesionWindow.getRightAnchorIconID());
		this._fullscreen = false;
		this.init();
	}

	async init() {
		this._leftImage.attachEvent("onBeforeRender", this.updateImage);
		this._leftImage.attachEvent("onAfterLoad", this.updateImage);

		this._rightImage.attachEvent("onBeforeRender", this.updateImage);
		this._rightImage.attachEvent("onAfterLoad", this.updateImage);

		this._fullScreenButton.attachEvent("onItemClick", () => { this.changeWindowMode(); });
		this._windowedButton.attachEvent("onItemClick", () => { this.changeWindowMode(); });

		this._searchInput.on_click["lesionWindow__filter-search"] = this.searchImagesByQueryHandler.bind(this);
		this._searchInput.on_click["lesionWindow__fa-times"] = () => {
			if (this._searchInput.getValue() !== "") {
				this._searchInput.setValue("");
				this._searchInput.callEvent("onEnter");
			}
		};
		this._searchInput.attachEvent("onEnter", this.searchImagesByQueryHandler.bind(this));
		this._searchInput.attachEvent("onAfterRender", () => {
			const inputNode = this._searchInput.$view.getElementsByClassName("webix_el_box")[0];
			const tooltipText = "Clear search value";
			searchButtonModel.createTimesSearchButton(
				this._searchInput,
				null,
				inputNode,
				tooltipText,
				true
			);
		});

		const navButtonClickHandler = util.debounce(async (navigate) => {
			let url = navigate === "prev"
				? lesionWindowImagesUrls.getPrevImagesUrl()
				: lesionWindowImagesUrls.getNextImagesUrl();
			if (url) {
				this._topSlider.showProgress();
				lesionWindowImagesUrls.setCurrImagesUrl(url);
				const result = await ajax.getImagesByUrl(url);
				lesionWindowImagesUrls.setPrevImagesUrl(result.previous);
				lesionWindowImagesUrls.setNextImagesUrl(result.next);
				this._topSlider.clearAll();
				this._topSlider.parse(result.results);
				this._topSlider.hideProgress();
			}
		}, 100);
		this._prevPageButton.attachEvent("onItemClick", navButtonClickHandler.bind(this, "prev"));
		this._nextPageButton.attachEvent("onItemClick", navButtonClickHandler.bind(this, "next"));

		const clearWindow = () => {
			this._leftSlider.clearAll();
			this._rightSlider.clearAll();
			this._topSlider.clearAll();
			this._searchInput.setValue("");
			if (this._window.config.fullscreen) {
				this.changeWindowMode();
			}
		};
		this._window.attachEvent("onHide", clearWindow);
		this._window.attachEvent("onShow", this.searchImagesByQueryHandler.bind(this));

		this._leftTimePointButton.attachEvent("onItemClick", () => {
			lesionsModel.setLeftMode(constants.MULTI_LESION_WINDOW_STATE.TIME);
			this.deactivateLeftControls();
			this._leftTimePointButton.define("active", true);
			this.refreshLeftControls();
			const currentItem = lesionsModel.getLeftImage();
			this.fillLeftPanel(currentItem);
		});
		this._leftModalityButton.attachEvent("onItemClick", () => {
			lesionsModel.setLeftMode(constants.MULTI_LESION_WINDOW_STATE.MODALITY);
			this.deactivateLeftControls();
			this._leftModalityButton.define("active", true);
			this.refreshLeftControls();
			const currentItem = lesionsModel.getLeftImage();
			this.fillLeftPanel(currentItem);
		});
		this._leftTotalButton.attachEvent("onItemClick", () => {
			lesionsModel.setLeftMode(constants.MULTI_LESION_WINDOW_STATE.TOTAL);
			this.deactivateLeftControls();
			this._leftTotalButton.define("active", true);
			this.refreshLeftControls();
			const currentItem = lesionsModel.getLeftImage();
			this.fillLeftPanel(currentItem);
		});
		this._rightTimePointButton.attachEvent("onItemClick", () => {
			lesionsModel.setRightMode(constants.MULTI_LESION_WINDOW_STATE.TIME);
			this.deactivateRightControls();
			this._rightTimePointButton.define("active", true);
			this.refreshRightControls();
			const currentItem = lesionsModel.getRightImage();
			this.fillRightPanel(currentItem);
		});
		this._rightModalityButton.attachEvent("onItemClick", () => {
			lesionsModel.setRightMode(constants.MULTI_LESION_WINDOW_STATE.MODALITY);
			this.deactivateRightControls();
			this._rightModalityButton.define("active", true);
			this.refreshRightControls();
			const currentItem = lesionsModel.getRightImage();
			this.fillRightPanel(currentItem);
		});
		this._rightTotalButton.attachEvent("onItemClick", () => {
			lesionsModel.setRightMode(constants.MULTI_LESION_WINDOW_STATE.TOTAL);
			this.deactivateRightControls();
			this._rightTotalButton.define("active", true);
			this.refreshRightControls();
			const currentItem = lesionsModel.getRightImage();
			this.fillRightPanel(currentItem);
		});
		const leftSortHandler = (type) => {
			const newType = type ?? this._leftSort.getValue();
			const images = this._leftSlider.serialize();
			const sortedImages = this.sortImages(images, newType);
			const selectedID = this._leftSlider.getSelectedId();
			this._leftSlider.clearAll();
			this._leftSlider.parse(sortedImages);
			this._leftSlider.select(selectedID);
		};
		this._leftSort.attachEvent("onChange", leftSortHandler.bind(this));
		this._leftSort.attachEvent("onAfterRender", leftSortHandler.bind(this));
		const rightSortHandler = (type) => {
			const newType = type ?? this._rightSort.getValue();
			const images = this._rightSlider.serialize();
			const sortedImages = this.sortImages(images, newType);
			const selectedID = this._rightSlider.getSelectedId();
			this._rightSlider.clearAll();
			this._rightSlider.parse(sortedImages);
			this._rightSlider.select(selectedID);
		};
		this._rightSort.attachEvent("onChange", rightSortHandler.bind(this));
		this._rightSort.attachEvent("onAfterRender", rightSortHandler.bind(this));
		this._rightSlider.attachEvent("onBeforeDrop", () => false);
		this._topSlider.attachEvent("onBeforeDrop", () => false);
		this._leftSlider.attachEvent("onBeforeDrop", () => false);
		const leftImageView = this._leftImage.$view;
		const rightImageView = this._rightImage.getNode();
		webix.DragControl.addDrop(leftImageView, {$drop: (/* source, target, event */) => {
			const dnd = webix.DragControl.getContext();
			const item = dnd.from.getItem(dnd.start);
			const lesionID = lesionsModel.getItemLesionID(item);
			if (lesionID) {
				lesionsModel.setLeftImage(item);
				this.fillLeftPanel(item);
			}
			else {
				webix.message("There are no lesions attached to this image");
			}
		}});
		webix.DragControl.addDrop(rightImageView, {$drop: (/* source, target, event */) => {
			const dnd = webix.DragControl.getContext();
			const item = dnd.from.getItem(dnd.start);
			const lesionID = lesionsModel.getItemLesionID(item);
			if (lesionID) {
				lesionsModel.setRightImage(item);
				this.fillRightPanel(item);
			}
			else {
				webix.message("There are no lesions attached to this image");
			}
		}});

		const changeTimePointImage = (side, move) => {
			const slider = side === "right" ? this._rightSlider : this._leftSlider;
			const selectedId = slider.getSelectedId();
			const itemID = move === "next"
				? slider.getNextId(selectedId) ?? slider.getFirstId()
				: slider.getPrevId(selectedId) ?? slider.getLastId();
			const item = webix.copy(slider.getItem(itemID));
			delete item.id;
			if (side === "left") {
				this.fillLeftPanel(item);
			}
			if (side === "right") {
				this.fillRightPanel(item);
			}
		};

		this._leftImage.define("onClick", {
			prev: () => {
				changeTimePointImage("left", "prev");
			},
			next: () => {
				changeTimePointImage("left", "next");
			}
		});

		this._rightImage.define("onClick", {
			prev: () => {
				changeTimePointImage("right", "prev");
			},
			next: () => {
				changeTimePointImage("right", "next");
			}
		});

		this._topSlider.on_click["resize-icon"] = (e, id) => {
			const currentItem = this._topSlider.getItem(id);
			this._galleryService._imageWindowTemplateWithoutControls?.hide();
			this._galleryService._imageWindowTemplate?.show();
			this._galleryService._setImageWindowValues(currentItem);
			if (this._galleryService._imageWindow) {
				this._galleryService._eventForHideMessages(this._galleryService._imageWindow);
				this._galleryService._imageWindow.show();
			}
		};

		this._topSlider.on_click["info-icon"] = async (e, id) => {
			try {
				const currentItem = this._topSlider.getItem(id);
				const image = await ajax.getImageItem(currentItem.isic_id);
				if (this._galleryService._metadataWindowMetadata) {
					webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)], this._galleryService._metadataWindowMetadata); // [] - because we rebuild only rows of this._imageWindowMetadata
				}
				else {
					webix.ui([metadataPart.getConfig("metadata-window-metadata", image, currentItem)]); // [] - because we rebuild only rows of this._imageWindowMetadata
				}
				if (this._galleryService._metadataWindow) {
					this._galleryService._eventForHideMessages(this._galleryService._metadataWindow);
					this._galleryService._metadataWindow.show();
				}
			}
			catch (error) {
				if (!this._galleryService._view.$destructed) {
					webix.message("ShowMetadata: Something went wrong");
				}
			}
		};

		this._topSlider.on_click["diagnosis-icon"] = (e, id) => {
			const currentItem = this._topSlider.getItem(id);
			const url = `${constants.URL_MULTIRATER}?id=${currentItem.isic_id}&sid=${currentItem.studyId}&uid=${authService.getToken()}`;
			util.openInNewTab(url);
		};

		this._topSlider.on_click["batch-icon"] = async (e, id) => {
			const currentItem = this._topSlider.getItem(id);
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

		this._topSlider.on_click["time-attack"] = (e, id) => {
			if (this._window) {
				const currentItem = this._topSlider.getItem(id);
				this.setMultiLesionState(currentItem, constants.MULTI_LESION_WINDOW_STATE.TIME);
			}
		};

		this._topSlider.on_click["layer-group"] = (e, id) => {
			if (this._window) {
				const currentItem = this._topSlider.getItem(id);
				this.setMultiLesionState(
					currentItem,
					constants.MULTI_LESION_WINDOW_STATE.MODALITY
				);
			}
		};

		this._topSlider.on_click["sum-of-sum"] = (e, id) => {
			if (this._window) {
				const currentItem = this._topSlider.getItem(id);
				this.setMultiLesionState(currentItem, constants.MULTI_LESION_WINDOW_STATE.TOTAL);
			}
		};

		webix.extend(this._topSlider, webix.ProgressBar);
	}

	async ready() {
		const data = await ajax.getLesions();
		if (data) {
			lesionsModel.setLesions(data.results);
		}
	}

	async updateImage(obj) {
		if (typeof galleryImagesUrls.getNormalImageUrl(obj?.isic_id) === "undefined") {
			if (obj?.isic_id) {
				const item = await ajax.getImageItem(obj.isic_id);
				galleryImagesUrls.setNormalImageUrl(obj.isic_id, item.files.full.url);
				this.refresh();
			}
		}
		return true;
	}

	setMultiLesionState(item, mode) {
		lesionsModel.setCurrentItem(item);
		lesionsModel.setLeftMode(mode);
		lesionsModel.setRightMode(mode);
		const lesionID = lesionsModel.getItemLesionID(item);
		const lesionImages = webix.copy(lesionsModel.getLesionImages(lesionID));
		const itemID = lesionsModel.getItemID(item);
		const anchorImageID = lesionsModel.getAnchorImageID(lesionID);
		if (itemID !== anchorImageID) {
			this._rightContainer.show();
			this._resizer.show();
			lesionsModel.setRightImage(item);
			this.fillRightPanel(item);
		}
		else {
			this._resizer.hide();
			this._rightContainer.hide();
		}
		const anchorImg = lesionImages.find(i => lesionsModel.getItemID(i) === anchorImageID);
		lesionsModel.setLeftImage(anchorImg);
		this.fillLeftPanel(anchorImg);
	}

	// Parse timePoint images to vertical slider
	parseTimePointImages(item, lesionID, isRightSide) {
		const timePoint = lesionsModel.getItemTimePoint(item);
		const timePointImages = webix.copy(lesionsModel.getTimePointImages(lesionID, timePoint));
		if (isRightSide === true) {
			this._rightTimePointButton.define("active", true);
			let rightSortedType = this._rightSort.getValue();
			if (rightSortedType === "") {
				this._rightSort.setValue(constants.MULTI_LESION_FILTERS.TIME);
				rightSortedType = this._rightSort.getValue();
			}
			const rightSortedImages = this.sortImages(timePointImages, rightSortedType);
			this._rightSlider.clearAll();
			this._rightSlider.parse(rightSortedImages);
		}
		else {
			this._leftTimePointButton.define("active", true);
			let leftSortedType = this._leftSort.getValue();
			if (leftSortedType === "") {
				this._leftSort.setValue(constants.MULTI_LESION_FILTERS.TIME);
				leftSortedType = this._leftSort.getValue();
			}
			const leftSortedImages = this.sortImages(timePointImages, leftSortedType);
			this._leftSlider.clearAll();
			this._leftSlider.parse(leftSortedImages);
		}
	}

	// Parse modality images to vertical slider
	parseModalityImages(item, lesionID, isRightSide) {
		const modality = lesionsModel.getItemModality(item);
		const modalityImages = webix.copy(lesionsModel.getModalityImages(lesionID, modality));
		if (isRightSide === true) {
			this._rightModalityButton.define("active", true);
			let rightSortedType = this._rightSort.getValue();
			if (rightSortedType === "") {
				this._rightSort.setValue(constants.MULTI_LESION_FILTERS.TIME);
				rightSortedType = this._rightSort.getValue();
			}
			const rightSortedImages = this.sortImages(modalityImages, rightSortedType);
			this._rightSlider.clearAll();
			this._rightSlider.parse(rightSortedImages);
		}
		else {
			this._leftModalityButton.define("active", true);
			let leftSortedType = this._leftSort.getValue();
			if (leftSortedType === "") {
				this._leftSort.setValue(constants.MULTI_LESION_FILTERS.TIME);
				leftSortedType = this._leftSort.getValue();
			}
			const leftSortedImages = this.sortImages(modalityImages, leftSortedType);
			this._leftSlider.clearAll();
			this._leftSlider.parse(leftSortedImages);
		}
	}

	changeWindowMode() {
		if (this._fullscreen) {
			this._fullscreen = false;
			this._window.define("width", 1240);
			this._window.define("height", 750);
			this._window.define("position", "center");
			this._fullScreenButton.show();
			this._windowedButton.hide();
		}
		else {
			this._fullscreen = true;
			this._window.define("width", window.innerWidth);
			this._window.define("height", window.innerHeight);
			this._window.define("position", "center");
			this._fullScreenButton.hide();
			this._windowedButton.show();
		}
		this.searchImagesByQueryHandler();
	}

	async searchImagesByQueryHandler() {
		let searchValue = this._searchInput.getValue().trim();
		this._searchInput.setValue(searchValue);
		let filteredImages = [];
		const filter = searchValue !== ""
			? this.buildCondition(searchValue)
			: null;
		const limit = Math.ceil(this._topSlider.$width / 174) - 1;
		this._topSlider.define("type", {width: this._topSlider.$width / limit, height: 104});
		const sourceParams = {
			limit,
			filter
		};
		this._topSlider.showProgress();
		let foundImages = {};
		try {
			foundImages = await ajax.getImages(sourceParams);
		}
		catch (e) {
			this._topSlider.hideProgress();
			return;
		}
		lesionWindowImagesUrls.setPrevImagesUrl(foundImages?.previous);
		lesionWindowImagesUrls.setNextImagesUrl(foundImages?.next);
		try {
			const allImagesArray = webix.copy(foundImages?.results ?? []);
			const foundImagesCount = foundImages.count ?? 0;
			allImagesArray.forEach((imageObj) => {
				filteredImages.push(imageObj);
			});
			if (foundImagesCount > 0) {
				this._topSlider.clearAll();
				this._topSlider.parse(filteredImages);
			}
			else {
				webix.alert(`Image with name "${searchValue}" was not found`);
			}
			this._topSlider.hideProgress();
		}
		catch (error) {
			if (!this._view.$destructed) {
				webix.alert(`Image with name "${searchValue}" was not found`);
				webix.message("Search Images: Something went wrong");
				this._topSlider.hideProgress();
			}
		}
	}

	async getImagesByUrl(url) {
		const result = ajax.getImagesByUrl(url);
		lesionWindowImagesUrls.setCurrImagesUrl(url);
		lesionWindowImagesUrls.setNextImagesUrl(url);
		lesionWindowImagesUrls.setPrevImagesUrl(url);
		return result.results;
	}

	fillRightPanel(image) {
		this._rightImage.parse(image);
		this._rightFooter.parse(image);
		this.setAnchorIcon(image, "right");
		const imageID = lesionsModel.getItemID(image);
		this._rightImageLabel.define("label", imageID.toUpperCase());
		this._rightImageLabel.refresh();
		const lesionID = lesionsModel.getItemLesionID(image);
		const mode = lesionsModel.getRightMode();
		const lesionImages = lesionsModel.getLesionImages(lesionID);
		this.deactivateRightControls();
		switch (mode) {
			case constants.MULTI_LESION_WINDOW_STATE.TIME:
				this._rightTimePointButton.define("active", true);
				this.parseTimePointImages(image, lesionID, true);
				break;
			case constants.MULTI_LESION_WINDOW_STATE.MODALITY:
				this._rightModalityButton.define("active", true);
				this.parseModalityImages(image, lesionID, true);
				break;
			case constants.MULTI_LESION_WINDOW_STATE.TOTAL:
				this._rightTotalButton.define("active", true);
				this._rightSlider.clearAll();
				this._rightSlider.parse(lesionImages);
				break;
			default:
				this._rightTotalButton.define("active", true);
				break;
		}
		const itemToSelect = this._rightSlider
			.find(obj => lesionsModel.getItemID(obj) === lesionsModel.getItemID(image), true);
		this._rightSlider.unselectAll();
		this._rightSlider.select(itemToSelect?.id);
		this.refreshRightControls();
	}

	fillLeftPanel(image) {
		this._leftImage.parse(image);
		this._leftFooter.parse(image);
		this.setAnchorIcon(image, "left");
		const imageID = lesionsModel.getItemID(image);
		this._leftImageLabel.define("label", imageID.toUpperCase());
		this._leftImageLabel.refresh();
		const lesionID = lesionsModel.getItemLesionID(image);
		const mode = lesionsModel.getLeftMode();
		const lesionImages = lesionsModel.getLesionImages(lesionID);
		this.deactivateLeftControls();
		switch (mode) {
			case constants.MULTI_LESION_WINDOW_STATE.TIME:
				this._leftTimePointButton.define("active", true);
				this.parseTimePointImages(image, lesionID);
				break;
			case constants.MULTI_LESION_WINDOW_STATE.MODALITY:
				this._leftModalityButton.define("active", true);
				this.parseModalityImages(image, lesionID);
				break;
			case constants.MULTI_LESION_WINDOW_STATE.TOTAL:
				this._leftTotalButton.define("active", true);
				this._leftSlider.clearAll();
				this._leftSlider.parse(lesionImages);
				break;
			default:
				this._leftTotalButton.define("active", true);
				break;
		}
		const itemToSelect = this._leftSlider
			.find(obj => lesionsModel.getItemID(obj) === lesionsModel.getItemID(image), true);
		this._leftSlider.unselectAll();
		this._leftSlider.select(itemToSelect?.id);
		this.refreshLeftControls();
	}

	deactivateLeftControls() {
		this._leftTimePointButton.define("active", false);
		this._leftModalityButton.define("active", false);
		this._leftTotalButton.define("active", false);
	}

	deactivateRightControls() {
		this._rightTimePointButton.define("active", false);
		this._rightModalityButton.define("active", false);
		this._rightTotalButton.define("active", false);
	}

	refreshLeftControls() {
		this._leftTimePointButton.refresh();
		this._leftModalityButton.refresh();
		this._leftTotalButton.refresh();
	}

	refreshRightControls() {
		this._rightTimePointButton.refresh();
		this._rightModalityButton.refresh();
		this._rightTotalButton.refresh();
	}

	buildCondition(filter) {
		const searchValues = filter.split(" OR ");
		const conditions = searchValues.map((str) => {
			const values = str.split(" AND ");
			return values.map((v) => {
				if (v.includes(":")) {
					return v;
				}
				return `isic_id:${v}`;
			}).join(" AND ");
		});
		return conditions.join(" OR ");
	}

	sortImages(images, type) {
		const sortedImages = [];
		switch (type) {
			case constants.MULTI_LESION_FILTERS.TIME:
				sortedImages.push(...images.sort((i1, i2) => {
					const t1 = lesionsModel.getItemTimePoint(i1);
					const t2 = lesionsModel.getItemTimePoint(i2);
					return t1 - t2;
				}));
				break;
			case constants.MULTI_LESION_FILTERS.TYPE:
				sortedImages.push(...images.sort((i1, i2) => {
					const t1 = lesionsModel.getItemModality(i1);
					const t2 = lesionsModel.getItemModality(i2);
					return t1.localeCompare(t2);
				}));
				break;
			case constants.MULTI_LESION_FILTERS.CONTR_DAY:
				sortedImages.push(...images);
				break;
			default:
				sortedImages.push(...images);
		}
		return sortedImages;
	}

	setAnchorIcon(image, side) {
		if (lesionsModel.checkIsImageAnchor(image)) {
			switch (side) {
				case "left":
					this._leftAnchorIcon.show();
					break;
				case "right":
					this._rightAnchorIcon.show();
					break;
				default:
					break;
			}
		}
		else {
			switch (side) {
				case "left":
					this._leftAnchorIcon.hide();
					break;
				case "right":
					this._rightAnchorIcon.hide();
					break;
				default:
					break;
			}
		}
	}
}
