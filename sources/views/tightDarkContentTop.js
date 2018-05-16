import {JetView} from "webix-jet";
import Footer from "./footer";
import Constants from "../constants";

export default class tightDarkContentTopView extends JetView {
	config() {
		function createRows() {
			const rows = [
				{
					css: "global-main global-main-dark",
					cols: [
						{},
						{
							type: "clean",
							width: Constants.CONTENT_WIDTH,
							css: "tight-content-container",
							paddingY: 15,
							rows: [
								{$subview: true}
							]
						},
						{}
					]
				},
				Footer
			];
			return rows;
		}

		const ui = {
			rows: createRows()
		};
		return ui;
	}
}
