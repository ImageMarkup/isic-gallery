import {JetView} from "webix-jet";

import authService from "../../services/auth";
import menuHandlerService from "../../services/menuHandlers";
import constants from "../../constants";
import uploadWindow from "jet-views/header/windows/uploadTypeWindow";
import MobileHeaderService from "app-services/header/mobileHeaderServices";

const ID_LOGOUT_PANEL = `logout-panel-id-${webix.uid()}`;
const ID_LOGIN_MENU = `login-menu-id-${webix.uid()}`;
const ID_LOGIN_PANEL = `login-panel-id-${webix.uid()}`;
const ID_MENU_PANEL = `menu-panel-id-${webix.uid()}`;

export default class MobileHeader extends JetView {
	config() {
		const menuPanel = {
			view: "sidebar",
			id: ID_MENU_PANEL,
			data: []
		};

		const logo = {
			template: "ISIC",
			css: "mobile-header-logo",
			borderless: true,
			width: 60,
			onClick: {
				"mobile-header-logo": () => menuHandlerService.clickHome()
			}
		};

		const loginMenu = {
			template: "<span class='menu-login login-menu-item'>Login</span> ",
			id: ID_LOGIN_MENU,
			css: "login-menu-mobile",
			borderless: true,
			width: 90,
			onClick: {
				"menu-login": (/* e, id */) => {
					authService.login();
				}
			}
		};

		const loginPanel = {
			id: ID_LOGIN_PANEL,
			cols: [
				{},
				loginMenu
			]
		};

		const logoutPanel = {
			id: ID_LOGOUT_PANEL,
			cols: [
			] // cols will be init after auth (after fiering login event on app).
		};

		const userPanel = {
			view: "multiview",
			css: "userbar",
			gravity: 1,
			cells: [
				loginPanel,
				logoutPanel
			]
		};

		const header = {
			css: "mobile-header",
			height: 60,
			cols: [
				logo,
				{gravity: 1},
				userPanel
			]
		};

		return {
			css: "mobile-header",
			cols: [
				header
			]
		};
	}

	init(view) {
		this.view = view;
		this.uploadWindow = $$(constants.ID_WINDOW_UPLOAD_TYPE)
			|| webix.ui(uploadWindow.getConfig(constants.ID_WINDOW_UPLOAD_TYPE));
		this.headerService = new MobileHeaderService(
			view,
			$$(ID_LOGIN_PANEL),
			$$(ID_LOGOUT_PANEL)
		);
		if (authService.isLoggedin()) {
			this.headerService.showLogoutPanel();
		}
	}
}
