const pager = {
	view: "pager",
	css: "dataview-pager",
	size: 80,
	height: 36,
	width: 280,
	master: false,
	template(obj, common) {
		return `${common.first()} ${common.prev()}
					<input type='text' class='pager-input' value='${common.page(obj, common)}'>	<span class="pager-amount">of ${obj.limit}</span>
				${common.next()} ${common.last()}`;
	},
	on: {
		onAfterRender() {
			const currentPager = this;
			const node = this.getNode();
			const inputNode = node.getElementsByClassName("pager-input")[0];
			inputNode.addEventListener("focus", () => {
				inputNode.prev = inputNode.value;
			});
			inputNode.addEventListener("blur", () => {
				const currentPage = currentPager.data.page + 1; // because in pager first page is 0
				if (inputNode.value !== currentPage) {
					inputNode.value = currentPage;
				}
			});
			inputNode.addEventListener("keydown", (e) => {
				if (e.keyCode === 13) { // enter
					let value = parseInt(inputNode.value);
					if (value && value > 0 && value <= currentPager.data.limit) {
						currentPager.select(value - 1); // because in pager first page is 0
					}
					else {
						inputNode.value = inputNode.prev;
					}
				}
			});

			inputNode.addEventListener("input", () => {
				const regexp = /[0-9]+/g;
				const value = inputNode.value;
				const validValue = value.match(regexp) ? value.match(regexp).join("") : "";
				inputNode.value = validValue;
			});
		}
	}
};

function getConfig(id) {
	pager.id = id || `pager-${webix.uid()}`;
	return pager;
}

function getIdFromConfig() {
	return pager.id;
}

export default {
	getConfig,
	getIdFromConfig
};
