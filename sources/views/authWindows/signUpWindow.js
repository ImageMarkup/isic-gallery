import constants from "../../constants";
import ajax from "../../services/ajaxActions";
import "../components/passwordInput";
import validationRules from "../../utils/validationRule";
import windowWithHeader from "../components/windowWithHeader";

const signupForm = {
	view: "form",
	width: 600,
	rules: {
		login: validationRules.validateLogin,
		email: webix.rules.isEmail,
		firstName: webix.rules.isNotEmpty,
		lastName: webix.rules.isNotEmpty,
		password(value) {
			const regWhiteSpace = new RegExp(/\s/);
			return !regWhiteSpace.test(value) && value.length >= 6;
		},
		confirmPassword(value) {
			const password = this.getValues().password;
			return password === value;
		}
	},
	elements: [
		{
			view: "text",
			css: "text-field",
			name: "login",
			label: "Login",
			placeholder: "Enter your login",
			required: true,
			invalidMessage: "Incorrect login",
			tooltip: "Login must contain at least 4 characters, start with a letter, and must only contain letters, numbers, dashes, and dots."
		},
		{
			view: "text",
			css: "text-field",
			name: "email",
			label: "Email",
			required: true,
			placeholder: "Enter your email",
			invalidMessage: "Enter your email"
		},
		{
			view: "text",
			css: "text-field",
			name: "firstName",
			label: "First name",
			required: true,
			placeholder: "Enter your first name",
			invalidMessage: "Enter your first name"
		},
		{
			view: "text",
			css: "text-field",
			name: "lastName",
			label: "Last name",
			required: true,
			placeholder: "Enter your last name",
			invalidMessage: "Enter your last name"
		},
		{
			view: "passwordInput",
			css: "search-field",
			name: "password",
			attributes: {autocomplete: "off", readonly: true},
			required: true,
			label: "Password",
			placeholder: "Choose a password",
			invalidMessage: "Incorrect password",
			tooltip: constants.TEXT_PASSWORD_REQUIREMENTS,
			on: {
				onFocus(currentView) {
					currentView.getInputNode().removeAttribute("readonly");
				}
			}
		},
		{
			view: "passwordInput",
			css: "search-field",
			name: "confirmPassword",
			required: true,
			label: "Retype password",
			placeholder: "Retype password",
			invalidMessage: "Passwords are not similar",
			attributes: {autocomplete: "off", readonly: true},
			on: {
				onFocus(currentView) {
					currentView.getInputNode().removeAttribute("readonly");
				}
			}
		},
		{
			paddingY: 10,
			rows: [
				{
					view: "template",
					template: `	<div>
									Already have an account?
									<span class="login-link link">Log in here</span>
								</div>`,
					borderless: true,
					autoheight: true,
					onClick: {
						// eslint-disable-next-line func-names
						"login-link": function () {
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
				{
					template: "<div style=\"padding-top: 11px;\"><span style=\"color: red;\">*</span> Indicates required field</div>",
					borderless: true
				},
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
					name: "signupButton",
					value: "Register",
					on: {
						onItemClick() {
							const form = this.getFormView();
							const thisWindow = this.getTopParentView();
							if (form.validate()) {
								const values = form.getValues();
								ajax.postUser(values).then(() => {
									webix.message("User has been registered. Please, log in");
									thisWindow.hide();
									form.clear();
								});
							}
						}
					}
				}
			]
		}
	],
	elementsConfig: {
		labelWidth: 130
	}
};

function getConfig(id) {
	signupForm.id = `recovery-form-${webix.uid()}`;
	return windowWithHeader.getConfig(id, signupForm, "Sign up");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getFormId() {
	return signupForm.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getFormId
};
