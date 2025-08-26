webix.type(webix.ui.tree, {
	name: "sideBar",
	css: "webix_sidebar about-sidebar",
	arrow(obj) {
		let html = "";
		for (let i = 1; i <= obj.$level; i++) {
			if (i === obj.$level && obj.$count) {
				let icon = `fas fa-caret-${obj.open ? "down" : "right"}`;
				html += `<span class='webix_sidebar_dir_icon webix_icon ${icon}'></span>`;
			}
		}
		return html;
	},
	template(obj, common) {
		if (common.collapsed) {
			return common.icon(obj, common);
		}
		return `${common.arrow(obj, common)} ${common.icon(obj, common)}<span>${obj.value}</span>`;
	},
	icon(obj) {
		if (obj.icon) {
			return `<span class='webix_icon webix_sidebar_icon fas fa-${obj.icon}'></span>`;
		}
		return "";
	},
	height: 35
});
