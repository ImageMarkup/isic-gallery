import constants from "../constants";
import state from "../models/state";
import util from "../utils/util";
import authService from "./auth";

export default {
	clickAbout() {
		state.app.show(constants.PATH_ABOUT_ISIC_OVERVIEW);
	},

	clickForum() {
		util.openInNewTab(constants.URL_FORUM);
	},

	clickGallery() {
		if (/Android|iPhone/i.test(navigator.userAgent)) {
			state.app.show(constants.PATH_GALLERY_MOBILE);
		}
		else {
			state.app.show(constants.PATH_GALLERY);
		}
	},

	clickChallenges() {
		window.open(constants.URL_CHALLENGES, "_blank");
	},

	clickChallengesStats() {
		window.open(constants.URL_CHALLENGES_STATS, "_blank");
	},

	clickChallengesLive() {
		window.open(constants.URL_CHALLENGES_LIVE, "_blank");
	},

	clickUpload() {
		state.app.show(constants.PATH_UPLOAD_DATA);
	},

	clickStudies() {},

	clickDermoscopedia() {
		util.openInNewTab(constants.URL_DERMOSCOPEDIA);
	},

	clickDashboard() {
		if (authService.isLoggedin()) {
			util.openInNewTab(constants.URL_DASHBOARD);
		}
		else {
			authService.login();
		}
	},

	async clickMultirater() {
		const isTermsOfUseAccepted = await authService.isTermsOfUseAccepted();
		if (isTermsOfUseAccepted) {
			util.openInNewTab(constants.URL_MULTIRATER);
		}
		else {
			authService.showTermOfUse(() => {
				util.openInNewTab(constants.URL_MULTIRATER);
			});
		}
	},

	clickContributeToArchive() {
		webix.message("clickContributeToArchive");
	},

	clickHome() {
		window.open(constants.URL_ISIC_LANDING_PAGE, "_self");
	},

	clickAPI() {
		util.openInNewTab(constants.URL_NEW_API_DOCS);
	},

	clickTermsOfUse() {
		state.app.show(constants.PATH_TERMS_OF_USE);
	},

	clickPrivacyPolicy() {
		state.app.show(constants.PATH_PRIVACY_POLICY);
	},

	clickMedicalDisclaimer() {
		state.app.show(constants.PATH_MEDICAL_DISCLAIMER);
	},

	clickFAQ() {
		state.app.show(constants.PATH_ABOUT_FAQ);
	},

	clickContact() {
		state.app.show(`${constants.PATH_ABOUT_CONTACT_INFO}`);
	}
};

