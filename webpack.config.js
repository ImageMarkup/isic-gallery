let path = require("path");
let webpack = require("webpack");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let CopyWebpackPlugin = require("copy-webpack-plugin");
let pack = require("./package.json");
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let UglifyJsPlugin = require("uglifyjs-webpack-plugin");
let appconfig = require("./appconfig.json");

module.exports = function (env) {
	let production = !!(env && env.production === "true");
	let babelSettings = {
		extends: path.join(__dirname, "/.babelrc")
	};

	let config = {
		entry: ["babel-polyfill", "./sources/app.js"],
		output: {
			path: path.join(__dirname, "codebase"),
			publicPath: "/",
			filename: "app.js"
		},
		mode: "development",
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.js$/,
					loader: `babel-loader?${JSON.stringify(babelSettings)}`
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
				{test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[path][name].[ext]"}
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
			new HtmlWebpackPlugin({
				template: "index.html"
			}),
			new CopyWebpackPlugin([
				{from: path.join(__dirname, "sources/libs"), to: "sources/libs/"},
				{from: path.join(__dirname, "sources/images"), to: "sources/images"},
				{from: path.join(__dirname, "sources/filesForDownload"), to: "sources/filesForDownload"}
			]),

			new webpack.EnvironmentPlugin({
				ISIC_SITE_URL: "https://isic-archive.com/",
				ISIC_BASE_API_URL: "https://sandbox.isic-archive.com/api/v1/",
			})

		],
		devServer: {
			host: appconfig.devHost,
			port: appconfig.devPort,
			contentBase: path.join(__dirname, "codebase"),
			inline: true
		}
	};

	if (production) {
		config.plugins.push(
			new UglifyJsPlugin({
				test: /\.js($|\?)/i
			})
		);
	}

	return config;
};
