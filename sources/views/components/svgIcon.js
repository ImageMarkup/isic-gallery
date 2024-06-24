webix.protoUI({
	name: "svgIcon",
	$cssName: "icon",
	defaults: {
		template(obj, view) {
			const min = Math.min(obj.awidth, obj.aheight);
			const top = Math.round((view.$height - obj.aheight) / 2);
			const inner = `<button type='button' style='height:${min}px;width:${min}px;' class='webix_icon_button tooltip-title'>${
				wrapIconWithSpan("webix_icon", obj.icon, obj.active)
			}</button>`;

			const lineHeight = obj.aheight !== min ? obj.aheight : 0;
			return `<div class='webix_el_box tooltip-container' style='width:${obj.awidth}px;height:${obj.aheight}px;line-height:${lineHeight}px;margin-top:${top}px; background-color: ${obj.active ? "#FFFFFF;" : "transparent"}'>${inner}
			<span class="tooltip-block tooltip-block-top" style="display: block; z-index: 1000000">${obj.tooltip}</span>
			${obj.badge || obj.badge === 0 ? `<span class='webix_badge'>${obj.badge}</span>` : ""}
			</div>`;
		}
	}
}, webix.ui.icon);

function wrapIconWithSpan(elementClass, icon, active) {
	return `<span class="${elementClass}">
		<svg viewBox="0 0 20 20" class="gallery-icon-svg" ${active ? "fill=#3C87CB" : "fill=#B5BBC9"} style="width: 20px; height: 20px;">
			<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${icon}" class="gallery-icon-use"></use>
		</svg>
	</span>`;
}
