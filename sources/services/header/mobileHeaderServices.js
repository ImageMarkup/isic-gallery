import authService from "app-services/auth";
import logoutPanelCols from "jet-views/header/parts/logoutPanelCols";

export default class MobileHeaderService {
	constructor(view, loginPanel, logoutPanel) {
		this._view = view;
		this._loginPanel = loginPanel;
		this._logoutPanel = logoutPanel;
		this._init();
	}

	_init() {
		this._view.$scope.on(this._view.$scope.app, "login", () => {
			this.showLogoutPanel();
		});
		this._view.$scope.on(this._view.$scope.app, "userInfoChanged", () => {
			this.showLogoutPanel();
		});
		this._view.$scope.on(this._view.$scope.app, "logout", () => {
			this._loginPanel.show();
		});
	}

	showLogoutPanel() {
		const user = authService.getUserInfo();
		const config = {css: "logout-mobile-name"};
		const cols = logoutPanelCols.createConfig(user.first_name, user.last_name, config);
		webix.ui(cols, this._logoutPanel);
		this._logoutPanel.show(false, false);
	}
}
