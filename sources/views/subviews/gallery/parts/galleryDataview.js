import "../../../components/activeDataview";
import selectedImages from "../../../../models/selectedGalleryImages";
import state from "../../../../models/state";
import ajax from "../../../../services/ajaxActions";
import galleryImageUrl from "../../../../models/galleryImagesUrls";
import constants from "../../../../constants";
import util from "../../../../utils/util";

function resizeButtonsLayout(layout, height) {
	layout.define("height", height);
	layout.resize();
}

function changeSelectedItem(item, value, dataview, config, studyFlag) {
	item.markCheckbox = value;
	let galleryButtonsLayout = $$(constants.DOWNLOAD_AND_CREATE_STUDY_BUTTON_LAYOUT_ID);
	if (value) {
		if (!studyFlag) {
			if (selectedImages.count() === 0) {
				let downloadMenu = $$(constants.DOWNLOAD_MENU_ID);
				resizeButtonsLayout(galleryButtonsLayout, 32);
				downloadMenu.show();
			}
			selectedImages.add(item._id);
		} else {
			if (selectedImages.countForStudies() === 0) {
				let newStudyButton = $$(constants.NEW_STUDY_BUTTON_ID);
				resizeButtonsLayout(galleryButtonsLayout, 32);
				newStudyButton.show();
			}
			selectedImages.addForStudy({
				id: item._id,
				name: item.name
			});
		}

	} else {
		if (!studyFlag) {
			selectedImages.remove(item._id);
			if (selectedImages.count() === 0) {
				let downloadMenu = $$(constants.DOWNLOAD_MENU_ID);
				resizeButtonsLayout(galleryButtonsLayout, 1);
				downloadMenu.hide();
			}
		} else {
			selectedImages.removeImageFromStudies(item._id);
			if (selectedImages.countForStudies() === 0) {
				let newStudyButton = $$(constants.NEW_STUDY_BUTTON_ID);
				resizeButtonsLayout(galleryButtonsLayout, 1);
				newStudyButton.hide();
			}
		}

	}
	dataview.updateItem(config.$masterId, item);
	if (!studyFlag) {
		state.app.callEvent("changedSelectedImagesCount");
	} else {
		state.app.callEvent("changedAllSelectedImagesCount");
	}
	dataview.callEvent("onCheckboxItemClick", [item]);
}

const dataview = {
	view: "activeDataview",
	css: "gallery-images-dataview",
	datathrottle: 500,
	minWidth: 800,
	template(obj, common) {
		const IMAGE_HEIGHT = util.getDataviewItemHeight() - 10;
		const IMAGE_WIDTH = util.getDataviewItemWidth();
		let flagForStudies = selectedImages.getStudyFlag();
		if (flagForStudies) {
			let dataview = $$(getIdFromConfig());
			dataview.find((obj) => {
				if (selectedImages.isSelectedInStudies(obj._id)){
					obj.markCheckbox = 1;
				}
			});
		}
		let checkedClass = obj.markCheckbox ? "is-checked" : "";
		const diagnosisIcon = obj.hasAnnotations ?
			`<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images">
				<span class="gallery-images-button diagnosis-icon tooltip-title">
					<svg viewBox="0 0 26 26" class="gallery-icon-svg">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#diagnosis-icon" class="gallery-icon-use"></use>
					</svg>
				</span>
				<span class="tooltip-block tooltip-block-top">Multirater</span>
			</div>` : "";
		const starHtml = obj.hasAnnotations ? "<span class='webix_icon fa-star gallery-images-star-icon'></span>" : "";
		if (typeof galleryImageUrl.getPreviewImageUrl(obj._id) === "undefined") {
			galleryImageUrl.setPreviewImageUrl(obj._id, ""); // to prevent sending query more than 1 time
			ajax.getImage(obj._id, IMAGE_HEIGHT, IMAGE_WIDTH).then((data) => {
				galleryImageUrl.setPreviewImageUrl(obj._id, URL.createObjectURL(data));
				$$(dataview.id).refresh(obj.id);
			});
		}
		return `<div class="gallery-images-container ${checkedClass}">
					<div class='gallery-images-info'>
						<div class="gallery-images-header">
							<div class="gallery-images-checkbox"> ${common.markCheckbox(obj, common)}</div>
			                <div class="thumbnails-name" style="font-size: ${util.getNewThumnailsNameFontSize()}px">${obj.name}</div>
						</div>
						<div class="gallery-images-buttons" style="top: ${util.getTopStylePercentage()}% !important;">
							<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images">
								<span class="gallery-images-button resize-icon tooltip-title">
									<svg viewBox="0 0 26 26" class="gallery-icon-svg">
										<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#resize-icon" class="gallery-icon-use"></use>
									</svg>
								</span>
								<span class="tooltip-block tooltip-block-top">Enlarge</span>
							</div>
							<div class="gallery-images-button-elem tooltip-container tooltip-gallery-images">
								<span class="gallery-images-button info-icon tooltip-title">
									<svg viewBox="0 0 26 26" class="gallery-icon-svg">
										<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#info-icon" class="gallery-icon-use"></use>
									</svg>
								</span>
								<span class="tooltip-block tooltip-block-top">Metadata</span>
							</div>
							${diagnosisIcon}
						</div>
					</div>
					${starHtml}
					<img src="${galleryImageUrl.getPreviewImageUrl(obj._id) || ""}" class="gallery-image" />
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
					if (value && (selectedImages.count() >= constants.MAX_COUNT_IMAGES_SELECTION || selectedImages.countForStudies() >= constants.MAX_COUNT_IMAGES_SELECTION)) {
						datav.updateItem(item.id, {markCheckbox: oldValue});
						webix.alert({
							text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
						});
						return;
					}
					changeSelectedItem(item, value, datav, this.config, studyFlag);
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

