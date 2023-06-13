import {JetView} from "webix-jet";
import constants from "../../constants";
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
				{id: constants.ID_HEADER_MENU_FORUM, value: "Forum"},
				{id: constants.ID_HEADER_MENU_GALLERY, value: "Gallery"},
				{
					id: constants.ID_HEADER_MENU_CHALLENGES,
					value: "Challenges",
					$css: "menu-with-sub",
					submenu: [
						{
							id: constants.ID_HEADER_SUB_MENU_CHALLENGE2016,
							value: "Challenge 2016",
							href: constants.URL_CHALLENGE_2016,
							target: "_blank"
						},
						{
							id: constants.ID_HEADER_SUB_MENU_CHALLENGE2017,
							value: "Challenge 2017",
							href: constants.URL_CHALLENGE_2017,
							target: "_blank"
						},
						{
							id: constants.ID_HEADER_SUB_MENU_CHALLENGE2018,
							value: "Challenge 2018",
							href: constants.URL_CHALLENGE_2018,
							target: "_blank"
						},
						{
							id: constants.ID_HEADER_SUB_MENU_CHALLENGE2019,
							value: "Challenge 2019",
							href: constants.URL_CHALLENGE_2019,
							target: "_blank"
						},
						{
							id: constants.ID_HEADER_SUB_MENU_CHALLENGE2020,
							value: "Challenge 2020",
							href: constants.URL_CHALLENGE_2020,
							target: "_blank"
						},
						{
							id: constants.ID_HEADER_SUB_MENU_CHALLENGES_LIVE,
							value: "Live Challenges",
							href: constants.URL_CHALLENGES_LIVE,
							target: "_blank"
						}
					]
				},
				{id: constants.ID_HEADER_MENU_ARCHIVE, value: "Contribute to Archive"},
				{id: constants.ID_HEADER_MENU_DASHBOARD, value: "Dashboard"}
			],
			type: {
				subsign: true,
				height: 60
			},
			on: {
				onBeforeRender() {
					const headerMenu = $$(BASE_MENU_ID);
					if (authService.isLoggedin()) {
						this.showItem("dashboard");
						this.showItem("forum");
					}
					else {
						this.hideItem("dashboard");
						this.hideItem("forum");
					}
					headerMenu.disableItem(constants.ID_HEADER_MENU_STUDIES);
				},
				onMenuItemClick: (id) => {
					const headerMenu = $$(BASE_MENU_ID);
					switch (id) {
						case constants.ID_HEADER_MENU_ABOUT:
						{
							menuHandlerService.clickAbout();
							break;
						}
						case constants.ID_HEADER_MENU_FORUM:
						{
							menuHandlerService.clickForum();
							// to fix bug with css selection
							break;
						}
						case constants.ID_HEADER_MENU_GALLERY:
						{
							menuHandlerService.clickGallery();
							break;
						}
						case constants.ID_HEADER_MENU_CHALLENGES:
						{
							menuHandlerService.clickChallenges(id);
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
							headerMenu.unselect(id);
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
						default: {
							break;
						}
					}
				}
			}
		};


		const loginMenu = {
			template: "<span class='menu-login login-menu-item'>Login</span> ",
			id: LOGIN_MENU_ID,
			css: "login-menu",
			borderless: true,
			width: 90,
			onClick: {
				"menu-login": (/* e, id */) => {
					authService.login();
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
				header
			]
		};
	}

	init(view) {
		this.view = view;
		this.uploadWindow = $$(constants.ID_WINDOW_UPLOAD_TYPE)
			|| webix.ui(uploadWindow.getConfig(constants.ID_WINDOW_UPLOAD_TYPE));
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

	urlChange(/* view, url */) {}
}
