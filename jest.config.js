module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  roots: ['<rootDir>/chess-engine'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
