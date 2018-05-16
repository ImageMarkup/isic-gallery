import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import template from "../../../templates/about/isicArchive.html";

export default class IsicArchiveView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:isicArchive"),
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
