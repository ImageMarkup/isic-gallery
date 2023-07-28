import {JetView} from "webix-jet";

import galleryImageUrl from "../../../../models/galleryImagesUrls";
import selectedGalleryImages from "../../../../models/selectedGalleryImages";

export default class StudyDataview extends JetView {
	config() {
		const studyDataview = {
			view: "dataview",
			css: "study-images-dataview",
			template: (obj) => {
				if (obj.name === "addImage") {
					return this.getFirstDataviewItemTemplate();
				}
				if (typeof galleryImageUrl.getPreviewImageUrl(obj.isic_id) === "undefined") {
					galleryImageUrl.setPreviewImageUrl(obj.isic_id, ""); // to prevent sending query more than 1 time
					// TODO: uncomment this after start working with study
					// ajax.getImage(obj._id, 107).then((data) => {
					// 	galleryImageUrl.setPreviewImageUrl(obj._id, URL.createObjectURL(data));
					// 	this.dataview.refresh();
					// });
				}

				return `<div class="study-images-container">
					<div class='study-images-info'>
						<div class="study-images-header">
			                <div class="thumbnails-study-image-name">${obj.name || "ISIC_STUDY_IMAGE"}</div>
						</div>
						<div class="study-images-buttons">
							<div class="study-images-button-elem tooltip-container tooltip-gallery-images">
								<span class="study-images-button resize-icon tooltip-title">
									<svg viewBox="0 0 26 26" class="study-icon-svg">
										<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#resize-icon" class="study-icon-use"></use>
									</svg>
								</span>
								<span class="tooltip-block tooltip-block-top">Enlarge</span>
							</div>
							<div class="study-images-button-elem tooltip-container tooltip-gallery-images">
								<span class="study-images-button trash-icon tooltip-title" style="padding-left: 1px;">
									<svg viewBox="0 0 26 26" class="study-icon-svg">
										<path d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z" class="study-icon-use"/>
									</svg>
								</span>
								<span class="tooltip-block tooltip-block-top">Delete</span>
							</div>
						</div>
					</div>
					<img src="${galleryImageUrl.getPreviewImageUrl(obj.isic_id) || ""}" class="study-image" />
				</div>`;
			},
			height: 120,
			borderless: true,
			type: {
				width: 148,
				height: 107
			}
		};

		return {
			name: "studyDataviewClass",
			rows: [
				studyDataview
			]
		};
	}

	ready(view) {
		this.view = view;
		this.dataview = this.getDataView();
		this.loadDataToDataview();
	}

	getDataView() {
		return this.getRoot().queryView({view: "dataview"});
	}

	getFirstDataviewItemTemplate() {
		return `<div class='add-new-image'>
						<svg viewBox="0 0 26 26" class='add-new-image-icon'>
							<path class="st0" d="M1.4,21V6.7h5.3V1.4h10v9.4c0.5,0.1,1,0.3,1.4,0.6V0H5.8L0,6.1v16.3h10.7c-0.5-0.4-1-0.9-1.3-1.4H1.4L1.4,21z
								M5.3,2.6v2.7H2.7L5.3,2.6z"/>
							<path class="st0" d="M14.9,11.7c-3.1,0-5.5,2.5-5.5,5.5s2.5,5.5,5.5,5.5s5.5-2.5,5.5-5.5S17.9,11.7,14.9,11.7z M17.5,18.1h-1.8v1.8
								h-1.6v-1.8h-1.8v-1.6h1.8v-1.8h1.6v1.8h1.8V18.1z"/>
						</svg>
						<div class='add-new-image-text' style='margin-top: -5px;'>Add Images</div>
						<div class='add-new-image-text' style='margin-top: -13px;'>from Gallery</div>
				</div>`;
	}

	loadDataToDataview() {
		this.dataview.clearAll();
		this.dataview.parse({
			pos: 0,
			data: {
				name: "addImage"
			}
		});
		let imagesForDataview = selectedGalleryImages.getStudyImagesId();
		if (imagesForDataview.length === 0) {
			imagesForDataview = selectedGalleryImages.getImageObjectsFromLocalStorage();
		}
		selectedGalleryImages.setImageObjectsToLocalStorage(imagesForDataview);
		imagesForDataview.forEach((imageObj) => {
			this.dataview.parse({
				_id: imageObj.isic_id,
				name: imageObj.name
			});
		});

		webix.delay(() => {
			this.dataview.callEvent("onAfterImagesUpdated");
		});
	}
}
