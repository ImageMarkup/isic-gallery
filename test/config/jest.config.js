module.exports = {
	rootDir: "../../",
	moduleNameMapper: {
		"\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|md|html)$":
      "<rootDir>/test/mocks/fileMock.js",
		"\\.(css|less)$": "<rootDir>/test/mocks/styleMock.js"
	},
	setupFiles: ["<rootDir>/test/config/envSettings.js"],
	moduleFileExtensions: ["js", "ts", "tsx"],
	moduleDirectories: ["node_modules"],
	testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"], // for all js/ts files with test/spec prefix
	transform: {
		"^.+\\.jsx?$": "babel-jest"
	},
	testEnvironment: "jsdom"
};
