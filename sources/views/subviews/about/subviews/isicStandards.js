import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import template from "../../../templates/about/isicStandards.html";

export default class IsicStandardsView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:isicStandards"),
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
