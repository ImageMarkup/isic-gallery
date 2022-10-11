import filtersViewHelper from "./filters";
import appliedFilters from "../../../../models/appliedFilters";

const showedFiltersCollection = appliedFilters.getShowedFiltersCollection();

// we assume that the first child of any filter will be a label
// and then we attach the handler for its click event to hide or show the other children
function _attachCollapseToFilter(filter, collapsed, dataForCreatingControl) {
	const collapsibleFilter = webix.copy(filter);
	const template = collapsibleFilter.rows[0];
	template.onClick = {
		// eslint-disable-next-line func-names
		"collapssible-filter": function () {
			const children = this.getParentView().getChildViews();
			const labelObject = children[0];
			const controls = children[1];
			if (!controls.isVisible()) {
				webix.html.addCss(labelObject.getNode(), "showed-filter");
				webix.html.removeCss(labelObject.getNode(), "hidden-filter");
				this.config.isRowsVisible = true;
				controls.show();
				// scroll into collapsed controls
				const filtersNode = controls.getParentView().getNode();
				filtersNode.scrollIntoView();
				showedFiltersCollection.add({
					id: dataForCreatingControl.id
				});
			}
			else {
				webix.html.removeCss(labelObject.getNode(), "showed-filter");
				webix.html.addCss(labelObject.getNode(), "hidden-filter");
				this.config.isRowsVisible = false;
				if (showedFiltersCollection.exists(dataForCreatingControl.id)) {
					showedFiltersCollection.remove(dataForCreatingControl.id);
				}
				controls.hide();
			}
		}
	};
	if (collapsed) {
		template.css += " collapssible-filter hidden-filter";
		collapsibleFilter.rows[1].hidden = true;
	}
	else {
		template.css += " collapssible-filter showed-filter";
		collapsibleFilter.rows[1].hidden = false;
		if (!showedFiltersCollection.exists(dataForCreatingControl.id)) {
			showedFiltersCollection.add({
				id: dataForCreatingControl.id
			});
		}
	}

	return collapsibleFilter;
}

function transformToFormFormat(data, expandedFilters) {
	const elems = [];
	const dataKeys = Object.keys(data);
	dataKeys.forEach((key) => {
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
						break; */
					default:
					{
						break;
					}
				}
				let collapsed = true;
				const indexOfDataForCreatingControl = expandedFilters.indexOf(dataForCreatingControl.id);
				const foundFilterCollection = showedFiltersCollection.find(
					showedFilter => dataForCreatingControl.id === showedFilter.id
				);
				if (indexOfDataForCreatingControl !== -1 || foundFilterCollection.length !== 0) {
					collapsed = false;
				}
				elems.push(_attachCollapseToFilter(filtersConfig, collapsed, dataForCreatingControl));
			}
		}
	});
	return elems;
}

export default {
	transformToFormFormat
};
