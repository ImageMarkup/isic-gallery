import state from "../models/state";
import util from "../utils/util";
import constants from "../constants";
import authService from "../services/auth";
import uploadWindow from "../views/header/windows/uploadTypeWindow";
import accessRequestWindow from "../views/header/windows/uploadAccessRequestWindow";
import ApiWindow from "../views/header/windows/apiWindow";

export default {
	clickAbout() {
		state.app.show(constants.PATH_ABOUT_ISIC_OVERVIEW);
	},

	clickForum() {
		util.openInNewTab(constants.URL_FORUM);
	},

	clickGallery() {
		state.app.show(constants.PATH_GALLERY);
	},

	clickChallenges() {
		window.open(constants.URL_CHALLENGES, "_blank");
	},

	clickChallengesStats() {
		window.open(constants.URL_CHALLENGES_STATS, "_blank");
	},

	clickUpload() {
		if (authService.isLoggedin()) {
			if (authService.isTermsOfUseAccepted()) {
				state.app.show(constants.PATH_UPLOAD_DATA);
			}
			else {
				authService.showTermOfUse(() => {
					state.app.show(constants.PATH_UPLOAD_DATA);
				});
			}
		}
		else {
			$$(constants.ID_WINDOW_LOGIN).show();
		}
	},

	clickStudies() {},

	clickDermoscopedia() {
		util.openInNewTab(constants.URL_DERMOSCOPEDIA);
	},

	clickDashboard() {
		if (authService.isLoggedin()) {
			state.app.show(constants.PATH_DASHBOARD);
		}
		else {
			$$(constants.ID_WINDOW_LOGIN).show();
		}
	},

	clickMultirater() {
		if (authService.isTermsOfUseAccepted()) {
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
		state.app.show(constants.PATH_MAIN);
	},

	clickAPI(thisView) {
		let apiWindow = thisView.$scope.ui(ApiWindow);
		apiWindow.showWindow()
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

	clickContact() {
		state.app.show(`${constants.PATH_ABOUT_CONTACT_INFO}`);
	}
};

