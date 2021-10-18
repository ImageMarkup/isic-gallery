jest.mock("../../sources/services/auth");
import constants from "../../sources/constants";
import authService from "../../sources/services/auth";

const permittedUser = {
    "_accessLevel": 2,
    "_id": "5d9c8feb64c35ff06848fbf2",
    "_modelType": "user",
    "admin": false,
    "created": "2019-10-08T13:32:27.279000+00:00",
    "email": "sbatura@xbsoftware.by",
    "emailVerified": true,
    "firstName": "Sergey",
    "gravatar_baseUrl": "https://www.gravatar.com/avatar/98ed5afc018d9a202d785e7943d47b0e?d=identicon",
    "groupInvites": [],
    "groups": [
        "5428cb05bae478621f6159cf",
        "575183509fc3c111cbe228cd",
        "576ad77f9fc3c178e90c9442",
        "57b49b6b9fc3c17b36b90919"
    ],
    "lastName": "Batura",
    "login": "sbatura",
    "otp": false,
    "permissions": {
        "acceptTerms": true,
        "adminStudy": true,
        "createDataset": true,
        "reviewDataset": true,
        "segmentationSkill": "expert"
    },
    "public": false,
    "size": 0,
    "status": "enabled"
};

const newUser = {
    "_accessLevel": 2,
    "_id": "5fc8cc59aa80280377b20977",
    "_modelType": "user",
    "admin": false,
    "created": "2020-12-03T11:30:33.437000+00:00",
    "email": "baturik58890@gmail.com",
    "emailVerified": false,
    "firstName": "XBS",
    "gravatar_baseUrl": "https://www.gravatar.com/avatar/8044602f9d6b96d7d11828ed74cf7959?d=identicon",
    "groupInvites": [],
    "groups": [],
    "lastName": "Test",
    "login": "xbstest1",
    "otp": false,
    "permissions": {
        "acceptTerms": false,
        "adminStudy": false,
        "createDataset": false,
        "reviewDataset": false,
        "segmentationSkill": null
    },
    "public": false,
    "size": 0,
    "status": "enabled"
};

webix.storage.local.get = jest.fn();
webix.storage.local.get.mockReturnValue(permittedUser);

describe("User permissions test", () => {
	it("Can create dataset", () => {
		expect(authService.canCreateDataset()).toBeTruthy();

		webix.storage.local.get.mockReturnValueOnce(newUser);
		expect(authService.canCreateDataset()).toBeFalsy();

		webix.storage.local.get.mockReturnValueOnce(null);
		expect(authService.canCreateDataset()).toBeFalsy();
	});

	it("Has segmentation skills", () => {
		expect(authService.hasSegmentationSkill()).toBeTruthy();

		webix.storage.local.get.mockReturnValueOnce(newUser);
		expect(authService.hasSegmentationSkill()).toBeFalsy();

		webix.storage.local.get.mockReturnValueOnce(null);
		expect(authService.hasSegmentationSkill()).toBeFalsy();
	});

	it("Can review dataset", () => {
		expect(authService.canReviewDataset()).toBeTruthy();

		webix.storage.local.get.mockReturnValueOnce(newUser);
		expect(authService.canReviewDataset()).toBeFalsy();

		webix.storage.local.get.mockReturnValueOnce(null);
		expect(authService.canReviewDataset()).toBeFalsy();
	});

	it("Is study admin", () => {
		expect(authService.isStudyAdmin()).toBeTruthy();

		webix.storage.local.get.mockReturnValueOnce(newUser);
		expect(authService.isStudyAdmin()).toBeFalsy();

		webix.storage.local.get.mockReturnValueOnce(null);
		expect(authService.isStudyAdmin()).toBeFalsy();
	});

	it("Is accepted terms of use", () => {
		expect(authService.isTermsOfUseAccepted()).toBeTruthy();

		webix.storage.local.get.mockReturnValueOnce(newUser);
		expect(authService.isTermsOfUseAccepted()).toBeFalsy();

		webix.storage.local.get.mockReturnValueOnce(null);
		webix.storage.local.get.mockReturnValueOnce(false);
		expect(authService.isTermsOfUseAccepted()).toBeFalsy();
		expect(webix.storage.local.get).toBeCalledWith(constants.KEY_ACCEPT_TERMS);

		webix.storage.local.get.mockReturnValueOnce(null);
		webix.storage.local.get.mockReturnValueOnce(true);
		expect(authService.isTermsOfUseAccepted()).toBeTruthy();
		expect(webix.storage.local.get).toBeCalledWith(constants.KEY_ACCEPT_TERMS);
	});
});

describe("User info checks", () => {
	it("Is user info changed", () => {
		expect(authService.isUserInfoChanged(newUser)).toBeFalsy();
		expect(authService.isUserInfoChanged(permittedUser)).toBeFalsy();
		expect(authService.isUserInfoChanged({...permittedUser, firstName: "John"})).toBeTruthy();
		expect(authService.isUserInfoChanged({...newUser, _id: permittedUser._id})).toBeTruthy();		
	});
});
