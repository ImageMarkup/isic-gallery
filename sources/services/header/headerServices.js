import logoutPanelCols from "../../views/header/parts/logoutPanelCols";
import authService from "../auth";

class HeaderService {
	constructor(view, loginPanel, logoutPanel, baseMenu) {
		this._view = view;
		this._loginPanel = loginPanel;
		this._logoutPanel = logoutPanel;
		this._baseMenu = baseMenu;
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
		this._view.$scope.on(this._view.$scope.app, "needSelectHeaderItem", (data) => {
			if (!(data && data.itemName)) {
				const selectedId = this._baseMenu.getSelectedId();
				if (selectedId) {
					this._baseMenu.unselect(selectedId);
				}
			}
			else {
				this._baseMenu.select(data.itemName);
			}
		});
	}

	showLogoutPanel() {
		const user = authService.getUserInfo();
		const cols = logoutPanelCols.createConfig(user.first_name, user.last_name);
		webix.ui(cols, this._logoutPanel);
		this._logoutPanel.show(false, false);
	}
}

export default HeaderService;
