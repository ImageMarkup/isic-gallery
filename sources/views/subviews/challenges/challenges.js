import {JetView} from "webix-jet";
import "../../components/templateWithImages";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import util from "../../../utils/util";
import constants from "../../../constants";

export default class aboutView extends JetView {
	config() {

		const template = {
			template: `<div class="inner-page-content">
				<div class="main-subtitle3">Thank you for your interest in the ISIC Challenges in image analysis!</div>
				<p>For the past two years, we have organized the “ISIC: Skin Lesion Analysis Towards Melanoma Detection“ grand challenges, presenting problems in lesion segmentation, detection of clinical diagnostic patterns, and lesion
	classification, along with a high-quality human-validated training and test set of nearly 3000 CC-0-licensed images and metadata.
				<p>These challenges have attracted global participation, with hundreds of registrations dozens of finalized submissions (including a four page manuscript with each final submission), making them the largest standardized and comparative study in this field to date. </p>
				<p>These challenges have yielded novel findings and numerous publications, and have been accepted as a de-facto reference standard in efforts by other research groups. </p>
				<p>Use the buttons below to review past challenges or to get involved!</p>
			</p>`,
			autoheight: true,
			borderless: true
		};

		const ui = {
			type: "clean",
			borderless: true,
			rows: [
				BreadcrumbsManager.getBreadcrumbsTemplate("challenges"),
				{height: 15},
				template,
				{
					margin: 15,
					cols: [
						{
							view: "button",
							css: "btn",
							value: "ISIC Challenge 2016",
							click() {
								util.openInNewTab(constants.URL_CHALLENGE_2016);
							}
						},
						{
							view: "button",
							css: "btn",
							value: "ISIC Challenge 2017",
							click() {
								util.openInNewTab(constants.URL_CHALLENGE_2017);
							}
						},
						{
							view: "button",
							css: "btn",
							value: "ISIC Challenge 2018",
							click() {
								util.openInNewTab(constants.URL_CHALLENGE_2018);
							}
						}
					]
				},
				{}
			]
		};
		return ui;
	}

	urlChange(view, url) {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_CHALLENGES}]);
	}
}
