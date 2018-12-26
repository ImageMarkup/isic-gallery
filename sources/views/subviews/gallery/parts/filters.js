import filterService from "../../../../services/gallery/filter";

function getLabelUI(label) {
	return {
		view: "label",
		label: label.toUpperCase(),
		css: "gallery-sidebar-title",
		align: "left"
	};
}

function getCheckboxUI(data) {
	const view = {
		rows: [
			{
				view: "template",
				css: "checkbox-label",
				autoheight: true,
				template: data.name,
				borderless: true
			},
			{
				paddingX: 20,
				rows: []
			}
		]
	};

	function handleAgregateButton(data, elements, newValue, app) {
		const filtersInfo = [];
		let selectNone = !newValue;
		data.options.forEach((currentOption) => {
			const option = filterService.prepareOptionName(currentOption, data.id);
			const controlName = filterService.getOptionId(data.id, option);
			const control = elements[controlName];
			control.blockEvent(); // block events for checkbox
			control.setValue(newValue);
			control.unblockEvent();
			filtersInfo.push();
			let params = webix.copy(control.config.filtersChangedData);
			params.remove = !newValue;
			filtersInfo.push(params);
		});
		app.callEvent("filtersChanged", [filtersInfo, selectNone]);
	}
	const selectAllLabel = {
		view: "template",
		template: "<span class='select-all-label'>Select All</span>",
		borderless: true,
		height: 22,
		onClick: {
			"select-all-label": function () {
				const elements = this.getFormView().elements;
				handleAgregateButton(data, elements, 1, this.getTopParentView().$scope.app);
			}
		}
	};

	const selectNoneLabel = {
		view: "template",
		template: "<span class='select-none-label'>Select None</span>",
		borderless: true,
		height: 22,
		onClick: {
			"select-none-label": function () {
				const elements = this.getFormView().elements;
				handleAgregateButton(data, elements, 0, this.getTopParentView().$scope.app);
			}
		}
	};

	view.rows[1].rows.push(selectAllLabel);
	view.rows[1].rows.push(selectNoneLabel);

	data.options.forEach((currentOption) => {
		const optionName = filterService.prepareOptionName(currentOption, data.id);
		const id = filterService.getOptionId(data.id, optionName);
		const filtersChangedData = {
			view: data.type,
			datatype: data.datatype,
			key: data.id,
			filterName: data.name,
			value: optionName,
			status: "equals"
		};
		if (currentOption && data.type === "rangeCheckbox") {
			filtersChangedData.highBound = currentOption.highBound;
			filtersChangedData.lowBound = currentOption.lowBound;
		}
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
				tooltip: `${optionName} (0)`,
				labelWidth: 0,
				filtersChangedData,
				on: {
					onChange: function (status) {
						if (currentOption && data.type === "rangeCheckbox") {
							webix.extend(this.config.filtersChangedData, {
								highBound: currentOption.highBound,
								lowBound: currentOption.lowBound
							});
						}
						let params = webix.copy(this.config.filtersChangedData);
						params.remove = !status;
						this.getTopParentView().$scope.app.callEvent("filtersChanged", [params]);
					}
				}
			}
		);
	});
	return view;
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

export default {
	getLabelUI,
	getCheckboxUI
};
