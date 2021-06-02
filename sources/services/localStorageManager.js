import constants from "../constants";

export default function manageLocalStorageByAppVersion() {
	const appVersion = VERSION;
	const cookieVersion = webix.storage.cookie.get(constants.COOKIE_VERSION_KEY);
	if (appVersion !== cookieVersion) {
		webix.storage.local.clear();
		const now = new Date();
		const expiresDate = new Date().setMonth(now.getMonth() + 12);
		webix.storage.cookie.put(constants.COOKIE_VERSION_KEY, appVersion, null, new Date(expiresDate));
	}
}
