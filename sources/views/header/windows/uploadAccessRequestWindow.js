import windowWithHeader from "../../components/windowWithHeader";
import ajax from "../../../services/ajaxActions";
import auth from "../../../services/auth";
import constants from "../../../constants";

const user = auth.getUserInfo();
let isRequestSend = webix.storage.session.get(`contribute-to-archive-request-${user ? user._id : ""}`);

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
					hidden: isRequestSend,
					on: {
						onItemClick() {
							requestContributeAccess();
						}
					}
				},
				{
					name: "requestTemplate",
					width: 600,
					data: {
						message: "Request has been sent"
					},
					template: (obj) => obj.message,
					css: {"text-align": "center"},
					borderless: true,
					hidden: !isRequestSend,
					autoheight: true
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

function requestContributeAccess() {
}

export default {
	getConfig,
	getIdFromConfig
};
