const config = {
    rootDir: "src",
    testRegex: "(\\.tests\\.(ts|tsx))$",
    moduleFileExtensions: ["ts", "tsx", "js"],
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(scss)$": "<rootDir>/__mocks__/styleMock.js",
        "@lib/(.*)": "<rootDir>/lib/$1",
        "@domain/(.*)": "<rootDir>/domain/$1",
        "@app/(.*)": "<rootDir>/app/$1"
    }
};

module.exports = config;
