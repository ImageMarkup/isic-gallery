import {JetView} from "webix-jet";
import ajaxActions from "../../../services/ajaxActions";
import authService from "../../../services/auth";
import "../../components/passwordInput";
import constants from "../../../constants";

const ID_PROFILE_FORM = "user-account-profile-form";
const ID_PASSWORD_FORM = "user-account-password-form";
const ID_TEMPLATE_NAME = "user-account-template-name";
const ID_LAYOUT_ADMIN_ACCESS_PROFILE_RORM = "layout-admin-access-profile-form";
const ID_TAB_PASSWORD = "password-tab";
const ID_TABVIEW = "user-account-tabview";

export default class UserAccountView extends JetView {
	config() {
		const profileTab = {
			header: "<span class='webix_icon fas fa-info'></span> Profile",
			width: 150,
			body: {
				padding: 20,
				css: "tabview-content",
				rows: [
					{
						view: "form",
						type: "clean",
						id: ID_PROFILE_FORM,
						borderless: true,
						margin: 15,
						rules: {
							login: webix.rules.isNotEmpty,
							email: webix.rules.isEmail,
							firstName: webix.rules.isNotEmpty,
							lastName: webix.rules.isNotEmpty
						},

						elementsConfig: {
							labelWidth: 120
						},
						elements: [
							{
								view: "text",
								css: "text-field",
								name: "login",
								label: "Login",
								disabled: true,
								placeholder: "Enter your Login",
								invalidMessage: "Enter your Login"
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
								view: "text",
								css: "text-field",
								name: "firstName",
								label: "First name",
								placeholder: "Enter your First name",
								invalidMessage: "Enter your First name"
							},
							{
								view: "text",
								css: "text-field",
								name: "lastName",
								label: "Last name",
								placeholder: "Enter your Last name",
								invalidMessage: "Enter your Last name"
							},
							{
								id: ID_LAYOUT_ADMIN_ACCESS_PROFILE_RORM,
								hidden: true,
								rows: [
									{
										view: "richselect",
										css: "select-field",
										name: "admin",
										label: "Is admin",
										options: [
											{id: "true", value: "true"},
											{id: "false", value: "false"}
										]
									},
									{
										view: "richselect",
										css: "select-field",
										name: "status",
										label: "Status",
										options: [
											{id: "pending", value: "pending"},
											{id: "enabled", value: "enabled"},
											{id: "disabled", value: "disabled"}
										]
									}
								]
							},
							{
								cols: [
									{},
									{
										view: "button",
										css: "btn",
										width: 80,
										name: "saveButton",
										value: "Save",
										on: {
											onItemClick() {
												const form = this.getFormView();
												if (form.validate()) {
													const values = form.getValues();
													if (!authService.getUserInfo().admin) {
														delete values.admin;
														delete values.status;
													}
													ajaxActions.putUser(values._id, values).then((user) => {
														authService.setUserInfo(user);
														webix.message("User info has been changed");
													});
												}
											}
										}
									}
								]
							}

						]
					}
				]
			}
		};

		const passwordTab = {
			header: "<span class='webix_icon fas fa-lock'></span> Password",
			width: 150,
			body: {
				id: ID_TAB_PASSWORD,
				css: "tabview-content",
				padding: 20,
				rows: [
					{
						view: "form",
						id: ID_PASSWORD_FORM,
						type: "clean",
						borderless: true,
						margin: 15,
						rules: {
							old: webix.rules.isNotEmpty,
							new: (value) => {
								const regWhiteSpace = new RegExp(/\s/);
								return !regWhiteSpace.test(value) && value.length >= 6;
							},
							confirmPassword(value) {
								const password = this.getValues().new;
								return password === value;
							}
						},
						elementsConfig: {
							labelWidth: 150
						},
						elements: [
							{
								view: "passwordInput",
								css: "search-field",
								name: "old",
								label: "Current password",
								placeholder: "Enter current password",
								invalidMessage: "Enter your current password"
							},
							{
								view: "passwordInput",
								css: "search-field",
								name: "new",
								label: "New password",
								placeholder: "Enter new password",
								invalidMessage: "Incorrect password",
								tooltip: constants.TEXT_PASSWORD_REQUIREMENTS
							},
							{
								view: "passwordInput",
								css: "search-field",
								name: "confirmPassword",
								label: "Retype new password",
								placeholder: "Retype new password",
								invalidMessage: "Passwords are not similar"
							},
							{
								cols: [
									{},
									{
										view: "button",
										css: "btn",
										width: 80,
										name: "saveButton",
										value: "Change",
										on: {
											onItemClick() {
												const form = this.getFormView();
												if (form.validate()) {
													const values = form.getValues();
													ajaxActions.putPassword(values).then(() => {
														webix.message("Password has been changed");
													});
												}
											}
										}
									}
								]
							}

						]
					}
				]
			}
		};

		const ui = {
			margin: 20,
			rows: [
				{
					id: ID_TEMPLATE_NAME,
					template: "<span class='main-subtitle2'>#name#</span>",
					autoheight: true,
					borderless: true,
					data: {name: "-"}
				},
				{
					view: "tabview",
					id: ID_TABVIEW,
					css: "tabview-block",
					cells: [
						profileTab,
						passwordTab
					]
				},
				{}
			]
		};

		return ui;
	}

	_load() {
		const user = authService.getUserInfo();
		$$(ID_TEMPLATE_NAME).setValues({name: `${user.firstName} ${user.lastName} (${user.login})`});
		$$(ID_PROFILE_FORM).setValues(user);
	}

	init() {
		this.app.attachEvent("userInfoChanged", () => {
			this._load();
		});
	}

	urlChange(view, url) {
		// we should mark "archive" item in header menu for this page
		this.app.callEvent("needSelectHeaderItem", []);

		const params = url[url.length - 1].params;
		if (authService.isLoggedin()) {
			this._load();
		}
		// if we appear on this page by link from recovery password email
		else if (params.token && params.id) {
			authService.loginByIdToken(params.id, params.token).then((data) => {
				const passwordForm = $$(ID_PASSWORD_FORM);
				passwordForm.elements.old.setValue(params.token);
				passwordForm.elements.old.hide();
				$$(ID_TABVIEW).setValue(ID_TAB_PASSWORD);
				this._load();
			}).fail(() => {
				authService.showMainPage();
			});
		}
		else {
			authService.showMainPage();
		}
	}
}
