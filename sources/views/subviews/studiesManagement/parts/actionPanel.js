function createActionsPanel(item) {
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
									type: "confirm-error"
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
