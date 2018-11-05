import state from "../models/state";
import util from "../utils/util";
import constants from "../constants";
import authService from "../services/auth";
import uploadWindow from "../views/header/windows/uploadTypeWindow";
import apiWindow from "../views/header/windows/apiWindow";

export default {
	clickAbout() {
		state.app.show(constants.PATH_ABOUT_ISIC_ARCHIVE);
	},

	clickForum() {
		util.openInNewTab(constants.URL_FORUM);
	},

	clickGallery() {
		state.app.show(constants.PATH_GALLERY);
	},

	clickChallenges() {
		state.app.show(constants.PATH_CHALLENGES);
	},

	clickUpload() {
		if (authService.isLoggedin()) {
			if (authService.isTermsOfUseAccepted()) {
				const win = $$(constants.ID_WINDOW_UPLOAD_TYPE) || webix.ui(uploadWindow.getConfig(constants.ID_WINDOW_UPLOAD_TYPE));
				win.show();
			}
			else {
				authService.showTermOfUse(() => {
					const win = $$(constants.ID_WINDOW_UPLOAD_TYPE) || webix.ui(uploadWindow.getConfig(constants.ID_WINDOW_UPLOAD_TYPE));
					win.show();
				});
			}
		}
		else {
			$$(constants.ID_WINDOW_LOGIN).show();
		}
	},

	clickStudies() {
		if (authService.isLoggedin()) {
			state.app.show(constants.PATH_STUDIES);
		}
		else {
			const win = $$(constants.ID_WINDOW_LOGIN);
			// this is for possibility to use path in login window object
			win.showAfterLoginPage = constants.PATH_STUDIES;
			win.show();
		}
	},

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

	clickAPI() {
		const win = $$(constants.ID_WINDOW_API) || webix.ui(apiWindow.getConfig(constants.ID_WINDOW_API));
		win.show();
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

