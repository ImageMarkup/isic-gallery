import {JetView} from "webix-jet";
import Header from "./header/header";

export default class TopView extends JetView {
	config() {
		const ui = {
			view: "scrollview",
			body: {
				rows: [
					Header,
					{$subview: true}
				]
			},
			on: {
				onAfterScroll() {
					webix.callEvent("onClick", []);
				}
			}
		};
		return ui;
	}
}
