import "@babel/polyfill";
import {JetApp} from "webix-jet";
import "./styles/app.less";
import "./utils/polifills";
import state from "./models/state";
import constants from "./constants";
import auth from "./services/auth";
import manageLocalStorageByAppVersion from "./services/localStorageManager";

import MainView from "./views/subviews/main";
import WideContentTop from "./views/wideContentTop";
import TightContentTop from "./views/tightContentTop";
import TightDarkContentTop from "./views/tightDarkContentTop";
import TopWithHeader from "./views/topWithHeader";
import OnlyHeaderTop from "./views/onlyHeaderTop";
import AboutView from "./views/subviews/about/about";
import DatasetView from "./views/subviews/dataset/dataset";
import FeaturesetView from "./views/subviews/featureset/featureset";
import GalleryView from "./views/subviews/gallery/gallery";
import TermOfUse from "./views/subviews/termOfUse/termOfUse";
import MedicalDisclaimer from "./views/subviews/medicalDisclaimer/medicalDisclaimer";
import PrivacyPolicy from "./views/subviews/privacyPolicy/privacyPolicy";
import Dashboard from "./views/subviews/dashboard/dashboard";
import UserAccount from "./views/subviews/userAccount/userAccount";
import CreateDataset from "./views/subviews/createDataset/createDataset";
import UploadData from "./views/subviews/uploadData/uploadData";
import WizzardUploader from "./views/subviews/wizzardUploader/wizzardUploader";
import BatchUpload from "./views/subviews/batchUpload/batchUpload";
import ApplyMetadata from "./views/subviews/applyMetadata/applyMetadata";
import RegisterMetadata from "./views/subviews/registerMetadata/registerMetadata";
import CreateStudy from "./views/subviews/createStudy/createStudyPage";
import ErrorPage from "./views/subviews/errorPage/errorPage";
import APIDocumentation from "./views/subviews/apiDocumentation/apiDocumentation";
// about pages
import AboutIsicOverview from "./views/subviews/about/subviews/aboutIsic/overview";
import AboutIsicBackground from "./views/subviews/about/subviews/aboutIsic/background";
import AboutIsicGoals from "./views/subviews/about/subviews/aboutIsic/goals";
import AboutIsicOrganization from "./views/subviews/about/subviews/aboutIsic/organization";
import AboutIsicSponsorsAndPartners from "./views/subviews/about/subviews/aboutIsic/sponsorsAndPartners";
import WorkingGroupsTechnology from "./views/subviews/about/subviews/workingGroups/technology";
import WorkingGroupsTechnique from "./views/subviews/about/subviews/workingGroups/technique";
import WorkingGroupsTerminology from "./views/subviews/about/subviews/workingGroups/terminology";
import WorkingGroupsPrivacy from "./views/subviews/about/subviews/workingGroups/privacy";
import WorkingGroupsMetadata from "./views/subviews/about/subviews/workingGroups/metadata";
import WorkingGroupsAI from "./views/subviews/about/subviews/workingGroups/artificialIntelligence";
import WorkingGroupsEducation from "./views/subviews/about/subviews/workingGroups/education";
import IsicArchiveGoals from "./views/subviews/about/subviews/isicArchive/goals";
import IsicArchiveContent from "./views/subviews/about/subviews/isicArchive/contentAndLayout";
import IsicArchiveInfrastructure from "./views/subviews/about/subviews/isicArchive/infrastructure";
import IsicArchiveDataDictionary from "./views/subviews/about/subviews/isicArchive/dataDictionary";
import IsicChallengesGoals from "./views/subviews/about/subviews/isicChallenges/goals";
import IsicChallengesGrandVLive from "./views/subviews/about/subviews/isicChallenges/grandVLive";
import IsicChallengesHistory from "./views/subviews/about/subviews/isicChallenges/historyOfChallenges";
import IsicChallengesPlanned from "./views/subviews/about/subviews/isicChallenges/planned";
import IsicMeetingsGroups from "./views/subviews/about/subviews/isicMeetings/groups";
import IsicMeetingsWorkshops from "./views/subviews/about/subviews/isicMeetings/workshops";
import IsicPublications from "./views/subviews/about/subviews/isicPublications";
import FAQ from "./views/subviews/about/subviews/faq";
import ContactInfo from "./views/subviews/about/subviews/contactInfo";

webix.ready(() => {
	manageLocalStorageByAppVersion();
	const app = new JetApp({
		id: APPNAME,
		version: VERSION,
		start: constants.PATH_MAIN,
		views: {
			main: MainView,
			error: ErrorPage,
			wideContentTop: WideContentTop,
			tightContentTop: TightContentTop,
			tightDarkContentTop: TightDarkContentTop,
			onlyHeaderTop: OnlyHeaderTop,
			topWithHeader: TopWithHeader,
			about: AboutView,
			dataset: DatasetView,
			featureset: FeaturesetView,
			gallery: GalleryView,
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
			uploadData: UploadData,
			// about pages
			aboutIsicOverview: AboutIsicOverview,
			aboutIsicBackground: AboutIsicBackground,
			aboutIsicGoals: AboutIsicGoals,
			aboutIsicOrganization: AboutIsicOrganization,
			aboutIsicSponsorsAndPartners: AboutIsicSponsorsAndPartners,
			workingGroupsTechnology: WorkingGroupsTechnology,
			workingGroupsTechnique: WorkingGroupsTechnique,
			workingGroupsTerminology: WorkingGroupsTerminology,
			workingGroupsPrivacy: WorkingGroupsPrivacy,
			workingGroupsMetadata: WorkingGroupsMetadata,
			workingGroupsAI: WorkingGroupsAI,
			workingGroupsEducation: WorkingGroupsEducation,
			isicArchiveGoals: IsicArchiveGoals,
			isicArchiveContent: IsicArchiveContent,
			isicArchiveInfrastructure: IsicArchiveInfrastructure,
			isicArchiveDataDictionary: IsicArchiveDataDictionary,
			isicChallengesGoals: IsicChallengesGoals,
			isicChallengesGrandVLive: IsicChallengesGrandVLive,
			isicChallengesHistory: IsicChallengesHistory,
			isicChallengesPlanned: IsicChallengesPlanned,
			isicMeetingsGroups: IsicMeetingsGroups,
			isicMeetingsWorkshops: IsicMeetingsWorkshops,
			isicPublications: IsicPublications,
			faq: FAQ,
			contactInfo: ContactInfo
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
		let user = auth.getUserInfo();
		if (user) {
			auth.refreshUserInfo();
		}
		const root = app.getRoot();
		root.scrollTo(0, 0);
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
