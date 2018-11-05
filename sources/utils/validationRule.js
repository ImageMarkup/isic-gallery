import constants from "./../constants";

// check if include more than "maxLength" consecutive characters (for ex. qwerty, 123456)

function validateLogin(value) {
	const pattern = new RegExp(constants.PATTERN_LOGIN);
	return webix.rules.isNotEmpty(value) &&
		pattern.test(value);
}

export default {
	validateLogin
};
