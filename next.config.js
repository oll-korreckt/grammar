/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const withPreact = require("next-plugin-preact");

const nextConfig = withPreact({
    reactStrictMode: true,
    sassOptions: {
        includePaths: [
            path.resolve(__dirname, "src/app")
        ]
    }
});

module.exports = nextConfig;