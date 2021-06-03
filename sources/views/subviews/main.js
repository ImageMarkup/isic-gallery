import {JetView} from "webix-jet";
import constants from "../../constants";
import menuHandlerService from "../../services/menuHandlers";
import authService from "../../services/auth";
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
				"download-card-block": () => menuHandlerService.clickAPI(this.getRoot()),
				"sign-up-btn": () => $$(constants.ID_WINDOW_SIGNUP).show()
			},
			on: {
				onAfterRender() {
					const signUpBtn = document.getElementsByClassName("sign-up-btn")[0];
					if (!authService.isLoggedin()) {
						webix.html.removeCss(signUpBtn, "hidden-block");
					}
					this.$scope.on(this.$scope.app, "login", () => {
						webix.html.addCss(signUpBtn, "hidden-block");
					});
					this.$scope.on(this.$scope.app, "logout", () => {
						webix.html.removeCss(signUpBtn, "hidden-block");
					});
				}
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
