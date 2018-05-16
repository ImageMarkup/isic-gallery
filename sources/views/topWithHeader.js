import {JetView} from "webix-jet";
import Header from "./header/header";

export default class TopView extends JetView {
	config() {

		const ui = {
			view: "scrollview",
			scroll: "xy",
			body: {
				rows: [
					Header,
					{$subview: true}
				]
			}
		};
		return ui;
	}
}
