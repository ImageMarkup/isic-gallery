const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const pack = require("./package.json");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const appconfig = require("./appconfig.json");
const Dotenv = require("dotenv-webpack");

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
			filename: "app.js"
		},
		mode: "production",
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.js$/,
					loader: `babel-loader`,
					options: {
						...babelSettings
					}
				},
				{
					test: /\.(svg|png|jpg|gif)$/,
					use: {
						loader: "file-loader",
						options: {
							name: "[path][name].[ext]"
						}
					}
				},
				{
					test: /\.(less|css)$/,
					loader: ExtractTextPlugin.extract("css-loader!less-loader")
				},
				{
					test: /\.html$/,
					exclude: /node_modules/,
					use: {loader: "html-loader"}
				},
				{
					test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
					loader: "url-loader?limit=10000&mimetype=application/font-woff&name=[path][name].[ext]"
				},
				{
					test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
					loader: "url-loader?limit=10000&mimetype=application/octet-stream&name=[path][name].[ext]"
				},
				{test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[path][name].[ext]"},
				{
					test: /\.md$/i,
					use: 'raw-loader',
				}
			]
		},
		resolve: {
			extensions: [".js"],
			modules: ["./sources", "node_modules"],
			alias: {
				"jet-views": path.resolve(__dirname, "sources/views"),
				"jet-locales": path.resolve(__dirname, "sources/locales")
			}
		},
		performance: {
			maxAssetSize: 100000000,
			maxEntrypointSize: 400000000
		},
		plugins: [
			new ExtractTextPlugin("app.css"),
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
				systemvars: true // Load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
			})
		],
		devServer: {
			host: appconfig.devHost,
			port: appconfig.devPort,
			contentBase: [path.join(__dirname, "codebase"), path.join(__dirname, "node_modules")],
			inline: true
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
