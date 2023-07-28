import {JetView} from "webix-jet";

import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import mdLoader from "../../../../services/mdLoader";
import mdTemplate from "../../../templates/about/contact.md";

export default class ContactInfoView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:contactInfo"),
				{
					view: "templateWithImages",
					template: () => `<div class='inner-page-content'>${mdLoader.render(mdTemplate)}</div>`,
					autoheight: true,
					borderless: true
				}
			]
		};
		return ui;
	}
}
