import util from "../../../../utils/util";

function getView() {
	/**	@type {webix.ui.suggestConfig} */
	const view = {
		view: "suggest",
		width: 70,
		yCount: 10,
		keyPressTimeout: 500,
		body: {
			multiselect: true,
			tooltip: {
				view: "tooltip",
				template: util.isMacintosh()
					? "Press and hold Cmd (⌘) key to make multiple selections"
					: "Press and hold left CTRL key to make multiple selections",
			}
		},
	};

	return view;
}

function getConfig(id) {
	const config = getView();
	config.id = id;
	return config;
}

const searchSuggest = {
	getConfig,
};

export default searchSuggest;
