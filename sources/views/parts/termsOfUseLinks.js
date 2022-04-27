import constants from "../../constants";
import util from "../../utils/util";

function getDownloadingPanel() {
	return {
		paddingY: 10,
		cols: [
			{
				template: "<span class='webix_icon far fa-file-alt'></span><span class='download-txt-link link'>Download as text</span>",
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
				template: "<span class='webix_icon far fa-file-pdf'></span><span class='download-pdf-link link'>Download as PDF</span>",
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
	};
}

export default {
	getDownloadingPanel
};
