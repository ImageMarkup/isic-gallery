import windowWithHeader from "../../../components/windowWithHeader";
import "../../../components/templateWithImages";
import template from "../../../templates/licenses.html";

const windowBody = {
	width: 600,
	paddingX: 15,
	type: "clean",
	rows: [
		{
			view: "templateWithImages",
			template,
			autoheight: true,
			borderless: true
		}
	]
};

function getConfig(id) {
	return windowWithHeader.getConfig(id, windowBody, "Licenses");
}

export default {
	getConfig
};
