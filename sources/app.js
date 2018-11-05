import "./styles/app.less";
import "./utils/polifils";
import {JetApp} from "webix-jet";
import state from "./models/state";
import constants from "./constants";
import auth from "./services/auth";
import MainView from "./views/subviews/main";
import WideContentTop from "./views/wideContentTop";
import TightContentTop from "./views/tightContentTop";
import TightDarkContentTop from "./views/tightDarkContentTop";
import TopWithHeader from "./views/topWithHeader";
import OnlyHeaderTop from "./views/onlyHeaderTop";
import AboutView from "./views/subviews/about/about";
import StudiesView from "./views/subviews/studies/studies";
import DatasetView from "./views/subviews/dataset/dataset";
import FeaturesetView from "./views/subviews/featureset/featureset";
import GalleryView from "./views/subviews/gallery/gallery";
import TermOfUse from "./views/subviews/termOfUse/termOfUse";
import MedicalDisclaimer from "./views/subviews/medicalDisclaimer/medicalDisclaimer";
import PrivacyPolicy from "./views/subviews/privacyPolicy/privacyPolicy";
import Dashboard from "./views/subviews/dashboard/dashboard";
import UserAccount from "./views/subviews/userAccount/userAccount";
import InviteUser from "./views/subviews/inviteUser/inviteUser";
import ManagementUI from "./views/subviews/managementUI/managementTop";
import ManagementUIAbout from "./views/subviews/managementUI/subviews/aboutManagement";
import ManagementCollections from "./views/subviews/managementUI/subviews/managementCollections";
import ManagementGroups from "./views/subviews/managementUI/subviews/managementGroups";
import ManagementUsers from "./views/subviews/managementUI/subviews/managementUsers";
import CreateDataset from "./views/subviews/createDataset/createDataset";
import ContactInfo from "./views/subviews/about/subviews/contactInfo";
import History from "./views/subviews/about/subviews/history";
import IsicArchive from "./views/subviews/about/subviews/isicArchive";
import IsicStandards from "./views/subviews/about/subviews/isicStandards";
import Literature from "./views/subviews/about/subviews/literature";
import WorkingGroups from "./views/subviews/about/subviews/workingGroups";
import WizzardUploader from "./views/subviews/wizzardUploader/wizzardUploader";
import BatchUpload from "./views/subviews/batchUpload/batchUpload";
import ChallengesVIew from "./views/subviews/challenges/challenges";
import ApplyMetadata from "./views/subviews/applyMetadata/applyMetadata";
import RegisterMetadata from "./views/subviews/registerMetadata/registerMetadata";
import CreateStudy from "./views/subviews/createStudy/createStudyPage";
import ErrorPage from "./views/subviews/errorPage/errorPage";
import APIDocumentation from "./views/subviews/apiDocumentation/apiDocumentation";

webix.ready(() => {
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
			studies: StudiesView,
			dataset: DatasetView,
			featureset: FeaturesetView,
			gallery: GalleryView,
			termsOfUse: TermOfUse,
			medicalDisclaimer: MedicalDisclaimer,
			privacyPolicy: PrivacyPolicy,
			[constants.NAME_VIEW_DASHBOARD]: Dashboard,
			userAccount: UserAccount,
			managementUI: ManagementUI,
			aboutManagement: ManagementUIAbout,
			managementCollections: ManagementCollections,
			managementGroups: ManagementGroups,
			managementUsers: ManagementUsers,
			inviteUser: InviteUser,
			createDataset: CreateDataset,
			contactInfo: ContactInfo,
			isicHistory: History,
			isicArchive: IsicArchive,
			isicStandards: IsicStandards,
			literature: Literature,
			workingGroups: WorkingGroups,
			wizardUploader: WizzardUploader,
			batchUploader: BatchUpload,
			challenges: ChallengesVIew,
			applyMetadata: ApplyMetadata,
			registerMetadata: RegisterMetadata,
			createStudy: CreateStudy,
			apiDocumentation: APIDocumentation
		}
	});

	app.render();

	app.attachEvent("app:error:resolve", (error, url) => {
		const regex = /\/(?!.*\/).*/;
		const startUrl = app.$router.config.start;
		let replacedUrl = startUrl.replace(regex, "/error");
		webix.delay(() => app.show(replacedUrl));
	});

	app.attachEvent("app:route", (url) => {
		let user = auth.getUserInfo();
		if (user) {
			auth.refreshUserInfo();
		}
	});

	state.app = app;
});
