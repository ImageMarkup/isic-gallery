import constants from "../../constants";
import galleryImagesUrls from "../../models/galleryImagesUrls";
import lesionWindowImagesUrls from "../../models/lesionWindowImagesUrls";
import lesionsModel from "../../models/lesionsModel";
import util from "../../utils/util";
import multiImageLesionWindow from "../../views/subviews/gallery/windows/multiImageLesionWindow";
import ajax from "../ajaxActions";
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
		this._leftButton1 = $$(multiImageLesionWindow.getLeftTimePointButtonID());
		this._leftButton2 = $$(multiImageLesionWindow.getLeftModalityButtonID());
		this._leftButton3 = $$(multiImageLesionWindow.getLeftTotalButtonID());
		this._rightButton1 = $$(multiImageLesionWindow.getRightTimePointButtonID());
		this._rightButton2 = $$(multiImageLesionWindow.getRightModalityButtonID());
		this._rightButton3 = $$(multiImageLesionWindow.getRightTotalButtonID());
		this._leftSort = $$(multiImageLesionWindow.getLeftDropDownFilterID());
		this._rightSort = $$(multiImageLesionWindow.getRightDropDownFilterID());
		this._leftImageLabel = $$(multiImageLesionWindow.getLeftImageNameLabelID());
		this._rightImageLabel = $$(multiImageLesionWindow.getRightImageNameLabelID());
		this._resizer = $$(multiImageLesionWindow.getResizerID());
		this._rightContainer = $$(multiImageLesionWindow.getRightContainerID());
		this._leftImage = $$(multiImageLesionWindow.getLeftImageID());
		this._rightImage = $$(multiImageLesionWindow.getRightImageID());
		this._fullScreenButton = $$(multiImageLesionWindow.getFullScreenButtonID());
		this._windowedButton = $$(multiImageLesionWindow.getWindowedButtonID());
		/** @type {webix.ui.search} */
		this._searchInput = $$(multiImageLesionWindow.getSearchID());
		this._prevPageButton = $$(multiImageLesionWindow.getPrevPageButtonID());
		this._nextPageButton = $$(multiImageLesionWindow.getNextPageButtonID());
		this._multilesionState = null;
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

		const prevClickHandler = util.debounce(() => {
			let url = lesionWindowImagesUrls.getPrevImagesUrl() || null;
			const visibleImagesCount = this._topSlider.getVisibleCount();
			if (url) {
				lesionWindowImagesUrls.setCurrImagesUrl(url);
				this._topSlider.loadNext(visibleImagesCount);
			}
		}, 100);
		const nextClickHandler = util.debounce(() => {
			let url = lesionWindowImagesUrls.getNextImagesUrl() || null;
			const visibleImagesCount = this._topSlider.getVisibleCount();
			if (url) {
				lesionWindowImagesUrls.setCurrImagesUrl(url);
				this._topSlider.loadNext(visibleImagesCount);
			}
		}, 100);
		this._prevPageButton.attachEvent("onItemClick", prevClickHandler);
		this._nextPageButton.attachEvent("onItemClick", nextClickHandler);

		const clearWindow = () => {
			this._leftSlider.clearAll();
			this._rightSlider.clearAll();
			this._topSlider.clearAll();
			this._searchInput.setValue("");
		};
		this._window.attachEvent("onHide", clearWindow);
		this._window.attachEvent("onShow", this.searchImagesByQueryHandler.bind(this));

		this._leftButton1.attachEvent("onItemClick", () => {
			const currentItem = lesionsModel.getCurrentItem();
			const lesionID = this.getItemLesionID(currentItem);
			const timePoint = this.getItemTimePoint(currentItem);
			const timePointImages = lesionsModel.getTimePointImages(lesionID, timePoint);
			this._leftSlider.clearAll();
			this._leftSlider.parse(timePointImages);
		});
		this._leftButton2.attachEvent("onItemClick", () => {
			const currentItem = lesionsModel.getCurrentItem();
			const lesionID = this.getItemLesionID(currentItem);
			const modality = this.getItemModality(currentItem);
			const modalityImages = lesionsModel.getModalityImages(lesionID, modality);
			this._leftSlider.clearAll();
			this._leftSlider.parse(modalityImages);
		});
		this._leftButton3.attachEvent("onItemClick", () => {
			const currentItem = lesionsModel.getCurrentItem();
			const lesionID = this.getItemLesionID(currentItem);
			const images = lesionsModel.getLesionImages(lesionID);
			this._leftSlider.clearAll();
			this._leftSlider.parse(images);
		});
		this._rightButton1.attachEvent("onItemClick", () => {
			const currentItem = lesionsModel.getCurrentItem();
			const lesionID = this.getItemLesionID(currentItem);
			const timePoint = this.getItemTimePoint(currentItem);
			const timePointImages = lesionsModel.getTimePointImages(lesionID, timePoint);
			this._rightSlider.clearAll();
			this._rightSlider.parse(timePointImages);
		});
		this._rightButton2.attachEvent("onItemClick", () => {
			const currentItem = lesionsModel.getCurrentItem();
			const lesionID = this.getItemLesionID(currentItem);
			const modality = this.getItemModality(currentItem);
			const modalityImages = lesionsModel.getModalityImages(lesionID, modality);
			this._rightSlider.clearAll();
			this._rightSlider.parse(modalityImages);
		});
		this._rightButton3.attachEvent("onItemClick", () => {
			const currentItem = lesionsModel.getCurrentItem();
			const lesionID = this.getItemLesionID(currentItem);
			const images = lesionsModel.getLesionImages(lesionID);
			this._rightSlider.clearAll();
			this._rightSlider.parse(images);
		});
		this._leftSort.attachEvent("onChange", (type) => {
			const images = this._leftSlider.serialize();
			const sortedImages = this.sortImages(images, type);
			this._leftSlider.clearAll();
			this._leftSlider.parse(sortedImages);
		});
		this._rightSort.attachEvent("onChange", (type) => {
			const images = this._rightSlider.serialize();
			const sortedImages = this.sortImages(images, type);
			this._rightSlider.clearAll();
			this._rightSlider.parse(sortedImages);
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

	setMultiLesionState(item, group) {
		lesionsModel.setCurrentItem(item);
		const lesionID = this.getItemLesionID(item);
		const lesionImages = webix.copy(lesionsModel.getLesionImages(lesionID));
		const itemID = this.getItemID(item);
		const anchorImageID = lesionsModel.getAnchorImageID(lesionID);
		if (itemID !== anchorImageID) {
			this._rightContainer.show();
			this.fillRightPanel(item);
		}
		else {
			this._rightContainer.hide();
		}
		const anchorImg = lesionImages.find(i => this.getItemID(i) === anchorImageID);
		this.fillLeftPanel(anchorImg);

		switch (group) {
			case constants.MULTI_LESION_WINDOW_STATE.TIME:
				this.parseTimePointImages(item, lesionID);
				break;
			case constants.MULTI_LESION_WINDOW_STATE.MODALITY:
				this.parseModalityImages(item, lesionID);
				break;
			case constants.MULTI_LESION_WINDOW_STATE.TOTAL:
				this._leftSlider.parse(lesionImages);
				this._rightSlider.parse(lesionImages);
				break;
			default:
				break;
		}
	}

	parseTimePointImages(item, lesionID) {
		const timePoint = this.getItemTimePoint(item);
		const timePointImages = webix.copy(lesionsModel.getTimePointImages(lesionID, timePoint));
		const leftSortedType = this._leftSort.getValue();
		const leftSortedImages = this.sortImages(timePointImages, leftSortedType);
		const rightSortedType = this._rightSort.getValue();
		const rightSortedImages = this.sortImages(timePointImages, rightSortedType);
		this._leftSlider.parse(leftSortedImages);
		this._rightSlider.parse(rightSortedImages);
	}

	parseModalityImages(item, lesionID) {
		const modality = this.getItemModality(item);
		const modalityImages = webix.copy(lesionsModel.getModalityImages(lesionID, modality));
		const leftSortedType = this._leftSort.getValue();
		const leftSortedImages = this.sortImages(modalityImages, leftSortedType);
		const rightSortedType = this._rightSort.getValue();
		const rightSortedImages = this.sortImages(modalityImages, rightSortedType);
		this._leftSlider.parse(leftSortedImages);
		this._rightSlider.parse(rightSortedImages);
	}

	changeWindowMode() {
		if (this._window.config.fullscreen) {
			this._window.define("fullscreen", false);
			this._fullScreenButton.show();
			this._windowedButton.hide();
		}
		else {
			this._window.define("fullscreen", true);
			this._fullScreenButton.hide();
			this._windowedButton.show();
		}
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

		const foundImages = await ajax.getImages(sourceParams);
		lesionWindowImagesUrls.setPrevImagesUrl(foundImages.previous);
		lesionWindowImagesUrls.setNextImagesUrl(foundImages.next);
		try {
			const allImagesArray = webix.copy(foundImages.results);
			const foundImagesCount = foundImages.count;
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

	getItemLesionID(item) {
		return item?.metadata?.clinical?.lesion_id;
	}

	getItemID(item) {
		return item?.isic_id;
	}

	getItemTimePoint(item) {
		return item?.metadata?.clinical?.acquisition_day;
	}

	getItemModality(item) {
		return item?.metadata?.acquisition?.image_type;
	}

	fillRightPanel(image) {
		this._rightImage.parse(image);
		this._rightFooter.parse(image);
		const imageID = this.getItemID(image);
		this._rightImageLabel.define("label", imageID.toUpperCase());
	}

	fillLeftPanel(image) {
		this._leftImage.parse(image);
		this._leftFooter.parse(image);
		const imageID = this.getItemID(image);
		this._leftImageLabel.define("label", imageID.toUpperCase());
	}

	buildCondition(filter) {
		const searchValues = filter.split(" OR ");
		const conditions = searchValues.map((str) => {
			const values = str.split(" and ");
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
					const t1 = this.getItemTimePoint(i1);
					const t2 = this.getItemTimePoint(i2);
					return t1 < t2;
				}));
				break;
			case constants.MULTI_LESION_FILTERS.TYPE:
				sortedImages.push(...images.sort((i1, i2) => {
					const t1 = this.getItemModality(i1);
					const t2 = this.getItemModality(i2);
					return t1 < t2;
				}));
				break;
			default:
				sortedImages.push(...images);
		}
		return sortedImages;
	}
}
