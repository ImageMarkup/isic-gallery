import constants from "../../constants";
import utils from "../../utils/util";

class ApiDocumentationService {
	constructor(view, languageMenu, leftSideBar, pageScrollView, searchInput, listOfSearchedValues) {
		this._view = view;
		this._languageMenu = languageMenu;
		this._leftSidebar = leftSideBar;
		this._pageScrollView = pageScrollView;
		this._searchInput = searchInput;
		this._listOfSearchedValues = listOfSearchedValues;
		this._ready();
	}

	_ready() {
		this._scrollOffsetTop = this._pageScrollView.$view.offsetTop;
		const firstItemId = this._leftSidebar.getFirstId();

		window.addEventListener("resize", () => {
			this._addScrollIfOverflown();
		});

		this._leftSidebar.select(firstItemId);

		this._languageMenu.attachEvent("onMenuItemClick", (id) => {
			this._languageMenu.select(id);
		});

		this._searchInput.attachEvent("onTimedKeyPress", () => {
			this._listOfSearchedValues.clearAll();
			const searchValue = this._searchInput.getValue().toLowerCase();
			if (searchValue === "") {
				this._listOfSearchedValues.hide();
			}
			else {
				this._leftSidebar.find((obj) => {
					const value = obj.value.toLowerCase();
					if (value.indexOf(searchValue) !== -1) {
						this._listOfSearchedValues.parse(obj);
					}
				});
				const parsedValuesLength = this._listOfSearchedValues.data.order.length;
				if (parsedValuesLength === 0) {
					this._listOfSearchedValues.clearAll();
					this._listOfSearchedValues.showOverlay(`<div class="list-overlay-message">No Results Found for \"${searchValue}\"</div>`);
				}
				else {
					this._listOfSearchedValues.hideOverlay();
				}
				this._listOfSearchedValues.show();
				const listNode = this._listOfSearchedValues.getNode();
				const isListOverflown = utils.isOverflown(listNode);
				if (isListOverflown) {
					this._listOfSearchedValues.define("scroll", "true");
				}
				else {
					this._listOfSearchedValues.define("scroll", "false");
				}
			}
		});

		this._listOfSearchedValues.attachEvent("onItemClick", (id) => {
			const firstChild = {
				isFirst: false
			};
			const afterSearch = {
				hasSearched: true
			};
			this._leftSidebar.callEvent("onItemClick", [id, firstChild, afterSearch]);
		});

		this._languageMenu.attachEvent("onAfterSelect", (id) => {
			webix.delay(() => {
				this._addScrollIfOverflown();
			});
			const pythonLanguageValue = constants.PYTHON_MENU_ID.toLowerCase();
			const RLagnuageValue = constants.R_MENU_ID;
			switch (id) {
				case constants.PYTHON_MENU_ID: {
					this._showAndHideLanguageTemplates(pythonLanguageValue, RLagnuageValue);
					break;
				}
				case constants.R_MENU_ID: {
					this._showAndHideLanguageTemplates(RLagnuageValue, pythonLanguageValue);
					break;
				}
				default: {
					break;
				}
			}
		});

		let pythonLanguageId = constants.PYTHON_MENU_ID;
		this._languageMenu.select(pythonLanguageId);

		this._leftSidebar.attachEvent("onItemClick", (id, firstChild, afterSearch) => {
			const sidebarItem = this._leftSidebar.getItem(id);
			if (afterSearch) {
				if (afterSearch.hasSearched) {
					this._leftSidebar.select(id);
					let sidebarBranch;
					if (sidebarItem.$parent !== 0) {
						sidebarBranch = this._leftSidebar.getItem(sidebarItem.$parent);
					}
					else {
						sidebarBranch = sidebarItem;
					}
					if (!this._leftSidebar.isBranchOpen(sidebarBranch.id)) {
						this._leftSidebar.open(sidebarBranch.id);
					}
				}
			}
			let layoutToShow = $$(sidebarItem.name);
			if (sidebarItem.$count > 0) {
				this._leftSidebar.unselectAll();
				this._firstChildId = this._leftSidebar.getFirstChildId(sidebarItem.id);
				this._leftSidebar.select(this._firstChildId);
			}
			else if (sidebarItem.$level > 1) {
				let offsetTop;
				if (firstChild.isFirst) {
					offsetTop = layoutToShow.$view.offsetTop;
					offsetTop -= layoutToShow.$view.parentNode.parentNode.offsetTop;
				}
				else {
					offsetTop = layoutToShow.$view.offsetTop;
					offsetTop -= layoutToShow.$view.parentNode.parentNode.parentNode.offsetTop;
				}
				this._pageScrollView.blockEvent();
				this._pageScrollView.scrollTo(0, offsetTop);
				setTimeout(() => {
					this._pageScrollView.unblockEvent();
				}, 100);
			}
			else {
				const sidebarState = this._leftSidebar.getState();
				if (sidebarState.open.length > 0) {
					this._leftSidebar.closeAll();
				}
				this._pageScrollView.blockEvent();
				this._pageScrollView.showView(sidebarItem.name);
				setTimeout(() => {
					this._pageScrollView.unblockEvent();
				}, 100);
			}
		});

		this._leftSidebar.attachEvent("onAfterSelect", (id) => {
			if (id === this._firstChildId) {
				const firstChild = {
					isFirst: true
				};
				this._leftSidebar.callEvent("onItemClick", [id, firstChild]);
			}
		});

		this._leftSidebar.attachEvent("onAfterRender", () => {
			let sideBarNode = this._leftSidebar.getNode();
			let sideBarOverflown = utils.isOverflown(sideBarNode);
			if (sideBarOverflown) {
				this._leftSidebar.define("scroll", "true");
			}
			else {
				this._leftSidebar.define("scroll", "false");
			}
		});

		this._pageScrollView.attachEvent("onAfterScroll", () => {
			this._afterPageScroll();
		});
	}

	_showAndHideLanguageTemplates(toShowLanguage, toHideLanguage) {
		const tempaltesToShow = this._view.$scope.getLanguageTemplates(toShowLanguage);
		const templatesToHide = this._view.$scope.getLanguageTemplates(toHideLanguage);
		tempaltesToShow.forEach((templateToShow) => {
			templateToShow.show();
		});
		templatesToHide.forEach((templateToHide) => {
			templateToHide.hide();
		});
	}

	_addScrollIfOverflown() {
		let codeSamplesElements = Array.from(document.getElementsByClassName("code-samples"));
		codeSamplesElements.forEach((codeElement) => {
			const isElementOverflown = utils.isOverflown(codeElement);
			if (isElementOverflown) {
				codeElement.style.overflowX = "scroll";
			}
			else {
				codeElement.style.overflowX = "auto";
			}
		});
	}

	_checkVisibalityOfElement(element, scrollTopOffset) {
		const rect = element.getBoundingClientRect();

		const elementTop = rect.top;
		const elementBottom = rect.bottom - scrollTopOffset;

		// Partially visible elements return true:
		return elementTop < window.innerHeight && elementBottom >= 0;
	}

	_afterPageScroll(scrollChildViews) {
		const scrollChildViewsToFind = scrollChildViews
			? scrollChildViews.getChildViews()
			: this._pageScrollView.getChildViews()[0].getChildViews();
		const topShownView = scrollChildViewsToFind.find(
			childView => this._checkVisibalityOfElement(childView.getNode(), this._scrollOffsetTop)
		);
		const sidebarItemName = topShownView.config.id;

		if (sidebarItemName.indexOf("$") !== -1) {
			this._afterPageScroll(topShownView);
		}

		const arrayWithOneItemToSelect = this._leftSidebar.find(
			sidebarItem => sidebarItem.name === sidebarItemName
		);

		if (arrayWithOneItemToSelect.length !== 0) {
			const itemToSelect = arrayWithOneItemToSelect[0];

			// block select and click events
			this._leftSidebar.blockEvent();

			// select top visible item in sidebar
			if (itemToSelect.$parent && !this._leftSidebar.isBranchOpen(itemToSelect.$parent)) {
				this._leftSidebar.closeAll();
				this._leftSidebar.open(itemToSelect.$parent);
			}
			else if (!itemToSelect.$parent) {
				this._leftSidebar.closeAll();
			}
			this._leftSidebar.select(itemToSelect.id);

			// unblock blocked events
			this._leftSidebar.unblockEvent();
		}
	}
}

export default ApiDocumentationService;
