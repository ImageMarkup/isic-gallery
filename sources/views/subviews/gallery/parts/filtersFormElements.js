import filtersViewHelper from "./filters";
import appliedFilters from "../../../../models/appliedFilters";

const removedFiltersCollection = appliedFilters.getRemovedFiltersCollection();
const collapsedRowsCollection = appliedFilters.getCollapsedRowsCollection();

function transformToFormFormat(data, expandedFilters) {
	const elems = [];
	for (let key in data) {
		if (data.hasOwnProperty(key)) {
			elems.push(filtersViewHelper.getLabelUI(data[key].label));
			for (let i = 0; i < data[key].data.length; i++) {
				let filtersConfig = null;
				const dataForCreatingControl = data[key].data[i];
				switch (data[key].data[i].type) {
					case "checkbox":
					case "rangeCheckbox":
						filtersConfig = filtersViewHelper.getCheckboxUI(dataForCreatingControl);
						break;
					/* case "range_slider":
						t = filtersViewHelper.getRangeSliderUI(data[key].data[i]);
						break;*/
					default:
					{
						break;
					}
				}
				let collapsed = true;
				if (expandedFilters.indexOf(dataForCreatingControl.id) !== -1 || removedFiltersCollection.find(key => dataForCreatingControl.id === key.id).length !== 0) {
					collapsed = false;
				}
				elems.push(_attachCollapseToFilter(filtersConfig, collapsed, dataForCreatingControl));
			}
		}
	}
	return elems;
}

// we assume that the first child of any filter will be a label
// and then we attach the handler for its click event to hide or show the other children
function _attachCollapseToFilter(filter, collapsed, dataForCreatingControl) {
	const collapsibleFilter = webix.copy(filter);
	const template = collapsibleFilter.rows[0];
	template.onClick = {
		"collapssible-filter": function () {
			const children = this.getParentView().getChildViews();
			const labelObject = children[0];
			let labelText = labelObject.getNode().innerText;
			const controls = children[1];
			const regexForLabelText = /\r?\n|\r/;
			labelText = labelText.replace(regexForLabelText, "");
			if (!controls.isVisible()) {
				webix.html.addCss(labelObject.getNode(), "showed-filter");
				webix.html.removeCss(labelObject.getNode(), "hidden-filter");
				this.config.isRowsVisible = true;
				controls.show();
				collapsedRowsCollection.remove(labelText);
			}
			else {
				webix.html.removeCss(labelObject.getNode(), "showed-filter");
				webix.html.addCss(labelObject.getNode(), "hidden-filter");
				this.config.isRowsVisible = false;
				removedFiltersCollection.remove(dataForCreatingControl.id);
				controls.hide();
				collapsedRowsCollection.add({
					id: labelText
				});
			}
		}
	};
	collapsedRowsCollection.find((obj) => {
		if (obj.id.toLowerCase() === template.template.toLowerCase()) {
			collapsed = true;
		}
	}, true);
	if (collapsed) {
		template.css += " collapssible-filter hidden-filter";
		collapsibleFilter.rows[1].hidden = true;
	}
	else {
		template.css += " collapssible-filter showed-filter";
		collapsibleFilter.rows[1].hidden = false;
	}

	return collapsibleFilter;
}

export default {
	transformToFormFormat
};
