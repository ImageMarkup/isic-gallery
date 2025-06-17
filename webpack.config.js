const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const pack = require("./package.json");
const TerserPlugin = require("terser-webpack-plugin");
const appconfig = require("./appconfig.json");
const Dotenv = require("dotenv-webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
	const production = !!(env && env.production === "true");
	const babelSettings = {
		extends: path.join(__dirname, "/.babelrc")
	};

	const config = {
		entry: "./sources/app.js",
		output: {
			path: path.join(__dirname, "codebase"),
			publicPath: production ? "./" : "/",
			filename: "app.js",
			assetModuleFilename: "[path][name].[ext]"
		},
		mode: "development",
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.js$/,
					loader: "babel-loader",
					options: {
						...babelSettings
					}
				},
				{
					test: /\.(svg|png|jpg|gif)$/,
					type: 'asset/resource'
				},
				{
					test: /\.(less|css)$/,
					use: [
						{ loader: MiniCssExtractPlugin.loader},
						{ loader: "css-loader" },
						{ loader: "less-loader" }
					]
				},
				{
					test: /\.html$/,
					exclude: [
						/node_modules/,
						path.resolve(__dirname, "index.html")
					],
					use: {loader: "html-loader"}
				},
				{
					test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
					type: "asset/inline"
				},
				{
					test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
					type: "asset/inline"
				},
				{
					test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
					type: 'asset/resource'
				},
				{
					test: /\.md$/i,
					type: "asset/source"
				}
			]
		},
		resolve: {
			extensions: [".js"],
			modules: ["./sources", "node_modules"],
			alias: {
				"jet-views": path.resolve(__dirname, "sources/views"),
				"jet-locales": path.resolve(__dirname, "sources/locales"),
				"app-templates": path.resolve(__dirname, "sources/views/templates"),
				"app-services": path.resolve(__dirname, "sources/services"),
				"app-components": path.resolve(__dirname, "sources/views/components"),
				"app-models": path.resolve(__dirname, "sources/models")
			},
			fallback: {
				"util": require.resolve("util/"),
			}
		},
		performance: {
			maxAssetSize: 100000000,
			maxEntrypointSize: 400000000
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: "app.css"
			}),
			new webpack.DefinePlugin({
				VERSION: `"${pack.version}"`,
				APPNAME: `"${pack.name}"`,
				PRODUCTION: production
			}),
			new HtmlWebpackPlugin({template: "index.html"}),
			new CopyWebpackPlugin({
				patterns: [
					{from: path.join(__dirname, "sources/images"), to: "sources/images"},
					{from: path.join(__dirname, "sources/filesForDownload"), to: "sources/filesForDownload"},
					{from: path.join(__dirname, "node_modules/webix"), to: "sources/libs/webix"},
					{from: "./error.html", to: "./"}
				]
			}),
			new Dotenv({
				path: path.resolve(__dirname, "./.env"), // Path to .env file
				// Load all the predefined 'process.env' variables
				// which will trump anything local per dotenv specs.
				systemvars: true
			})
		],
		devServer: {
			host: appconfig.devHost,
			port: appconfig.devPort,
			open: true,
			static: [
				{
					directory: path.join(__dirname, "codebase")
				},
				{
					directory: path.join(__dirname, "node_modules")
				}
			],
			server: {
				type: "https",
			},
		}
	};

	if (production) {
		config.plugins.push(
			new TerserPlugin({
				test: /\.js($|\?)/i
			})
		);
	}

	return config;
};
