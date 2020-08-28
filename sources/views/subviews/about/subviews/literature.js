import {JetView} from "webix-jet";
import "../../../components/templateWithImages";
import BreadcrumbsManager from "../../../../services/breadcrumbs";
import mdTemplate from "../../../templates/about/literature.md";
import mdLoader from "../../../../services/mdLoader";

export default class LiteratureView extends JetView {
	config() {
		const ui = {
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("about:literature"),
				{
					view: "templateWithImages",
					template: () => `<div class='inner-page-content literature'>${mdLoader.render(mdTemplate)}</div>`,
					autoheight: true,
					borderless: true
				}
			]
		};
		return ui;
	}
}
