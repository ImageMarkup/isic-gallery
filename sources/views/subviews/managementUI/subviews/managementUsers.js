import {JetView} from "webix-jet";
import ManagementUsersService from "../../../../services/managementUI/managementUsers";
import dates from "../../../../utils/formats";
import ajax from "../../../../services/ajaxActions";

const USER_PAGER_ID = "management-ui-user-pager-id";
const USER_SORT_BUTTON_NAME = "userSortAZButtonName";

export default class ManagementUsersView extends JetView {
	config() {
		const usersPager = {
			view: "pager",
			id: USER_PAGER_ID,
			master: false,
			width: 150,
			size: 26,
			count: 500,
			template: "{common.prev()} <span class='pager-input'>{common.page()}</span> {common.next()}"
		};

		const sortAZButton = {
			view: "button",
			type: "icon",
			icon: "sort-alpha-asc",
			name: USER_SORT_BUTTON_NAME,
			width: 30
		};

		const sortBySelection = {
			view: "richselect",
			css: "select-field",
			width: 150,
			value: "lastName",
			options: {
				data: [
					{id: "lastName", value: "Last Name"},
					{id: "created", value: "Creation Date"},
					{id: "size", value: "Used Space"}
				]
			}
		};

		const searchField = {
			view: "combo",
			css: "select-field",
			placeholder: "Search user...",
			width: 250,
			options: {
				keyPressTimeout: 300,
				body: {
					scheme: {
						$init(obj) {
							if (obj._modelType === "user") {
								obj.name = `${obj.lastName} ${obj.firstName} (${obj.login})`;
							}
						}
					},
					template(obj) {
						if (obj._modelType === "user") {
							return `<span class="webix_icon fa-user"></span> ${obj.name}`;
						}
						return `<span class="webix_icon fa-users"></span> ${obj.name}`;
					},
					on: {
						onAfterSelect(id) {
							console.log(id);
						}
					},
					dataFeed(text) {
						const params = {
							q: text,
							mode: "prefix",
							types: ["user"]
						};
						ajax.search(params).then((data) => {
							this.clearAll();
							if (data.user && data.user.length) {
								this.parse(data.user);
								this.sort("name");
							}
						});
					}
				}
			}
		};

		const listTemplate = obj => `<div class='management-top-level-list-entry'>
						<div class='management-user-right-column'>
							<div class='management-space-used-user-joined'><span class='webix_icon fa-clock-o'></span>Joined on <b>${dates.formatDateStringForManagement(obj.created)}</b></div>
							<div class='management-space-used-user-size'><span class='webix_icon fa-floppy-o'></span>Currently using <b>${obj.size || "0"} B</b></div>
			            </div>
						<div class='management-user-container'>
							<div class='management-user-link'>
								<div class='management-user-title'><a onmouseover="this.style.color='#275d8b'" onmouseout="this.style.color='#0288D1'"><b>${obj.firstName} ${obj.lastName}</b></a></div>
							</div>
							<div class='management-user-login'>${obj.login}</div>
						</div>
					</div>`;

		let usersList = {
			view: "list",
			borderless: true,
			type: {
				height: 75
			},
			template: listTemplate

		};

		return {
			rows: [
				{
					padding: 10,
					cols: [
						usersPager,
						sortAZButton,
						sortBySelection,
						{
							cols: [
								{width: 30},
								searchField
							]
						},
						{}
					]
				},
				usersList
			]
		};
	}

	init(view) {
		this.list = view.queryView({view: "list"});
		this.sortAZButton = view.queryView({name: USER_SORT_BUTTON_NAME});
		this.pager = this.$$(USER_PAGER_ID);
		this.richSelectFilter = view.queryView({view: "richselect"});
		this.managementUsersService = new ManagementUsersService(
			view, this.list, this.sortAZButton, this.pager, this.richSelectFilter
		);
		webix.extend(view, webix.ProgressBar);
	}

	urlChange() {
		let offset = this.managementUsersService.getOffsetParam();
		let sort = this.managementUsersService.getSortParam();
		let sortdir = this.managementUsersService.getSortdirParam();
		this.managementUsersService.load(26, offset, sort, sortdir);
	}
}
