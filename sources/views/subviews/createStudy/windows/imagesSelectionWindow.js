import {JetView} from "webix-jet";

import constants from "../../../../constants";
import appliedFiltersModel from "../../../../models/appliedFilters";
import galleryImageUrl from "../../../../models/galleryImagesUrls";
import selectedImages from "../../../../models/selectedGalleryImages";
import state from "../../../../models/state";
import ajax from "../../../../services/ajaxActions";
import "../../../components/activeDataview";
import util from "../../../../utils/util";

const DATAVIEW_ID = "popUpDataviewId";

export default class ImagesSelectionWindow extends JetView {
	config() {
		const pager = {
			view: "pager",
			size: 80,
			height: 36,
			width: 250,
			master: false,
			template(obj, common) {
				return `${common.prev()} ${common.next()}`;
			},
			on: {
				onItemClick(id) {
					let offset = 0;
					const prevClickHandler = util.debounce(() => {
						const url = galleryImageUrl.getPrevImagesUrl() || null;
						offset = URLSearchParams(url).offset || 0;
						const callback = null;
						if (url) {
							$$(DATAVIEW_ID).loadNext(this.data.size, offset, callback, url);
						}
					});
					const nextClickHandler = util.debounce(() => {
						const url = galleryImageUrl.getNextImagesUrl() || null;
						offset = URLSearchParams(url).offset || 0;
						const callback = null;
						if (url) {
							$$(DATAVIEW_ID).loadNext(this.data.size, offset, callback, url);
						}
					});
					switch (id) {
						case "prev": {
							prevClickHandler();
							break;
						}
						case "next": {
							nextClickHandler();
							break;
						}
						default: {
							offset = 0;
							break;
						}
					}
				}
			}
		};
		const dataviewConfig = {
			view: "activeDataview",
			css: "gallery-images-dataview",
			datathrottle: 500,
			id: DATAVIEW_ID,
			minWidth: 800,
			template(obj, common) {
				// const IMAGE_HEIGHT = util.getDataviewItemHeight() - 10;
				// const IMAGE_WIDTH = util.getDataviewItemWidth();
				let flagForStudies = selectedImages.getStudyFlag();
				if (flagForStudies) {
					// eslint-disable-next-line array-callback-return
					$$(DATAVIEW_ID).find((dataviewObj) => {
						if (selectedImages.isSelectedInAddNewImagePopup(dataviewObj.isic_id)) {
							dataviewObj.markCheckbox = 1;
						}
					});
				}
				let checkedClass = obj.markCheckbox ? "is-checked" : "";
				if (typeof galleryImageUrl.getPreviewImageUrl(obj.isic_id) === "undefined") {
					// to prevent sending query more than 1 time
					galleryImageUrl.setPreviewImageUrl(obj.isic_id, obj.files.thumbnail_256.url);
					// ajax.getImage(obj._id, IMAGE_HEIGHT, IMAGE_WIDTH).then((data) => {
					// 	galleryImageUrl.setPreviewImageUrl(obj._id, URL.createObjectURL(data));
					// 	$$(dataview.id).refresh(obj.id);
					// });
				}
				return `<div class="gallery-images-container ${checkedClass}">
					<div class='gallery-images-info'>
						<div class="gallery-images-header">
							<div class="gallery-images-checkbox"> ${common.markCheckbox(obj, common)}</div>
							<div class="thumbnails-name" style="font-size: ${util.getImageNameFontSize()}px">${obj.name}</div>
						</div>
						<div class="gallery-images-buttons">
						</div>
					</div>

					<img src="${galleryImageUrl.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image" />
				</div>`;
			},
			borderless: true,
			type: {
				width: util.getDataviewItemWidth(),
				height: util.getDataviewItemHeight()
			},
			activeContent: {
				markCheckbox: {
					view: "checkbox",
					css: "checkbox-ctrl",
					width: 20,
					height: 30,
					on: {
						onChange(value, oldValue) {
							let imagesArray = [];
							const studyFlag = true;
							const createStudyDataview = true;
							const dataview = $$(DATAVIEW_ID);
							const item = dataview.getItem(this.config.$masterId);
							const deletedItemsDataCollection = selectedImages.getDeletedItemsDataCollection();
							const selectedImagesCount = selectedImages.countSelectedInAddNewImagePopup();
							if (value && selectedImagesCount >= constants.MAX_COUNT_IMAGES_SELECTION) {
								dataview.updateItem(item.id, {markCheckbox: oldValue});
								webix.alert({
									text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
								});
								return;
							}
							item.markCheckbox = value;

							if (state.toSelectByShift) {
								imagesArray = util.getImagesToSelectByShift(
									item,
									studyFlag,
									selectedImages,
									dataview,
									value,
									createStudyDataview
								);
							}
							else {
								deletedItemsDataCollection.clearAll();
								deletedItemsDataCollection.add(item);
								imagesArray = [item];
							}
							if (value) {
								selectedImages.addToSelectedInAddNewImagePopup(imagesArray);
							}
							else {
								imagesArray.forEach((image) => {
									selectedImages.removeFromSelectedInAddNewImagePopup(image.isic_id);
								});
							}
							dataview.parse(imagesArray);
							state.app.callEvent("changedStudyImageCount");
						}
					}
				}
			}
		};

		const selectionWindow = {
			view: "window",
			name: "nonModalWindow",
			head: {
				view: "toolbar",
				css: "window-header-toolbar",
				borderless: true,
				type: "clean",
				height: 32,
				cols: [
					{
						template: "Gallery",
						css: "window-header-toolbar-text main-subtitle2",
						borderless: true,
						autoheight: true
					},
					{gravity: 0.001},
					{
						view: "button",
						css: "window-close-button",
						label: '<svg viewBox="0 0 26 26" class="close-icon-svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use></svg>',
						type: "htmlbutton",
						width: 30,
						align: "right",
						on: {
							onItemClick: () => {
								this.close();
							}
						}
					},
					{width: 5}
				]
			},
			modal: true,
			position: "center",
			width: 923,
			height: 638,
			body: {
				name: "windowBodyTemplate",
				// eslint-disable-next-line quote-props
				css: {"background": "#E8EBF1"},
				rows: [
					{height: 10},
					{
						cols: [

							{width: 7},
							{
								css: "gallery-main-header",
								name: "popupSelectionTemplate",
								height: 30,
								template: () => {
									const selectedImagesCount = selectedImages.countSelectedInAddNewImagePopup();
									let text = `<span class='gallery-select-all-images-on-all-pages'> You have selected ${this.getImagesCount(selectedImagesCount)}`;
									if (selectedImagesCount) {
										return `${text} <span class='unselect-images-on-all-pages link'>Unselect all images</span>`;
									}
									return text;
								},
								borderless: true
							},
							pager,
							{width: 23}
						]
					},
					{height: 10},
					{
						cols: [
							{width: 6},
							dataviewConfig
						]
					},
					{height: 10},
					{
						cols: [
							{},
							{
								view: "button",
								css: "btn-contour",
								width: 100,
								height: 35,
								name: "cancelButton",
								value: "Cancel",
								click: () => this.close()
							},
							{width: 20},
							{
								view: "button",
								css: "btn",
								width: 100,
								height: 35,
								name: "saveStudyImagesButton",
								value: "Save",
								click: () => this.saveNewStudyImages()
							},
							{width: 33}
						]
					},
					{height: 15}
				]
			}
		};

		return selectionWindow;
	}

	ready() {
		this.view = this.getRoot();
		webix.extend(this.view, webix.ProgressBar);
		this.dataview = $$(DATAVIEW_ID);
		this.pager = this.getRoot().queryView({view: "pager"});
		this.selectionTemplate = this.getPopupSelectionTemplate();
		this.dataview.getNode().style.background = "#E8EBF1";
		this.selectionTemplate.getNode().style.background = "#E8EBF1";

		this.dataview.attachEvent("onDataRequest", (offset, limit) => {
			this.updateImagesDataview(offset, limit);
		});
		this.view.$scope.on(this.view.$scope.app, "changedStudyImageCount", () => {
			this.selectionTemplate.refresh();
		});

		this.selectionTemplate.define("onClick", {
			"unselect-images-on-all-pages": () => {
				this.unselectImages();
			}
		});
	}

	showWindow(imageDataview) {
		this.studyImagesDataview = imageDataview;
		state.app.callEvent("changedStudyImageCount");
		selectedImages.setStudyFlag(true);
		let selectedImagesArray;
		let selectedImagesArrayLength = selectedImages.countForStudies();
		if (selectedImagesArrayLength === 0) {
			selectedImagesArray = selectedImages.getImageObjectsFromLocalStorage();
		}
		else {
			selectedImagesArray = selectedImages.getStudyImagesId();
		}
		if (selectedImagesArray) {
			selectedImagesArray.forEach((selectedImage) => {
				selectedImages.addToSelectedInAddNewImagePopup(selectedImage);
			});
		}
		this.getRoot().show();
		this.load();
	}


	load() {
		// we should get maximum count of images once
		let appliedFilters = appliedFiltersModel.getAppliedFiltersFromLocalStorage();
		ajax.getHistogram(appliedFilters).then((data) => {
			state.imagesTotalCounts = data;
			const imagesCount = state.imagesTotalCounts.__passedFilters__[0].count;
			this.updatePagerCount(imagesCount);
		});
		this.reload();
	}

	reload() {
		let page = this.pager?.data?.page;
		let limit = this.pager?.data?.size;
		let offset = page * limit;
		// save promise to object. we need wait for its result before rendering images dataview
		if (offset >= 0 && limit) {
			this.updateImagesDataview(offset, limit); // load images first time
		}
	}

	updateImagesDataview(offset, limit) {
		let appliedFilters = appliedFiltersModel.getAppliedFiltersFromLocalStorage();
		const imagesPromise = ajax.getImages({
			limit,
			filter: appliedFilters
		});
		this.view.showProgress();
		webix.promise.all([
			imagesPromise
		])
			.then((results) => {
				this.dataview.clearAll();
				results.forEach((imageItem) => {
					this.dataview.parse(imageItem);
				});
				this.view.hideProgress();
			})
			.fail(() => {
				this.view.hideProgress();
			});
	}

	updatePagerCount(count) {
		if (count) {
			this.pager.define("count", count);
			this.pager.refresh();
		}
	}

	saveNewStudyImages() {
		let lengthOfSelectedImages = selectedImages.countSelectedInAddNewImagePopup();
		if (lengthOfSelectedImages === 0) {
			webix.alert({
				title: "Warning!",
				text: "At least one image should be selected for a study.",
				type: "confirm-warning"
			});
		}
		else {
			let selectedImagesInPopup = selectedImages.getSelectedInAddNewImagePopup();
			selectedImages.clearImagesForStudies();
			selectedImages.addForStudy(selectedImagesInPopup);
			this.studyImagesDataview.loadDataToDataview();
			webix.message("Study images were successfully updated!");
			this.close();
		}
	}

	getPopupSelectionTemplate() {
		return this.getRoot().queryView({name: "popupSelectionTemplate"});
	}

	getImagesCount(selectedImagesCount) {
		if (selectedImagesCount === 1) {
			return `${selectedImagesCount} image.`;
		}
		return `${selectedImagesCount} images.`;
	}

	unselectImages() {
		this.dataview.data.each((item) => {
			item.markCheckbox = 0;
		});
		selectedImages.clearSelectedInAddNewImagePopup();
		this.view.$scope.app.callEvent("changedStudyImageCount");
		this.dataview.refresh();
	}

	close() {
		selectedImages.clearSelectedInAddNewImagePopup();
		this.dataview.clearAll();
		this.getRoot().hide();
	}
}
