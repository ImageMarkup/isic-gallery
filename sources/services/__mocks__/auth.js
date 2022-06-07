import constants from "../../constants";
import util from "../../utils/util";

function __getUserInfo() {
	return webix.storage.local.get("user");
}

function canCreateDataset() {
	const user = __getUserInfo();
	return user && user.permissions && user.permissions.createDataset;
}
function hasSegmentationSkill() {
	const user = __getUserInfo();
	return user && user.permissions && user.permissions.segmentationSkill;
}

function canReviewDataset() {
	const user = __getUserInfo();
	return user && user.permissions && user.permissions.reviewDataset;
}

function isTermsOfUseAccepted() {
	const user = __getUserInfo();
	let termOfUse;
	if (user) {
		termOfUse = !!user.accepted_terms;
	}
	else {
		termOfUse = !!webix.storage.local.get(constants.KEY_ACCEPT_TERMS);
	}
	return termOfUse;
}

function isUserInfoChanged(newData) {
	const currentUserInfo = __getUserInfo();
	// check for the same user because of IE bug with promises
	return newData._id === currentUserInfo._id && !util.deepCompare(currentUserInfo, newData);
}

export default {
	canCreateDataset,
	hasSegmentationSkill,
	canReviewDataset,
	isTermsOfUseAccepted,
	isUserInfoChanged
};
