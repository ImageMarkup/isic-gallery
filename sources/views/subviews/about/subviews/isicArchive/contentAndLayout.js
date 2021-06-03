import {JetView} from "webix-jet";
import "app-components/templateWithImages";
import BreadcrumbsManager from "app-services/breadcrumbs";
import mdTemplate from "app-templates/about/isicArchive/contentAndLayout.md";
import mdLoader from "app-services/mdLoader";

export default class IsicArchiveContent extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:isicArchiveContent"),
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
