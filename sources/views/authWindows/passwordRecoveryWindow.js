import windowWithHeader from "../components/windowWithHeader";
import ajax from "../../services/ajaxActions";

const recoveryForm = {
	view: "form",
	width: 600,
	rules: {
		"email": webix.rules.isEmail
	},
	elements: [
		{
			paddingY: 10,
			rows: [
				{
					view: "template",
					template: `	<div>
									If you have forgotten your password, enter your email address here. You will be sent an email with a temporary access link, from which you can reset your password.
								</div>`,
					borderless: true,
					autoheight: true
				}
			]
		},
		{
			view: "text",
			css: "text-field",
			name: "email",
			label: "Email",
			placeholder: "Enter your Email",
			invalidMessage: "Enter your Email"
		},
		{
			paddingY: 10,
			rows: [
				{
					view: "template",
					template: `	<div>
									<span class='register-link link'>Register</span> |
									<span class="login-link link">Login</span>
								</div>`,
					borderless: true,
					autoheight: true,
					onClick: {
						"register-link": function() {
							// close current window
							this.getTopParentView().hide();
							$$("signup-window").show();
						},
						"login-link": function() {
							// close current window
							this.getTopParentView().hide();
							$$("login-window").show();
						}
					}
				}
			]
		},
		{
			cols: [
				{},
				{
					view: "button",
					css: "btn-contour",
					width: 80,
					name: "cancelButton",
					value: "Cancel",
					on: {
						onItemClick() {
							this.getTopParentView().hide();
						}
					}
				},
				{width: 20},
				{
					view: "button",
					css: "btn",
					width: 80,
					name: "recoveryPasswordButton",
					value: "Submit",
					on: {
						onItemClick() {
							const form = this.getFormView();
							const emailInput = encodeURIComponent(this.getTopParentView().ed.children[0].children[0].children[1].children[0].children[1].value);
							if (form.validate()) {
								webix.ajax().put(`${BASE_API_URL}`+"user/password/temporary?email="+emailInput);
								this.getTopParentView().hide();
							}
						}
					}
				}
			]
		}
	],
	elementsConfig: {
		labelWidth: 80
	}
};

function getConfig(id) {
	recoveryForm.id = `recovery-form-${webix.uid()}`;
	return windowWithHeader.getConfig(id, recoveryForm, "Forgotten password");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getFormId() {
	return recoveryForm.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getFormId
};
