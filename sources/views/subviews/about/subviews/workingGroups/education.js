import {JetView} from "webix-jet";

import "app-components/templateWithImages";
import BreadcrumbsManager from "app-services/breadcrumbs";
import mdLoader from "app-services/mdLoader";
import mdTemplate from "app-templates/about/workingGroups/education.md";

export default class WorkingGroupsEducation extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:workingGroupsEducation"),
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
