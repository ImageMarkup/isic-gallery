import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import template from "../../../templates/about/contact.html";

export default class ContactInfoView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:contactInfo"),
				{
					view: "templateWithImages",
					template,
					autoheight: true,
					borderless: true
				}
			]
		};
		return ui;
	}
}
