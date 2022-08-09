import constants from "../../../../constants";
import dates from "../../../../utils/formats";

// TODO: uncomment when dataset will be implemented
// const ACCESS_CONTROL_WINDOW_ID = "access-control-window";


function createActionsPanel(item) {
	const isNeedShowButton = item._accessLevel >= 1;
	const isNeedShowSetAccessButton = item._accessLevel >= 2;
	return {
		rows: [
			{
				template() {
					return "<div class='item-content-header'>Actions</div>";
				},
				hidden: !isNeedShowButton && !isNeedShowSetAccessButton,
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
						hidden: !isNeedShowSetAccessButton,
						width: 110,
						height: 32,
						on: {
							onItemClick: () => {
								// TODO: uncomment when dataset will be implemented
								// const win = $$(ACCESS_CONTROL_WINDOW_ID);
							}
						}
					},
					{}
				]
			}
		]
	};
}

// TODO: uncomment when dataset will be implemented
// function prepareUsersListData(data) {
// 	data.users.forEach((item) => {
// 		item._modelType = "user";
// 	});
// 	data.groups.forEach((item) => {
// 		item._modelType = "group";
// 	});
// 	return data.groups.concat(data.users);
// }

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
										</div>
									</div>`;
	accordionItem.getChildViews()[0].addView({
		template: html,
		autoheight: true,
		borderless: true
	});
	accordionItem.getChildViews()[0].addView(createActionsPanel(item));
	accordionItem.contentLoaded = true;
}

export default {
	createAccordion
};
