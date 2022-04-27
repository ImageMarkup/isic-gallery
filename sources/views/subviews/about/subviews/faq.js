import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import mdTemplate from "../../../templates/about/faq.md";
import mdLoader from "../../../../services/mdLoader";

export default class FAQ extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:faq"),
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
