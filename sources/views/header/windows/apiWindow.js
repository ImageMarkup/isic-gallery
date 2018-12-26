import {JetView} from "webix-jet";
import util from "../../../utils/util";
import constants from "../../../constants";
import template from "../../templates/apiInfo.html";
import state from "../../../models/state";

export default class ApiWindowClass extends JetView {
	config() {
		const windowBody = {
			paddingX: 20,
			paddingY: 10,
			rows: [
				{
					align: "absolute",
					body: {
						view: "scrollview",
						height: 550,
						body: {
							view: "template",
							id: "test",
							template: () => template,
							autoheight: true,
							borderless: true
						}
					}
				},
				{
					paddingY: 10,
					cols: [
						{
							view: "button",
							css: "btn",
							value: "API Documentation",
							width: 140,
							on: {
								onItemClick: () => {
									this.closeWindow();
									state.app.show(constants.PATH_API_DOCUMENTATION);
								}
							}
						},
						{},
						{
							view: "button",
							css: "btn",
							value: "Proceed to API",
							width: 140,
							on: {
								onItemClick: () => {
									this.closeWindow();
									util.openInNewTab(constants.URL_API);
								}
							}
						}
					]
				}
			]
		};

		const nonModalWindow = {
			view: "window",
			css: "window-with-header",
			modal: true,
			position: "center",
			headHeight: 30,
			width: 700,
			move: true,
			head: {
				view: "toolbar",
				css: "window-header-toolbar",
				borderless: true,
				type: "clean",
				height: 32,
				cols: [
					{
						template: "API information",
						css: "window-header-toolbar-text main-subtitle2",
						borderless: true,
						autoheight: true
					},
					{gravity: 0.001},
					{
						view: "button",
						css: "window-close-button",
						label: '<svg viewBox="0 0 26 26" class="close-icon-svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close-icon" class="close-icon-svg-use"></use></svg>',
						type: "htmlbutton",
						width: 30,
						align: "right",
						on: {
							onItemClick:() => {
								this.closeWindow();
							}
						}
					},
					{width: 5}
				]
			},
			body: windowBody
		};
		return nonModalWindow;
	}

	init() {
		this.apiWindow = this.getApiWindow();
	}

	getApiWindow() {
		return this.getRoot();
	}

	showWindow() {
		this.apiWindow.show();
	}

	closeWindow() {
		this.apiWindow.hide();
	}
}