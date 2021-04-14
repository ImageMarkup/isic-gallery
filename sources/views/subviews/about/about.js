import {JetView} from "webix-jet";
import "../../components/types/sideBarType";
import constants from "../../../constants";

const SIDEBAR_ID = "about-sidebar";
const SIDEBAR_CONTAINER_ID = "about-sidebar-container";
const SIDEBAR_MENU_CONTAINER_ID = "about-sidebar-menu-container";
const BARS_ICON = "bars-icon";
const SIDEBAR_MENU_ITEMS = [
	{
		id: "about-isic",
		value: "About ISIC",
		data: [
			{
				id: "isicArchive",
				value: "ISIC Archive"
			},
			{
				id: "isicStandards",
				value: "ISIC Standards for Skin Imaging"
			},
			{
				id: "isicHistory",
				value: "History"
			}
		]
	},
	{
		id: "workingGroups",
		value: "Working Groups"
	},
	{
		id: "literature",
		value: "Literature"
	},
	{
		id: "contactInfo",
		value: "Contact Info"
	},
	{
		id: "partnersAndSponsors",
		value: "Partners & Sponsors"
	}
];

function toggleSidebar() {
	const sidebar = $$(SIDEBAR_CONTAINER_ID);
	const barsIcon = $$(BARS_ICON);
	if (sidebar.isVisible()) {
		sidebar.hide();
		barsIcon.show();
	}
	else {
		sidebar.show();
		barsIcon.hide();
	}
}

export default class aboutView extends JetView {
	config() {
		const sidebar = {
			view: "sidebar",
			type: "sideBar",
			id: SIDEBAR_ID,
			data: SIDEBAR_MENU_ITEMS,
			navigation: false,
			on: {
				onAfterSelect(id) {
					this.$scope.app.show(`${constants.PATH_ABOUT}/${id}`);
				},
				onAfterOpen: () => {
					this.setMenuHeight();
				},
				onAfterClose: () => {
					this.setMenuHeight();
				}
			}
		};

		const sidebarContainer = {
			type: "clean",
			localId: SIDEBAR_MENU_CONTAINER_ID,
			height: 300,
			css: "sidebar-container",
			rows: [
				{
					type: "clean",
					css: "about-sidebar-header",
					cols: [
						{
							view: "icon",
							icon: "fas fa-times",
							align: "left",
							width: 38,
							click: toggleSidebar
						},
						{
							template: "Menu",
							css: "menu-sidebar-template",
							borderless: true,
							autoheight: true
						}
					]
				},
				sidebar
			]
		};

		const ui = {
			type: "clean",
			borderless: true,
			cols: [
				{
					id: SIDEBAR_CONTAINER_ID,
					rows: [
						{
							css: "about-sidebar-container",
							type: "clean",
							cols: [
								sidebarContainer,
								{
									width: 30
								}
							]
						},
						{}
					]
				},
				{
					rows: [
						{
							cols: [
								{
									height: 38,
									gravity: 0.0001,
									css: "bars-icon-container",
									rows: [
										{
											view: "icon",
											id: BARS_ICON,
											css: "bars-icon",
											icon: "fas fa-bars",
											align: "left",
											width: 30,
											hidden: true,
											click: toggleSidebar
										}
									]
								},
								{
									type: "clean",
									rows: [
										{$subview: true}
									]
								}
							]
						},
						{}
					]
				}
			]
		};
		return ui;
	}

	ready() {
		this.setMenuHeight();
	}

	urlChange(view, url) {
		view.$scope.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_ABOUT}]);
		let selectedId = "isicArchive";
		if (url[1]) {
			selectedId = url[1].page;
		}
		const sidebar = $$(SIDEBAR_ID);
		const selectedItem = sidebar.getItem(selectedId);
		sidebar.select(selectedId);
		sidebar.open(selectedItem.$parent);
	}

	setMenuHeight() {
		const sidebarContainer = this.$$(SIDEBAR_MENU_CONTAINER_ID);
		const sidebarContainerNode = sidebarContainer.getNode();
		const menuHeaderNode = sidebarContainerNode.querySelector(".about-sidebar-header");
		const menuItemsContainterNode = sidebarContainerNode.querySelector(".about-sidebar");
		const menuItemsScrollContainer = menuItemsContainterNode.querySelector(".webix_scroll_cont");
		const countedHeight = menuHeaderNode.offsetHeight + menuItemsScrollContainer.offsetHeight;
		sidebarContainer.define("height", countedHeight);
		sidebarContainer.resize();
	}
}
