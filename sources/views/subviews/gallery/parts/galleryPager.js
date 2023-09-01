import galleryImagesUrls from "../../../../models/galleryImagesUrls";
import state from "../../../../models/state";
import util from "../../../../utils/util";

let dataviewId;

const pager = {
	view: "pager",
	// size: 80, define in gallery service
	height: 36,
	width: 250,
	master: false,
	template(obj, common) {
		return `${common.prev()} ${common.next()}`;
	},
	on: {
		onItemClick(id/* , e, node */) {
			let offset = state.imagesOffset;
			const prevClickHandler = util.debounce(() => {
				let url = galleryImagesUrls.getPrevImagesUrl() || null;
				if (url) {
					offset -= this.data.size;
					galleryImagesUrls.setCurrImagesUrl(url);
					$$(dataviewId).loadNext(this.data.size, offset);
				}
			}, 100);
			const nextClickHandler = util.debounce(() => {
				let url = galleryImagesUrls.getNextImagesUrl() || null;
				if (url) {
					offset += this.data.size;
					galleryImagesUrls.setCurrImagesUrl(url);
					$$(dataviewId).loadNext(this.data.size, offset);
				}
			}, 100);
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
					break;
				}
			}
		}
	}
};

const mobilePager = {
	view: "pager",
	height: 110,
	width: 0,
	master: false,
	css: "mobile-pager",
	template(obj, common) {
		return `<div style="display: flex; justify-content: space-around">${common.prev()} <div></div> ${common.next()}</div>`;
	},
	on: {
		onItemClick(id/* , e, node */) {
			let offset = state.imagesOffset;
			const prevClickHandler = util.debounce(() => {
				let url = galleryImagesUrls.getPrevImagesUrl() || null;
				if (url) {
					offset -= this.data.size;
					galleryImagesUrls.setCurrImagesUrl(url);
					$$(dataviewId).loadNext(this.data.size, offset);
				}
			}, 100);
			const nextClickHandler = util.debounce(() => {
				let url = galleryImagesUrls.getNextImagesUrl() || null;
				if (url) {
					offset += this.data.size;
					galleryImagesUrls.setCurrImagesUrl(url);
					$$(dataviewId).loadNext(this.data.size, offset);
				}
			}, 100);
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
					break;
				}
			}
		}
	},
	onClick: {
		"pager-info-panel": function(ev, id) {

		}
	}
};

/**
 * @param id
 * @param sourceDataviewId
 * @param {boolean} isMobile
 */
function getConfig(id, sourceDataviewId, isMobile) {
	if (isMobile) {
		mobilePager.id = id || `pager-${webix.uid()}`;
		dataviewId = sourceDataviewId;
		return mobilePager;
	}
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
