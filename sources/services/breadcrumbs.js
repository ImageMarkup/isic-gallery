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
	}],
	// about section
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
	// ["about:contactInfo", {
	// 	path: constants.PATH_ABOUT_CONTACT_INFO,
	// 	text: "Contact Info",
	// 	parent: "home"
	// }],
	["about:partnersAndSponsors", {
		path: constants.PATH_ABOUT_PARTNERS_AND_SPONSORS,
		text: "Partners & Sponsors",
		parent: "home"
	}],

	["about:aboutIsicOverview", {
		path: constants.PATH_ABOUT_ISIC_OVERVIEW,
		text: "About ISIC: Overview",
		parent: "home"
	}],
	["about:aboutIsicBackground", {
		path: constants.PATH_ABOUT_ISIC_BACKGROUND,
		text: "About ISIC: Background",
		parent: "home"
	}],
	["about:aboutIsicGoals", {
		path: constants.PATH_ABOUT_ISIC_GOALS,
		text: "About ISIC: Goals",
		parent: "home"
	}],
	["about:aboutIsicOrganization", {
		path: constants.PATH_ABOUT_ISIC_ORGANIZATION,
		text: "About ISIC: Organization",
		parent: "home"
	}],
	["about:aboutIsicSponsorsAndPartners", {
		path: constants.PATH_ABOUT_ISIC_SPONSORS_AND_PARTNERS,
		text: "About ISIC: Sponsors and Partners",
		parent: "home"
	}],
	["about:workingGroupsTechnology", {
		path: constants.PATH_ABOUT_WG_TECHNOLOGY,
		text: "Working Groups: Technology",
		parent: "home"
	}],
	["about:workingGroupsTechnique", {
		path: constants.PATH_ABOUT_WG_TECHNIQUE,
		text: "Working Groups: Technique",
		parent: "home"
	}],
	["about:workingGroupsTerminology", {
		path: constants.PATH_ABOUT_WG_TERMINOLOGY,
		text: "Working Groups: Terminology",
		parent: "home"
	}],
	["about:workingGroupsPrivacy", {
		path: constants.PATH_ABOUT_WG_PRIVACY,
		text: "Working Groups: Privacy",
		parent: "home"
	}],
	["about:workingGroupsMetadata", {
		path: constants.PATH_ABOUT_WG_METADATA,
		text: "Working Groups: Metadata/DICOM",
		parent: "home"
	}],
	["about:workingGroupsAI", {
		path: constants.PATH_ABOUT_WG_AI,
		text: "Working Groups: Artificial Intelligence",
		parent: "home"
	}],
	["about:workingGroupsEducation", {
		path: constants.PATH_ABOUT_WG_EDUCATION,
		text: "Working Groups: Education",
		parent: "home"
	}],
	["about:isicArchiveGoals", {
		path: constants.PATH_ABOUT_ARCHIVE_GOALS,
		text: "ISIC Archive: Goals",
		parent: "home"
	}],
	["about:isicArchiveContent", {
		path: constants.PATH_ABOUT_ARCHIVE_CONTENT,
		text: "ISIC Archive: Content and Layout",
		parent: "home"
	}],
	["about:isicArchiveInfrastructure", {
		path: constants.PATH_ABOUT_ARCHIVE_INFRASTRUCTURE,
		text: "ISIC Archive: Infrastructure",
		parent: "home"
	}],
	["about:isicArchiveDataDictionary", {
		path: constants.PATH_ABOUT_ARCHIVE_DATA_DICTIONARY,
		text: "ISIC Archive: Data Dictionary",
		parent: "home"
	}],
	["about:isicChallengesGoals", {
		path: constants.PATH_ABOUT_CHALLENGES_GOALS,
		text: "ISIC Challenges: Goals",
		parent: "home"
	}],
	["about:isicChallengesGrandVLive", {
		path: constants.PATH_ABOUT_CHALLENGES_GRAND_V_LIVE,
		text: "ISIC Challenges: Grand v. Live",
		parent: "home"
	}],
	["about:isicChallengesHistory", {
		path: constants.PATH_ABOUT_CHALLENGES_HISTORY,
		text: "ISIC Challenges: History",
		parent: "home"
	}],
	["about:isicChallengesPlanned", {
		path: constants.PATH_ABOUT_CHALLENGES_PLANNED,
		text: "ISIC Challenges: Planned",
		parent: "home"
	}],

	["about:isicMeetingsGroups", {
		path: constants.PATH_ABOUT_MEETINGS_GROUPS,
		text: "ISIC Meetings: Working Groups",
		parent: "home"
	}],
	["about:isicMeetingsWorkshops", {
		path: constants.PATH_ABOUT_MEETINGS_WORKSHOPS,
		text: "ISIC Meetings: Workshops and Conferences",
		parent: "home"
	}],
	["about:isicPublications", {
		path: constants.PATH_ABOUT_PUBLICATIONS,
		text: "ISIC Publications",
		parent: "home"
	}],
	["about:faq", {
		path: constants.PATH_ABOUT_FAQ,
		text: "FAQ",
		parent: "home"
	}],
	["about:contactInfo", {
		path: constants.PATH_ABOUT_CONTACT_INFORMATION,
		text: "Contact Info",
		parent: "home"
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

