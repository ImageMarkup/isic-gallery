import constants from "../../constants";
import util from "../../utils/util";
/*
 config: closed = true/false, type = left/right
 */

function changeDataviewItemDimensions(collapsedView) {
	if (
		collapsedView.config.id === constants.ID_GALLERY_LEFT_PANEL
		|| collapsedView.config.id === constants.ID_GALLERY_RIGHT_PANEL
	) {
		const galleryRichselect = $$(constants.ID_GALLERY_RICHSELECT);
		let dataviewSelectionId = util.getDataviewSelectionId();
		const doNotCallUpdatePager = true;
		galleryRichselect.callEvent("onChange", [dataviewSelectionId, null, doNotCallUpdatePager]);
	}
}

function getConfig(collapsedViewId, config) {
	const BTN_CLOSED_STATE_ID = `collapser-btn-closed-${webix.uid()}`;
	const BTN_OPENED_STATE_ID = `collapser-btn-opened-${webix.uid()}`;
	let openedSpan;
	let closedSpan;
	switch (config.type) {
		case "left":
			openedSpan = "<span class='webix_icon fas fa-angle-left'></span>";
			closedSpan = "<span class='webix_icon fas fa-angle-right'></span>";
			break;
		case "right":
			openedSpan = "<span class='webix_icon fas fa-angle-right'></span>";
			closedSpan = "<span class='webix_icon fas fa-angle-left'></span>";
			break;
		case "top":
			openedSpan = "<span class='webix_icon fas fa-angle-up'></span>";
			closedSpan = "<span class='webix_icon fas fa-angle-down'></span>";
			break;
		case "bottom":
			openedSpan = "<span class='webix_icon fas fa-angle-down'></span>";
			closedSpan = "<span class='webix_icon fas fa-angle-up'></span>";
			break;
		default:
			openedSpan = "<span class='webix_icon fas fa-angle-left'></span>";
			closedSpan = "<span class='webix_icon fas fa-angle-right'></span>";
	}

	if (config.type === "top" || config.type === "bottom") {
		return {
			css: "collapser-vertical",
			height: 23,
			cols: [
				{
					view: "template",
					template: openedSpan,
					css: "collapser-btn",
					id: BTN_OPENED_STATE_ID,
					state: "wasOpened",
					hidden: config && config.closed,
					onClick: {
						// eslint-disable-next-line func-names
						"collapser-btn": function (thisButton) {
							const thisCollapsedButton = this?.config ? this : thisButton;
							const collapsedView = $$(collapsedViewId);
							collapsedView.hide();
							thisCollapsedButton.hide();
							$$(BTN_CLOSED_STATE_ID).show();
							webix.ui.resize();
							if (collapsedViewId === constants.ID_GALLERY_RIGHT_PANEL) {
								util.setHiddenGalleryCartList(true);
							}
							else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
								util.setHiddenGalleryLeftPanel(true);
							}
							changeDataviewItemDimensions(collapsedView);
						}
					}
				},
				{
					view: "template",
					template: closedSpan,
					css: "collapser-btn",
					id: BTN_CLOSED_STATE_ID,
					state: "wasClosed",
					hidden: !(config && config.closed),
					onClick: {
						// eslint-disable-next-line func-names
						"collapser-btn": function (thisButton) {
							const thisCollapsedButton = this?.config ? this : thisButton;
							const collapsedView = $$(collapsedViewId);
							collapsedView.show();
							thisCollapsedButton.hide();
							$$(BTN_OPENED_STATE_ID).show();
							webix.ui.resize();
							if (collapsedViewId === constants.ID_GALLERY_RIGHT_PANEL) {
								util.setHiddenGalleryCartList(false);
							}
							else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
								util.setHiddenGalleryLeftPanel(false);
							}
							changeDataviewItemDimensions(collapsedView);
						}
					}
				}
			]
		};
	}
	return {
		css: "collapser",
		width: 23,
		rows: [
			{
				view: "template",
				template: openedSpan,
				css: "collapser-btn",
				id: BTN_OPENED_STATE_ID,
				state: "wasOpened",
				hidden: config && config.closed,
				onClick: {
					// eslint-disable-next-line func-names
					"collapser-btn": function (thisButton) {
						const thisCollapsedButton = this?.config ? this : thisButton;
						const collapsedView = $$(collapsedViewId);
						collapsedView.hide();
						thisCollapsedButton.hide();
						$$(BTN_CLOSED_STATE_ID).show();
						webix.ui.resize();
						if (collapsedViewId === constants.ID_GALLERY_RIGHT_PANEL) {
							util.setHiddenGalleryCartList(true);
						}
						else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
							util.setHiddenGalleryLeftPanel(true);
						}
						changeDataviewItemDimensions(collapsedView);
					}
				}
			},
			{
				view: "template",
				template: closedSpan,
				css: "collapser-btn",
				id: BTN_CLOSED_STATE_ID,
				state: "wasClosed",
				hidden: !(config && config.closed),
				onClick: {
					// eslint-disable-next-line func-names
					"collapser-btn": function (thisButton) {
						const thisCollapsedButton = this?.config ? this : thisButton;
						const collapsedView = $$(collapsedViewId);
						collapsedView.show();
						thisCollapsedButton.hide();
						$$(BTN_OPENED_STATE_ID).show();
						webix.ui.resize();
						if (collapsedViewId === constants.ID_GALLERY_RIGHT_PANEL) {
							util.setHiddenGalleryCartList(false);
						}
						else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
							util.setHiddenGalleryLeftPanel(false);
						}
						changeDataviewItemDimensions(collapsedView);
					}
				}
			}
		]
	};
}

export default {
	getConfig
};
