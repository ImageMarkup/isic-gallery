import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import template from "../../../templates/about/workingGroups.html";

export default class WorkingGroupsView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:workingGroups"),
				{
					view: "templateWithImages",
					template,
					autoheight: true,
					borderless: true
				},
				{}
			]
		};
		return ui;
	}
}
