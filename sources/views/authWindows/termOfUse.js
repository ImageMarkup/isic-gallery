import windowWithHeader from "../components/windowWithHeader";
import authService from "../../services/auth";
import util from "../../utils/util";
import constants from "../../constants";
import template from "../templates/termsOfUse.html";

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
				{
					template: "<span class='webix_icon fa-file-text-o'></span><span class='download-txt-link link'>Download as text</span>",
					autoheight: true,
					borderless: true,
					width: 160,
					onClick: {
						"download-txt-link": () => {
							util.downloadByLink(constants.PATH_DOWNLOAD_TXT_TERMS_OF_USE, "termsOfUse.txt");
						}
					}
				},
				{
					template: "<span class='webix_icon fa-file-pdf-o'></span><span class='download-pdf-link link'>Download as PDF</span>",
					autoheight: true,
					borderless: true,
					width: 160,
					onClick: {
						"download-pdf-link": () => {
							util.downloadByLink(constants.PATH_DOWNLOAD_PDF_TERMS_OF_USE, "termsOfUse.pdf");
						}
					}
				},
				{}
			]
		},
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
							authService.acceptTermOfUse();
							this.getTopParentView().hide();
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
							authService.showMainPage();
						}
					}
				}
			]
		}
	]
};

function getConfig(id) {
	return windowWithHeader.getConfig(id, body, "Terms of Use", authService.showMainPage);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

export default {
	getConfig,
	getIdFromConfig
};
