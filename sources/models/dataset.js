import ajaxActions from "../services/ajaxActions";

let data = [];

const dataset = {
	load(params) {
		return ajaxActions.getDataset(params).then((sourceData) => {
			if (Array.isArray(sourceData)) {
				data = sourceData;
			}
		});
	},
	getData(limit, offset) {
		return data.slice(offset, offset + limit);
	},
	getCount() {
		return data.length;
	}
};

export default dataset;
