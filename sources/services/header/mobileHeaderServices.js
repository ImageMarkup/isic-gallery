import logoutPanelCols from "../../views/header/parts/logoutPanelCols";
import authService from "../auth";

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
		const cols = logoutPanelCols.createConfig(user.first_name, user.last_name);
		webix.ui(cols, this._logoutPanel);
		this._logoutPanel.show(false, false);
	}
}
