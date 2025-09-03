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
		const callUpdatePager = false;
		galleryRichselect.callEvent("onChange", [dataviewSelectionId, dataviewSelectionId, callUpdatePager]);
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

	const createCollapser = isOpen => ({
		view: "template",
		template: isOpen ? openedSpan : closedSpan,
		css: "collapser-btn",
		id: isOpen ? BTN_OPENED_STATE_ID : BTN_CLOSED_STATE_ID,
		state: isOpen ? "wasOpened" : "wasClosed",
		hidden: isOpen ? config?.closed : !config?.closed,
		onClick: {
			// eslint-disable-next-line func-names
			"collapser-btn": function (thisButton) {
				const thisCollapsedButton = this?.config ? this : thisButton;
				const collapsedView = $$(collapsedViewId);
				if (isOpen) {
					collapsedView.hide();
					thisCollapsedButton.hide();
					$$(BTN_CLOSED_STATE_ID).show();
				}
				else {
					collapsedView.show();
					thisCollapsedButton.hide();
					$$(BTN_OPENED_STATE_ID).show();
				}
				webix.ui.resize();
				if (collapsedViewId === constants.ID_GALLERY_RIGHT_PANEL) {
					util.setHiddenGalleryCartList(isOpen);
				}
				else if (collapsedViewId === constants.ID_GALLERY_LEFT_PANEL) {
					util.setHiddenGalleryLeftPanel(isOpen);
				}
				changeDataviewItemDimensions(collapsedView);
			}
		}
	});

	const layoutConfig = config.type === "top" || config.type === "bottom"
		? {
			css: "collapser-vertical",
			height: 23,
			cols: [createCollapser(true), createCollapser(false)]
		}
		: {
			css: "collapser",
			width: 23,
			rows: [createCollapser(true), createCollapser(false)]
		};

	return layoutConfig;
}

export default {
	getConfig
};
