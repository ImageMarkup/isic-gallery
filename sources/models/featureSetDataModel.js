const featureSetData = [
    {
        parent: "Lines", data: [
            "Angulated lines / Polygons / Zig-zag pattern",
            "Atypical pigment network / Reticulation",
            "Branched streaks",
            "Broadened pigment network / Reticulation",
            "Cerebriform pattern",
            "Crypts",
            "Delicate pigment network / Reticulation",
            "Fibrillar pattern",
            "Fingerprint pattern",
            "Leaf like areas",
            "Negative pigment network",
            "Parallel furrows pattern (volar lesions)",
            "Parallel lines (volar lesions)",
            "Parallel ridge pattern (volar lesions)",
            "Pseudopods",
            "Radial streaming",
            "Rhomboids (facial skin)",
            "Shiny white streaks",
            "Spoke wheel areas",
            "Streaks",
            "Starburst pattern",
            "Typical pigment network / Reticulation",
            "NOS"
        ]
    },
    {
        parent: "Globules / Clods", data: [
            "Blue",
            "Blue-gray ovoid nests",
            "Cobblestone pattern",
            "Comedo-like openings",
            "Concentric",
            "Irregular",
            "Regular",
            "Leaflike area",
            "Spoke wheel areas",
            "Milia-like cysts",
            "Milky red",
            "Lacunae : Red",
            "Lacunae : Black",
            "Lacunae : Blue",
            "Lacunae : Red-purple",
            "Lacunae : NOS",
            "Rim of brown globules",
            "Shiny white blotches and strands",
            "Variant of spoke wheel area",
            "White",
            "NOS"
        ]
    },
    {
        parent: "Dots", data: [
            "Annular-granular pattern",
            "Black",
            "Blue-gray",
            "Brown",
            "Granularity",
            "Irregular",
            "Linear",
            "Milia-like cysts",
            "Peppering",
            "Regular",
            "Rosettes",
            "Targetoid",
            "Yellow",
            "NOS"
        ]
    },
    {
        parent: "Circles & Semicircles", data: [
            "Asymmetric follicular openings",
            "Brown",
            "Circle within a circle",
            "Fish scale (mucosal lesions)",
            "Gray",
            "White",
            "NOS"
        ]
    },
    {
        parent: "Structureless", data: [
            "Blotch irregular",
            "Blotch regular",
            "Blue-whitish veil",
            "Central white patch",
            "Homogeneous pattern : Blue",
            "Homogeneous pattern : Brown",
            "Homogeneous pattern : Pink",
            "Homogeneous pattern : NOS",
            "Homogeneous pattern : NOS",
            "Pseudonetwork",
            "Rainbow pattern",
            "Scar-like depigmentation",
            "Strawberry pattern",
            "Structureless brown (tan)",
            "NOS"
        ]
    },
    {
        parent: "Vessels", data: [
            "Arborizing",
            "Comma",
            "Corkscrew",
            "Crown",
            "Dotted",
            "Glomerular",
            "Hairpin",
            "Linear irregular",
            "Monomorphous",
            "Polymorphous",
            "String of pearls",
            "Targetoid",
            "NOS"
        ]
    },
    {
        parent: "Network", data: [
            "Atypical pigment network / Reticulation",
            "Broadened pigment network / Reticulation",
            "Delicate Pigment Network / Reticulation",
            "Negative pigment network",
            "Typical pigment network / Reticulation",
            "NOS"
        ]
    },
    {
        parent: "Pattern", data: [
            "Cerebriform",
            "Fibrilar",
            "Fingerprint",
            "Homogeneous : Blue",
            "Homogeneous : Brown",
            "Homogeneous : Pink",
            "Homogeneous : NOS",
            "Honeycomb",
            "Latticelike",
            "Parallel furrow",
            "Parallel ridge",
            "Rainbow",
            "Starburst",
            "Strawberry",
            "NOS"
        ]
    },
    {
        parent: "Regression structures", data: [
            "Peppering / Granularity",
            "Scarlike depigmentation",
            "NOS"
        ]
    },
    {
        parent: "Shiny white structures", data: [
            "Rosettes",
            "Shiny white blotches and strands",
            "Shiny white streaks",
            "NOS"
        ]
    },
    {
        parent: "Facial Skin", data: [
            "Annular-granular pattern",
            "Asymmetric follicular openings",
            "Brown circles",
            "Circle within a circle",
            "Pseudonetwork",
            "Rhomboids / Zig-zag pattern"
        ]
    },
    {
        parent: "Volar lesions", data: [
            "Parallel furrow pattern",
            "Fibrilar pattern",
            "Latticelike pattern",
            "Parallel lines",
            "Parallel ridge pattern"
        ]
    },
    {
        parent: "Nail lesions", data: [
            "Blood spots",
            "Granular inclusions",
            "Hutchinson sign",
            "Irregular lines",
            "Pseudo-Hutchinson sign",
            "Splinter hemorrhage",
            "Regular lines"
        ]
    },
    {
        parent: "Miscellaneous", data: [
            "Angulated lines / Polygons",
            "Annular-granular pattern",
            "Asymmetric pigmented follicular openings",
            "Blood spots",
            "Blotch irregular",
            "Blotch regular",
            "Blue-whitish veil",
            "Circle within a circle",
            "Comedo-like openings",
            "Crypts",
            "Disruption of parallelism",
            "Fissures",
            "Granularity or granules",
            "Hutchinson sign",
            "Lacunae : Red",
            "Lacunae : Black",
            "Lacunae : Blue",
            "Lacunae : Red-purple",
            "Lacunae : NOS",
            "Leaflike area",
            "Milia-like cysts, cloudy or starry",
            "Moth-eaten border",
            "Pseudo-Hutchinson sign",
            "Pseudonetwork",
            "Pseudopods",
            "Radial streaming",
            "Regularly bended ribbon sign",
            "Rhomboids / Zig-zag pattern",
            "Ridges",
            "Scale",
            "Setting-sun pattern",
            "Spoke wheel area",
            "Streaks",
            "String of pearls",
            "Structureless, brown (tan)",
            "Twisted red loops",
            "Ulceration / Erosion"
        ]
    }
];

const featureSetSynonymsArray = [
	[
		"Lines : Angulated lines / Polygons / Zig-zag pattern",
		"Miscellaneous : Angulated lines / Polygons"
	],
	[
		"Lines : Atypical pigment network / Reticulation",
		"Network : Atypical pigment network / Reticulation"
	],
	[
		"Lines : Broadened pigment network / Reticulation",
		"Network : Broadened pigment network / Reticulation"
	],
	[
		"Lines : Crypts",
		"Miscellaneous : Crypts"
	],
	[
		"Lines : Delicate pigment network / Reticulation",
		"Network : Delicate Pigment Network / Reticulation"
	],
	[
		"Lines : Negative pigment network",
		"Network : Negative pigment network"
	],
	[
		"Lines : Pseudopods",
		"Miscellaneous : Pseudopods"
	],
	[
		"Lines : Radial streaming",
		"Miscellaneous : Radial streaming"
	],
	[
		"Lines : Spoke wheel areas",
		"Globules / Clods : Spoke wheel areas",
		"Miscellaneous : Spoke wheel area"
	],
	[
		"Lines : Streaks",
		"Miscellaneous : Streaks"
	],
	[
		"Lines : Starburst pattern",
		"Pattern : Starburst"
	],
	[
		"Lines : Typical pigment network / Reticulation",
		"Network : Typical pigment network / Reticulation"
	],
	[
		"Globules / Clods : Comedo-like openings",
		"Miscellaneous : Comedo-like openings"
	],
	[
		"Lines : Leaf like areas",
		"Globules / Clods : Leaflike area",
		"Miscellaneous : Leaflike area"
	],
	[
		"Globules / Clods : Milia-like cysts",
		"Dots : Milia-like cysts",
		"Miscellaneous : Milia-like cysts, cloudy or starry"
	],
	[
		"Globules / Clods : Shiny white blotches and strands",
		"Shiny white structures : Shiny white blotches and strands"
	],
	[
		"Dots : Annular-granular pattern",
		"Facial Skin : Annular-granular pattern",
		"Miscellaneous : Annular-granular pattern"
	],
	[
		"Dots : Rosettes",
		"Shiny white structures : Rosettes"
	],
	[
		"Circles & Semicircles : Asymmetric follicular openings",
		"Facial Skin : Asymmetric follicular openings"
	],
	[
		"Circles & Semicircles : Circle within a circle",
		"Facial Skin : Circle within a circle",
		"Miscellaneous : Circle within a circle"
	],
	[
		"Structureless : Pseudonetwork",
		"Facial Skin : Pseudonetwork",
		"Miscellaneous : Pseudonetwork"
	],
	[
		"Nail lesions : Blood spots",
		"Miscellaneous : Blood spots"
	],
	[
		"Nail lesions : Hutchinson sign",
		"Miscellaneous : Hutchinson sign"
	],
	[
		"Nail lesions : Pseudo-Hutchinson sign",
		"Miscellaneous : Pseudo-Hutchinson sign"
	],
	[
		"Vessels : String of pearls",
		"Miscellaneous : String of pearls"
	],
	[
		"Structureless : Blotch irregular",
		"Miscellaneous : Blotch irregular"
	],
	[
		"Structureless : Blotch regular",
		"Miscellaneous : Blotch regular"
	],
	[
		"Structureless : Blue-whitish veil",
		"Miscellaneous : Blue-whitish veil"
	],
	[
		"Lines : Parallel furrows pattern (volar lesions)",
		"Pattern : Parallel furrow",
		"Volar lesions : Parallel furrow pattern"
	],
	[
		"Lines : Parallel lines (volar lesions)",
		"Pattern : Parallel ridge",
		"Volar lesions : Parallel lines"
	],
	[
		"Lines : Parallel ridge pattern (volar lesions)",
		"Volar lesions : Parallel ridge pattern",
	],
	[
		"Globules / Clods : Lacunae : Red",
		"Miscellaneous : Lacunae : Red"
	],
	[
		"Globules / Clods : Lacunae : Black",
		"Miscellaneous : Lacunae : Black"
	],
	[
		"Globules / Clods : Lacunae : Blue",
		"Miscellaneous : Lacunae : Blue"
	],
	[
		"Globules / Clods : Lacunae : Red-purple",
		"Miscellaneous : Lacunae : Red-purple"
	],
	[
		"Globules / Clods : Lacunae : NOS",
		"Miscellaneous : Lacunae : NOS"
	],
	[
		"Lines : Fibrillar pattern",
		"Pattern : Fibrilar",
		"Volar lesions : Fibrilar pattern"
	],
	[
		"Pattern : Latticelike",
		"Volar lesions : Latticelike pattern",
	],
	[
		"Structureless : Rainbow pattern",
		"Pattern : Rainbow"
	],
	[
		"Lines : Cerebriform pattern",
		"Pattern : Cerebriform"
	],
	[
		"Structureless : Strawberry pattern",
		"Pattern : Strawberry"
	],
	[
		"Structureless : Scar-like depigmentation",
		"Regression structures : Scarlike depigmentation"
	],
	[
		"Dots : Peppering",
		"Regression structures : Peppering / Granularity"
	],
	[
		"Lines : Shiny white streaks",
		"Shiny white structures : Shiny white streaks"
	],
	[
		"Structureless : Homogeneous pattern : Blue",
		"Pattern : Homogeneous : Blue"
	],
	[
		"Structureless : Homogeneous pattern : Brown",
		"Pattern : Homogeneous : Brown"
	],
	[
		"Structureless : Homogeneous pattern : Pink",
		"Pattern : Homogeneous : Pink"
	],
	[
		"Structureless : Homogeneous pattern : NOS",
		"Pattern : Homogeneous : NOS"
	],
	[
		"Circles & Semicircles : Brown",
		"Facial Skin : Brown circles",
	],
	[
		"Structureless : Structureless brown (tan)",
		"Miscellaneous : Structureless, brown (tan)"
	],
	[
		"Lines : Fingerprint pattern",
		"Pattern : Fingerprint"
	],
	[
		"Lines : Rhomboids (facial skin)",
		"Facial Skin : Rhomboids / Zig-zag pattern",
		"Miscellaneous : Rhomboids / Zig-zag pattern"
	]
];

function getFeatureSetData() {
    return featureSetData;
}

function getFeatureSetSynonymsArray() {
	return featureSetSynonymsArray;
}

export default {
    getFeatureSetData,
	getFeatureSetSynonymsArray
}