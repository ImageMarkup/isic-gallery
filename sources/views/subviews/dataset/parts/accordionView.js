function prepareAccordionItems(data) {
	if (data && typeof data.map === "function") {
		return data.map(item => ({
			css: "accordion-item",
			// function is used because we can have # as variable value. # is reserved for webix template
			header: () => item.name,
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

<<<<<<< HEAD
function buildAccordion(dataset, accordion, template) {
=======
function buildAccordion(dataset, accordion, tempalte) {
>>>>>>> cd7521d525bd4ce85174aa2d47247312f65eaa07
	if (Array.isArray(dataset)) {
		const items = prepareAccordionItems(dataset);
		webix.ui(items, accordion);
		this.rendered = true; // set the mark that accordion has been built
<<<<<<< HEAD
		template.parse({count: items.length});
		template.refresh();
=======
		tempalte.setValues({count: items.length});
>>>>>>> cd7521d525bd4ce85174aa2d47247312f65eaa07
	}
	else {
		throw new Error("Data set is not Array");
	}
}

export default {
	buildAccordion
};
