function togglePasswordVisibility(elem) {
	if (elem.config.icon === "fas fa-eye") {
		elem.define("type", "password");
		elem.define("icon", "fas fa-eye-slash");
	}
	else {
		elem.define("type", "base");
		elem.define("icon", "fas fa-eye");
	}
	elem.refresh();
}

webix.protoUI({
	name: "passwordInput",
	$cssName: "search",
	$init() {
		this.attachEvent("onSearchIconClick", (ev) => {
			togglePasswordVisibility($$(ev.target));
		});
	},
	defaults: {
		type: "password",
		icon: "fas fa-eye-slash"
	}
}, webix.ui.search);

