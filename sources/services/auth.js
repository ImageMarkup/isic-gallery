import state from "../models/state";
import ajax from "./ajaxActions";
import constants from "../constants";
import termOfUseWindow from "../views/authWindows/termOfUse";
import gallerySelectedImages from "../models/selectedGalleryImages";
import appliedFilters from "../models/appliedFilters";
import wizardUploaderStorage from "../models/wizardUploaderStorage";
import util from "../utils/util";

function login(params, afterLoginPage) {
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

function loginByIdToken(userId, token) {
	return ajax.getTemporaryUserInfo(userId, token).then((data) => {
		webix.storage.local.put("authToken", data.authToken);
		webix.storage.local.put("user", data.user);
		// trigger event
		state.app.callEvent("login");
	});
}

function logout() {
	ajax.logout().then(() => {
		webix.storage.local.remove("user");
		webix.storage.local.remove("authToken");
		gallerySelectedImages.clearImagesForDownload();
		gallerySelectedImages.clearImagesForStudies();
		appliedFilters.clearAll();
		wizardUploaderStorage.clearAll();
		state.clear();
		state.app.refresh();
	});
	//state.app.callEvent("logout");
}

function getToken() {
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
	}*/
	return authToken.token;
}

function isUserInfoChanged(newData) {
	let currentUserInfo = getUserInfo();
	return !util.deepCompare(currentUserInfo, newData);
}

function refreshUserInfo() {
	return ajax.getUserInfo().then((data) => {
		if (data && isUserInfoChanged(data)) {
			logout();
			webix.alert({
				title: "Close",
				text: "Your user permissions or other information have been changed",
				callback() {
					state.app.refresh();
				}
			});
		}
		return data;
	});
}

function isLoggedin() {
	return getToken() && getUserInfo();
}

function isTermsOfUseAccepted() {
	const user = getUserInfo();
	let termOfUse;
	if (user) {
		termOfUse = user.permissions.acceptTerms;
	} else {
		termOfUse = !!webix.storage.local.get(constants.KEY_ACCEPT_TERMS);
	}
	return termOfUse;
}

function acceptTermOfUse() {
	const user = getUserInfo();
	if (user) {
		ajax.postUserTermsOfUse(true);
	} else {
		webix.storage.local.put(constants.KEY_ACCEPT_TERMS, true);
	}

}

function showMainPage() {
	window.location = "/";
}

function getUserInfo() {
	return webix.storage.local.get("user");
}

function setUserInfo(user) {
	webix.storage.local.put("user", user);
	state.app.callEvent("userInfoChanged");
}

function showTermOfUse(okCallback) {
	let win = $$(constants.ID_WINDOW_TERMS_OF_USE)
		|| webix.ui(termOfUseWindow.getConfig(constants.ID_WINDOW_TERMS_OF_USE));
	win.show();
	win.okCallback = okCallback;
}

function isStudyAdmin() {
	const user = getUserInfo();
	return user && user.permissions && user.permissions.adminStudy;
}

function canCreateDataset() {
	const user = getUserInfo();
	return user && user.permissions && user.permissions.createDataset;
}

function hasSegmentationSkill() {
	const user = getUserInfo();
	return user && user.permissions && user.permissions.segmentationSkill;
}

function canReviewDataset() {
	const user = getUserInfo();
	return user && user.permissions && user.permissions.reviewDataset;
}

export default {
	login,
	logout,
	refreshUserInfo,
	isLoggedin,
	getToken,
	showMainPage,
	isTermsOfUseAccepted,
	acceptTermOfUse,
	getUserInfo,
	setUserInfo,
	showTermOfUse,
	isStudyAdmin,
	loginByIdToken,
	canCreateDataset,
	hasSegmentationSkill,
	canReviewDataset
};

