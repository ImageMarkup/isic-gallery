import windowWithHeader from "../../components/windowWithHeader";
import ajax from "../../../services/ajaxActions";

const body = {
	width: 750,
	paddingX: 18,
	rows: [
		{
			template: "Thank you for your interest in contributing to the ISIC Archive. We accept dermoscopic images with metadata, under CC-0, CC-BY and CC-BY-NC licenses. Please click below to request access to contribute images",
			autoheight: true,
			borderless: true
		},
		{height: 15},
		{
			cols: [
				{},
				{
					view: "button",
					css: "btn",
					value: "Request access",
					width: 160,
					on: {
						onItemClick() {
							ajax.createDatasetPermission().then(() => {
								webix.message("Request has been sent");
							});
						}
					}
				},
				{}
			]
		},
		{height: 20}
	]

};

function getConfig(id) {
	return windowWithHeader.getConfig(id, body, "Request Dataset Contributor access");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

export default {
	getConfig,
	getIdFromConfig
};
