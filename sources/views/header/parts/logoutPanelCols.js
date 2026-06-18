import constants from "../../../constants";
import state from "../../../models/state";
import authService from "../../../services/auth";

function createConfig(firstName, lastName) {
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
			width: 60,
			hidden: true
		},
		{
			rows: [
				{},
				{
					view: "menu",
					openAction: "click",
					maxWidth: 150,
					css: "logout-menu",
					data: [
						{
							id: "name",
							value: `<div class="menu-option" title="${name}">${name}</div>`,
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
