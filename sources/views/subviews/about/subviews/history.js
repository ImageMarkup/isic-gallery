import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import template from "../../../templates/about/isicHistory.html";

export default class IsicHistoryView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:history"),
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
