import {JetView} from "webix-jet";

export default class wideContentTopView extends JetView {
	config() {
		function createRows() {
			const rows = [
				{
					type: "clean",
					css: "global-main",
					rows: [
						{$subview: true}
					]
				}
			];
			return rows;
		}

		const ui = {
			rows: createRows()
		};
		return ui;
	}
}
