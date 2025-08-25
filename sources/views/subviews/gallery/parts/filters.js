import constants from "../../../../constants";
import appliedFilters from "../../../../models/appliedFilters";
import collectionsModel from "../../../../models/collectionsModel";
import globalState from "../../../../models/state";
import filterService from "../../../../services/gallery/filter";
import util from "../../../../utils/util";

const NAME_SELECT_ALL_FILTERS = "filter-images-select-all-name";
const NAME_SELECT_ALL_FILTERS_MOBILE = "filter-images-select-all-mobile-name";
const NAME_SELECT_NONE_FILTERS = "filter-images-select-none-name";
const NAME_SELECT_NONE_FILTERS_MOBILE = "filter-images-select-none-mobile-name";

const shownFiltersCollection = appliedFilters.getShownFiltersCollection();

function getLabelUI(label) {
	const view = {
		view: "label",
		label: label.toUpperCase(),
		css: "gallery-sidebar-title",
		align: "left"
	};
	return view;
}

function _attachCollapseToTreeFilter(filter, dataForCreatingControl, isCollapsedFilter) {
	const collapsibleFilter = webix.copy(filter);
	const collapseElement = collapsibleFilter.rows[0];
	const collapsibleFilterFunction = function () {
		const children = this.getParentView().getChildViews();
		const collapser = children[0];
		const controls = children[1];
		if (!controls.isVisible()) {
			webix.html.addCss(collapser.getNode(), "shown-filter");
			webix.html.removeCss(collapser.getNode(), "hidden-filter");
			this.config.isRowsVisible = true;
			controls.show();
			shownFiltersCollection.add({
				id: dataForCreatingControl.id
			});
		}
		else {
			webix.html.removeCss(collapser.getNode(), "shown-filter");
			webix.html.addCss(collapser.getNode(), "hidden-filter");
			this.config.isRowsVisible = false;
			if (shownFiltersCollection.exists(dataForCreatingControl.id)) {
				shownFiltersCollection.remove(dataForCreatingControl.id);
			}
			controls.hide();
		}
	};
	collapseElement.onClick = {
		"collapsible-filter-tree": collapsibleFilterFunction
	};
	if (isCollapsedFilter) {
		collapseElement.css = "collapsible-filter-tree hidden-filter";
		collapsibleFilter.rows[1].hidden = true;
	}
	else {
		collapseElement.css = "collapsible-filter-tree shown-filter";
		collapsibleFilter.rows[1].hidden = false;
		if (!shownFiltersCollection.exists(dataForCreatingControl.id)) {
			shownFiltersCollection.add({
				id: dataForCreatingControl.id
			});
		}
	}

	return collapsibleFilter;
}

function getCheckboxUI(data, collapsed) {
	const isMobile = util.isMobilePhone();
	const handleAggregateButton = function (controlData, elements, newValue, app) {
		const filtersInfo = [];
		let selectNone = !newValue;
		controlData.options.forEach((currentOption) => {
			const option = filterService.prepareOptionName(currentOption, controlData.id);
			const controlId = util.getOptionId(controlData.id, option);
			const control = elements[controlId];
			if (control) {
				control.blockEvent(); // block events for checkbox
				control.setValue(newValue);
				control.unblockEvent();
			}
			filtersInfo.push();
			let params = webix.copy(control.config.filtersChangedData);
			params.optionId = currentOption.optionId;
			params.remove = !newValue;
			filtersInfo.push(params);
		});

		app.callEvent("filtersChanged", [filtersInfo, selectNone]);
	};

	const showOrHideSelectAllButton = function() {
		const currentFiltersArray = appliedFilters.getFiltersArray();
		const currentFiltersCount = currentFiltersArray.reduce((count, filterFromFilterArray) => {
			if (data.id.includes(filterFromFilterArray.key)) {
				return ++count;
			}
			return count;
		}, 0);
		if (currentFiltersCount === data?.options?.length) {
			this.hide();
		}
	};

	const selectAllLabel = {
		view: "template",
		name: isMobile ? NAME_SELECT_ALL_FILTERS_MOBILE : NAME_SELECT_ALL_FILTERS,
		css: "select-all-template",
		template: "<span class='select-all-label'>Select All</span>",
		borderless: true,
		hidden: collapsed,
		height: 22,
		onClick: {
			// eslint-disable-next-line func-names
			"select-all-label": function () {
				this.hide();
				const elements = this.getFormView().elements;
				handleAggregateButton(data, elements, 1, this.getTopParentView().$scope.app);
			}
		},
		on: {
			onViewShow: showOrHideSelectAllButton,
			onAfterRender: showOrHideSelectAllButton
		}
	};

	const showOrHideSelectNoneButton = function () {
		const currentFiltersArray = appliedFilters.getFiltersArray();
		const currentFiltersCount = currentFiltersArray.reduce((count, filterFromFilterArray) => {
			if (data.id.includes(filterFromFilterArray.key)) {
				return ++count;
			}
			return count;
		}, 0);
		if (currentFiltersCount === 0) {
			this.hide();
		}
	};

	const selectNoneLabel = {
		view: "template",
		name: isMobile ? NAME_SELECT_NONE_FILTERS_MOBILE : NAME_SELECT_NONE_FILTERS,
		css: "select-none-template",
		template: "<span class='select-none-label'>Select None</span>",
		borderless: true,
		hidden: collapsed,
		height: 22,
		onClick: {
			// eslint-disable-next-line func-names
			"select-none-label": function () {
				this.hide();
				const elements = this.getFormView().elements;
				handleAggregateButton(data, elements, 0, this.getTopParentView().$scope.app);
			}
		},
		on: {
			onViewShow: showOrHideSelectNoneButton,
			onAfterRender: showOrHideSelectNoneButton
		}
	};

	const view = isMobile
		? {
			id: `checkboxUI-${data.id}`,
			rows: [
				{
					cols: [
						{
							id: util.getFilterLabelId(data.id),
							view: "template",
							css: "checkbox-label",
							autoheight: true,
							template: data.name,
							borderless: true
						},
						{width: 10},
						selectAllLabel,
						selectNoneLabel
					]
				},
				{
					paddingX: 20,
					rows: []
				}
			]
		}
		: {
			id: `checkboxUI-${data.id}`,
			rows: [
				{
					id: util.getFilterLabelId(data.id),
					view: "template",
					css: "checkbox-label",
					autoheight: true,
					template: data.name,
					borderless: true
				},
				{
					paddingX: 20,
					rows: [
						selectAllLabel,
						selectNoneLabel
					]
				}
			]
		};

	data?.options?.forEach((currentOption) => {
		const isCollection = data.id === constants.COLLECTION_KEY;
		if (isCollection) {
			if (!currentOption.updated) {
				const pinnedCollections = collectionsModel
					.getPinnedCollections()
					.map(collection => ({name: collection.name, id: collection.id}));
				const currentCollection = pinnedCollections
					.find(collection => collection.id === currentOption.key);
				if (currentCollection) {
					currentOption.updated = true;
					currentOption.optionId = currentCollection.id;
					currentOption.key = currentCollection.id;
					currentOption.collectionName = currentCollection.name;
				}
			}
		}

		const optionName = isCollection
			? filterService.prepareOptionName(currentOption.name, data.id)
			: filterService.prepareOptionName(currentOption.key, data.id);
		const labelRight = isCollection ? optionName : `${optionName} (0)`;
		const id = util.getOptionId(data.id, currentOption.key);
		const filtersChangedData = appliedFilters.getFiltersChangedData(
			data,
			currentOption,
			optionName
		);

		const checkboxConfig = {
			id,
			view: "checkbox",
			css: "checkbox-ctrl",
			label: "",
			labelRight,
			value: 0,
			name: id,
			height: 28,
			attributes: {
				title: labelRight,
				dataOptionId: currentOption.optionId ? `${currentOption.optionId}` : null,
			},
			labelWidth: 0,
			filtersChangedData,
			on: {
				onChange(status) {
					let params = webix.copy(this.config.filtersChangedData);
					if (currentOption && data.type === "rangeCheckbox") {
						webix.extend(this.config.filtersChangedData, {
							to: currentOption.to,
							from: currentOption.from
						});
					}
					params.remove = !status;
					params.optionId = currentOption.optionId;
					this.getTopParentView().$scope.app.callEvent("filtersChanged", [params]);
				}
			}
		};

		if (isCollection) {
			view.rows[1].rows.push({
				cols: [checkboxConfig]
			});
		} else {
			view.rows[1].rows.push(checkboxConfig);
		}
	});
	return view;
}

function getTreeCheckboxUI(data, collapsed, elementsToOpen) {
	const labelId = data.id;
	const treeTableId = `treeTable-${data.id}`;
	const treeTableDataForFilters = {
		type: data.type,
		name: data.name,
		id: data.id,
		labelId
	};
	if (!globalState.filtersTreeData.has(treeTableId)) {
		globalState.filtersTreeData.set(treeTableId, treeTableDataForFilters);
	}
	const view = {
		rows: [
			{
				id: util.getFilterLabelId(data.id),
				view: "template",
				css: "checkbox-label",
				autoheight: true,
				template: data.name,
				borderless: true
			},
			{
				paddingsX: 20,
				id: treeTableId,
				view: "treetable",
				css: "filter-tree-table",
				columns: [
					{
						id: "name",
						template: (obj, common) => {
							const name = obj.$level < 3 ? obj.name.toUpperCase() : obj.name;
							return `${common.space(obj, common)}${common.icon(obj, common)} ${common.treecheckbox(obj, common)}<span style="padding-left:5px;" title="${name}">${name}</span>`;
						},
						fillspace: true,
						select: false
					}
				],
				header: false,
				threeState: true,
				data: data.options,
				autoheight: true,
				scrollX: false,
				rowHeight: 28,
				borderless: true,
				on: {
					onItemCheck(id, state) {
						const item = this.getItem(id);
						const treeData = globalState.filtersTreeData.get(treeTableId);
						const filtersChangedData = [];
						filtersChangedData.push(appliedFilters.getFiltersChangeTreeItemData(
							treeData,
							item,
							item.datatype,
							!state,
						));
						if (state) {
							const children = getChildrenIds(this, id, item.$level);
							children.forEach((c) => {
								filtersChangedData.push(appliedFilters.getFiltersChangeTreeItemData(
									treeData,
									c,
									item.datatype,
									true,
								));
							});
						}
						else {
							const parents = getParentsIds(this, id, item.$level);
							parents.forEach((p) => {
								filtersChangedData.push(appliedFilters.getFiltersChangeTreeItemData(
									treeData,
									p,
									item.datatype,
									true,
								));
							});
							const currentParent = this.getItem(this.getParentId(id));
							const firstChildId = currentParent ? this.getFirstChildId(currentParent.id) : null;
							if (firstChildId) {
								let nextSiblingId = firstChildId;
								while (nextSiblingId) {
									const nextSiblingItem = this.getItem(nextSiblingId);
									filtersChangedData.push(appliedFilters.getFiltersChangeTreeItemData(
										treeData,
										nextSiblingItem,
										item.dataType,
										!nextSiblingItem.checked,
									));
									const children = getChildrenIds(this, nextSiblingId, nextSiblingItem.$level);
									children.forEach((c) => {
										filtersChangedData.push(appliedFilters.getFiltersChangeTreeItemData(
											treeData,
											c,
											item.datatype,
											true,
										));
									});
									const currentId = nextSiblingId;
									nextSiblingId = this.getNextSiblingId(currentId);
								}
							}
							const allCheckedItems = this.getChecked();
							allCheckedItems.forEach((checkedItemId) => {
								const checkedItem = this.getItem(checkedItemId);
								const parentForCheckedItem = this.getItem(this.getParentId(checkedItemId));
								if (!parentForCheckedItem.checked) {
									filtersChangedData.push(appliedFilters.getFiltersChangeTreeItemData(
										treeData,
										checkedItem,
										checkedItem.datatype,
										false,
									));
								}
							});
						}
						this.getTopParentView().$scope.app.callEvent("filtersChanged", [filtersChangedData]);
					},
					onAfterRender() {
						elementsToOpen.forEach((e) => {
							if (this.getItem(e)) {
								this.open(e);
							}
						});
						elementsToOpen.length = 0;
					}
				},
			}
		]
	};
	return _attachCollapseToTreeFilter(view, data, collapsed);
}

function getParentsIds(treeView, optionId, level) {
	const parents = [];
	const parentId = treeView.getParentId(optionId);
	if (parentId) {
		parents.push({id: parentId, level: level - 1});
		const parentIds = getParentsIds(treeView, parentId, level - 1);
		if (parentIds.length > 0) {
			parents.push(...parentIds);
		}
	}
	return parents;
}

function getChildrenIds(treeView, optionId, level) {
	const childIds = [];
	const firstChildId = treeView.getFirstChildId(optionId);
	if (!firstChildId) {
		return childIds;
	}
	childIds.push({id: firstChildId, level: level + 1});
	let nextSiblingId = treeView.getNextSiblingId(firstChildId);
	while (nextSiblingId) {
		const currentId = nextSiblingId;
		childIds.push({id: currentId, level: level + 1});
		nextSiblingId = treeView.getNextSiblingId(currentId);
	}
	childIds.forEach((c) => {
		const ids = getChildrenIds(treeView, c.id, level + 1);
		if (ids.length > 0) {
			childIds.push(...ids);
		}
	});
	return childIds;
}

function getSelectAllFilersName() {
	const isMobile = util.isMobilePhone();
	return isMobile ? NAME_SELECT_ALL_FILTERS_MOBILE : NAME_SELECT_ALL_FILTERS;
}

function getSelectNoneFiltersName() {
	const isMobile = util.isMobilePhone();
	return isMobile ? NAME_SELECT_NONE_FILTERS_MOBILE : NAME_SELECT_NONE_FILTERS;
}

export default {
	getLabelUI,
	getCheckboxUI,
	getSelectAllFilersName,
	getSelectNoneFiltersName,
	getTreeCheckboxUI,
};
