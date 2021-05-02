const config = {
    rootDir: "src",
    testRegex: "__tests__.*(_tests\\.(ts|tsx))$",
    moduleFileExtensions: ["ts", "tsx", "js"],
    testEnvironment: "node",
    transform: {
        "(\\.(ts|tsx))$": "@sucrase/jest-plugin"
    }
};

module.exports = config;