// @ts-nocheck
import * as path from "path";

import * as webpack from "webpack";

const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const cssnano = require("cssnano");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const browser = process.env.BROWSER || "chrome";

const webpackConfig: webpack.Configuration = {
  cache: false,
  entry: {
    service_worker: [
      path.join(__dirname, "src/background/regeneratorRuntime.js"),
      path.join(__dirname, "src/service_worker/index.ts"),
    ],
    "build/content-script": path.join(__dirname, "src/content_script/index.ts"),
    "build/options": path.join(__dirname, "src/options/index.tsx"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(scss)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: () => [autoprefixer(), cssnano()],
              },
            },
          },
          { loader: "sass-loader" },
        ],
      },
      {
        test: /\.js$/,
        include: /node_modules\/@faker-js\/faker/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.js$/,
        include: /node_modules\/@sentry/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        loader: "file-loader",
        exclude: [/\.(html?)$/, /\.(ts|tsx|js|jsx)$/, /\.css$/, /\.scss$/, /\.json$/],
        query: {
          name: "[hash].[ext]",
          outputPath: "media/",
          publicPath: "build/",
        },
      },
    ],
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
  },
  plugins: [
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: "public",
          from: "**/*",
          to: path.join(__dirname, "dist/"),
        },
        browser === "chrome"
          ? {
              context: "public",
              from: "manifest.chrome.json",
              to: path.join(__dirname, "dist/manifest.json"),
            }
          : null,
        browser === "firefox"
          ? {
              context: "public",
              from: "manifest.firefox.json",
              to: "manifest.json",
            }
          : null,
      ].filter((x) => x !== null),
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  stats: "minimal",
};

export default webpackConfig;
