import constants from "../../../../constants";

const contextMenu = {
	view: "contextmenu",
	data: [constants.ID_GALLERY_CONTEXT_MENU_SAVE_IMAGE]
};

function getConfig(id = `contextmenu-${webix.uid()}`, css) {
	return {
		...contextMenu,
		id,
		// eslint-disable-next-line no-extra-parens
		...(css && {css})
	};
}

export default {
	getConfig,
};
