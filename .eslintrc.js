module.exports = {
	"extends": [
		"eslint-config-xbsoftware/javascript"
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
		"import/no-extraneous-dependencies": "off",
		"@stylistic/js/no-extra-parens": "warn",
		"valid-jsdoc": "warn",
		"no-useless-escape": "off",
		"no-use-before-define": "off",
		"@stylistic/js/comma-dangle": "off",
		"func-names": "off",
		"@stylistic/js/indent": ["error", "tab", {SwitchCase: 1}],
		"@stylistic/js/quotes": ["error", "double", {avoidEscape: true}],
		"@stylistic/js/linebreak-style": "off",
	},
	"settings": {
		"import/resolver": {
			"alias": {
			  	"map": [
					["jet-views", "./sources/views"],
					["jet-locales", "./sources/locales"],
					["app-templates", "./sources/views/templates"],
					["app-services", "./sources/services"],
					["app-components", "./sources/views/components"],
					["app-models", "./sources/models"],
					["app-utils", "./sources/utils"]
			  	]
			}
		}
	}	
};
