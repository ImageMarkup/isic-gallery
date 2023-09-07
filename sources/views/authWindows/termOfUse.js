import state from "../../models/state";
import mdLoader from "../../services/mdLoader";
import windowWithHeader from "../components/windowWithHeader";
import termsOfUseDownloadingPanel from "../parts/termsOfUseLinks";
import mdTemplate from "../templates/termsOfUse.md";

const body = {
	width: 700,
	paddingX: 20,
	paddingY: 10,
	rows: [
		{
			align: "absolute",
			body: {
				view: "scrollview",
				height: 250,
				body: {
					rows: [
						{
							view: "template",
							template: () => `<div class='inner-page-content terms-of-use'>${mdLoader.render(mdTemplate)}</div>`,
							autoheight: true,
							borderless: true
						}
					]
				}
			}
		},
		termsOfUseDownloadingPanel.getDownloadingPanel(),
		{
			paddingY: 10,
			cols: [
				{},
				{
					view: "button",
					css: "btn-contour",
					value: "I Accept",
					width: 100,
					on: {
						onItemClick() {
							const thisWindow = this.getTopParentView();
							if (typeof thisWindow.okCallback === "function") {
								thisWindow.okCallback();
							}
							state.auth.acceptTermOfUse().then(() => {
								this.getTopParentView().hide();
							});
						}
					}
				},
				{width: 15},
				{
					view: "button",
					css: "btn",
					value: "I decline",
					width: 100,
					on: {
						onItemClick() {
							this.getTopParentView().hide();
							state.auth.showMainPage();
						}
					}
				}
			]
		}
	]
};

function getConfig(id) {
	return windowWithHeader.getConfig(id, body, "Terms of Use", state.auth.reloadPage);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

export default {
	getConfig,
	getIdFromConfig
};
