import {JetView} from "webix-jet";
import Constants from "../constants";
import menuHandlerService from "../services/menuHandlers";
import template from "./templates/footer.html";

export default class Footer extends JetView {
	config() {
		const footer = {
			view: "template",
			css: "footer-template",
			template,
			autoheight: true,
			borderless: true,
			width: Constants.CONTENT_WIDTH,
			onClick: {
				"menu-home": () => menuHandlerService.clickHome(),
				"menu-about": () => menuHandlerService.clickAbout(),
				"menu-gallery": () => menuHandlerService.clickGallery(),
				"menu-learning-competitions": () => menuHandlerService.clickChallengesStats(),
				"menu-upload": () => menuHandlerService.clickUpload(),
				"menu-dermoscopedia": () => menuHandlerService.clickDermoscopedia(),
				"menu-api": () => menuHandlerService.clickAPI(),
				"menu-terms-of-use": () => menuHandlerService.clickTermsOfUse(),
				"menu-privacy-policy": () => menuHandlerService.clickPrivacyPolicy(),
				"menu-medical-disclaimer": () => menuHandlerService.clickMedicalDisclaimer(),
				"menu-contact": () => menuHandlerService.clickContact()
			}
		};

		return {
			css: "global-footer",
			cols: [
				{},
				footer,
				{}
			]
		};
	}

	init(view) {
		this.view = view;
	}
}
