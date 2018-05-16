import "../../../components/activeDataview";
import selectedImages from "../../../../models/selectedGalleryImages";
import state from "../../../../models/state";
import ajax from "../../../../services/ajaxActions";
import galleryImageUrl from "../../../../models/galleryImagesUrls";
import constants from "../../../../constants";

const dataview = {
	view: "activeDataview",
	css: "gallery-images-dataview",
	datathrottle: 500,
	template(obj, common) {
		const checkedClass = obj.markCheckbox ? "is-checked" : "";
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
			galleryImageUrl.setPreviewImageUrl(obj._id, ""); // to prevent sending query vore than 1 times
			ajax.getImage(obj._id, 113).then((data) => {
				galleryImageUrl.setPreviewImageUrl(obj._id, URL.createObjectURL(data));
				$$(dataview.id).refresh(obj.id);
			});
		}
		return `<div class="gallery-images-container ${checkedClass}">
					<div class='gallery-images-info'>
						<div class="gallery-images-header">
							<div class="gallery-images-checkbox"> ${common.markCheckbox(obj, common)}</div>
			                <div class="thumbnails-name">${obj.name}</div>
						</div>
						<div class="gallery-images-buttons">
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
		width: 180,
		height: 123
	},
	activeContent: {
		markCheckbox: {
			view: "checkbox",
			css: "checkbox-ctrl",
			width: 20,
			height: 30,
			on: {
				onChange(value, oldValue) {
					const datav = $$(dataview.id);
					const item = datav.getItem(this.config.$masterId);

					if (value && selectedImages.count() >= constants.MAX_COUNT_IMAGES_SELECTION) {
						datav.updateItem(item.id, {markCheckbox: oldValue});
						webix.alert({
							text: `You can select maximum ${constants.MAX_COUNT_IMAGES_SELECTION} images`
						});
						return;
					}

					item.markCheckbox = value;
					if (value) {
						selectedImages.add(item._id);
					}
					else {
						selectedImages.remove(item._id);
					}
					datav.updateItem(this.config.$masterId, item);
					state.app.callEvent("changedSelectedImagesCount");
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

