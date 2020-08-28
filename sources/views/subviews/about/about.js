import {JetView} from "webix-jet";
import "../../components/types/sideBarType";
import constants from "../../../constants";

const SIDEBAR_ID = "about-sidebar";
const SIDEBAR_CONTAINER_ID = "about-sidebar-container";
const BARS_ICON = "bars-icon";
const menuData = [
	{
		id: "about-isic",
		value: "About ISIC",
		data: [
			{id: "isicArchive", src: "/sources/views/templates/about/isicArchive.html", value: "ISIC Archive"},
			{
				id: "isicStandards",
				src: "/sources/views/templates/about/isicStandards.html",
				value: "ISIC Standards for Skin Imaging"
			},
			{id: "isicHistory", src: "/sources/views/templates/about/isicHistory.html", value: "History"}
		]
	},
	{
		id: "workingGroups",
		src: "/sources/views/templates/about/workingGroups.html",
		value: "Working Groups"
	},
	{
		id: "literature",
		src: "/sources/views/templates/about/literature.html",
		value: "Literature"
	},
	{
		id: "contactInfo",
		src: "/sources/views/templates/about/contact.html",
		value: "Contact Info"
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
			data: menuData,
			navigation: false,
			on: {
				onAfterSelect(id) {
					this.$scope.app.show(`${constants.PATH_ABOUT}/${id}`);
				}
			}
		};

		const sidebarContainer = {
			type: "clean",
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
							height: 300,
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
}
