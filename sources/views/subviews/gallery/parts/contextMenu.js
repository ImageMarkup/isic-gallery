import constants from "../../../../constants";

const contextMenu = {
	view: "contextmenu",
	data: [constants.ID_GALLERY_CONTEXT_MENU_SAVE_IMAGE]
};

function getConfig(id) {
	contextMenu.id = id || `contextmenu-${webix.uid()}`;
	return contextMenu;
}

function getIdFromConfig() {
	return contextMenu;
}

export default {
	getConfig,
	getIdFromConfig
};
