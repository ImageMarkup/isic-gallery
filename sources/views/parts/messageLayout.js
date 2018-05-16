const template = {
	template: "",
	autoheight: true,
	borderless: true

};

const ui = {
	css: "template-error",
	rows: [
		template
	]
};

function getConfig(message) {
	if (message) {
		template.template = message.text;
	}
	return ui;
}

export default {
	getConfig
};
