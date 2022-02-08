import state from "../../../../models/state";

let dataviewId;

const pager = {
	view: "pager",
	// size: 80, define in gallery service
	height: 36,
	width: 250,
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
			inputNode.addEventListener("focus", function () {
				this.prev = this.value;
			});
			inputNode.addEventListener("keyup", function (e) {
				if (e.keyCode === 13) { // enter
					let value = parseInt(this.value);
					if (value && value > 0 && value <= currentPager.data.limit) {
						let offset = currentPager.data.size * (value - 1); // because in pager first page is 0
						$$(dataviewId).loadNext(currentPager.data.size, offset);
						currentPager.select(value - 1); // because in pager first page is 0
					}
					else {
						this.value = this.prev;
					}
				}
			});
		},
		onItemClick(id, e, node) {
			let offset;
			switch (id) {
				case "prev": {
					const nextPage = this.data.page > 0 ? this.data.page - 1 : 0;
					offset = nextPage * this.data.size;
					break;
				}
				case "next": {
					const nextPage = this.data.page < this.data.limit - 1 ? this.data.page + 1 : this.data.limit - 1;
					offset = nextPage * this.data.size;
					break;
				}
				case "first": {
					offset = 0;
					break;
				}
				case "last": {
					offset = (this.data.limit - 1) * this.data.size;
					break;
				}
				default: {
					offset = 0;
					break;
				}
			}
			$$(dataviewId).loadNext(this.data.size, offset);
		}
	}
};

function getConfig(id, sourceDataviewId) {
	pager.id = id || `pager-${webix.uid()}`;
	dataviewId = sourceDataviewId;
	return pager;
}

function getIdFromConfig() {
	return pager.id;
}

export default {
	getConfig,
	getIdFromConfig
};
