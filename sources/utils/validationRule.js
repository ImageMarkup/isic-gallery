import constants from "../constants";

function validateLogin(value) {
	const pattern = new RegExp(constants.PATTERN_LOGIN);
	return webix.rules.isNotEmpty(value) &&
		pattern.test(value);
}

export default {
	validateLogin
};
