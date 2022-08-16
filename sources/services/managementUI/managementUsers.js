import ajaxActions from "../ajaxActions";
import util from "../../utils/util";

class ManagementUsersService {
	constructor(view, listOfUsers, sortAZButton, listPager, richselectFilter) {
		this._view = view;
		this._listOfUsers = listOfUsers;
		this._sortAZButton = sortAZButton;
		this._listPager = listPager;
		this._richselectFilter = richselectFilter;
		this._init();
	}

	_init() {
		this._listOfUsers.on_click["management-user-title"] = (e, id) => {
			console.log(e, id);
		};

		this._sortAZButton.attachEvent("onItemClick", () => {
			let offset = this.getOffsetParam();
			let sort = this.getSortParam();
			if (this._sortAZButton.config.icon === "sort-alpha-asc") {
				this._sortAZButton.define("icon", "sort-alpha-desc");
				this._sortAZButton.setValue("-1");
				let sortdir = this._sortAZButton.getValue();
				this.load(this.setParamsForSorting(26, offset, sort, sortdir));
				this._sortAZButton.refresh();
			}
			else {
				this._sortAZButton.define("icon", "sort-alpha-asc");
				this._sortAZButton.setValue("1");
				let sortdir = this._sortAZButton.getValue();
				this.load(this.setParamsForSorting(26, offset, sort, sortdir));
				this._sortAZButton.refresh();
			}
		});

		this._listPager.attachEvent("onItemClick", (id) => {
			let offset;
			const prevClickHandler = util.debounce(() => {
				const prevPage = this._listPager.data.page !== 0 ? this._listPager.data.page : 0;
				offset = prevPage * this._listPager.data.size;
				this._listOfUsers.loadNext(this._listPager.data.size, offset);
			});
			const nextClickHandler = util.debounce(() => {
				const nextPage = this._listPager.data.page;
				offset = nextPage * this._listPager.data.size;
				this._listOfUsers.loadNext(this._listPager.data.size, offset);
			});
			switch (id) {
				case "prev": {
					prevClickHandler();
					break;
				}
				case "next": {
					nextClickHandler();
					break;
				}
				default: {
					offset = 0;
					break;
				}
			}
		});

		this._listOfUsers.attachEvent("onDataRequest", (offset) => {
			let sort = this.getSortParam();
			let sortdir = this.getSortdirParam();
			this.load(this.setParamsForSorting(26, offset, sort, sortdir));
		});

		this._richselectFilter.attachEvent("onChange", (id) => {
			let offset = this.getOffsetParam();
			let sortdir = this.getSortdirParam();
			let sortdirForListSort = sortdir === "1" ? "asc" : "desc";
			this.load(this.setParamsForSorting(26, offset, id, sortdir));
			this._listOfUsers.sort(id, sortdirForListSort, "string");
		});
	}


	load(params) {
		this._view.showProgress();
		ajaxActions.getUsers(params).then((users) => {
			const offset = params && params.offset ? params.offset : 0;
			const usersCount = users && users.length ? users.length : 0;
			if (users) {
				this._listOfUsers.clearAll();
				this._listOfUsers.parse(users);
				// we have no information about total count of items(users)
				// but be need to set count for pager.
				// So we will update pager count after each data loading.
				this._listPager.define("count", offset + usersCount + 1);
				this._listPager.refresh();
				this._view.hideProgress();
			}
		});
	}


	setParamsForSorting(limit, offset, sort, sortdir) {
		let params = {
			limit: limit || 26,
			offset: offset || 0,
			sort: sort || "lastName",
			sortdir: sortdir || "1"
		};
		return params;
	}

	getOffsetParam() {
		const page = this._listPager.data.page !== 0 ? this._listPager.data.page - 1 : 0;
		return page * this._listPager.data.size;
	}

	getSortParam() {
		let value = this._richselectFilter.data.value;
		return value || "lastName";
	}

	getSortdirParam() {
		let value = this._sortAZButton.getValue();
		return value || "1";
	}
}

export default ManagementUsersService;
