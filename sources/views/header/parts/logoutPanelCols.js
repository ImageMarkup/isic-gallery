import constants from "../../../constants";
import state from "../../../models/state";
import authService from "../../../services/auth";

function calcUserMenuWidth(str) {
	const nameWidth = str && str.length ? str.length * 20 : 1;
	return nameWidth <= 150 ? nameWidth : 150;
}

function createConfig(firstName, lastName, config) {
	const name = `${firstName || ""} ${lastName || ""}`;
	const cols = [
		{},
		{
			// TODO: uncomment if user avatar will be implemented in new API
			// template:
			// 	`<div class="userbar-avatar">
			// 		<img src="${imageUrl}" class="userbar-avatar-image" width="50px" height="50px"/>
			// 	</div>`,
			borderless: true,
			width: 60
		},
		{
			rows: [
				{},
				{
					view: "menu",
					openAction: "click",
					width: calcUserMenuWidth(name),
					data: [
						{
							id: "name",
							css: config.css,
							value: `<span style="margin-left: -10px; width: ${calcUserMenuWidth(name)}px;" title="${firstName} ${lastName}"}>${name}</span>`,
							submenu: [
								{id: "logout", value: "<span class='webix_icon fas fa-arrow-right'></span> Logout"}
							]
						}
					],
					type: {
						subsign: true
					},
					on: {
						onMenuItemClick(id) {
							switch (id) {
								case "logout": {
									authService.logout();
									break;
								}
								case "account": {
									state.app.show(constants.PATH_USER_ACCOUNT);
									break;
								}
								default: {
									break;
								}
							}
						}
					}
				},
				{}
			]
		}
	];

	return cols;
}

export default {
	createConfig
};
