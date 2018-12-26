import windowWithHeader from "../../../components/windowWithHeader";
import "../../../components/templateWithImages";
import template from "../../../templates/licenses.html";

const windowBody = {
	width: 600,
	view: "scrollview",
	type: "clean",
	body: {
		paddingX: 15,
		rows: [
			{
				view: "templateWithImages",
				template() {
					return template;
				},
				autoheight: true,
				borderless: true
			}
		]
	}
};

function getConfig(id) {
	let windowHeight;
	let windowScroll;
	let clientHeight = document.body.clientHeight;
	if (clientHeight < 700) {
		windowHeight = clientHeight - 50;
		windowScroll = true;
	} else {
		windowHeight = 700;
		windowScroll = false;
	}
	windowBody.height = windowHeight;
	windowBody.scroll = windowScroll;
	return windowWithHeader.getConfig(id, windowBody, "Licenses");
}

export default {
	getConfig
};
