import authService from "../../../../services/auth";
import constants from "../../../../constants";
import accessControlWindow from "../windows/accessControl";
import ajaxActions from "../../../../services/ajaxActions";
import dates from "../../../../utils/formats";

const ACCESS_CONTROL_WINDOW_ID = "access-control-window";


function createActionsPanel(item) {
<<<<<<< HEAD
	const isNeedShowButton = item._accessLevel >= 1;
	const isNeedShowSetAccessButton = item._accessLevel >= 2;
=======
	const isNeedShowButton = authService.getUserInfo()._accessLevel >= 1;
>>>>>>> cd7521d525bd4ce85174aa2d47247312f65eaa07
	return {
		rows: [
			{
				template() {
					return "<div class='item-content-header'>Actions</div>";
				},
<<<<<<< HEAD
				hidden: !isNeedShowButton && !isNeedShowSetAccessButton,
=======
>>>>>>> cd7521d525bd4ce85174aa2d47247312f65eaa07
				autoheight: true,
				borderless: true
			},
			{
				paddingX: 17,
				paddingY: 12,
				margin: 10,
				cols: [
					{
						view: "button",
						css: "btn",
						value: "Register metadata",
						width: 150,
						height: 32,
						hidden: !isNeedShowButton,
						on: {
							onItemClick() {
								const path = `${constants.PATH_REGISTER_METADATA}?datasetId=${item._id}`;
								this.$scope.app.show(path);
							}
						}
					},
					{
						view: "button",
						css: "btn",
						value: "Apply metadata",
						width: 150,
						height: 32,
						hidden: !isNeedShowButton,
						on: {
							onItemClick() {
								const path = `${constants.PATH_APPLY_METADATA}?datasetId=${item._id}`;
								this.$scope.app.show(path);
							}
						}
					},
					{
						view: "button",
						css: "btn",
						value: "Set access",
<<<<<<< HEAD
						hidden: !isNeedShowSetAccessButton,
=======
>>>>>>> cd7521d525bd4ce85174aa2d47247312f65eaa07
						width: 110,
						height: 32,
						on: {
							onItemClick: () => {
								const win = $$(ACCESS_CONTROL_WINDOW_ID);
								ajaxActions.getDatasetAccess(item._id).then((data) => {
									if (!data) {
										return;
									}
									const list = $$(accessControlWindow.getListId());
									const form = $$(accessControlWindow.getFormId());
									form.config.datasetId = item._id;
									const template = $$(accessControlWindow.getTemplateId());
									template.setValues({name: item.name});

									const values = form.getCleanValues();
									values.public = data.public.toString();
									form.setValues(values);
									list.clearAll();
									const users = prepareUsersListData(data.access);
									list.parse(users);
									win.show();
								});
							}
						}
					},
					{}
				]
			}
		]
	};
}


function prepareUsersListData(data) {
	data.users.forEach((item) => {
		item._modelType = "user";
	});
	data.groups.forEach((item) => {
		item._modelType = "group";
	});
	return data.groups.concat(data.users);
}

function createAccordion(item, accordionItem) {
	const html = `	<div class='accordion-item-template'>
										<div class="item-content-header">Info</div>
										<div class="item-content-block">
											<div class="item-content-row">
												<span class="item-content-label">Unique ID</span>
												<span class="item-content-value">${item._id ? item._id : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Creator</span>
												<span class="item-content-value">${item.creator && item.creator.name ? item.creator.name : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Created</span>
												<span class="item-content-value">${dates.formatDateString(item.created)}</span>
											</div>

										</div>
										<div class="item-content-header">Description</div>
										<div class="item-content-block">
											<div class="item-content-row">
												<span class="item-content-label">Owner</span>
												<span class="item-content-value">${item.owner ? item.owner : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Description</span>
												<span class="item-content-value">${item.description ? item.description : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">License</span>
												<span class="item-content-value">${item.license ? item.license : ""}</span>
											</div>
											<div class="item-content-row">
												<span class="item-content-label">Attribution</span>
												<span class="item-content-value">${item.attribution ? item.attribution : ""}</span>
											</div>
<<<<<<< HEAD
=======
											<div class="item-content-row">
												<span class="item-content-label">Signature</span>
												<span class="item-content-value">${item.signature ? item.signature : ""}</span>
											</div>
>>>>>>> cd7521d525bd4ce85174aa2d47247312f65eaa07
										</div>
									</div>`;
	accordionItem.getChildViews()[0].addView({
		template: html,
		autoheight: true,
		borderless: true
	});
	if (authService.isStudyAdmin()) {
		accordionItem.getChildViews()[0].addView(createActionsPanel(item));
	}
	accordionItem.contentLoaded = true;
}

export default {
	createAccordion
};
