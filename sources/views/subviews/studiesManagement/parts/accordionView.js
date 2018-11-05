function prepareAccordionItems(data) {
	if (data && typeof data.map === "function") {
		//const me = authService.getUserInfo();
		return data.map((item) => {
				/*const foundUser = item.users.find((item) => item._id === me._id);
				const enrolledHtml = foundUser ? "<div class='accordion-item-mark'>Enrolled</div>" : "";*/
				return {
					css: "accordion-item",
					id: `accordion-item-${item._id}`,
					header: `${item.name}`,
					body: {
						rows: []
					},
					elementId: item._id,
					headerAltHeight: 35,
					headerHeight: 35
				};
			}
		);
	}
	return [];
}

function buildAccordion(studies, accordion, headerTemplate) {
	if (Array.isArray(studies)) {
		const items = prepareAccordionItems(studies);
		webix.ui(items, accordion);
		headerTemplate.setValues({count: items.length});
	}
	else {
		throw new Error("Studies is not Array");
	}
}

export default {
	buildAccordion
};