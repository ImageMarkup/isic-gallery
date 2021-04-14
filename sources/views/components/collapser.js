import constants from "../../constants";
import util from "../../utils/util";
/*
 config: closed = true/false, type = left/right
 */


function getConfig(collapsedViewId, config) {
	const BTN_CLOSED_STATE_ID = `collapser-btn-closed-${webix.uid()}`;
	const BTN_OPENED_STATE_ID = `collapser-btn-opened-${webix.uid()}`;
	return {
		css: "collapser",
		width: 23,
		rows: [
			{
				view: "template",
				template: config && config.type === "left" ?
					"<span class='webix_icon fas fa-angle-left'></span>" :
					"<span class='webix_icon fas fa-angle-right'></span>",
				css: "collapser-btn",
				id: BTN_OPENED_STATE_ID,
				state: "wasOpened",
				hidden: config && config.closed,
				onClick: {
					"collapser-btn": function (thisButton) {
						const thisCollapsedButton = this.config ? this : thisButton;
						const collapsedView = $$(collapsedViewId);
						collapsedView.hide();
						thisCollapsedButton.hide();
						$$(BTN_CLOSED_STATE_ID).show();
						webix.ui.resize();
						collapsedView.callEvent("onViewHide");
						if (collapsedViewId === constants.ID_GALLERY_ACTIVE_CART_LIST) {
							util.setHiddenGalleryCartList(true);
						} else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
							util.setHiddenGalleryLeftPanel(true);
						}
					}
				}
			},
			{
				view: "template",
				template: config && config.type === "left" ?
				"<span class='webix_icon fas fa-angle-right'></span>" :
				"<span class='webix_icon fas fa-angle-left'></span>",
				css: "collapser-btn",
				id: BTN_CLOSED_STATE_ID,
				state: "wasClosed",
				hidden: !(config && config.closed),
				onClick: {
					"collapser-btn": function (thisButton) {
						const thisCollapsedButton = this.config ? this : thisButton;
						const collapsedView = $$(collapsedViewId);
						collapsedView.show();
						thisCollapsedButton.hide();
						$$(BTN_OPENED_STATE_ID).show();
						webix.ui.resize();
						if (collapsedViewId === constants.ID_GALLERY_ACTIVE_CART_LIST) {
							util.setHiddenGalleryCartList(false);
						} else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
							util.setHiddenGalleryLeftPanel(false);
						}
					}
				}
			}
		]
	};
}

export default {
	getConfig
}
