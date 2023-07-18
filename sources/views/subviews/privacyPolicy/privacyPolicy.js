import {JetView} from "webix-jet";

import "../../components/templateWithImages";
import mdLoader from "../../../services/mdLoader";
import mdTemplate from "../../templates/privacyPolicy.md";

export default class PrivacyPolicyView extends JetView {
	config() {
		const ui = {
			rows: [
				{
					view: "templateWithImages",
					template: () => `<div class='inner-page-content privacy-policy'>${mdLoader.render(mdTemplate)}</div>`,
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
