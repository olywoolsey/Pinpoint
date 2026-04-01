module.exports = {
    preset: 'ts-jest',
    transform: {
        "^.+\\.(ts|tsx)?$": "ts-jest",
        "^.+\\.(js|jsx)$": "babel-jest"
    },
    silent: true,
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    reporters: [
        "default",
        ["jest-junit", {
            outputDirectory: ".",
            outputName: "junit.xml",
            includeConsoleOutput: true
        }]
    ],
    setupFilesAfterEnv: ['./jest.setup.js']
}