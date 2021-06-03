import {JetView} from "webix-jet";
import "app-components/templateWithImages";
import BreadcrumbsManager from "app-services/breadcrumbs";
import mdTemplate from "app-templates/about/aboutIsic/overview.md";
import mdLoader from "app-services/mdLoader";

export default class AboutIsicOverview extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:aboutIsicOverview"),
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
