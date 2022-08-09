let data = [];

const dataset = {
	load() {
		return null;
	},
	getData(limit, offset) {
		return data.slice(offset, offset + limit);
	},
	getCount() {
		return data.length;
	}
};

export default dataset;
