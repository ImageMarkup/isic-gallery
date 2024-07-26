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

const MOVE = {
	next: "next",
	prev: "prev",
};

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
		this._leftGroup = $$(multiImageLesionWindow.getLeftDropDownFilterID());
		this._rightGroup = $$(multiImageLesionWindow.getRightDropDownFilterID());
		this._leftImageLabel = $$(multiImageLesionWindow.getLeftImageNameLabelID());
		this._rightImageLabel = $$(multiImageLesionWindow.getRightImageNameLabelID());
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
		this._leftAnchorIcon = $$(multiImageLesionWindow.getLeftAnchorIconID());
		this._rightAnchorIcon = $$(multiImageLesionWindow.getRightAnchorIconID());
		this._topPanel = $$(multiImageLesionWindow.getTopPanelID());
		this._expandButton = $$(multiImageLesionWindow.getExpandButtonID());
		this._collapseButton = $$(multiImageLesionWindow.getCollapseButtonID());
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
			let url = navigate === MOVE.prev
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
		this._prevPageButton.attachEvent("onItemClick", navButtonClickHandler.bind(this, MOVE.prev));
		this._nextPageButton.attachEvent("onItemClick", navButtonClickHandler.bind(this, MOVE.next));

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

		const leftGroupByHandler = (type) => {
			const newType = type ?? this._leftGroup.getValue();
			const leftImage = lesionsModel.getLeftImage();
			const lesionID = lesionsModel.getItemLesionID(leftImage);
			const images = lesionsModel.getLesionImages(lesionID);
			const imagesGroups = this.groupImages(images, newType);
			this._leftSlider.clearAll();
			this._leftSlider.parse(imagesGroups);
			const selectedID = this._leftSlider.getSelectedId() ?? this._leftSlider.getFirstId();
			this._leftSlider.select(selectedID);
		};
		this._leftGroup.attachEvent("onChange", leftGroupByHandler.bind(this));
		this._leftGroup.attachEvent("onAfterRender", leftGroupByHandler.bind(this));
		const rightGroupByHandler = (type) => {
			const newType = type ?? this._rightGroup.getValue();
			const rightImage = lesionsModel.getRightImage();
			const lesionID = lesionsModel.getItemLesionID(rightImage);
			const images = lesionsModel.getLesionImages(lesionID);
			const imagesGroups = this.groupImages(images, newType);
			this._rightSlider.clearAll();
			this._rightSlider.parse(imagesGroups);
			const selectedID = this._rightSlider.getSelectedId() ?? this._rightSlider.getFirstId();
			this._rightSlider.select(selectedID);
		};
		this._rightGroup.attachEvent("onChange", rightGroupByHandler.bind(this));
		this._rightGroup.attachEvent("onAfterRender", rightGroupByHandler.bind(this));
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

		const changeImage = (side, move) => {
			if (side === constants.MULTI_LESION_SIDE.LEFT) {
				const currentImage = lesionsModel.getLeftImage();
				const newImage = move === MOVE.prev
					? lesionsModel.getPrevLeftImage(currentImage)
					: lesionsModel.getNextLeftImage(currentImage);
				if (newImage) {
					this.fillLeftPanel(newImage);
				}
			}
			if (side === constants.MULTI_LESION_SIDE.RIGHT) {
				const currentImage = lesionsModel.getRightImage();
				const newImage = move === MOVE.prev
					? lesionsModel.getPrevRightImage(currentImage)
					: lesionsModel.getNextRightImage(currentImage);
				if (newImage) {
					this.fillRightPanel(newImage);
				}
			}
		};

		this._leftImage.define("onClick", {
			prev: () => {
				changeImage(constants.MULTI_LESION_SIDE.LEFT, MOVE.prev);
			},
			next: () => {
				changeImage(constants.MULTI_LESION_SIDE.LEFT, MOVE.next);
			}
		});

		this._rightImage.define("onClick", {
			prev: () => {
				changeImage(constants.MULTI_LESION_SIDE.RIGHT, MOVE.prev);
			},
			next: () => {
				changeImage(constants.MULTI_LESION_SIDE.RIGHT, MOVE.next);
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

		this._topSlider.on_click["layer-group"] = (e, id) => {
			if (this._window) {
				const currentItem = this._topSlider.getItem(id);
				this.setMultiLesionState(
					currentItem,
				);
			}
		};

		this._collapseButton.attachEvent("onViewShow", () => {
			this._searchInput.show();
		});

		this._expandButton.attachEvent("onViewShow", () => {
			this._searchInput.hide();
		});

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

	setMultiLesionState(item) {
		lesionsModel.setCurrentItem(item);
		const lesionID = lesionsModel.getItemLesionID(item);
		const lesionImages = webix.copy(lesionsModel.getLesionImages(lesionID));
		const itemID = lesionsModel.getItemID(item);
		const anchorImageID = lesionsModel.getAnchorImageID(lesionID);
		if (itemID === anchorImageID) {
			const imageForRightPanel = lesionsModel.getFirstNonAnchorImage(lesionID, anchorImageID);
			this.fillRightPanel(imageForRightPanel);
			this._rightContainer.show();
		}
		else {
			this.fillRightPanel(item);
			this._rightContainer.show();
		}
		const anchorImg = lesionImages.find(i => lesionsModel.getItemID(i) === anchorImageID);
		this.fillLeftPanel(anchorImg);
	}

	parseImages(item, lesionID, isRightSide) {
		const lesionImages = lesionsModel.getLesionImages(lesionID);
		if (isRightSide === true) {
			let rightGroupType = this._rightGroup.getValue();
			if (rightGroupType === "") {
				this._rightGroup.setValue(constants.MULTI_LESION_GROUP_BY.TIME);
				rightGroupType = this._rightGroup.getValue();
			}
			const rightImagesGroups = this.groupImages(lesionImages, rightGroupType);
			let sortedImages;
			if (rightGroupType === constants.MULTI_LESION_GROUP_BY.NO_GROUP) {
				const images = rightImagesGroups.map(g => g.images[0]);
				sortedImages = this.sortImages(images, rightImagesGroups);
			}
			else {
				const currentImagesGroup = rightImagesGroups.find((g) => {
					const found = g.images
						.find(i => lesionsModel.getItemID(item) === lesionsModel.getItemID(i));
					return found;
				});
				sortedImages = this.sortImages(currentImagesGroup.images, rightGroupType);
			}
			lesionsModel.setCurrentRightImages(sortedImages);
			this._rightSlider.clearAll();
			this._rightSlider.parse(rightImagesGroups);
		}
		else {
			let leftGroupType = this._leftGroup.getValue();
			if (leftGroupType === "") {
				this._leftGroup.setValue(constants.MULTI_LESION_GROUP_BY.TIME);
				leftGroupType = this._leftGroup.getValue();
			}
			const leftImagesGroups = this.groupImages(lesionImages, leftGroupType);
			let sortedImages;
			if (leftGroupType === constants.MULTI_LESION_GROUP_BY.NO_GROUP) {
				const images = leftImagesGroups.map(g => g.images[0]);
				sortedImages = this.sortImages(images, leftGroupType);
			}
			else {
				const currentImagesGroup = leftImagesGroups.find((g) => {
					const found = g.images
						.find(i => lesionsModel.getItemID(item) === lesionsModel.getItemID(i));
					return found;
				});
				sortedImages = this.sortImages(currentImagesGroup.images, leftGroupType);
			}
			lesionsModel.setCurrentLeftImages(sortedImages);
			this._leftSlider.clearAll();
			this._leftSlider.parse(leftImagesGroups);
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
		lesionsModel.setRightImage(image);
		this._rightImage.parse(image);
		this._rightFooter.parse(image);
		this.setAnchorIcon(image, constants.MULTI_LESION_SIDE.RIGHT);
		const imageID = lesionsModel.getItemID(image);
		this._rightImageLabel.define("label", imageID.toUpperCase());
		this._rightImageLabel.refresh();
		const lesionID = lesionsModel.getItemLesionID(image);
		this.parseImages(image, lesionID, true);
		const itemToSelect = this._rightSlider
			.find(obj => lesionsModel.getItemID(obj) === lesionsModel.getItemID(image), true);
		this._rightSlider.unselectAll();
		this._rightSlider.select(itemToSelect?.id);
	}

	fillLeftPanel(image) {
		lesionsModel.setLeftImage(image);
		this._leftImage.parse(image);
		this._leftFooter.parse(image);
		this.setAnchorIcon(image, constants.MULTI_LESION_SIDE.LEFT);
		const imageID = lesionsModel.getItemID(image);
		this._leftImageLabel.define("label", imageID.toUpperCase());
		this._leftImageLabel.refresh();
		const lesionID = lesionsModel.getItemLesionID(image);
		this.parseImages(image, lesionID, false);
		const itemToSelect = this._leftSlider
			.find(obj => lesionsModel.getItemID(obj) === lesionsModel.getItemID(image), true);
		this._leftSlider.unselectAll();
		this._leftSlider.select(itemToSelect?.id);
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

	groupImages(images, type) {
		let imagesGroupsObj;
		switch (type) {
			case constants.MULTI_LESION_GROUP_BY.TIME:
				imagesGroupsObj = lesionsModel.groupByTimePoint(images);
				break;
			case constants.MULTI_LESION_GROUP_BY.TYPE:
				imagesGroupsObj = lesionsModel.groupByModality(images);
				break;
			case constants.MULTI_LESION_GROUP_BY.COMBINATION:
				imagesGroupsObj = lesionsModel.groupByTimePointAndModality(images);
				break;
			default:
				imagesGroupsObj = lesionsModel.groupByID(images);
		}
		const imagesGroupsObjectKeys = Object.keys(imagesGroupsObj);
		const result = imagesGroupsObjectKeys.map((k) => {
			const imgsGroup = {
				groupBy: type,
				groupValue: k,
				images: imagesGroupsObj[k],
			};
			return imgsGroup;
		});
		return result;
	}

	sortImages(images, groupType) {
		const sortedImages = images.sort((a, b) => {
			let result;
			let aValue;
			let bValue;
			switch (groupType) {
				case constants.MULTI_LESION_GROUP_BY.TIME:
					aValue = lesionsModel.getItemModality(a);
					bValue = lesionsModel.getItemModality(b);
					result = aValue.localeCompare(bValue);
					if (result === 0) {
						aValue = lesionsModel.getItemID(a);
						bValue = lesionsModel.getItemID(b);
						result = aValue.localeCompare(bValue);
					}
					break;
				case constants.MULTI_LESION_GROUP_BY.TYPE:
					aValue = lesionsModel.getItemTimePoint(a);
					bValue = lesionsModel.getItemTimePoint(b);
					result = Number(aValue) - Number(bValue);
					if (result === 0) {
						aValue = lesionsModel.getItemID(a);
						bValue = lesionsModel.getItemID(b);
						result = aValue.localeCompare(bValue);
					}
					break;
				case constants.MULTI_LESION_GROUP_BY.COMBINATION:
					aValue = lesionsModel.getItemID(a);
					bValue = lesionsModel.getItemID(b);
					result = aValue.localeCompare(bValue);
					break;
				default:
					aValue = lesionsModel.getItemID(a);
					bValue = lesionsModel.getItemID(b);
					result = aValue.localeCompare(bValue);
			}
			return result;
		});
		return sortedImages;
	}

	setAnchorIcon(image, side) {
		if (lesionsModel.checkIsImageAnchor(image)) {
			switch (side) {
				case constants.MULTI_LESION_SIDE.LEFT:
					this._leftAnchorIcon.show();
					break;
				case constants.MULTI_LESION_SIDE.RIGHT:
					this._rightAnchorIcon.show();
					break;
				default:
					break;
			}
		}
		else {
			switch (side) {
				case constants.MULTI_LESION_SIDE.LEFT:
					this._leftAnchorIcon.hide();
					break;
				case constants.MULTI_LESION_SIDE.RIGHT:
					this._rightAnchorIcon.hide();
					break;
				default:
					break;
			}
		}
	}
}
