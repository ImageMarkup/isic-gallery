import {createZoomableImage, restoreImageViewExtent} from "app-services/zoomImages";

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
		const initZoomableImage = async (imageObj) => {
			imageObj._zoomableImageProperties = await createZoomableImage(
				this.getZoomableImageNode(imageObj.$view)
			);
		};

		const images = [this._leftImage, this._rightImage];
		images.forEach((imageObj) => {
			imageObj.attachEvent("onBeforeRender", this.updateImage);
			imageObj.attachEvent("onAfterRender", async () => {
				await initZoomableImage(imageObj);
			});
			imageObj.attachEvent("onAfterLoad", this.updateImage);
		});

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
		this._searchInput.attachEvent("onViewShow", this.searchImagesByQueryHandler.bind(this));
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
		this._window.attachEvent("onShow", () => {
			this._leftGroup.setValue(constants.MULTI_LESION_GROUP_BY.TIME);
			this._rightGroup.setValue(constants.MULTI_LESION_GROUP_BY.TIME);
			const leftImage = lesionsModel.getLeftImage();
			const leftLesionId = lesionsModel.getItemLesionID(leftImage);
			const LeftLesionImages = lesionsModel.getLesionImages(leftLesionId);
			const leftType = this._leftGroup.getValue();
			const leftImagesGroups = this.groupImages(LeftLesionImages, leftType);
			if (leftImagesGroups.length === 1) {
				this._leftGroup.setValue(constants.MULTI_LESION_GROUP_BY.TYPE);
				this._leftGroup.refresh();
			}

			const rightImage = lesionsModel.getRightImage();
			const rightLesionId = lesionsModel.getItemLesionID(rightImage);
			const rightLesionImages = lesionsModel.getLesionImages(rightLesionId);
			const rightType = this._rightGroup.getValue();
			const rightImagesGroups = this.groupImages(rightLesionImages, rightType);
			if (rightImagesGroups.length === 1) {
				this._rightGroup.setValue(constants.MULTI_LESION_GROUP_BY.TYPE);
				this._rightGroup.refresh();
			}

			if (this._topPanel.isVisible()) {
				this._collapseButton.hide();
				this._topPanel.hide();
				this._expandButton.show();
			}
		});

		const leftGroupByHandler = () => {
			const leftImage = lesionsModel.getLeftImage();
			this.fillLeftPanel(leftImage);
		};

		this._leftGroup.attachEvent("onChange", leftGroupByHandler.bind(this));

		const rightGroupByHandler = () => {
			const rightImage = lesionsModel.getRightImage();
			this.fillRightPanel(rightImage);
		};

		this._rightGroup.attachEvent("onChange", rightGroupByHandler.bind(this));

		this._rightSlider.attachEvent("onBeforeDrop", () => false);
		this._topSlider.attachEvent("onBeforeDrop", () => false);
		this._leftSlider.attachEvent("onBeforeDrop", () => false);
		const leftImageView = this._leftImage.$view;
		const rightImageView = this._rightImage.getNode();
		webix.DragControl.addDrop(leftImageView, {$drop: (/* source, target, event */) => {
			const dnd = webix.DragControl.getContext();
			const item = dnd.from.getItem(dnd.start);
			const image = item.firstImage ?? item;
			const lesionID = lesionsModel.getItemLesionID(image);
			if (lesionID) {
				lesionsModel.setLeftImage(image);
				this.fillLeftPanel(image);
			}
			else {
				webix.message("There are no lesions attached to this image");
			}
		}});
		webix.DragControl.addDrop(rightImageView, {$drop: (/* source, target, event */) => {
			const dnd = webix.DragControl.getContext();
			const item = dnd.from.getItem(dnd.start);
			const image = item.firstImage ?? item;
			const lesionID = lesionsModel.getItemLesionID(image);
			if (lesionID) {
				lesionsModel.setRightImage(image);
				this.fillRightPanel(image);
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
		this._rightContainer.show();
		let rightGroupType = this._rightGroup.getValue();
		let imageForRightPanel;
		if (itemID === anchorImageID) {
			imageForRightPanel = lesionsModel.getFirstNonAnchorImage(lesionID, anchorImageID);
		}
		else {
			imageForRightPanel = item;
		}
		lesionsModel.setRightImage(imageForRightPanel);
		if (rightGroupType === "") {
			this._rightGroup.setValue(constants.MULTI_LESION_GROUP_BY.TIME);
			rightGroupType = this._rightGroup.getValue();
		}
		this.fillRightPanel(imageForRightPanel);

		let leftGroupType = this._leftGroup.getValue();
		if (leftGroupType === "") {
			this._leftGroup.setValue(constants.MULTI_LESION_GROUP_BY.TYPE);
			leftGroupType = this._leftGroup.getValue();
		}
		const anchorImg = lesionImages.find(i => lesionsModel.getItemID(i) === anchorImageID);
		this.fillLeftPanel(anchorImg);
	}

	parseImages(item, lesionID, isRightSide) {
		const lesionImages = lesionsModel.getLesionImages(lesionID);
		if (isRightSide === true) {
			let rightGroupType = this._rightGroup.getValue();
			const rightImagesGroups = this.groupImages(lesionImages, rightGroupType);
			const sortedImages = this.sortImages(rightImagesGroups, rightGroupType, item);
			lesionsModel.setCurrentRightImages(sortedImages);
			this._rightSlider.clearAll();
			this._rightSlider.parse(rightImagesGroups);
			this._rightSlider.unselectAll();
			const groupToSelect = this.findItemToSelect(rightImagesGroups, item);
			this._rightSlider.select(groupToSelect.id);
		}
		else {
			let leftGroupType = this._leftGroup.getValue();
			const leftImagesGroups = this.groupImages(lesionImages, leftGroupType);
			const sortedImages = this.sortImages(leftImagesGroups, leftGroupType, item);
			lesionsModel.setCurrentLeftImages(sortedImages);
			this._leftSlider.clearAll();
			this._leftSlider.parse(leftImagesGroups);
			this._leftSlider.unselectAll();
			const groupToSelect = this.findItemToSelect(leftImagesGroups, item);
			this._leftSlider.select(groupToSelect.id);
		}
	}

	getZoomableImageNode(containerNode) {
		return containerNode.getElementsByClassName("zoomable-image")[0];
	}

	changeWindowMode() {
		if (this._fullscreen) {
			this._fullscreen = false;
			this._window.define("width", this._window.config.initialWidth);
			this._window.define("height", this._window.config.initialHeight);
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

		const images = [this._leftImage, this._rightImage];
		images.forEach((imageObj) => {
			restoreImageViewExtent(imageObj._zoomableImageProperties, 
				this.getZoomableImageNode(imageObj.$view));
		});

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
		this._rightFooter.parse(image);
		this.setAnchorIcon(image, constants.MULTI_LESION_SIDE.RIGHT);
		const imageID = lesionsModel.getItemID(image);
		this._rightImageLabel.define("label", imageID.toUpperCase());
		this._rightImageLabel.refresh();
		const lesionID = lesionsModel.getItemLesionID(image);
		this.parseImages(image, lesionID, true);
		this._rightImage.parse(image);
	}

	fillLeftPanel(image) {
		lesionsModel.setLeftImage(image);
		this._leftFooter.parse(image);
		this.setAnchorIcon(image, constants.MULTI_LESION_SIDE.LEFT);
		const imageID = lesionsModel.getItemID(image);
		this._leftImageLabel.define("label", imageID.toUpperCase());
		this._leftImageLabel.refresh();
		const lesionID = lesionsModel.getItemLesionID(image);
		this.parseImages(image, lesionID, false);
		this._leftImage.parse(image);
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
				firstImage: imagesGroupsObj[k][0],
				groupBy: type,
				groupValue: k,
				images: imagesGroupsObj[k],
			};
			return imgsGroup;
		});
		return result;
	}

	sortImages(imagesGroups, groupType, item) {
		let images;
		if (groupType === constants.MULTI_LESION_GROUP_BY.NO_GROUP) {
			images = imagesGroups.map(g => g.images[0]);
			imagesGroups.sort((a, b) => {
				const aValue = lesionsModel.getItemID(a.images[0]);
				const bValue = lesionsModel.getItemID(b.images[0]);
				const result = aValue.localeCompare(bValue);
				return result;
			});
		}
		else {
			switch (groupType) {
				case constants.MULTI_LESION_GROUP_BY.TIME:
					imagesGroups.sort((a, b) => {
						const aValue = a.groupValue;
						const bValue = b.groupValue;
						return Number(aValue) - Number(bValue);
					});
					break;
				case constants.MULTI_LESION_GROUP_BY.TYPE:
					imagesGroups.sort((a, b) => {
						const aValue = a.groupValue;
						if (aValue === constants.MULTI_LESION_TYPE_PRIORITY.FIRST) {
							return -1;
						}
						const bValue = b.groupValue;
						if (bValue === constants.MULTI_LESION_TYPE_PRIORITY.FIRST) {
							return 1;
						}
						return aValue.localeCompare(bValue);
					});
					break;
				case constants.MULTI_LESION_GROUP_BY.COMBINATION:
					imagesGroups.sort((a, b) => {
						const aValue = a.groupValue;
						const bValue = b.groupValue;
						return aValue.localeCompare(bValue);
					});
					break;
				default:
					imagesGroups.sort((a, b) => {
						const aValue = a.value;
						const bValue = b.value;
						return aValue.localeCompare(bValue);
					});
			}
			const currentImagesGroup = imagesGroups.find((g) => {
				const found = g.images
					.find(i => lesionsModel.getItemID(item) === lesionsModel.getItemID(i));
				return found;
			});
			images = [...currentImagesGroup.images];
		}
		if (images.length === 1) {
			return images;
		}
		const sortedImages = images.sort((a, b) => {
			let result;
			let aValue;
			let bValue;
			switch (groupType) {
				case constants.MULTI_LESION_GROUP_BY.TIME:
					aValue = lesionsModel.getItemModality(a);
					if (aValue === constants.MULTI_LESION_TYPE_PRIORITY.FIRST) {
						result = -1;
					}
					else {
						bValue = lesionsModel.getItemModality(b);
						if (bValue === constants.MULTI_LESION_TYPE_PRIORITY.FIRST) {
							result = 1;
						}
						else {
							result = aValue.localeCompare(bValue);
						}
						if (result === 0) {
							aValue = lesionsModel.getItemID(a);
							bValue = lesionsModel.getItemID(b);
							result = aValue.localeCompare(bValue);
						}
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

	findItemToSelect(groups, image) {
		const groupToSelect = groups.find((obj) => {
			if (obj.images) {
				if (obj.images.find(i => lesionsModel.getItemID(i) === lesionsModel.getItemID(image))) {
					return true;
				}
				return false;
			}
			return lesionsModel.getItemID(obj) === lesionsModel.getItemID(image);
		});
		return groupToSelect;
	}
}
