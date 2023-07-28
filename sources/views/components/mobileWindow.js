let configId;

function getConfig(id, windowBody) {
	configId = id || `window-${webix.uid()}`;
	return {
		view: "window",
		id: configId,
		css: "mobile-window",
		modal: true,
		position: "center",
		headHeight: 0,
		move: false,
		body: windowBody
	};
}

function getIdFromConfig() {
	return configId;
}

export default {
	getConfig,
	getIdFromConfig
};
