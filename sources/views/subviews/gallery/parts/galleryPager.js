import galleryImagesUrls from "../../../../models/galleryImagesUrls";
import util from "../../../../utils/util";

let dataviewId;

const pager = {
	view: "pager",
	// size: 80, define in gallery service
	height: 36,
	width: 250,
	master: false,
	template(obj, common) {
		return `${common.first()} ${common.prev()} ${common.next()} ${common.last()}`;
	},
	on: {
		onItemClick(id/* , e, node */) {
			let offset = 0;
			const prevClickHandler = util.debounce(() => {
				let url = galleryImagesUrls.getPrevImagesUrl() || null;
				const callback = null;
				$$(dataviewId).loadNext(this.data.size, offset, callback, url);
			});
			const nextClickHandler = util.debounce(() => {
				let url = galleryImagesUrls.getNextImagesUrl() || null;
				const callback = null;
				$$(dataviewId).loadNext(this.data.size, offset, callback, url);
			});
			const lastClickHandler = util.debounce(() => {
				offset = (this.data.limit - 1) * this.data.size;
				galleryImagesUrls.setNextImagesUrl(null);
				galleryImagesUrls.setPrevImagesUrl(null);
				$$(dataviewId).loadNext(this.data.size, offset);
			});
			const firstClickHandler = util.debounce(() => {
				offset = 0;
				galleryImagesUrls.setNextImagesUrl(null);
				galleryImagesUrls.setPrevImagesUrl(null);
				$$(dataviewId).loadNext(this.data.size, offset);
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
				case "first": {
					firstClickHandler();
					break;
				}
				case "last": {
					lastClickHandler();
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

function getConfig(id, sourceDataviewId) {
	pager.id = id || `pager-${webix.uid()}`;
	dataviewId = sourceDataviewId;
	return pager;
}

function getIdFromConfig() {
	return pager.id;
}

export default {
	getConfig,
	getIdFromConfig
};
