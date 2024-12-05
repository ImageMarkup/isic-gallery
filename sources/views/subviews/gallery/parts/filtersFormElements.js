import constants from "../../../../constants";
import appliedFilters from "../../../../models/appliedFilters";
import util from "../../../../utils/util";
import filtersViewHelper from "./filters";

const showedFiltersCollection = appliedFilters.getShowedFiltersCollection();
const NAME_SELECT_ALL_FILTER = filtersViewHelper.getSelectAllFilersName();
const NAME_SELECT_NONE_FILTER = filtersViewHelper.getSelectNoneFiltersName();
// we assume that the first child of any filter will be a label
// and then we attach the handler for its click event to hide or show the other children
function _attachCollapseToFilter(filter, collapsed, dataForCreatingControl) {
	const collapsibleFilter = webix.copy(filter);
	const isMobile = util.isMobilePhone();
	const template = isMobile || filter.type === constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX
		? collapsibleFilter.rows[0].cols[0]
		: collapsibleFilter.rows[0];
	const collapsibleFilterFunction = function () {
		const currentMobile = util.isMobilePhone();
		const selectAllFiltersButton = this.getParentView().queryView({
			name: NAME_SELECT_ALL_FILTER
		});
		const selectNoneFiltersButton = this.getParentView().queryView({
			name: NAME_SELECT_NONE_FILTER
		});
		const children = currentMobile
			? this.getParentView().getParentView().getChildViews()
			: this.getParentView().getChildViews();
		const labelObject = currentMobile
			? children[0].getChildViews()[0]
			: children[0];
		const controls = children[1];
		if (!controls.isVisible()) {
			selectAllFiltersButton.show();
			selectNoneFiltersButton.show();
			showOrHideAggregateButton(filter, controls, dataForCreatingControl, currentMobile);
			webix.html.addCss(labelObject.getNode(), "showed-filter");
			webix.html.removeCss(labelObject.getNode(), "hidden-filter");
			this.config.isRowsVisible = true;
			controls.show();
			// scroll into collapsed controls
			// TODO: fix mobile view
			// const filtersNode = controls.getParentView().getNode();
			// filtersNode.scrollIntoView();
			showedFiltersCollection.add({
				id: dataForCreatingControl.id
			});
		}
		else {
			selectAllFiltersButton?.hide();
			selectNoneFiltersButton?.hide();
			webix.html.removeCss(labelObject.getNode(), "showed-filter");
			webix.html.addCss(labelObject.getNode(), "hidden-filter");
			this.config.isRowsVisible = false;
			if (showedFiltersCollection.exists(dataForCreatingControl.id)) {
				showedFiltersCollection.remove(dataForCreatingControl.id);
			}
			controls.hide();
		}
	};
	template.onClick = {
		// eslint-disable-next-line func-names
		"collapssible-filter": collapsibleFilterFunction
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
				let collapsed = true;
				const indexOfDataForCreatingControl = expandedFilters.indexOf(dataForCreatingControl.id);
				const foundFilterCollection = showedFiltersCollection.find(
					showedFilter => dataForCreatingControl.id === showedFilter.id
				);
				if (indexOfDataForCreatingControl !== -1 || foundFilterCollection.length !== 0) {
					collapsed = false;
				}
				switch (data[key].data[i].type) {
					case "checkbox":
					case "rangeCheckbox":
						filtersConfig = filtersViewHelper.getCheckboxUI(dataForCreatingControl, collapsed);
						elems.push(_attachCollapseToFilter(filtersConfig, collapsed, dataForCreatingControl));
						break;
					/* case "range_slider":
						t = filtersViewHelper.getRangeSliderUI(data[key].data[i]);
						break; */
					case constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX: {
						const diagnosisRegex = /^diagnosis\|.*/;
						const diagnosisFilter = expandedFilters.find(f => diagnosisRegex.test(f));
						collapsed = !diagnosisFilter;
						filtersConfig = filtersViewHelper.getTreeCheckboxUI(
							dataForCreatingControl,
							collapsed,
							expandedFilters
						);
						elems.push(filtersConfig);
						break;
					}
					default:
					{
						break;
					}
				}
			}
		}
	});
	return elems;
}

function showOrHideAggregateButton(filter, controls, dataForCreatingControl, isCurrentMobile) {
	const filterView = $$(filter.id);
	const selectAllFiltersButton = isCurrentMobile
		? filterView?.queryView({
			name: NAME_SELECT_ALL_FILTER
		})
		: controls.queryView({
			name: NAME_SELECT_ALL_FILTER
		});
	const selectNoneFiltersButton = isCurrentMobile
		? filterView?.queryView({
			name: NAME_SELECT_NONE_FILTER
		})
		: controls.queryView({
			name: NAME_SELECT_NONE_FILTER
		});
	const filtersArray = appliedFilters.getFiltersArray();
	const filtersCount = filtersArray.reduce((count, filterFromFilterArray) => {
		if (filter.id.includes(filterFromFilterArray.key)) {
			return ++count;
		}
		return count;
	}, 0);
	if (filtersCount === 0) {
		selectNoneFiltersButton.hide();
	}
	if (filtersCount === dataForCreatingControl.options.length) {
		selectAllFiltersButton.hide();
	}
}

export default {
	transformToFormFormat
};
