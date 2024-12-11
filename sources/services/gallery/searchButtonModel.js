function removeTootipDiv(elementNode, tooltipClassName) {
	elementNode.removeAttribute("tooltip");
	const tooltipDiv = document.querySelector(`.${tooltipClassName}`);
	if (tooltipDiv) {
		tooltipDiv.parentNode.removeChild(tooltipDiv);
	}
}

function createHintForSearchTimesButton(elementNodeForTooltip, tooltipClassName, tooltipText) {
	function mouseOverHandler() {
		const title = this.title;
		this.setAttribute("tooltip", title);
		const tooltipWrap = document.createElement("div"); // creates div
		tooltipWrap.className = tooltipClassName; // adds class
		const textDiv = document.createElement("div"); // creates another div
		textDiv.innerHTML = tooltipText;	// add the text node to the newly created span.
		tooltipWrap.appendChild(textDiv); // add text element to the tooltip

		const firstChild = document.body.firstChild;// gets the first elem after body
		firstChild.parentNode.insertBefore(tooltipWrap, firstChild); // adds tt before elem
		const padding = 5;
		const linkProps = this.getBoundingClientRect();
		const tooltipProps = tooltipWrap.getBoundingClientRect();
		const topPos = linkProps.top - (tooltipProps.height + padding);
		tooltipWrap.setAttribute("style", `top:${topPos}px;left:${linkProps.left}px;z-index: 1010`); // z-index: 1010 to show tooltip in modal window background
	}
	elementNodeForTooltip.addEventListener("mouseover", mouseOverHandler);
	elementNodeForTooltip.addEventListener("mouseout", () => {
		removeTootipDiv(elementNodeForTooltip, tooltipClassName);
	});
}

function createTimesSearchButton(
	searchInput,
	appliedFilterModel,
	inputNode,
	tooltipText,
	nameFilter
) {
	const className = `clear-input-${webix.uid()}`;
	inputNode.lastChild.style.paddingRight = "26px";
	const timesSpan = document.createElement("span");
	inputNode.appendChild(timesSpan);
	const timesButtonNode = inputNode.lastChild;
	timesButtonNode.setAttribute("class", `search-times-button webix_input_icon fas fa-times ${className}`);
	timesButtonNode.setAttribute("style", "height:26px; padding-top:6px;");
	const tootipTextForTimesButton = `${tooltipText}`;
	const tooltipClassNameForTimesButton = "tooltip";
	createHintForSearchTimesButton(
		timesButtonNode,
		tooltipClassNameForTimesButton,
		tootipTextForTimesButton
	);
	searchInput.on_click[className] = () => {
		if (searchInput.getValue() !== "") {
			searchInput.setValue("");
			if (appliedFilterModel) {
				appliedFilterModel?.setFilterValue("");
			}
			if (nameFilter) {
				searchInput.callEvent("onEnter");
			}
		}
	};
}

function removeTimesSearchButton(inputNode) {
	inputNode.removeChild(inputNode.lastChild);
	inputNode.lastChild.style.paddingRight = "0px";
}

export default {
	removeTootipDiv,
	createTimesSearchButton,
	removeTimesSearchButton,
	createHintForSearchTimesButton,
};
