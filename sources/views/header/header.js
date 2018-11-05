import {JetView} from "webix-jet";
import constants from "../../constants";
import loginWindow from "./../authWindows/loginWindow";
import signupWindow from "./../authWindows/signUpWindow";
import recoveryWindow from "./../authWindows/passwordRecoveryWindow";
import HeaderService from "../../services/header/headerServices";
import menuHandlerService from "../../services/menuHandlers";
import authService from "../../services/auth";
import uploadWindow from "./windows/uploadTypeWindow";

const LOGIN_MENU_ID = "login-menu";
const LOGOUT_PANEL_ID = "logout-panel";
const LOGIN_PANEL_ID = "login-panel";
const BASE_MENU_ID = "base-menu";

export default class Header extends JetView {
	config() {
		const logo = {
			template: "ISIC",
			css: "main-header-logo",
			borderless: true,
			width: 60,
			onClick: {
				"main-header-logo": () => menuHandlerService.clickHome()
			}
		};

		const baseMenu = {
			view: "menu",
			id: BASE_MENU_ID,
			css: "header-base-menu",
			width: 935,
			borderless: true,
			data: [
				{id: constants.ID_HEADER_MENU_ABOUT, value: "About"},
				{id: constants.ID_HEADER_MENU_FORUM, value: "Forum"},
				{id: constants.ID_HEADER_MENU_GALLERY, value: "Gallery"},
				{id: constants.ID_HEADER_MENU_CHALLENGES, value: "Challenges"},
				{id: constants.ID_HEADER_MENU_STUDIES, value: "Studies"},
				{id: constants.ID_HEADER_MENU_DERMO, value: "Dermoscopedia"},
				{id: constants.ID_HEADER_MENU_ARCHIVE, value: "Contribute to Archive"},
				{id: constants.ID_HEADER_MENU_DOWNLOAD, value: "Download Data"},
				{id: constants.ID_HEADER_MENU_DASHBOARD, value: "Dashboard"}
			],
			type: {
				subsign: true,
				height: 60
			},
			on: {
				onBeforeRender() {
					if (authService.isLoggedin()) {
						this.showItem("dashboard");
						this.showItem("forum");
					}
					else {
						this.hideItem("dashboard");
						this.hideItem("forum");
					}
				},
				onMenuItemClick(id) {
					switch (id) {
						case constants.ID_HEADER_MENU_ABOUT:
						{
							menuHandlerService.clickAbout();
							break;
						}
						case constants.ID_HEADER_MENU_FORUM:
						{
							menuHandlerService.clickForum();
							break;
						}
						case constants.ID_HEADER_MENU_GALLERY:
						{
							menuHandlerService.clickGallery();
							break;
						}
						case constants.ID_HEADER_MENU_CHALLENGES:
						{
							menuHandlerService.clickChallenges();
							break;
						}
						case constants.ID_HEADER_MENU_STUDIES:
						{
							menuHandlerService.clickStudies();
							break;
						}
						case constants.ID_HEADER_MENU_DERMO:
						{
							menuHandlerService.clickDermoscopedia();
							break;
						}
						case constants.ID_HEADER_MENU_DASHBOARD:
						{
							menuHandlerService.clickDashboard();
							break;
						}
						case constants.ID_HEADER_MENU_ARCHIVE:
						{
							menuHandlerService.clickUpload();
							break;
						}
						case constants.ID_HEADER_MENU_DOWNLOAD:
						{
							menuHandlerService.clickAPI();
							break;
						}
					}
				}
			}
		};


		const loginMenu = {
			template: "<span class='menu-sign-up login-menu-item'>Sign Up Free</span> <span class='menu-login login-menu-item'>Login</span> ",
			id: LOGIN_MENU_ID,
			css: "login-menu",
			borderless: true,
			width: 180,
			onClick: {
				"menu-login": (e, id) => {
					$$(constants.ID_WINDOW_LOGIN).show();
				},
				"menu-sign-up": (e, id) => {
					$$(constants.ID_WINDOW_SIGNUP).show();
				}
			}
		};

		const loginPanel = {
			id: LOGIN_PANEL_ID,
			cols: [
				{},
				loginMenu
			]
		};

		const logoutPanel = {
			id: LOGOUT_PANEL_ID,
			cols: [
			] // cols will be init after auth (after fiering login event on app).
		};

		const userPanel = {
			view: "multiview",
			css: "userbar",
			cells: [
				loginPanel,
				logoutPanel
			]
		};

		const header = {
			height: 60,
			width: 1220,
			css: "main-header",
			cols: [
				logo,
				baseMenu,
				userPanel
			]
		};
		return {
			css: "global-header",
			cols: [
				{},
				header,
				{}
			]
		};
	}

	init(view) {
		this.loginWindow = $$(constants.ID_WINDOW_LOGIN) || webix.ui(loginWindow.getConfig(constants.ID_WINDOW_LOGIN));
		this.signupWindow = $$(constants.ID_WINDOW_SIGNUP) || webix.ui(signupWindow.getConfig(constants.ID_WINDOW_SIGNUP));
		this.recoveryWindow = $$(constants.ID_WINDOW_RECOVERY) || webix.ui(recoveryWindow.getConfig(constants.ID_WINDOW_RECOVERY));
		this.uploadWindow = $$(constants.ID_WINDOW_UPLOAD_TYPE) || webix.ui(uploadWindow.getConfig(constants.ID_WINDOW_UPLOAD_TYPE));
		this.headerService = new HeaderService(
			view,
			$$(LOGIN_PANEL_ID),
			$$(LOGOUT_PANEL_ID),
			$$(BASE_MENU_ID)
		);
		if (authService.isLoggedin()) {
			this.headerService.showLogoutPanel();
		}
	}

	urlChange(view, url) {
	}
}
