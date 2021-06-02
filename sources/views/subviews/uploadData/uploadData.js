import {JetView} from "webix-jet";
import "../../components/templateWithImages";
import mdTemplate from "../../templates/uploadData.md";
import mdLoader from "../../../services/mdLoader";
import constants from "../../../constants";

export default class UploadData extends JetView {
	config() {
		const ui = {
			rows: [
				{
					view: "templateWithImages",
					template: () => `<div class='inner-page-content'>${mdLoader.render(mdTemplate)}</div>`,
					autoheight: true,
					borderless: true
				},
				{}
			]
		};
		return ui;
	}

	urlChange() {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_ARCHIVE}]);
	}
}
