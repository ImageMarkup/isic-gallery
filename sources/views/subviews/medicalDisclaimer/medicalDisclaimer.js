import {JetView} from "webix-jet";

import "../../components/templateWithImages";
import mdLoader from "../../../services/mdLoader";
import mdTemplate from "../../templates/medicalDisclaimer.md";

export default class MedicalDisclaimerView extends JetView {
	config() {
		const ui = {
			rows: [
				{
					view: "templateWithImages",
					template: () => `<div class='inner-page-content'>${mdLoader.render(mdTemplate)}</div>`,
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
