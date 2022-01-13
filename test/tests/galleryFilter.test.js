import filters from "../../sources/services/gallery/filter";
import state from "../../sources/models/state";

describe("Gallery filters", () => {
	const emptyValue = null;
	const emptyKeyValue = {
		key: null
	}
	const validValue = "Valid value";
	it("Get option names", () => {
		expect(filters.prepareOptionName(emptyValue, "emptyValue")).toBe("unknown");		
		expect(filters.prepareOptionName(emptyKeyValue, "emptyLabelValue")).toBe("unknown");
		expect(filters.prepareOptionName(validValue, "validValue")).toBe(validValue);

		expect(filters.prepareOptionName(validValue, "meta.datasetId")).toBeFalsy();

		const mappedValidValue = "Mapped valid value";
		state.datasetMapForFilters[validValue] = mappedValidValue;
		expect(filters.prepareOptionName(validValue, "meta.datasetId")).toBe(mappedValidValue);	
	});

	it("Get option ids", () => {
		expect(filters.getOptionId("filterId", "value")).toBe("filterId|value");
		expect(filters.getOptionId(null, "value")).toBe("|value");
		expect(filters.getOptionId("filterId", null)).toBe("filterId|");
		expect(filters.getOptionId(null, null)).toBe("|");
	});
});
