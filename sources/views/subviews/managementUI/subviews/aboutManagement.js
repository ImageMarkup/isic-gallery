/* eslint-disable arrow-body-style */
import {JetView} from "webix-jet";
import authService from "../../../../services/auth";
import constants from "../../../../constants";

export default class ManagementUIAbout extends JetView {
	config() {
		const headerTemplate = () => {
			return `<div class='management-about-header-frontpage'>
						<div class='management-about-logo-container'>
							<img class='management-about-frontpage-logo' src='sources/images/inner-pages/ManagementAboutLogo.png'>
						</div>
						<div class='management-about-title-container'>
							<div class='management-about-frontpage-title'>ISIC Archive</div>
							<div class='management-about-frontpage-subtitle'>Data management platform</div>
						</div>
					</div>`;
		};

		const bodyTemplate = (obj) => {
			return `<div class='management-about-frontpage-body'>
						<div class='management-about-frontpage-paragraph'>
							<div><b>Welcome to ISIC Archive!</b></div>
							<ul class='ul-margin'>
								<li>You are currently logged in as <b>${obj && obj.login ? obj.login : "'"}</b>.
									<ul>
										<li>To explore the data hosted on this server, start with the <a class='management-collection-template'>Collection</a> page.</li>
										<li>To explore your data, go to your <b>personal data space</b> or your <b>user account page</b>.</li>
									</ul>
								</li>
								<li>
									ISIC Archive is powered by Girder, a part of <a class='a' target='_blank' href='http://resonant.kitware.com'>Resonant</a>, Kitware's open-source platform for data management, 
									analytics, and visualization. To learn more, you can read our series of <a class='link' target='_blank' href='https://blog.kitware.com/tag/resonant'>blog posts</a> about Resonant,
									or <a class='link' target='_blank' href='https://www.kitware.com/contact-us'>contact</a> us to learn how we can help you solve your data problems.
									<ul>
										<li>To learn more about Girder, including how you can host your own instance either locally or in the cloud,
											see the <a class='link' target='_blank' href='http://girder.readthedocs.io/en/latest/user-guide.html'>User Guide</a>,
											 the <a class='link' target='_blank' href='http://girder.readthedocs.io/en/latest'>full documentation</a>, 
											or visit the <a class='link' target='_blank' href='https://github.com/girder/girder'>GitHub repository</a>.
										</li>
									</ul>
								</li>
								<li>To use the REST API to interact with this server, check out the <a class='link' href='https://isic-archive.com/api/v1'>interactive web API docs</a>.</li>
								<li>This instance of ISIC Archive was built from Git version 
									<a class='link' target='_blank' href='https://github.com/girder/girder/tree/79c6e17c1be3f46b524f777f8e22ae936c6c6387'>79c6e17</a>. API version 2.4.0.
								</li>
							</ul>
						</div>
					</div>`;
		};

		const frontPageHeader = {
			autoheight: true,
			borderless: true,
			template: headerTemplate
		};

		const frontPageBody = {
			view: "template",
			autoheight: true,
			template: bodyTemplate,
			onClick: {
				"management-collection-template": () => {
					this.app.show(`${constants.PATH_MANAGEMENT_COLLECTIONS}`);
				}
			}
		};

		return {
			borderless: true,
			type: "clean",
			rows: [
				frontPageHeader,
				{
					cols: [
						frontPageBody
					]
				},
				{}
			]
		};
	}

	init(view) {
		this.template = view.queryView({view: "template"});
		let data = authService.getUserInfo();
		this.template.parse(data);
	}
}
