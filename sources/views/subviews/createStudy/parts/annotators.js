import {JetView} from "webix-jet";
import ajax from "../../../../services/ajaxActions";
import "../../../components/activeList";
import utils from "../../../../utils/util";

export default class AnnotatorsView extends JetView {
	config() {
		const searchField = {
			view: "combo",
			css: "select-field",
			placeholder: "Search for annotators",
			width: 328,
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
							return `<span class="webix_icon fas fa-user"></span> ${obj.name}`;
						}
						return `<span class="webix_icon fas fa-users"></span> ${obj.name}`;
					},
					on: {
						onItemClick: (id) => {
							let selectedUser = this.searchUser.getList().getItem(id);
							const userIsInList = this.annotatorsList.find(obj => obj._id === selectedUser._id);
							if (userIsInList.length === 0) {
								this.annotatorsList.parse({
									data: selectedUser
								});
								this.annotatorsList.callEvent("onAfterUserUpdated");
								utils.scrollToLast(this.annotatorsList);
							}
							else {
								webix.alert({
									type: "alert-error",
									text: "This user was already added!"
								});
							}
						}
					},
					dataFeed(text) {
						this.clearAll();
						if (text) {
							const params = {
								q: text,
								mode: "prefix",
								types: ["user"]
							};
						}
					}
				}
			}
		};

		const activeUserList = {
			view: "activeList",
			css: "feature-set-list",
			height: 377,
			activeContent: {
				deleteButton: {
					view: "button",
					type: "icon",
					css: "delete-icon-button",
					icon: "fas fa-times",
					width: 25,
					height: 25,
					click: (id) => {
						const deleteButton = $$(id);
						let listItemId = deleteButton.config.$masterId;
						this.annotatorsList.remove(listItemId);
						this.annotatorsList.callEvent("onAfterUserUpdated");
					}
				}
			},
			template: (obj, common) => `<div>
						<div class='active-list-delete-button'>${common.deleteButton(obj, common)}</div>
 						<div class='active-list-name'>${obj.firstName} ${obj.lastName} (${obj.login})</div>
					</div>`
		};

		return {
        	width: 350,
			name: "studyAnnotatorsClass",
			rows: [
				{
					css: "annonators-search-layout",
					cols: [
						{width: 10},
						{
							rows: [
								{height: 10},
								searchField,
								{height: 10}
							]
						},
						{width: 10}
					]
				},
				activeUserList
			]
		};
	}

	init() {
    	this.searchUser = this.getSearchUserView();
    	this.annotatorsList = this.getAnnotatorsList();
	}

	getSearchUserView() {
    	return this.getRoot().queryView({view: "combo"});
	}

	getAnnotatorsList() {
    	return this.getRoot().queryView({view: "activeList"});
	}
}
