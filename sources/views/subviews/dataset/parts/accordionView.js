function prepareAccordionItems(data) {
	if (data && typeof data.map === "function") {
		return data.map(item => ({
			css: "accordion-item",
			// function is used because we can have # as variable value. # is reserved for webix template
			header: () => (item.name),
			id: `accordion-item-${item._id}`,
			body: {
				rows: []
			},
			elementId: item._id,
			headerAltHeight: 35,
			headerHeight: 35
		}));
	}
	return [];
}

function buildAccordion(dataset, accordion, tempalte) {
	if (Array.isArray(dataset)) {
		const items = prepareAccordionItems(dataset);
		webix.ui(items, accordion);
		this.rendered = true; // set the mark that accordion has been built
		tempalte.setValues({count: items.length});
	}
	else {
		throw new Error("Data set is not Array");
	}
}

export default {
	buildAccordion
};