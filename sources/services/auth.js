import IsicClient from "@isic/client";
import state from "../models/state";
import ajax from "./ajaxActions";
import constants from "../constants";
import termOfUseWindow from "../views/authWindows/termOfUse";
import gallerySelectedImages from "../models/selectedGalleryImages";
import appliedFilters from "../models/appliedFilters";
import wizardUploaderStorage from "../models/wizardUploaderStorage";
import util from "../utils/util";

const ISIC_CLIENT_ID = process.env.ISIC_CLIENT_ID;
const AUTHORIZATION_SERVER = process.env.ISIC_AUTHORIZATION_SERVER;
const client = new IsicClient(
	ISIC_CLIENT_ID,
	AUTHORIZATION_SERVER
);

class OAuthISIC {
	constructor() {
		const isUserInfoExists = this.getUserInfo();
		if (!isUserInfoExists) {
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
				.then((userInfo) => {
					if (userInfo) {
						webix.storage.local.put("user", userInfo);
					}
					if (state.app) {
						state.app.callEvent("login");
					}
				})
				.catch(() => {
					console.error("Authentication: Something went wrong");
				});
		}
	}

	login() {
		webix.storage.local.put(constants.KEY_ACCEPT_TERMS, false);
		client.redirectToLogin();
	}

	logout() {
		client.logout()
			.then(() => {
				webix.storage.local.remove("user");
				webix.storage.local.remove("authToken");
				webix.storage.local.put(constants.KEY_ACCEPT_TERMS, false);
				gallerySelectedImages.clearImagesForDownload();
				gallerySelectedImages.clearImagesForStudies();
				appliedFilters.clearAll();
				appliedFilters.setFilterValue("");
				gallerySelectedImages.clearAll();
				wizardUploaderStorage.clearAll();
				state.clear();
				// state.app.callEvent("logout");
				state.app.refresh();
			});
	}

	getAuthHeaders() {
		return client.authHeaders;
	}

	getClient() {
		return client;
	}

	acceptTermOfUse() {
		const user = this.getUserInfo();
		if (user) {
			return ajax.putUserTermsOfUse(true)
				.then(async () => {
					const userInfo = await ajax.getUserInfo();
					if (userInfo && userInfo.accepted_terms) {
						webix.storage.local.put("user", user);
					}
				});
		}
		return new Promise((resolve) => {
			webix.storage.local.put(constants.KEY_ACCEPT_TERMS, true);
			resolve();
		});
	}

	refreshUserInfo() {
		return ajax.getUserInfo()
			.then((userInfo) => {
				if (userInfo && this.isUserInfoChanged(userInfo)) {
					webix.alert({
						title: "Close",
						text: "Your user permissions or other information have been changed",
						callback() {
							webix.storage.local.put("user", userInfo);
							state.app.refresh();
						}
					});
				}
				return userInfo;
			});
	}

	showTermOfUse(okCallback) {
		let win = $$(constants.ID_WINDOW_TERMS_OF_USE)
			|| webix.ui(termOfUseWindow.getConfig(constants.ID_WINDOW_TERMS_OF_USE));
		win.show();
		win.okCallback = okCallback;
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

	isTermsOfUseAccepted() {
		const user = this.getUserInfo();
		let termOfUse;
		if (user) {
			termOfUse = !!user.accepted_terms;
		}
		else {
			termOfUse = !!webix.storage.local.get(constants.KEY_ACCEPT_TERMS);
		}
		return termOfUse;
	}

	isUserInfoChanged(newData) {
		const currentUserInfo = this.getUserInfo();
		// check for the same user because of IE bug with promises
		return newData._id === currentUserInfo._id && !util.deepCompare(currentUserInfo, newData);
	}

	isLoggedin() {
		return this.getUserInfo();
	}
}

const instance = new OAuthISIC();

state.auth = instance;

export default instance;
