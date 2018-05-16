webix.protoUI({
	name: "slidebutton",
	defaults: {
		checkValue: true,
		uncheckValue: false,
		template(config, common) {
			const id = config.name || `x${webix.uid()}`;
			let rightlabel = "";
			let leftlabel = "";

			if (config.labelRight) {
				rightlabel = `<label class='webix_label_right'>${config.labelRight}</label>`;
				if (config.labelWidth) {
					config.label = config.label || "&nbsp;";
				}
			}
			if (config.labelLeft) {
				leftlabel = `<label class='webix_label_left'>${config.labelLeft}</label>`;
				if (config.labelWidth) {
					config.label = config.label || "&nbsp;";
				}
			}

			const checked = config.checkValue === config.value;

			const className = `webix_inp_checkbox_border webix_el_group webix_checkbox_${(checked ? "1" : "0")}`;
			const ch = `<div class="cmn-toggle-box">
				<input  id="cmn-toggle-${id}" class="cmn-toggle cmn-toggle-round" type="checkbox" ${(checked ? "checked" : "")}>
				<label  for="cmn-toggle-${id}"></label>
				</div>`;

			const html = `<div style="line-height:${common.config.cheight}px;" class="${className}">${leftlabel + ch + rightlabel}</div>`;
			return common.$renderInput(config, html, id);
		}
	},
	on_click: {
		"cmn-toggle": function toggle() {
			this.toggle();
		}
	}
}, webix.ui.checkbox);
