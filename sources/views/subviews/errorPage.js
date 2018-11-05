import {JetView} from "webix-jet";

export default class ErrorPage extends JetView {
	config() {
		let template = {
			view: "template",
			template: () => {
				return `<div class='error-page'>
							<div class='error-h1'>Error 404! Not Found</div>
							<div class='error-p'>The requested URL / was not found on this server.</div>
							<div class='error-hr'></div>
						</div>`
			}
		};
		return template;
	}
}