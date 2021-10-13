import IsicClient from "@isic/client";
import state from "../models/state";
import ajax from "./ajaxActions";
import constants from "../constants";
import termOfUseWindow from "../views/authWindows/termOfUse";
import gallerySelectedImages from "../models/selectedGalleryImages";
import appliedFilters from "../models/appliedFilters";
import selectedImages from "../models/selectedGalleryImages";
import wizardUploaderStorage from "../models/wizardUploaderStorage";
import util from "../utils/util";

const ISIC_CLIENT_ID = process.env.ISIC_CLIENT_ID;
const AUTHORIZATION_SERVER = process.env.ISIC_AUTHORIZATION_SERVER;
const client = new IsicClient(
	ISIC_CLIENT_ID,
	AUTHORIZATION_SERVER
);

class Auth {
	login(params, afterLoginPage) {
		return ajax.login(params).then((data) => {
			webix.storage.local.put("authToken", data.authToken);
			webix.storage.local.put("user", data.user);
			// trigger event
			state.app.callEvent("login");
			// path that we should show after login. it can be set in any place of app
			if (afterLoginPage) {
				state.app.show(afterLoginPage);
			}
			else {
				state.app.refresh();
			}
		});
	}

	loginByIdToken(userId, token) {
		return ajax.getTemporaryUserInfo(userId, token).then((data) => {
			webix.storage.local.put("authToken", data.authToken);
			webix.storage.local.put("user", data.user);
			// trigger event
			state.app.callEvent("login");
		});
	}

	logout() {
		ajax.logout().then(() => {
			webix.storage.local.remove("user");
			webix.storage.local.remove("authToken");
			gallerySelectedImages.clearImagesForDownload();
			gallerySelectedImages.clearImagesForStudies();
			appliedFilters.clearAll();
			appliedFilters.setFilterValue("");
			selectedImages.clearAll();
			wizardUploaderStorage.clearAll();
			state.clear();
			// state.app.callEvent("logout");
			state.app.refresh();
		});
	}

	getToken() {
		const authToken = webix.storage.local.get("authToken");
		if (!authToken) {
			return null;
		}
		/* Do not need check expiration time
		const expDate = new Date(authToken.expires);
		const now = new Date();
		if (expDate <= now) {
			logout();
			return null;
		} */
		if (state.authorization_mode === "Legacy") {
			return authToken.token;
		}
		return authToken;
	}

	isUserInfoChanged(newData) {
		const currentUserInfo = this.getUserInfo();
		// check for the same user because of IE bug with promises
		return newData._id === currentUserInfo._id && !util.deepCompare(currentUserInfo, newData);
	}

	refreshUserInfo() {
		return ajax.getUserInfo().then((data) => {
			if (data && this.isUserInfoChanged(data)) {
				webix.alert({
					title: "Close",
					text: "Your user permissions or other information have been changed",
					callback() {
						webix.storage.local.put("user", data);
						state.app.refresh();
					}
				});
			}
			return data;
		});
	}

	isLoggedin() {
		return this.getToken() && this.getUserInfo();
	}

	isTermsOfUseAccepted() {
		const user = this.getUserInfo();
		let termOfUse;
		if (user) {
			termOfUse = user.permissions.acceptTerms;
		}
		else {
			termOfUse = !!webix.storage.local.get(constants.KEY_ACCEPT_TERMS);
		}
		return termOfUse;
	}

	acceptTermOfUse() {
		const user = this.getUserInfo();
		if (user) {
			return ajax.postUserTermsOfUse(true).then(() => {
				user.permissions.acceptTerms = true;
				webix.storage.local.put("user", user);
			});
		}
		else {
			return new Promise((resolve, reject) => {
				webix.storage.local.put(constants.KEY_ACCEPT_TERMS, true);
				resolve();
			});
		}
	}

	showMainPage() {
		window.location = "/";
	}

	getUserInfo() {
		return webix.storage.local.get("user");
	}

	setUserInfo(user) {
		webix.storage.local.put("user", user);
		state.app.callEvent("userInfoChanged");
	}

	showTermOfUse(okCallback) {
		let win = $$(constants.ID_WINDOW_TERMS_OF_USE)
			|| webix.ui(termOfUseWindow.getConfig(constants.ID_WINDOW_TERMS_OF_USE));
		win.show();
		win.okCallback = okCallback;
	}

	isStudyAdmin() {
		const user = this.getUserInfo();
		return user && user.permissions && user.permissions.adminStudy;
	}

	canCreateDataset() {
		const user = this.getUserInfo();
		return user && user.permissions && user.permissions.createDataset;
	}

	hasSegmentationSkill() {
		const user = this.getUserInfo();
		return user && user.permissions && user.permissions.segmentationSkill;
	}

	canReviewDataset() {
		const user = this.getUserInfo();
		return user && user.permissions && user.permissions.reviewDataset;
	}
}

class OAuthISIC extends Auth {
	constructor() {
		super();

		const isLegacyTokenExists = this.getToken();
		const isUserInfoExists = this.getUserInfo();
		if (!isLegacyTokenExists || !isUserInfoExists) {
			client.maybeRestoreLogin()
				.then(() => {
					if (client.isLoggedIn) {
						return client.getLegacyToken();
					}
					return null;
				})
				.then((_legacyToken) => {
					if (_legacyToken) {
						webix.storage.local.put("authToken", _legacyToken);
						return ajax.getUserInfo();
					}
					return null;
				})
				.then((user) => {
					if (user) {
						webix.storage.local.put("user", user);
						// trigger event
						state.app.callEvent("login");
					}
				})
				.catch(() => {
					client.logout();
				});
		}
	}

	login() {
		client.redirectToLogin();
	}

	logout() {
		client.logout()
			.then(() => {
				webix.storage.local.remove("user");
				webix.storage.local.remove("authToken");
				gallerySelectedImages.clearImagesForDownload();
				gallerySelectedImages.clearImagesForStudies();
				appliedFilters.clearAll();
				appliedFilters.setFilterValue("");
				selectedImages.clearAll();
				wizardUploaderStorage.clearAll();
				state.clear();
				// state.app.callEvent("logout");
				state.app.refresh();
			});
	}
}

const instance = state.authorization_mode === "Legacy" ? new Auth() : new OAuthISIC();

export default instance;
