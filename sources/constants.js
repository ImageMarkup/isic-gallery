import appconfig from "../appconfig.json";

export default {
	CONTENT_WIDTH: 1220,

	KEY_TOKEN: "girderToken",
	KEY_ACCEPT_TERMS: "acceptTerms",

	TEXT_PASSWORD_REQUIREMENTS: "Password must contain at least 6 characters, must not consist of identical symbols ONLY (for ex. 1111111), must not include more than 4 consecutive characters (for ex. qwerty, 123456), must include at least 1 number or 1 special symbol !@_#$%^&?*()\"\\\/, mustn't include user's login, first name, last name and email",

	MAX_COUNT_IMAGES_SELECTION: 300,

	PATTERN_PASSWORD: "^[!@_#$%^&?*()\"\\\/0-9a-zA-Z]{6,15}$",
	PATTERN_PASSWORD_HAS_SPEC_SYMBOLS: "[!@_#$%^&?*()\"\\\/0-9]+",
	PATTERN_LOGIN: "^[a-zA-Z]{1}[a-zA-Z0-9_.]{3,}$",

	ID_WINDOW_RECOVERY: "recovery-window",
	ID_WINDOW_LOGIN: "login-window",
	ID_WINDOW_SIGNUP: "signup-window",
	ID_WINDOW_UPLOAD_TYPE: "upload-type-selection",
	ID_WINDOW_CHALLENGES_TYPE: "challenges-type-selection",
	ID_WINDOW_API: "api-info-window",
	ID_WINDOW_ACCESS_REQUEST: "create-dataset-access-request-window",
	ID_WINDOW_TERMS_OF_USE: "term-of-use-window",

	ID_MENU_DOWNLOAD_SEL_IMAGES_METADATA: "download-selected-images-metadata",
	ID_MENU_DOWNLOAD_SEL_IMAGES: "download-selected-images",
	ID_MENU_DOWNLOAD_SEL_METADATA: "download-selected-metadata",
	ID_MENU_DOWNLOAD_IMAGES_METADATA: "download-images-metadata",
	ID_MENU_DOWNLOAD_IMAGES: "download-images",
	ID_MENU_DOWNLOAD_METADATA: "download-metadata",

	ID_HEADER_MENU_MAIN: "isic",
	ID_HEADER_MENU_ABOUT: "about",
	ID_HEADER_MENU_GALLERY: "gallery",
	ID_HEADER_MENU_CHALLENGES: "challenges",
	ID_HEADER_MENU_STUDIES: "studies",
	ID_HEADER_MENU_DERMO: "dermo",
	ID_HEADER_MENU_ARCHIVE: "archive",
	ID_HEADER_MENU_DOWNLOAD: "download",
	ID_HEADER_MENU_DASHBOARD: "dashboard",

	PATH_MULTIRATER: "/topWithHeader/onlyHeaderTop/multirater",
	PATH_ABOUT: "/topWithHeader/tightContentTop/about",
	PATH_ABOUT_CONTACT_INFO: "/topWithHeader/tightContentTop/about/contactInfo",
	PATH_ABOUT_HISTORY: "/topWithHeader/tightContentTop/about/history",
	PATH_ABOUT_ISIC_ARCHIVE: "/topWithHeader/tightContentTop/about/isicArchive",
	PATH_ABOUT_ISIC_STANDARDS: "/topWithHeader/tightContentTop/about/isicStandards",
	PATH_ABOUT_LITERATURE: "/topWithHeader/tightContentTop/about/literature",
	PATH_ABOUT_WORKING_GROUPS: "/topWithHeader/tightContentTop/about/workingGroups",
	PATH_MAIN: "/topWithHeader/wideContentTop/main",
	PATH_STUDIES: "/topWithHeader/tightDarkContentTop/studies",
	PATH_GALLERY: "/topWithHeader/onlyHeaderTop/gallery",
	PATH_MEDICAL_DISCLAIMER: "/topWithHeader/tightDarkContentTop/medicalDisclaimer",
	PATH_PRIVACY_POLICY: "/topWithHeader/tightDarkContentTop/privacyPolicy",
	PATH_TERMS_OF_USE: "/topWithHeader/tightDarkContentTop/termsOfUse",
	PATH_DASHBOARD: "/topWithHeader/tightContentTop/dashboard",
	PATH_USER_ACCOUNT: "/topWithHeader/tightContentTop/userAccount",
	PATH_CREATE_DATASET: "/topWithHeader/tightContentTop/createDataset",
	PATH_INVITE_USER: "/topWithHeader/tightContentTop/inviteUser",
	PATH_WIZZARD_UPLOADER: "/topWithHeader/tightContentTop/wizzardUploader",
	PATH_CHALLENGES: "/topWithHeader/tightContentTop/challenges",

	PATH_DOWNLOAD_PDF_TERMS_OF_USE: "/sources/filesForDownload/termsOfUse.pdf",
	PATH_DOWNLOAD_TXT_TERMS_OF_USE: "/sources/filesForDownload/termsOfUse.txt",

	URL_ISIC_SITE: appconfig.isicSiteUrl,
	URL_DERMOSCOPEDIA: "https://dermoscopedia.org/Main_Page",
	URL_CHALLENGES: "https://challenge.kitware.com/#challenge/n/ISIC_2017%3A_Skin_Lesion_Analysis_Towards_Melanoma_Detection",
	URL_API: `${appconfig.isicSiteUrl}api/v1`,
	URL_ANNOTATIONS_TOOL: `${appconfig.isicSiteUrl}#tasks/annotate/`,
	URL_ANNOTATIONS_TOOL_SEGMENT: `${appconfig.isicSiteUrl}/markup/segment#/`,
	URL_BATCH_UPLOAD: `${appconfig.isicSiteUrl}#dataset/upload/batch`,
	URL_CHALLENGE_2016: "http://challenge2016.isic-archive.com",
	URL_CHALLENGE_2017: "http://challenge2017.isic-archive.com",
	URL_CHALLENGE_2018: "http://challenge2018.isic-archive.com/",
	URL_MULTIRATER: "http://www.dermannotator.org/multirater/",

	NAME_VIEW_DASHBOARD: "dashboard"
};
