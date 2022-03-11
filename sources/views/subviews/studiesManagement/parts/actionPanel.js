import ajaxActions from "../../../../services/ajaxActions";

function createActionsPanel(item, service) {
	return {
		rows: [
			{
				template() {
					return "<div class='item-content-header'>Actions</div>";
				},
				autoheight: true,
				borderless: true
			},
			{
				paddingX: 17,
				paddingY: 12,
				cols: [
					{
						view: "button",
						css: "btn",
						value: "Delete study",
						width: 120,
						height: 32,
						on: {
							onItemClick() {
								webix.confirm({
									text: `Permanently remove <b>"${item.name}"</b> study?`,
									type: "confirm-error",
									callback(result) {
										if (result) {
											ajaxActions.removeStudy(item._id).then(() => {
												webix.message("Study has been removed");
												service.load();
											});
										}
									}
								});
							}
						}
					},
					{}
				]
			}
		]
	};
}

export default {
	createActionsPanel
};
