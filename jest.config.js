const config = {
    rootDir: "src",
    testRegex: "(\\.tests\\.(ts|tsx))$",
    moduleFileExtensions: ["ts", "tsx", "js"],
    testEnvironment: "jsdom",
    modulePaths: ["<rootDir>"],
    moduleNameMapper: {
        "\\.(scss)$": "<rootDir>/__mocks__/styleMock.js",
        "@lib/(.*)": "<rootDir>/lib/$1",
        "@domain/(.*)": "<rootDir>/domain/$1",
        "@app/(.*)": "<rootDir>/app/$1",
        "@utils/(.*)": "<rootDir>/utils/$1"
    },
    transform: {
        "\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.testing.config.json" }]
    },
    setupFiles: [
        "<rootDir>/__mocks__/localStorageMock.js"
    ]
};

module.exports = config;
