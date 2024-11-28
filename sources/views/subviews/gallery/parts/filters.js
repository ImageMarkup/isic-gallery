import constants from "../../../../constants";
import appliedFilters from "../../../../models/appliedFilters";
import collectionsModel from "../../../../models/collectionsModel";
import diagnosisModel from "../../../../models/diagnosis";
import filterService from "../../../../services/gallery/filter";
import util from "../../../../utils/util";

const NAME_SELECT_ALL_FILTERS = "filter-images-select-all-name";
const NAME_SELECT_ALL_FILTERS_MOBILE = "filter-images-select-all-mobile-name";
const NAME_SELECT_NONE_FILTERS = "filter-images-select-none-name";
const NAME_SELECT_NONE_FILTERS_MOBILE = "filter-images-select-none-mobile-name";

const showedFiltersCollection = appliedFilters.getShowedFiltersCollection();

function getLabelUI(label) {
	const view = {
		view: "label",
		label: label.toUpperCase(),
		css: "gallery-sidebar-title",
		align: "left"
	};
	return view;
}

const expandedParentsFilters = [];

function _attachCollapseToFilter(filter, dataForCreatingControl, expandedFilters) {
	const collapsibleFilter = webix.copy(filter);
	const collapseElement = collapsibleFilter.rows[0].cols[0];
	const collapsibleFilterFunction = function () {
		const children = this.getParentView().getParentView().getChildViews();
		const collapser = children[0].getChildViews()[0];
		const controls = children[1];
		if (!controls.isVisible()) {
			webix.html.addCss(collapser.getNode(), "showed-filter");
			webix.html.removeCss(collapser.getNode(), "hidden-filter");
			this.config.isRowsVisible = true;
			controls.show();
			showedFiltersCollection.add({
				id: dataForCreatingControl.id
			});
		}
		else {
			webix.html.removeCss(collapser.getNode(), "showed-filter");
			webix.html.addCss(collapser.getNode(), "hidden-filter");
			this.config.isRowsVisible = false;
			controls.hide();
		}
	};
	collapseElement.onClick = {
		"collapssible-filter-tree": collapsibleFilterFunction
	};
	const filterId = util.getOptionId("diagnosis", dataForCreatingControl.id);
	if (!expandedFilters?.includes(filterId)) {
		collapseElement.css = "collapssible-filter-tree hidden-filter";
		collapsibleFilter.rows[1].hidden = true;
	}
	else {
		collapseElement.css = "collapssible-filter-tree showed-filter";
		collapsibleFilter.rows[1].hidden = false;
		if (!showedFiltersCollection.exists(dataForCreatingControl.id)) {
			showedFiltersCollection.add({
				id: dataForCreatingControl.id
			});
		}
		if (dataForCreatingControl.parent) {
			const parentValue = diagnosisModel.getDiagnosisConcatenateValue(
				dataForCreatingControl.parent
			);
			const parentId = util.getOptionId("diagnosis", parentValue);
			expandedParentsFilters.push(parentId);
		}
	}
	if (expandedParentsFilters.includes(filterId)) {
		collapseElement.css = "collapssible-filter-tree showed-filter";
		collapsibleFilter.rows[1].hidden = false;
		if (dataForCreatingControl.parent) {
			const parentValue = diagnosisModel.getDiagnosisConcatenateValue(
				dataForCreatingControl.parent
			);
			const parentId = util.getOptionId("diagnosis", parentValue);
			expandedParentsFilters.push(parentId);
		}
	}

	return collapsibleFilter;
}

function getCheckboxUI(data, collapsed, expandedFilters) {
	const isMobile = util.isMobilePhone();
	const handleAggregateButton = function (controlData, elements, newValue, app) {
		const filtersInfo = [];
		let selectNone = !newValue;
		controlData.options.forEach((currentOption) => {
			const option = filterService.prepareOptionName(currentOption, controlData.id);
			const controlId = controlData.id === constants.COLLECTION_KEY
				? util.getOptionId(controlData.id, currentOption.name)
				: util.getOptionId(controlData.id, option);
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

	if (data.type === constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX) {
		expandedParentsFilters.length = 0;
		data.options?.forEach((currentOption) => {
			view.rows[1].rows.push(getTreeCheckboxUI(currentOption, data.id, expandedFilters));
		});
	}
	else {
		data?.options?.forEach((currentOption) => {
			if (data.id === constants.COLLECTION_KEY) {
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
			const optionName = data.id === constants.COLLECTION_KEY
				? filterService.prepareOptionName(currentOption.name, data.id)
				: filterService.prepareOptionName(currentOption.key, data.id);
			const id = util.getOptionId(data.id, optionName);
			const filtersChangedData = {
				view: data.type,
				datatype: data.datatype,
				key: data.id,
				filterName: data.name,
				value: optionName,
				optionId: currentOption.optionId,
				status: "equals"
			};
			if (currentOption && data.type === "rangeCheckbox") {
				filtersChangedData.to = currentOption.to;
				filtersChangedData.from = currentOption.from;
			}
			if (data.id === constants.COLLECTION_KEY) {
				view.rows[1].rows.push(
					{
						cols: [
							{
								id,
								view: "checkbox",
								css: "checkbox-ctrl",
								label: "",
								labelRight: optionName,
								value: 0,
								name: id,
								height: 28,
								gravity: 3,
								attributes: {
									title: `${optionName}`,
									dataOptionId: currentOption.optionId ? `${currentOption.optionId}` : null
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
							},
						]
					}
				);
			}
			else {
				view.rows[1].rows.push(
					{
						id,
						view: "checkbox",
						css: "checkbox-ctrl",
						label: "",
						labelRight: `${optionName} (0)`,
						value: 0,
						name: id,
						height: 28,
						attributes: {
							title: `${optionName} (0)`,
							dataOptionId: currentOption.optionId ? `${currentOption.optionId}` : null
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
					}
				);
			}
		});
	}
	return view;
}

function getTreeCheckboxUI(data, labelId, expandedFilters) {
	const optionName = data.name;
	// const id = data.id;
	const id = util.getOptionId(labelId, data.id);
	const filtersChangedData = {
		view: data.type,
		datatype: data.datatype,
		key: labelId,
		filterName: labelId,
		value: optionName,
		status: "equals",
		treeCheckboxFlag: true,
		diagnosisLevel: data.level,
		optionId: data.id,
		children: data.data,
		parent: data.parent,
	};

	const view = {
		rows: [
			{
				cols: [
					{
						view: "template",
						width: 19,
						css: {"border-width": "0px !important"}
					},
					{
						id,
						view: "checkbox",
						css: "checkbox-ctrl",
						label: "",
						labelRight: `${optionName} (0)`,
						value: 0,
						name: id,
						height: 28,
						attributes: {
							title: `${optionName} (0)`,
							dataOptionId: data.data ? `${data.optionId}` : null,
							parentId: data.parent
								? util.getOptionId(
									labelId,
									diagnosisModel.getDiagnosisConcatenateValue(data.parent)
								)
								: null,
						},
						labelWidth: 0,
						filtersChangedData,
						customCheckbox: false,
						on: {
							onChange(status) {
								let params;
								params = webix.copy(this.config.filtersChangedData);
								params.remove = !status;
								if (params.parent) {
									const parentValue = diagnosisModel.getDiagnosisConcatenateValue(params.parent);
									const parentId = util.getOptionId(labelId, parentValue);
									const element = $$(parentId);
									const levelCheckboxes = this
										.getParentView()
										.getParentView()
										.getParentView()
										.queryView({view: "checkbox"}, "all")
										.filter(c => c.isVisible());
									const isIndeterminate = status
										? levelCheckboxes.filter(c => c.getValue()).length > 0
										: true;
									filterService.changeParentState(element, isIndeterminate, status);
								}
								this.getTopParentView().$scope.app.callEvent("filtersChanged", [params]);
							}
						}
					}
				],
			},
			{
				paddingX: 20,
				rows: [],
			},
		]
	};
	data.data?.forEach((currentOption) => {
		view.rows[1].rows.push(getTreeCheckboxUI(currentOption, labelId, expandedFilters));
	});
	return data.data ? _attachCollapseToFilter(view, data, expandedFilters) : view;
}

/*
function getRangeSliderUI(data) {
	var min = data.options[0],
		max = data.options[1],
		length, i;
	if (data.options.length > 2) {
		length = data.options.length;

		for (i = 0; i < length; i++) {
			if (data.options[i] < min) {
				min = data.options[i];
			}
			if (data.options[i] > max) {
				max = data.options[i];
			}
		}
	}

	const view = {
		rows: [
			{
				view: "label",
				css: "rangeslider-label",
				label: data.name
			}
		]
	}

	const controls = {
		height: 110,
		rows: [
			{
				id: data.id + "|start",
				view: "slider",
				name: data.name,
				label: "Start",
				labelWidth: 100,
				value: min,
				min: min,
				max: max,
				title: "#value#",
				on: {
					onChange: function (a) {
						app.callEvent("filtersChanged", [{
							"view": "multiSlider",
							"max": parseInt($$(data.id + "|end").getValue()),
							"min": a,
							"key": data.id,
							"status": "between",
							"remove": true
						}]);
					}
				}
			},
			{
				id: data.id + "|end",
				view: "slider",
				name: data.name,
				label: "End",
				labelWidth: 100,
				value: max,
				min: min,
				max: max,
				title: "#value#",
				on: {
					onChange: function (a) {
						app.callEvent("filtersChanged", [{
							"view": "multiSlider",
							"key": data.id,
							"max": a,
							"min": $$(data.id + "|start").getValue(),
							"status": "between",
							"remove": true
						}]);
					}
				}
			},
			{
				cols: [
					{width: 100},
					{
						view: 'template',
						template: min.toString(),
						type: 'clean',
						maxWidth: 150,
						gravity: 1
					},
					{},
					{
						view: 'template',
						css: 'slider-label-right',
						template: max.toString(),
						type: 'clean',
						maxWidth: 150,
						gravity: 1
					}
				]
			}
		]
	}

	view.rows[1] = controls;
	return view;
};
*/

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
