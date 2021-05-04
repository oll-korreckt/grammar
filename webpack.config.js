/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./src/app/index.tsx",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: [/node_modules/, /__tests__/],
                use: {
                    loader: "@sucrase/webpack-loader",
                    options: {
                        transforms: ["jsx"]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
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
    plugins: [new webpack.HotModuleReplacementPlugin()]
};
