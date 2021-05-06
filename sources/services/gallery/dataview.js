import constants from "../../constants";
import utils from "../../utils/util";

export default class DataviewService {
	constructor(dataview, pager) {
		this.dataview = dataview;
		this.pager = pager;
		this.multiplier = 1;
	}

	getVisibleRange() {
		const state = this.dataview.getScrollState();
		const top = Math.max(0, state.y);
		const width = this.dataview.$width;
		const height = this.dataview.$height; // size of single item

		const t = this.dataview.type;
		let dx = Math.floor(width / t.width) || 1; // at least single item per row

		let min = Math.floor(top / t.height); // index of first visible row

		let dy = Math.ceil((height + top) / t.height) - 1 || 1; // index of last visible row

		let count = this.dataview.data.$max ?
			this.dataview.data.$max - this.dataview.data.$min : this.dataview.count();
		let max = Math.ceil(count / dx) * t.height; // size of view in rows

		return {
			_from: min,
			_dy: dy,
			_top: top,
			_max: max,
			_y: t.height,
			_dx: dx,
			width,
			height
		};
	}

	getPagerSize() {
		const vr = this.getVisibleRange();
		const yCount = vr._dy || 1;
		const xCount = vr._dx || 1;
		return yCount * xCount;
	}

	getFitImageSizeByGrid() {
		const vr = this.getVisibleRange();
		const yCount = vr._dy || 1;
		const xCount = vr._dx || 1;
		const width = Math.floor(vr.width / xCount);
		const height = Math.floor(vr.height / yCount);
		return {
			width,
			height
		};
	}

	setImagesRange() {
		const prevSize = this.pager.data.size;
		const size = this.getPagerSize();
		if (prevSize !== size) {
			this.pager.define("size", size);
			this.pager.refresh();
		}
	}

	onResizeDataview() {
		const dataviewTypeObj = this.dataview.config.type;
		const defaultMultipliedImageSizes = this.getDataviewTypeObject();
		Object.assign(dataviewTypeObj, defaultMultipliedImageSizes);
		this.dataview.customize(dataviewTypeObj);

		const index = this.getFirstItemIndexOnPage();
		this.setImagesRange();
		const page = this.getCurrentPageByItemIndex(index);

		const imageSizes = this.getFitImageSizeByGrid();
		this.setImageSize(imageSizes);
		this.dataview.refresh();
		return Promise.resolve(page);
	}

	getFirstItemIndexOnPage() {
		const pData = this.pager.data || {page: 0, size: 0};
		return pData.page * pData.size;
	}

	getCurrentPageByItemIndex(index) {
		return Math.floor(index / this.pager.data.size);
	}

	getDataviewTypeObject(multiplier = this.multiplier) {
		let width = utils.getDataviewItemWidth();
		let height = utils.getDataviewItemHeight();
		width *= multiplier;
		height *= multiplier;
		return {
			width,
			height
		};
	}

	setImageSizeByMultiplier(id) {
		const multiplier = constants.DATAVIEW_IMAGE_MULTIPLIERS.get(id) ||
			constants.DATAVIEW_IMAGE_MULTIPLIERS.keys().next();
		this.multiplier = multiplier;
		const imageSizes = this.getDataviewTypeObject(multiplier);
		this.setImageSize(imageSizes);
	}

	setImageSize(imageSizes) {
		const dataviewTypeObj = this.dataview.config.type;
		Object.assign(dataviewTypeObj, imageSizes);
		this.dataview.customize(dataviewTypeObj);
		this.dataview.refresh();
	}
}
