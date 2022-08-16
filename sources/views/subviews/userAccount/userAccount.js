import {JetView} from "webix-jet";
import authService from "../../../services/auth";
import "../../components/passwordInput";

const ID_PROFILE_FORM = "user-account-profile-form";
const ID_PASSWORD_FORM = "user-account-password-form";
const ID_TEMPLATE_NAME = "user-account-template-name";
const ID_LAYOUT_ADMIN_ACCESS_PROFILE_FORM = "layout-admin-access-profile-form";
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
								hidden: true,
								name: "firstName",
								label: "First name",
								placeholder: "Enter your First name",
								invalidMessage: "Enter your First name"
							},
							{
								view: "text",
								css: "text-field",
								hidden: true,
								name: "lastName",
								label: "Last name",
								placeholder: "Enter your Last name",
								invalidMessage: "Enter your Last name"
							},
							{
								id: ID_LAYOUT_ADMIN_ACCESS_PROFILE_FORM,
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
							}
							// TODO: uncomment if updating user information will be possible
							/* {
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
							} */

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
						profileTab
					]
				},
				{}
			]
		};

		return ui;
	}

	_load() {
		const user = authService.getUserInfo();
		$$(ID_TEMPLATE_NAME).setValues({name: `${user.first_name} ${user.last_name}`});
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
			authService.loginByIdToken(params.id, params.token).then(() => {
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
