const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/app.js",
    mode: argv.mode || "development",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js",
      clean: true, // Clean the output directory before build
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  quietDeps: true,
                  verbose: false,
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource", // Use asset modules for images
          generator: {
            filename: "assets/images/[name][ext][query]",
          },
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        title: "friend.ly",
        template: "src/assets/index.html",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
        chunkFilename: "[id].[contenthash].css",
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      historyApiFallback: {
        rewrites: [
          { from: /^\/u\/.*$/, to: "/index.html" },
          { from: /^\/explore$/, to: "/index.html" },
          { from: /^\/$/, to: "/index.html" },
        ],
      },
      port: 8080,
      open: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      proxy: [
        {
          context: ["/images"],
          target: "http://localhost:3000",
          changeOrigin: true,
        },
        {
          context: ["/assets"],
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      ],
    },
  };
};
