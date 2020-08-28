import {JetView} from "webix-jet";
import "../../components/templateWithImages";
import mdTemplate from "../../templates/termsOfUse.md";
import mdLoader from "../../../services/mdLoader";

export default class TermsOfUseView extends JetView {
	config() {
		const ui = {
			rows: [
				{
					view: "templateWithImages",
					template: () => `<div class='inner-page-content terms-of-use'>${mdLoader.render(mdTemplate)}</div>`,
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
