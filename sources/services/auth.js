import OauthClient from "@resonant/oauth-client";
import {AxiosError} from "axios";

import constants from "../constants";
import appliedFilters from "../models/appliedFilters";
import gallerySelectedImages from "../models/selectedGalleryImages";
import state from "../models/state";
import wizardUploaderStorage from "../models/wizardUploaderStorage";
import logger from "../utils/logger";
import util from "../utils/util";
import mobileLandscapeTermOfUse from "../views/authWindows/mobileLandscapeTermOfUse";
import mobileTermOfUseWindow from "../views/authWindows/mobileTermOfUse";
import termOfUseWindow from "../views/authWindows/termOfUse";
import ajax from "./ajaxActions";

const ISIC_CLIENT_ID = process.env.ISIC_CLIENT_ID;
const AUTHORIZATION_SERVER = process.env.ISIC_AUTHORIZATION_SERVER;
const client = new OauthClient(
	new URL(`${AUTHORIZATION_SERVER}/oauth/`),
	ISIC_CLIENT_ID,
);

class OAuthISIC {
	#isLoginRestored;

	constructor() {
		const isUserInfoExists = this.getUserInfo();
		if (!isUserInfoExists) {
			this.#isLoginRestored = client.maybeRestoreLogin()
				.then(() => {
					if (client.isLoggedIn) {
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
				.catch((e) => {
					this.errorHandler(e);
				});
		}
		webix.attachEvent("onRotate", (landscape) => {
			const win = $$(constants.ID_MOBILE_WINDOW_TERMS_OF_USE)
				|| webix.ui(mobileTermOfUseWindow.getConfig(constants.ID_MOBILE_WINDOW_TERMS_OF_USE));
			const landWin = $$(constants.ID_MOBILE_LANDSCAPE_TERMS_OF_USE)
				|| webix.ui(mobileLandscapeTermOfUse.getConfig(constants.ID_MOBILE_LANDSCAPE_TERMS_OF_USE));
			if (win.isVisible() || landWin.isVisible()) {
				this.reloadPage();
			}
		});
	}

	login() {
		webix.storage.local.put(constants.KEY_ACCEPT_TERMS, false);
		client.redirectToLogin();
	}

	logout() {
		client.logout()
			.then(() => {
				webix.storage.local.remove("user");
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
				})
				.catch((e) => {
					this.errorHandler(e);
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
			})
			.catch((e) => {
				this.errorHandler(e);
			});
	}

	showTermOfUse(okCallback) {
		let win = $$(constants.ID_WINDOW_TERMS_OF_USE)
			|| webix.ui(termOfUseWindow.getConfig(constants.ID_WINDOW_TERMS_OF_USE));
		win.show();
		win.okCallback = okCallback;
	}

	showMobileTermOfUse(okCallback) {
		const win = $$(constants.ID_MOBILE_WINDOW_TERMS_OF_USE)
			|| webix.ui(mobileTermOfUseWindow.getConfig(constants.ID_MOBILE_WINDOW_TERMS_OF_USE));
		const landWin = $$(constants.ID_MOBILE_LANDSCAPE_TERMS_OF_USE)
			|| webix.ui(mobileLandscapeTermOfUse.getConfig(constants.ID_MOBILE_LANDSCAPE_TERMS_OF_USE));
		if (util.isPortrait()) {
			win.show();
		}
		else {
			landWin.show();
		}
		win.okCallback = okCallback;
		landWin.okCallback = okCallback;
	}

	showMainPage() {
		window.location = "/";
	}

	reloadPage() {
		window.location.reload(true);
	}

	getUserInfo() {
		return webix.storage.local.get("user");
	}

	setUserInfo(user) {
		webix.storage.local.put("user", user);
		state.app.callEvent("userInfoChanged");
	}

	async isTermsOfUseAccepted() {
		if (this.isLoginRestored?.finally) {
			await this.isLoginRestored.finally();
		}
		const user = this.getUserInfo();
		let isAccepted;
		if (user) {
			isAccepted = !!user.accepted_terms;
		}
		else {
			isAccepted = !!webix.storage.local.get(constants.KEY_ACCEPT_TERMS);
		}
		return isAccepted;
	}

	isUserInfoChanged(newData) {
		const currentUserInfo = this.getUserInfo();
		// check for the same user because of IE bug with promises
		return newData._id === currentUserInfo._id && !util.deepCompare(currentUserInfo, newData);
	}

	isLoggedin() {
		return this.getUserInfo();
	}

	get isLoginRestored() {
		return this.#isLoginRestored;
	}

	errorHandler(e) {
		logger.error(e);
		if (e.cause instanceof AxiosError) {
			if (e.cause.response.status === 401) {
				this.logout();
			}
			else {
				logger.error("Authentication: bad response");
			}
		}
		else {
			logger.error("Authentication: Something went wrong");
		}
	}
}

const instance = new OAuthISIC();

state.auth = instance;

export default instance;
