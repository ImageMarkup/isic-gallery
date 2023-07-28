import {JetView, plugins} from "webix-jet";

import authService from "../../../services/auth";

const MENU_ID = "managementMenu";
const menuData = [
	{id: "managementCollections", value: "Collections", icon: "fas fa-align-justify"},
	{id: "managementUsers", value: "Users", icon: "far fa-user-circle"},
	{id: "managementGroups", value: "Groups", icon: "fas fa-users"}
];

export default class ManagementUIView extends JetView {
	config() {
		let menu = {
			view: "menu",
			id: MENU_ID,
			layout: "y",
			type: {
				height: 40
			},
			select: true,
			template: "<div style='padding-top:4px'><span class='webix_icon #icon#'></span>#value#</div>",
			data: menuData,
			width: 200
		};

		let ui = {
			cols: [
				{
					padding: 10,
					borderless: true,
					css: "management-left-panel",
					rows: [
						menu
					]
				},
				{$subview: true}

			]
		};

		return ui;
	}

	init() {
		this.use(plugins.Menu, MENU_ID);
	}

	urlChange() {
		authService.showMainPage();
	}
}
