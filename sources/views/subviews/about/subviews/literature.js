import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import template from "../../../templates/about/literature.html";

export default class LiteratureView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:literature"),
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
