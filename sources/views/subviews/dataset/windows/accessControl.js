import windowWithHeader from "../../../components/windowWithHeader";
import "../../../components/activeList";

let callbacks = {};

const DEFAULT_ACCESS_LEVEL = "0";

// concat users and groups arrays to one array
function prepareOptions(data) {
	if (data && Array.isArray(data.user) && Array.isArray(data.group)) {
		return data.group.concat(data.user);
	}
	return [];
}

// eslint-disable-next-line no-unused-vars
function _prepereListDataForAPI(data) {
	const result = {};
	data.forEach((item) => {
		// because we need to send number in json for api
		item.level = parseInt(item.level);
		if (item._modelType === "user") {
			if (!result.users) {
				result.users = [];
			}
			result.users.push(item);
		}
		if (item._modelType === "group") {
			if (!result.groups) {
				result.groups = [];
			}
			result.groups.push(item);
		}
	});
	return result;
}

const list = {
	view: "activeList",
	autoheight: true,
	yCount: 5,
	template(obj, common) {
		let iconNameHtml = "";
		if (obj._modelType === "user") {
			iconNameHtml = `<div class="access-row-icon">
							<span class="webix_icon fas fa-user"></span>
						</div>
						<div class="access-row-user">
							<div class="access-row-user-top">${obj.name}</div>
							<div class="access-row-user-bottom">${obj.login}</div>
						</div>`;
		}
		else if (obj._modelType === "group") {
			iconNameHtml = `<div class="access-row-icon">
							<span class="webix_icon fas fa-users"></span>
						</div>
						<div class="access-row-user">
							<div class="access-row-user-top">${obj.name}</div>
							<div class="access-row-user-bottom">${obj.description}</div>
						</div>`;
		}
		return `<div class="access-row">
						<div class="access-row-btn">
							<span class="webix_icon fas fa-times remove-user"></span>
						</div>
						<div class="access-row-select">${common.level(obj, common)}</div>
				        ${iconNameHtml}
					</div>`;
	},
	on: {
		onBeforeAdd(id, item) {
			item.level = DEFAULT_ACCESS_LEVEL;
		}
	},
	onClick: {
		// eslint-disable-next-line func-names
		"remove-user": function (e, id) {
			if (this.data.count() > 1) {
				this.remove(id);
			}
			else {
				webix.alert({
					text: "At least one user is required"
				});
			}
			return false; // blocks the default click behavior
		}
	},
	activeContent: {
		level: {
			view: "richselect",
			css: "select-field",
			width: 120,
			value: DEFAULT_ACCESS_LEVEL,
			options: [
				{id: "2", value: "Is owner"},
				{id: "1", value: "Can edit"},
				{id: "0", value: "Can view"}
			]
		}
	}
};

const searchFieldset = {
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
				labelWidth: 150,
				options: [
					{
						id: "prefix",
						value: '<span class="tooltip-container tooltip-search-prefix">' +
					'<span class="tooltip-title">Search by prefix</span>' +
					'<span class="tooltip-block tooltip-block-xs tooltip-block-right">You are searching by prefix. Start typing the first letters of whatever you are searching for.</span>' +
					"</span>"
					},
					{
						id: "text",
						value: '<span class="tooltip-container tooltip-search-text">' +
					'<span class="tooltip-title">Full text search</span>' +
					'<span class="tooltip-block tooltip-block-xs tooltip-block-right">By default, search results will be returned if they contain any of the terms of the search. If you wish to search for documents containing all of the terms, place them in quotes. Examples:' +
					'<ul class="tooltip-block-list">' +
					'<li><span class="code">cat dog</span> returns documents containing either "cat" or "dog".</li>' +
					'<li><span class="code">"cat" "dog"</span> returns documents containing both "cat" and "dog".</li>' +
					'<li><span class="code">"cat dog"</span> returns documents containing the phrase "cat dog".</li>' +
					"</ul>" +
					"</span>" +
					"</span>"
					}
				]
			},
			{
				view: "combo",
				css: "select-field",
				label: "Search for a user",
				placeholder: "Start typing a name...",
				name: "q",
				labelWidth: 150,
				options: {
					keyPressTimeout: 300,
					filter() {}, // because of webix bug in webix 5.3.0
					body: {		// list
						scheme: {
							$init(obj) {
								if (obj._modelType === "user") {
									obj.name = `${obj.lastName} ${obj.firstName} (${obj.login})`;
								}
							}
						},
						template(obj) {
							if (obj._modelType === "user") {
								return `<span class="webix_icon fas fa-user"></span> ${obj.name}`;
							}
							return `<span class="webix_icon fas fa-users"></span> ${obj.name}`;
						},
						on: {
							onItemClick(id) {
								const item = this.getItem(id);
								const existingUsersList = $$(list.id);
								if (existingUsersList.getItem(item._id)) {
									webix.alert({
										type: "alert-warning",
										text: "User is already in permission list"
									});
								}
								else {
									const added = webix.copy(item);
									added.id = added._id;
									added.name = `${added.firstName} ${added.lastName}`;
									existingUsersList.add(added);
								}
							}
						},
						dataFeed(/* text */) {
							// TODO: uncomment when search will be implemented
							/* const thisForm = $$(form.id);
							const params = {
								q: text,
								mode: thisForm.getValues().mode,
								types: ["user", "group"]
							}; */
						}
					}
				}
			}
		]
	}
};

const form = {
	view: "form",
	type: "clean",
	borderless: true,
	elements: [
		{
			view: "radio",
			css: "access-radio-block",
			name: "public",
			value: "false",
			vertical: true,
			options: [
				{
					id: "false",
					value: "<span class='webix_icon fas fa-lock'></span><b>Private</b> — Access is required to view this Dataset"
				}, // the initially selected item
				{
					id: "true",
					value: "<span class='webix_icon fas fa-globe'></span><b>Public</b> — Anyone can view this Dataset"
				}
			]
		},
		{
			paddingY: 10,
			rows: [
				{
					template: "Permissions",
					autoheight: true
				},
				list
			]
		},
		{height: 5},
		{
			css: "access-control-part-form",
			rows: [
				{
					template: "Grant access to another group or user",
					autoheight: true,
					borderless: true
				},
				{height: 5},
				searchFieldset,
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
									const permissionsList = $$(list.id);
									const ownersArray = permissionsList.data.find(obj => obj.level.toString() === "2");
									if (ownersArray.length > 0) {
										// TODO: uncomment when dataset will be implemented
										/* const thisForm = this.getFormView();
										const usersList = _prepereListDataForAPI(permissionsList.data.serialize());
										const params = {
											access: usersList,
											public: thisForm.getValues().public
										};
										// form.config.datasetId has been added after window initialisation
										ajax.putDatasetAccess(thisForm.config.datasetId, params); */
										this.getTopParentView().hide();
									}
									else {
										webix.alert({
											text: "At least one owner is required"
										});
									}
								}
							}

						}
					]
				}
			]
		}
	]
};

const template = {
	template(obj) {
		return `<span class='main-subtitle3'>${obj.name || ""}</span>`;
	},
	data: {name: ""},
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
	template.id = `access-template-${webix.uid()}`;
	form.id = `access-form-${webix.uid()}`;
	list.id = `access-datatable-${webix.uid()}`;
	return windowWithHeader.getConfig(id, windowBody, "Access control");
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

function getListId() {
	return list.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getTemplateId,
	getFormId,
	getListId,
	prepareOptions
};
