/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");

module.exports = {
    entry: "./src/app/pages/index.tsx",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: [/node_modules/, /__tests__/],
                use: {
                    loader: "@sucrase/webpack-loader",
                    options: {
                        transforms: ["jsx", "typescript", "imports"]
                    }
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".scss"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    devServer: {
        contentBase: path.join(__dirname, "public"),
        compress: true,
        hot: true,
        port: 9000,
        clientLogLevel: "none"
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new ErrorOverlayPlugin()
    ]
};
