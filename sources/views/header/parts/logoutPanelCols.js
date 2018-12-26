import authService from "../../../services/auth";
import state from "../../../models/state";
import constants from "../../../constants";

function calcUserMenuWidth(str) {
	return (str && str.length ? str.length * 20 : 1) <= 150 || 150;
}

function createConfig(firstName, lastName, imageUrl) {
	const name = `${firstName || ""} ${lastName || ""}`;
	const cols = [
		{},
		{
			template: `<div class="userbar-avatar"><img src="${imageUrl}" class="userbar-avatar-image" width="50px" height="50px"/></div>`,
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
							value: `<span style="margin-left: -10px; width: ${calcUserMenuWidth(name)}px;" title="${firstName} ${lastName}"}>${name}</span>`,
							submenu: [
								{id: "account", value: "<span class='webix_icon fa-cog'></span> My account"},
								{$template: "Separator"},
								{id: "logout", value: "<span class='webix_icon fa-arrow-right'></span> Logout"}
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
