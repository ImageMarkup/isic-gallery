webix.protoUI({
	name: "templateWithImages",
	defaults: {
		on: {
			onAfterRender() {
				const rootNode = this.getNode();
				const imgs = rootNode.getElementsByTagName("img");
				for (let i = 0; i < imgs.length; i++) {
					imgs[i].addEventListener("load", () => {
						webix.delay(() => {
							this.resize();
						}, 0);
					});
				}
			}
		}
	}
}, webix.ui.template);
