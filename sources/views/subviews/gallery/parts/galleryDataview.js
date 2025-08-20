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
	template(obj) {
		const lesionID = lesionsModel.getItemLesionID(obj);
		const lesion = lesionsModel.getLesionByID(lesionID);
		const lesionModalitiesCount = lesionID
			? lesionsModel.getLesionModalitiesCount(lesionID)
			: 0;
		const lesionTimePointsCount = lesionID
			? lesionsModel.getLesionTimePointsCount(lesionID)
			: 0;
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

		const checkedClass = obj.markCheckbox ? "is-checked" : "";
		const lesionIconBadges = `
			${util.getIconBadge(lesionTimePointsCount, "Lesion time points count", lesion, true)}
			${util.getIconBadge(lesionModalitiesCount, "Lesion modalities count", lesion, false)}
		`;
		const diagnosisIcon = obj.hasAnnotations
			? util.getIconButton("diagnosis-icon", true, "Multirater", "", "")
			: "";

		const starHtml = obj.hasAnnotations ? "<span class='webix_icon fas fa-star gallery-images-star-icon'></span>" : "";
		if (typeof galleryImageUrl.getPreviewImageUrl(obj.isic_id) === "undefined") {
			galleryImageUrl.setPreviewImageUrl(
				obj.isic_id,
				obj.files.thumbnail_256.url
			); // to prevent sending query more than 1 time
		}
		return `<div class="gallery-images-container">
					<div class="check-layout ${checkedClass}" style="height: ${util.getImageHeight()}px; width: 100%; position: absolute; right:0px; top:${Math.floor((util.getDataviewItemHeight() - util.getImageHeight()) / 2)}px">
						<div class='gallery-images-info' style="height: ${util.getImageHeight()}px;">
							<div class="gallery-images-header">
								<div class="thumbnails-name">${obj.isic_id}</div>
								<input type="checkbox" class="gtm-image-selection gallery-images-checkbox" ${obj.markCheckbox ? "checked" : ""}>
							</div>
							<div class="gallery-images-buttons">
								${util.getIconButton("resize-icon", true, "Enlarge", "gtm-image-enlargement", "")}
								${util.getIconButton("info-icon", true, "Metadata", "gtm-image-metadata", "")}
								${util.getIconButton("batch-icon", true, "Download ZIP", "gtm-single-download", "")}
								${util.getIconButton("layer-group", lesion, "Lesion", "gtm-lesion-viewer", lesionIconBadges)}
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
	onClick: {
		"gallery-images-checkbox"(event, id, checkbox) {
			const studyFlag = selectedImages.getStudyFlag();
			const item = this.getItem(id);
			const value = checkbox.checked;
			if (value
				&& (
					selectedImages.count() >= constants.MAX_COUNT_IMAGES_SELECTION
					|| selectedImages.countForStudies() >= constants.MAX_COUNT_IMAGES_SELECTION
				)
			) {
				this.updateItem(id, {markCheckbox: !value});
				webix.alert({
					text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
				});
				return;
			}
			changeSelectedItem(item, value, this, studyFlag);
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

