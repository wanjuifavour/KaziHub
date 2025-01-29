module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(your-module-name|another-module)/)'
  ],
  globals: {
    "TextEncoder": TextEncoder,
    "TextDecoder": TextDecoder
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom','jest-fetch-mock/setupJest'],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/test/styleMock.js"
  }
};