import dates from "../../../../utils/formats";

function createInfoPanel(item) {
	const html = `	<div class='accordion-item-template'>
								<div class="item-content-header">Info</div>
								<div class="item-content-block">
									<div class="item-content-row">
										<span class="item-content-label">Unique ID</span>
										<span class="item-content-value">${item._id ? item._id : ""}</span>
									</div>
									<div class="item-content-row">
										<span class="item-content-label">Creator</span>
										<span class="item-content-value">${item.creator && item.creator.name ? item.creator.name : ""}</span>
									</div>
									<div class="item-content-row">
										<span class="item-content-label">Created</span>
										<span class="item-content-value">${dates.formatDateString(item.created)}</span>
									</div>
									<div class="item-content-row">
										<span class="item-content-label">Featureset</span>
										<span class="item-content-value">${item.features && item.features.name ? item.features.name : ""}</span>
									</div>
								</div>
							</div>`;
	return {
		view: "template",
		template: html,
		autoheight: true,
		borderless: true
	};
}

export default {
	createInfoPanel
};