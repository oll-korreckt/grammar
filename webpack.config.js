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
                            modules: {
                                localIdentName: "[local]_[hash:base64:8]"
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                includePaths: [
                                    path.resolve(__dirname, "src/app")
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".scss"],
        alias: {
            "@app": path.resolve(__dirname, "src/app"),
            "@lib": path.resolve(__dirname, "src/lib"),
            "@domain": path.resolve(__dirname, "src/domain"),
            "@public": path.resolve(__dirname, "public")
        }
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
