import {JetView} from "webix-jet";
import "../../components/templateWithImages";
import BreadcrumbsManager from "../../../services/breadcrumbs";
import util from "../../../utils/util";
import constants from "../../../constants";
import mdTemplate from "../../templates/challenges.md";
import mdLoader from "../../../services/mdLoader";

export default class aboutView extends JetView {
	config() {
		const template = {
			template: () => `<div class='inner-page-content'>${mdLoader.render(mdTemplate)}</div>`,
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
							rows: [
								{
									view: "button",
									css: "btn",
									tooltip: "It may not work in Internet Explorer", // leave tooltip before backend fixes
									value: "ISIC Challenge 2016",
									click() {
										util.openInNewTab(constants.URL_CHALLENGE_2016);
									}
								},
								{height: 15},
								{
									view: "button",
									css: "btn",
									tooltip: "It may not work in Internet Explorer",
									value: "ISIC Challenge 2017",
									click() {
										util.openInNewTab(constants.URL_CHALLENGE_2017);
									}
								},
								{height: 15},
								{
									view: "button",
									css: "btn",
									tooltip: "It may not work in Internet Explorer",
									value: "ISIC Challenge 2018",
									click() {
										util.openInNewTab(constants.URL_CHALLENGE_2018);
									}
								},
								{height: 15},
								{
									view: "button",
									css: "btn",
									tooltip: "It may not work in Internet Explorer",
									value: "ISIC Challenge 2019",
									click() {
										util.openInNewTab(constants.URL_CHALLENGE_2019);
									}
								},
								{height: 15},
								{
									view: "button",
									css: "btn",
									tooltip: "It may not work in Internet Explorer",
									value: "ISIC Challenge 2020",
									click() {
										util.openInNewTab(constants.URL_CHALLENGE_2020);
									}
								}
							]
						},
						{}
					]
				},
				{}
			]
		};
		return ui;
	}

	urlChange(/* view, url */) {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_CHALLENGES}]);
	}
}
