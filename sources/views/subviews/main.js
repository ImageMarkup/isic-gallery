import {JetView} from "webix-jet";

import menuHandlerService from "../../services/menuHandlers";
import mainTemplate from "../templates/main.html";

const ID_TEMPLATE = "main-content-template";

export default class mainView extends JetView {
	config() {
		const template = {
			view: "template",
			id: ID_TEMPLATE,
			css: "main-template",
			template: mainTemplate,
			autoheight: true,
			borderless: true,
			onClick: {
				"about-card-block": () => menuHandlerService.clickAbout(),
				"gallery-card-block": () => menuHandlerService.clickGallery(),
				"learning-challenges-card-block": () => menuHandlerService.clickChallengesStats(),
				"upload-card-block": () => menuHandlerService.clickUpload(),
				"dermoscopedia-card-block": () => menuHandlerService.clickDermoscopedia(),
				"download-card-block": () => menuHandlerService.clickAPI(),
				"dashboard-card-block": () => menuHandlerService.clickDashboard()
			}
		};
		return {
			css: "main-content",
			rows: [
				template,
				{css: "main-bottom-spacer"}
			]
		};
	}

	urlChange() {
		this.app.callEvent("needSelectHeaderItem", []);
	}
}
