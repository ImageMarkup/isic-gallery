import {JetView} from "webix-jet";
import "../../components/templateWithImages";
import template from "../../templates/privacyPolicy.html";

export default class PrivacyPolicyView extends JetView {
	config() {
		const ui = {
			rows: [
				{
					view: "templateWithImages",
					template,
					autoheight: true,
					borderless: true
				},
				{}
			]
		};
		return ui;
	}

	urlChange() {
		this.app.callEvent("needSelectHeaderItem", []);
	}
}
