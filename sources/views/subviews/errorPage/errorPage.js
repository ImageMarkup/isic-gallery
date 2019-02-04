import {JetView} from "webix-jet";
import errorHTMl from "../../../../error.html";

export default class ErrorPageView extends JetView {
	config() {
		const template = {
			view: "template",
			borderless: true,
			template: () => {
				return errorHTMl;
			}
		};

		return {
			rows: [
				{gravity: 0.25},
				template,
				{gravity: 0.25}
			]
		}
	}
}