import galleryImagesUrls from "../../../../models/galleryImagesUrls";
import state from "../../../../models/state";
import util from "../../../../utils/util";

let dataviewId;

function createPager({height, width, css, template}) {
	const combinedCss = `gtm-paginator${css ? ` ${css}` : ""}`;
	return {
		view: "pager",
		height,
		width,
		master: false,
		css: combinedCss,
		template,
		on: {
			onItemClick(id) {
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
					case "prev":
						prevClickHandler();
						break;
					case "next":
						nextClickHandler();
						break;
					default:
						break;
				}
			}
		}
	};
}

const pager = createPager({
	height: 36,
	width: 250,
	template: (obj, common) => `${common.prev()} ${common.next()}`,
});

const mobilePager = createPager({
	height: 60,
	width: 0,
	css: "mobile-pager",
	template: (obj, common) => `<div style="display: flex; justify-content: space-around">${common.prev()}${common.next()}</div>`,
});


/**
 * @param {string} id
 * @param {string} sourceDataviewId
 * @param {boolean} isMobile
 * @returns {webix.ui.pagerConfig}
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
