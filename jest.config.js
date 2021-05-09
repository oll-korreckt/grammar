const config = {
    rootDir: "src",
    testRegex: "(\\.tests\\.(ts|tsx))$",
    moduleFileExtensions: ["ts", "tsx", "js"],
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(scss)$": "<rootDir>/__mocks__/styleMock.js"
    }
};

module.exports = config;
