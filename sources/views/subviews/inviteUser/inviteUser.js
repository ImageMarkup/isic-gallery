import {JetView} from "webix-jet";
import ajaxActions from "../../../services/ajaxActions";
import authService from "../../../services/auth";
import constants from "../../../constants";

export default class InviteUserView extends JetView {

	config() {

		const form = {
			view: "form",
			type: "clean",
			borderless: true,
			rules: {
				login: webix.rules.isNotEmpty,
				email: webix.rules.isEmail,
				firstName: webix.rules.isNotEmpty,
				lastName: webix.rules.isNotEmpty
			},
			elementsConfig: {
				labelWidth: 120
			},
			margin: 30,
			elements: [
				{
					view: "fieldset",
					label: "New user information",
					body: {
						paddingY: 15,
						margin: 15,
						type: "clean",
						rows: [
							{
								template: "Enter the registration information on behalf of the user to be invited. The new user will only have to choose their own password.",
								autoheight: true,
								borderless: true
							},
							{
								view: "text",
								css: "text-field",
								label: "Login",
								name: "login",
								invalidMessage: "Enter your login"
							},
							{
								view: "text",
								css: "text-field",
								label: "Email",
								name: "email",
								invalidMessage: "Incorrect email"
							},
							{
								view: "text",
								css: "text-field",
								label: "First name",
								name: "firstName",
								invalidMessage: "Enter your first name"
							},
							{
								view: "text",
								css: "text-field",
								label: "Last name",
								name: "lastName",
								invalidMessage: "Enter your last name"
							}
						]
					}
				},
				{
					view: "fieldset",
					label: "Invitation settings",
					body: {
						paddingY: 15,
						rows: [
							{
								view: "text",
								css: "text-field",
								label: "Time until exporation (optional)",
								labelWidth: 250,
								name: "validityPeriod",
								placeholder: "Enter number of days (default is 60)"
							}
						]
					}
				},
				{
					paddingY: 10,
					cols: [
						{},
						{
							view: "button",
							css: "btn",
							width: 150,
							value: "Send invitation",
							on: {
								onItemClick() {
									const form = this.getFormView();
									if (form.validate()) {
										const values = form.getValues();
										ajaxActions.sendInvitation(values).then(() => {
											webix.message("Invitation query has been sent");
											this.$scope.app.show(constants.PATH_DASHBOARD);
										});
									}
								}
							}
						}
					]
				}
			]
		};

		const ui = {
			margin: 10,
			rows: [
				{
					template: "<div class='page-header-info'><div class='main-subtitle2'>Invite a new user</div></div>",
					autoheight: true,
					borderless: true
				},
				form,
				{}
			]
		};
		return ui;
	}

	urlChange() {
		if (!authService.isStudyAdmin()) {
			authService.showMainPage();
		}
	}
}
