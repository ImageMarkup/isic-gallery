import "@babel/polyfill";
import {JetApp} from "webix-jet";

import "./styles/app.less";
import "./utils/polyfills";
import constants from "./constants";
import state from "./models/state";
import auth from "./services/auth";
import util from "./utils/util";
import manageLocalStorageByAppVersion from "./services/localStorageManager";
import MobileHeader from "./views/header/mobileHeader";
import MobileTop from "./views/mobileTop";
import OnlyHeaderTop from "./views/onlyHeaderTop";
import APIDocumentation from "./views/subviews/apiDocumentation/apiDocumentation";
import ApplyMetadata from "./views/subviews/applyMetadata/applyMetadata";
import BatchUpload from "./views/subviews/batchUpload/batchUpload";
import CreateDataset from "./views/subviews/createDataset/createDataset";
import CreateStudy from "./views/subviews/createStudy/createStudyPage";
import Dashboard from "./views/subviews/dashboard/dashboard";
import DatasetView from "./views/subviews/dataset/dataset";
import ErrorPage from "./views/subviews/errorPage/errorPage";
import FeaturesetView from "./views/subviews/featureset/featureset";
import GalleryView from "./views/subviews/gallery/gallery";
import GalleryMobileView from "./views/subviews/gallery/galleryMobile";
import MainView from "./views/subviews/main";
import MedicalDisclaimer from "./views/subviews/medicalDisclaimer/medicalDisclaimer";
import PrivacyPolicy from "./views/subviews/privacyPolicy/privacyPolicy";
import RegisterMetadata from "./views/subviews/registerMetadata/registerMetadata";
import TermOfUse from "./views/subviews/termOfUse/termOfUse";
import UploadData from "./views/subviews/uploadData/uploadData";
import UserAccount from "./views/subviews/userAccount/userAccount";
import WizzardUploader from "./views/subviews/wizzardUploader/wizzardUploader";
import TightContentTop from "./views/tightContentTop";
import TightDarkContentTop from "./views/tightDarkContentTop";
import TopWithHeader from "./views/topWithHeader";
import WideContentTop from "./views/wideContentTop";

webix.ready(() => {
	manageLocalStorageByAppVersion();
	const startPath = util.isMobilePhone()
		? constants.PATH_GALLERY_MOBILE
		: constants.PATH_GALLERY;
	const app = new JetApp({
		id: APPNAME,
		version: VERSION,
		start: startPath,
		views: {
			main: MainView,
			error: ErrorPage,
			wideContentTop: WideContentTop,
			tightContentTop: TightContentTop,
			tightDarkContentTop: TightDarkContentTop,
			onlyHeaderTop: OnlyHeaderTop,
			topWithHeader: TopWithHeader,
			mobileTop: MobileTop,
			mobileHeader: MobileHeader,
			dataset: DatasetView,
			featureset: FeaturesetView,
			gallery: GalleryView,
			mobileGallery: GalleryMobileView,
			termsOfUse: TermOfUse,
			medicalDisclaimer: MedicalDisclaimer,
			privacyPolicy: PrivacyPolicy,
			[constants.NAME_VIEW_DASHBOARD]: Dashboard,
			userAccount: UserAccount,
			createDataset: CreateDataset,
			wizardUploader: WizzardUploader,
			batchUploader: BatchUpload,
			applyMetadata: ApplyMetadata,
			registerMetadata: RegisterMetadata,
			createStudy: CreateStudy,
			apiDocumentation: APIDocumentation,
			uploadData: UploadData
		}
	});

	app.render();

	app.attachEvent("app:error:resolve", () => {
		const regex = /\/(?!.*\/).*/;
		const startUrl = app.$router.config.start;
		let replacedUrl = startUrl.replace(regex, "/error");
		webix.delay(() => app.show(replacedUrl));
	});

	app.attachEvent("app:route", () => {
		const user = auth.getUserInfo();
		if (user) {
			auth.refreshUserInfo();
		}
		const root = app.getRoot();
		if (typeof (root.scrollTo) === "function") {
			root.scrollTo(0, 0);
		}
	});

	// selection by shift in dataviews
	document.body.addEventListener("keydown", (event) => {
		if (event.keyCode === 16) { // key code of shift button
			state.toSelectByShift = true;
		}
	});

	document.body.addEventListener("keyup", (event) => {
		if (event.keyCode === 16) { // key code of shift button
			state.toSelectByShift = false;
		}
	});

	state.app = app;
	// trigger event
	app.callEvent("login");
	state.toSelectByShift = false;
});
