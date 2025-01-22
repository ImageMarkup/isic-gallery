function _prepareFilterName(obj) {
	let result = "";
	switch (obj.view) {
		case "rangeCheckbox":
		case "checkbox": {
			result += `${obj.filterName}: ${obj.value}`;
			break;
		}
		case "rangeSlider": {
			break;
		}
		default: {
			break;
		}
	}
	return result;
}

const list = {
	view: "list",
	css: "applied-filters-list",
	height: 100,
	scroll: "auto",
	template(obj) {
		if (obj.treeCheckboxFlag) {
			const result = getTreeCheckboxFilterName(obj);
			return `<div class='applied-filters-item'>
						${result}
						<span class="remove-filter-icon">
							<svg viewBox="0 0 26 26" style="width:26px;height:26px">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#remove-filter-icon" class="close-icon-svg-use"></use>
							</svg>
						</span>
					</div>`;
		}
		const filterName = _prepareFilterName(obj);
		return `<div class='applied-filters-item' title="${filterName}">${filterName}
					<span class="remove-filter-icon">
						<svg viewBox="0 0 26 26" class="close-icon-svg">
							<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#remove-filter-icon" class="close-icon-svg-use"></use>
						</svg>
					</span>
				</div>`;
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

const mobileList = {
	view: "list",
	css: "mobile-applied-filters-list",
	height: 100,
	scroll: "auto",
	template(obj) {
		const filterName = _prepareFilterName(obj);
		return `<div class='applied-filters-item' title="${filterName}">${filterName}
					<span class="remove-filter-icon">
						<svg viewBox="0 0 26 26" class="close-icon-svg">
							<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use>
						</svg>
					</span></div>`;
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

const landscapeMobileList = {
	view: "list",
	css: "mobile-applied-filters-list",
	scroll: "auto",
	template(obj) {
		const filterName = _prepareFilterName(obj);
		return `<div class='applied-filters-item' title="${filterName}">${filterName}
					<span class="remove-filter-icon">
						<svg viewBox="0 0 26 26" class="close-icon-svg">
							<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use>
						</svg>
					</span></div>`;
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

function getTreeCheckboxFilterName(obj) {
	let result = ["<div class='applied-filters-item-hierarchy_container'>"];
	const namesArray = obj.optionId.split("|");
	namesArray.forEach((n, index) => {
		const lastBlockClass = index === namesArray.length - 1
			? " last-block"
			: "";
		result.push(`<div class="applied-filters-item-hierarchy-item${lastBlockClass}" title="${n}">${n}</div>`);
	});
	result.push("</div>");
	return result.join(" ");
}

export default {
	getConfig,
	getIdFromConfig,
	getMobileConfig,
	getIdFromMobileConfig,
	getLandscapeMobileConfig
};
