import {JetView} from "webix-jet";

export default class ErrorPageView extends JetView {
	config() {
		const template = {
			view: "template",
			borderless: true,
			template: () => {
				return `<center>
							<img src='sources/images/inner-pages/error-page.png'>
							<div style="font-size: 130px; color: #564c53; margin-top: -10px">404</div>
							<div style="font-size: 30px; color: #6E7480; margin-top: -20px">Page not found</div>
							<div class='page-not-found'>Oops! The page you are looking for does not exist.</div>
						</center>`;
			}
		};

		return {
			rows: [
				{gravity: 0.25},
				template,
				{gravity: 0.25}
			]
		};
	}
}