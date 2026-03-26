import {TREE_MODELS_CONFIG} from "app-models/treeModels";

import util from "../../../../utils/util";

function prepareFilterName(obj) {
	const {view, filterName, value} = obj;
	if (view === "rangeCheckbox" || view === "checkbox") {
		return `
			<div class='applied-filters-item-hierarchy_container'>
				<div class='applied-filters-item-hierarchy-item' title='${filterName}'>${filterName}</div>
				<div class="applied-filters-item-hierarchy-item" title='${value}'>${value}</div>
			</div>
		`;
	}
	return "";
}

function getTreeCheckboxFilterName(obj) {
	const {optionId, filterName, key} = obj;
	const namesArray = optionId.split("|");
	const isAnatomicSite = key === TREE_MODELS_CONFIG.anatom_site.key;

	const items = ["<div class='applied-filters-item-hierarchy_container'>"];
	items.push(`<div class="applied-filters-item-hierarchy-item" title="${filterName}">${filterName}</div>`);
	namesArray.forEach((name, index) => {
		const itemName = index < 2 && !isAnatomicSite ? name.toUpperCase() : name;
		items.push(
			`<div class="applied-filters-item-hierarchy-item" title="${itemName}">${itemName}</div>`
		);
	});
	items.push("</div>");
	return items.join(" ");
}

function getFilterHTML(obj) {
	const crossIconName = util.isMobilePhone() ? "close-icon" : "remove-filter-icon";

	let filterNameHTML = "";
	if (obj.treeCheckboxFlag) {
		filterNameHTML = getTreeCheckboxFilterName(obj);
	}
	else {
		filterNameHTML = prepareFilterName(obj);
	}

	return `
		<div class='applied-filters-item'>
			${filterNameHTML}
			<span class="remove-filter-icon">
				<svg viewBox="0 0 26 26" class="close-icon-svg">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${crossIconName}" class="close-icon-svg-use"></use>
				</svg>
			</span>
		</div>
	`;
}

function createFilterListConfig(baseConfig) {
	return {
		...baseConfig,
		scroll: "auto",
		template(obj) {
			return getFilterHTML(obj);
		},
		onClick: {
			// eslint-disable-next-line func-names
			"remove-filter-icon": function (e, id) {
				const clickedItem = this.getItem(id);
				this.getTopParentView().$scope.app.callEvent("filtersChanged", [{
					view: clickedItem.view,
					key: clickedItem.key,
					datatype: clickedItem.datatype,
					filterName: clickedItem.filterName,
					value: clickedItem.value,
					optionId: clickedItem.optionId,
					remove: 1,
					status: clickedItem.status
				}, true]); // true - isNeedUpdateFiltersFormControls
			}
		}
	};
}

const listBase = {
	view: "list",
	css: "applied-filters-list",
	height: 100,
};

const mobileListBase = {
	view: "list",
	css: "mobile-applied-filters-list",
	height: 100,
};

const landscapeMobileListBase = {
	view: "list",
	css: "mobile-applied-filters-list",
};

const list = createFilterListConfig(listBase);
const mobileList = createFilterListConfig(mobileListBase);
const landscapeMobileList = createFilterListConfig(landscapeMobileListBase);

function getMobileConfig(id) {
	mobileList.id = id ?? `list-${webix.uid()}`;
	return mobileList;
}

function getLandscapeMobileConfig(id) {
	landscapeMobileList.id = id ?? `list-${webix.uid()}`;
	return landscapeMobileList;
}

function getIdFromMobileConfig() {
	return mobileList.id;
}

function getConfig(id) {
	list.id = id || `list-${webix.uid()}`;
	return list;
}

function getIdFromConfig() {
	return list.id;
}


export default {
	getConfig,
	getIdFromConfig,
	getMobileConfig,
	getIdFromMobileConfig,
	getLandscapeMobileConfig
};
