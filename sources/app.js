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
import CreateDataset from "./views/subviews/createDataset/createDataset";
import ContactInfo from "./views/subviews/about/subviews/contactInfo";
import History from "./views/subviews/about/subviews/history";
import IsicArchive from "./views/subviews/about/subviews/isicArchive";
import IsicStandards from "./views/subviews/about/subviews/isicStandards";
import Literature from "./views/subviews/about/subviews/literature";
import WorkingGroups from "./views/subviews/about/subviews/workingGroups";
import WizzardUploader from "./views/subviews/wizzardUploader/wizzardUploader";
import ChallengesVIew from "./views/subviews/challenges/challenges";
import ErrorPage from "./views/subviews/errorPage";

webix.ready(() => {
	const app = new JetApp({
		id: APPNAME,
		version: VERSION,
		start: constants.PATH_MAIN,
		views: {
			error: ErrorPage,
			main: MainView,
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
			inviteUser: InviteUser,
			createDataset: CreateDataset,
			contactInfo: ContactInfo,
			isicHistory: History,
			isicArchive: IsicArchive,
			isicStandards: IsicStandards,
			literature: Literature,
			workingGroups: WorkingGroups,
			wizzardUploader: WizzardUploader,
			challenges: ChallengesVIew
		}
	});

	app.render();

	app.attachEvent("app:error:resolve", (err, url) => {
		webix.delay(() => app.show("error"));
	});

	state.app = app;
});
