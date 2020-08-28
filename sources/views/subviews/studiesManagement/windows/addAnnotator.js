import windowWithHeader from "../../../components/windowWithHeader";
import ajax from "../../../../services/ajaxActions";

let callbacks = {};

const form = {
	view: "form",
	css: "add-annotators-form",
	type: "clean",
	borderless: true,
	elementsConfig: {
		labelWidth: 150
	},
	elements: [
		{
			view: "fieldset",
			label: "Search user",
			body: {
				rows: [
					{
						view: "radio",
						label: "Choose search mode",
						vertical: true,
						name: "mode",
						value: "prefix",
						options: [
							{id: "prefix", value: '<span class="tooltip-container tooltip-search-prefix">' +
													'<span class="tooltip-title">Search by prefix</span>' +
													'<span class="tooltip-block tooltip-block-xs tooltip-block-right">You are searching by prefix. Start typing the first letters of whatever you are searching for.</span>' +
												'</span>'},
							{id: "text", value: '<span class="tooltip-container tooltip-search-text">' +
													'<span class="tooltip-title">Full text search</span>' +
													'<span class="tooltip-block tooltip-block-xs tooltip-block-right">By default, search results will be returned if they contain any of the terms of the search. If you wish to search for documents containing all of the terms, place them in quotes. Examples:' +
														'<ul class="tooltip-block-list">' +
															'<li><span class="code">cat dog</span> returns documents containing either "cat" or "dog".</li>' +
															'<li><span class="code">"cat" "dog"</span> returns documents containing both "cat" and "dog".</li>' +
															'<li><span class="code">"cat dog"</span> returns documents containing the phrase "cat dog".</li>' +
														'</ul>' +
													'</span>' +
												'</span>'}
						]
					},
					{
						view: "combo",
						css: "select-field",
						label: "Search for a user",
						placeholder: "Start typing a name...",
						name: "q",
						options: {
							keyPressTimeout: 300,
							filter() {}, // because of webix bug in webix 5.3.0
							body: {		// list
								scheme: {
									$init(obj) {
										obj.name = `${obj.lastName} ${obj.firstName} (${obj.login})`;
									}
								},
								template: "<span class='webix_icon fas fa-user'></span> #name#",
								dataFeed(text) {
									const thisForm = $$(form.id);
									const params = thisForm.getValues();
									params.q = text;
									ajax.search(params).then((data) => {
										this.clearAll();
										if (data && data.user && data.user.length) {
											this.parse(data.user);
											this.sort("name");
										}
									});
								}
							}
						}
					}
				]
			}
		},
		{
			paddingY: 10,
			cols: [
				{},
				{
					view: "button",
					css: "btn-contour",
					value: "Cancel",
					width: 95,
					align: "right",
					on: {
						onItemClick() {
							if (typeof callbacks.cancelCallback === "function") {
								callbacks.cancelCallback();
							}
							this.getTopParentView().hide();
						}
					}

				},
				{width: 20},
				{
					view: "button",
					css: "btn",
					value: "OK",
					width: 65,
					align: "right",
					on: {
						onItemClick() {
							if (typeof callbacks.okCallback === "function") {
								const f = this.getFormView();
								const selectedUser = f.elements.q.getList().getSelectedItem();
								if (selectedUser) {
									const isNeedHideWindow = callbacks.okCallback(selectedUser._id);
									if (isNeedHideWindow) {
										this.getTopParentView().hide();
									}
								}
								else {
									webix.alert({type: "alert-warning", text: "Please, select user"});
								}
							}
						}
					}

				}
			]
		}
	]
};

const template = {
	template(obj) {
		return `<span class='main-subtitle3'>${obj.studyName || ""}</span>`;
	},
	data: {studyName: ""},
	autoheight: true,
	autowidth: true
};

const windowBody = {
	width: 600,
	paddingX: 15,
	type: "clean",
	rows: [
		template,
		{height: 10},
		form
	]
};

function getConfig(id, okCallback, cancelCallback) {
	callbacks.okCallback = okCallback;
	callbacks.cancelCallback = cancelCallback;
	template.id = `search-user-template-${webix.uid()}`;
	form.id = `search-user-form-${webix.uid()}`;
	return windowWithHeader.getConfig(id, windowBody, "Add user");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getTemplateId() {
	return template.id;
}

function getFormId() {
	return form.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getTemplateId,
	getFormId
};
