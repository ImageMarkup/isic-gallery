const xbsEslint = require("eslint-config-xbsoftware");
const {INDENT, QUOTES, PLUGINS} = require("eslint-config-xbsoftware/constants");

module.exports = {
	"extends": [
		xbsEslint({
			config: {
				indent: INDENT.TABS,
				quotes: QUOTES.DOUBLE
			}
		})
	],
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"globals": {
		"webix": true,
		"APPNAME": true,
		"VERSION": true,
		"PRODUCTION": true,
		"$$": true
	},
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": "latest"
	},
	"rules": {
		"no-extra-parens": "warn",
		"valid-jsdoc": "warn",
		"no-useless-escape": "off"
	},
	"settings": {
		"import/resolver": {
			"alias": {
			  	"map": [
					["jet-views", "./sources/views"],
					["jet-locales", "./sources/locales"],
					["app-templates", "./sources/views/templates"],
					["app-services", "./sources/services"],
					["app-components", "./sources/views/components"]
			  	]
			}
		}
	}	
};
