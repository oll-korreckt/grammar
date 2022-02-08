// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const nextConfig = {
    reactStrictMode: true,
    sassOptions: {
        includePaths: [
            path.resolve(__dirname, "src/app")
        ]
    }
};

module.exports = nextConfig;