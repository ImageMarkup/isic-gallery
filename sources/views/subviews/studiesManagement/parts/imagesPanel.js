function createImagesPanel(item) {
	const template = {
		template() {
			return `<div class="item-content-header">Images (${item.images ? item.images.length : 0}) </div>`;
		},
		autoheight: true,
		borderless: true
	};
	const datatable = {
		view: "activeDatatable",
		css: "simple-datatable",
		scroll: "y",
		yCount: 10,
		borderless: true,
		rowHeight: 25,
		rowLineHeight: 25,
		columns: [
			{id: "name", header: {text: "Image Name", height: 25}},
			{id: "_id", header: "Image ID", width: 40, fillspace: true}
		],
		data: item.images,
		on: {
			onBeforeRender() {
				const count = this.count();
				if (count < 10) {
					this.define({autoheight: true, yCount: count});
				}
				else {
					this.define({yCount: 10, autoheight: false});
				}
			}
		}
	};
	return {
		rows: [
			template,
			{
				paddingX: 17,
				paddingY: 10,
				cols: [
					datatable
				]
			}
		]
	};
}

export default {
	createImagesPanel
};
