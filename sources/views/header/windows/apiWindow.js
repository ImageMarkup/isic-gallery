import windowWithHeader from "../../components/windowWithHeader";
import util from "../../../utils/util";
import constants from "../../../constants";
import template from "../../templates/apiInfo.html";

const body = {
	width: 700,
	paddingX: 20,
	paddingY: 10,
	rows: [
		{
			align: "absolute",
			body: {
				view: "scrollview",
				height: 550,
				body: {
					rows: [
						{
							view: "template",
							template,
							autoheight: true,
							borderless: true
						}
					]
				}
			}
		},
		{
			paddingY: 10,
			cols: [
				{},
				{
					view: "button",
					css: "btn",
					value: "Proceed to API",
					width: 140,
					on: {
						onItemClick() {
							this.getTopParentView().hide();
							util.openInNewTab(constants.URL_API);
						}
					}
				}
			]
		}
	]
};

function getConfig(id) {
	return windowWithHeader.getConfig(id, body, "API information");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

export default {
	getConfig,
	getIdFromConfig
};
