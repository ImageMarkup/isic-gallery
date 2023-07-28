import {JetView} from "webix-jet";

import "app-components/templateWithImages";
import BreadcrumbsManager from "app-services/breadcrumbs";
import mdLoader from "app-services/mdLoader";
import mdTemplate from "app-templates/about/isicArchive/dataDictionary.md";

export default class IsicArchiveDataDictionary extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:isicArchiveDataDictionary"),
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
