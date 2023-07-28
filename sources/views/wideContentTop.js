import {JetView} from "webix-jet";

import Footer from "./footer";

export default class wideContentTopView extends JetView {
	config() {
		function createRows() {
			const rows = [
				{
					type: "clean",
					css: "global-main global-main-dark",
					rows: [
						{$subview: true}
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

