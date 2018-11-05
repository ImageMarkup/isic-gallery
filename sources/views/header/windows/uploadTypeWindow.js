import windowWithHeader from "../../components/windowWithHeader";
import util from "../../../utils/util";
import constants from "../../../constants";
import auth from "../../../services/auth";
import accessRequestWindow from "./uploadAccessRequestWindow";
import state from "../../../models/state";
import template from "../../templates/uploadTypeBtns.html";

const body = {
	width: 800,
	rows: [
		{
			view: "template",
			template,
			autoheight: true,
			borderless: true,
			onClick: {
				"wizzard-upload-btn": function() {
					if (auth.canCreateDataset()) {
						this.getTopParentView().hide();
						state.app.show(constants.PATH_WIZZARD_UPLOADER);
					}
					else {
						const win = $$(constants.ID_WINDOW_ACCESS_REQUEST) || webix.ui(accessRequestWindow.getConfig(constants.ID_WINDOW_ACCESS_REQUEST));
						win.show();
					}
				},
				"batch-upload-btn": function() {
					if (auth.canCreateDataset()) {
						this.getTopParentView().hide();
						state.app.show(constants.PATH_BATCH_UPLOADER);
					}
					else {
						const win = $$(constants.ID_WINDOW_ACCESS_REQUEST) || webix.ui(accessRequestWindow.getConfig(constants.ID_WINDOW_ACCESS_REQUEST));
						win.show();
					}
				}
			}
		}
	]
};

function getConfig(id) {
	return windowWithHeader.getConfig(id, body, "Contribute to Archive");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

export default {
	getConfig,
	getIdFromConfig
};
