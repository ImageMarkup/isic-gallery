import constants from "../constants";
const DATASET_PATH = "tightContentTop/dataset";
const FEATURESET_PATH = "tightContentTop/featureset";
const CLASS_NAME = "breadcrumbs";

const map = new Map([
	["home", {
		path: constants.PATH_MAIN,
		text: "Home"
	}],
	["about", {
		path: constants.PATH_ABOUT,
		text: "About",
		parent: "home"
	}],
	["studies", {
		path: constants.PATH_STUDIES,
		text: "Studies",
		parent: "home"
	}],
	["dataset", {
		path: DATASET_PATH,
		text: "Dataset",
		parent: "home"
	}],
	["featureset", {
		path: FEATURESET_PATH,
		text: "Featuresets",
		parent: "home"
	}],
	["dashboard", {
		path: constants.PATH_DASHBOARD,
		text: "Dashboard",
		parent: "home"
	}],
	["about:isicArchive", {
		path: constants.PATH_ABOUT_ISIC_ARCHIVE,
		text: "ISIC Archive",
		parent: "home"
	}],
	["about:isicStandards", {
		path: constants.PATH_ABOUT_ISIC_STANDARDS,
		text: "ISIC Standards for Skin Imaging",
		parent: "home"
	}],
	["about:history", {
		path: constants.PATH_ABOUT_HISTORY,
		text: "History",
		parent: "home"
	}],
	["about:workingGroups", {
		path: constants.PATH_ABOUT_WORKING_GROUPS,
		text: "Working Groups",
		parent: "home"
	}],
	["about:literature", {
		path: constants.PATH_ABOUT_LITERATURE,
		text: "Literature",
		parent: "home"
	}],
	["about:contactInfo", {
		path: constants.PATH_ABOUT_CONTACT_INFO,
		text: "Contact Info",
		parent: "home"
	}],
	["about:partnersAndSponsors", {
		path: constants.PATH_ABOUT_WORKING_GROUPS,
		text: "Partners & Sponsors",
		parent: "home"
	}],
	["wizzardUploader", {
		path: constants.PATH_WIZZARD_UPLOADER,
		text: "Wizard tool",
		parent: "home"
	}],
	["challenges", {
		path: constants.PATH_CHALLENGES,
		text: "Challenges",
		parent: "home"
	}],
	["batchUploader", {
		path: constants.PATH_BATCH_UPLOADER,
		text: "Batch upload",
		parent: "home"
	}],
	["gallery", {
		path: constants.PATH_GALLERY,
		text: "Gallery",
		parent: "home"
	}],
	["createNewStudy", {
		path: constants.PATH_CREATE_STUDY,
		text: "Create New Study",
		parent: "gallery"
	}]
]);

export default class BreadcrumbsManager {
	static getPaths(key) {
		let result = new Map();
		let current = map.get(key);
		if (current) {
			result.set(key, {path: current.path, text: current.text});
		}
		let currentKey;
		while (current && current.parent) {
			currentKey = current.parent;
			current = map.get(currentKey);
			if (current) {
				result.set(currentKey, {path: current.path, text: current.text});
			}
		}
		return result;
	}

	static getBreadcrumbsTemplate(key) {
		let itemsString = "";
		let linksHandlers = {};
		let paths = this.getPaths(key);
		for (let [currentKey, value] of paths) {
			let spanClass = `${currentKey}-${CLASS_NAME}`;
			itemsString = `<span class='${spanClass}'>${value.text}</span>${itemsString}`;
			// prepare click handlers for webix template
			linksHandlers[spanClass] = function(){
				this.$scope.app.show(value.path);
			};
		}
		return {
			view: "template",
			template: `<div class="breadcrumds">${itemsString}</div>`,
			borderless: true,
			autoheight: true,
			onClick: linksHandlers
		};
	}
}

