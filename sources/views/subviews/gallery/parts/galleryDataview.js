import "../../../components/activeDataview";
import constants from "../../../../constants";
import galleryImageUrl from "../../../../models/galleryImagesUrls";
import lesionsModel from "../../../../models/lesionsModel";
import selectedImages from "../../../../models/selectedGalleryImages";
import state from "../../../../models/state";
import util from "../../../../utils/util";

function resizeButtonsLayout(layout, height) {
	layout.define("height", height);
	layout.resize();
}

function changeSelectedItem(item, value, dataview, studyFlag) {
	let imagesArray = [];
	item.markCheckbox = value;
	const galleryButtonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
	if (value) {
		if (state.toSelectByShift) {
			imagesArray = util.getImagesToSelectByShift(item, studyFlag, selectedImages, dataview, value);
		}
		else {
			imagesArray = [item];
		}
		if (studyFlag) {
			if (selectedImages.countForStudies() === 0) {
				let newStudyButton = $$(constants.NEW_STUDY_BUTTON_ID);
				resizeButtonsLayout(galleryButtonsLayout, 32);
				newStudyButton.show();
			}
			selectedImages.addForStudy(imagesArray);
		}
		else {
			if (selectedImages.count() === 0) {
				// TODO: uncomment after download will be implemented
				// let downloadMenu = $$(constants.DOWNLOAD_MENU_ID);
				// resizeButtonsLayout(galleryButtonsLayout, 32);
				// downloadMenu.show();
			}
			selectedImages.add(imagesArray);
		}
	}
	else {
		const deletedItemsDataCollection = selectedImages.getDeletedItemsDataCollection();
		if (state.toSelectByShift) {
			imagesArray = util.getImagesToSelectByShift(item, studyFlag, selectedImages, dataview, value);
		}
		else {
			deletedItemsDataCollection.clearAll();
			deletedItemsDataCollection.add(item);
			imagesArray = [item];
		}
		if (!studyFlag) {
			imagesArray.forEach((imageItem) => {
				selectedImages.remove(imageItem.isic_id);
			});

			if (selectedImages.count() === 0) {
				// TODO: uncomment after download will be implemented
				// let downloadMenu = $$(constants.DOWNLOAD_MENU_ID);
				// resizeButtonsLayout(galleryButtonsLayout, 1);
				// downloadMenu.hide();
			}
		}
		else {
			imagesArray.forEach((imageItem) => {
				selectedImages.removeImageFromStudies(imageItem.isic_id);
			});
			if (selectedImages.countForStudies() === 0) {
				let newStudyButton = $$(constants.NEW_STUDY_BUTTON_ID);
				resizeButtonsLayout(galleryButtonsLayout, 1);
				newStudyButton.hide();
			}
		}
	}
	if (studyFlag) {
		state.app.callEvent("changedAllSelectedImagesCount");
	}
	else {
		state.app.callEvent("changedSelectedImagesCount");
	}
	dataview.callEvent("onCheckboxItemClick", [imagesArray, value]);
}

const dataview = {
	view: "activeDataview",
	name: "galleryImagesDataviewName",
	css: "gallery-images-dataview",
	scroll: false,
	datathrottle: 500,
	onContext: {},
	template(obj, common) {
		const lesionID = lesionsModel.getItemLesionID(obj);
		const lesionImagesCount = lesionID ? lesionsModel.getLesionImagesCount(lesionID) : null;
		const lesionModalityImagesCount = lesionID
			? lesionsModel.getImagesWithModalityCount(obj)
			: null;
		const lesionTimePointImagesCount = lesionID
			? lesionsModel.getImagesWithTimePointsCount(obj)
			: null;
		const imageIconDimensions = util.getImageIconDimensions();
		let flagForStudies = selectedImages.getStudyFlag();
		// TODO check this when if study works
		if (flagForStudies) {
			// eslint-disable-next-line no-use-before-define
			let dataviewConfig = $$(getIdFromConfig());
			// TODO: find out why we use find
			// eslint-disable-next-line array-callback-return
			dataviewConfig.find((config) => {
				if (selectedImages.isSelectedInStudies(config.isic_id)) {
					config.markCheckbox = 1;
				}
			});
		}
		let checkedClass = obj.markCheckbox ? "is-checked" : "";
		const diagnosisIcon = obj.hasAnnotations ?
			`<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
				<span class="gallery-images-button diagnosis-icon tooltip-title">
					<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#diagnosis-icon" class="gallery-icon-use"></use>
					</svg>
				</span>
				<span class="tooltip-block tooltip-block-top" style="z-index: 1000000">Multirater</span>
			</div>` : "";
		const timePointsIconElementClass = lesionTimePointImagesCount > 0
			? "gallery-images-button-elem"
			: "gallery-images-button-elem-disabled";
		const timePointsIcon = `<div class="${timePointsIconElementClass} tooltip-container tooltip-gallery-images" style="height:${imageIconDimensions[0].height}px;width:${imageIconDimensions[0].width}px;">
			<span class="gallery-images-button time-attack tooltip-title">
				<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#time-attack" class="gallery-icon-use"></use>
				</svg>
			</span>
			<span class="tooltip-block tooltip-block-top" style="display: block">Multiple time points</span>
			<span class="gallery-images-badge">${lesionTimePointImagesCount ?? 0}</span>
		</div>`;
		const modalitiesIconElementClass = lesionModalityImagesCount > 0
			? "gallery-images-button-elem"
			: "gallery-images-button-elem-disabled";
		const modalitiesIcon = `<div class="${modalitiesIconElementClass} tooltip-container tooltip-gallery-images" style="height:${imageIconDimensions[0].height}px;width:${imageIconDimensions[0].width}px;">
			<span class="gallery-images-button layer-group tooltip-title">
				<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#layer-group" class="gallery-icon-use"></use>
				</svg>
			</span>
			<span class="tooltip-block tooltip-block-top" style="display: block">Multiple available modalities</span>
			<span class="gallery-images-badge">${lesionModalityImagesCount ?? 0}</span>
		</div>`;
		const totalIconElementClass = lesionImagesCount
			? "gallery-images-button-elem"
			: "gallery-images-button-elem-disabled";
		const totalIcons = `<div class="${totalIconElementClass} tooltip-container tooltip-gallery-images" style="height:${imageIconDimensions[0].height}px;width:${imageIconDimensions[0].width}px;">
			<span class="gallery-images-button sum-of-sum tooltip-title">
				<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sum-of-sum" class="gallery-icon-use"></use>
				</svg>
			</span>
			<span class="tooltip-block tooltip-block-top" style="display: block">Multiple images per lesion</span>
			<span class="gallery-images-badge">${lesionImagesCount ?? 0}</span>
		</div>`;
		const starHtml = obj.hasAnnotations ? "<span class='webix_icon fas fa-star gallery-images-star-icon'></span>" : "";
		if (typeof galleryImageUrl.getPreviewImageUrl(obj.isic_id) === "undefined") {
			galleryImageUrl.setPreviewImageUrl(
				obj.isic_id,
				obj.files.thumbnail_256.url
			); // to prevent sending query more than 1 time
		}
		return `<div class="gallery-images-container">
					<div class="check-layout ${checkedClass}" style="height: ${util.getImageHeight()}px; width: 100%; position: absolute; right:0px; top:${Math.floor((util.getDataviewItemHeight() - util.getImageHeight()) / 2)}px">
						<div class='gallery-images-info' style="height: ${util.getImageHeight()}px; position: absolute; right:0px;">
							<div class="gallery-images-header">
								<div class="gallery-images-checkbox"> ${common.markCheckbox(obj, common)}</div>
			        	        <div class="thumbnails-name" style="font-size: ${util.getNewThumnailsNameFontSize()}px">${obj.isic_id}</div>
							</div>
							<div class="gallery-images-buttons" style="bottom: ${imageIconDimensions[2]}px;">
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button resize-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#resize-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top" style="display: block">Enlarge</span>
								</div>
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button info-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#info-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top">Metadata</span>
								</div>
								<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images" style="width: ${imageIconDimensions[0].width}px; height: ${imageIconDimensions[0].height}px;">
									<span class="gallery-images-button batch-icon tooltip-title">
										<svg viewBox="0 0 26 26" class="gallery-icon-svg" style="width: ${imageIconDimensions[1].width}px; height: ${imageIconDimensions[1].height}px;">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#batch-icon" class="gallery-icon-use"></use>
										</svg>
									</span>
									<span class="tooltip-block tooltip-block-top">Download ZIP</span>
								</div>
								${timePointsIcon}
								${modalitiesIcon}
								${totalIcons}
								${diagnosisIcon}
							</div>
						</div>
						${starHtml}
						<img src="${galleryImageUrl.getPreviewImageUrl(obj.isic_id) || ""}" class="gallery-image" height="${util.getImageHeight()}"/>
					</div>
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
					let studyFlag = selectedImages.getStudyFlag();
					const datav = $$(dataview.id);
					const item = datav.getItem(this.config.$masterId);
					if (value
						&& (
							selectedImages.count() >= constants.MAX_COUNT_IMAGES_SELECTION
							|| selectedImages.countForStudies() >= constants.MAX_COUNT_IMAGES_SELECTION
						)
					) {
						datav.updateItem(item.id, {markCheckbox: oldValue});
						webix.alert({
							text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
						});
						return;
					}
					changeSelectedItem(item, value, datav, studyFlag);
				}
			}
		}
	}
};

function getConfig(id) {
	dataview.id = id || `dataview-${webix.uid()}`;
	return dataview;
}

function getIdFromConfig() {
	return dataview.id;
}

export default {
	getConfig,
	getIdFromConfig
};

