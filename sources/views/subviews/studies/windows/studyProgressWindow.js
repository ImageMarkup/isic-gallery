import windowWithHeader from "../../../components/windowWithHeader";

let chartId;

function getChartConfig() {
	chartId = `chart-${webix.uid()}`;
	return {
		view: "chart",
		id: chartId,
		borderless: true,
		type: "stackedBarH",
		yAxis: {
			template: "",
			lines: false,
			color: "#fff"
		},
		xAxis: {
			color: "#fff",
			lines: false,
			template: ""
		},
		series: [
			{
				value: "#completed#",
				label: "#completed#%",
				color: "#5FAB1F",
				tooltip: {
					template: "Completed #completed#%"
				}
			},
			{
				value: "#active#",
				label: "#active#%",
				color: "#C8C8C8",
				tooltip: {
					template: "Remain #active#%"
				}
			}
		]
	};
}

const windowBody = {
	css: "metadata-window-body",
	rows: [
		{
			cols: [
				{width: 20},
				getChartConfig(),
				{width: 20}
			]
		},
		{height: 20}
	]
};

function getConfig(id) {
	return windowWithHeader.getConfig(id, windowBody, "Progress");
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getChartIdFromConfig() {
	return chartId;
}

export default {
	getConfig,
	getIdFromConfig,
	getChartIdFromConfig
};
