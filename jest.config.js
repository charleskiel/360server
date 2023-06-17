module.exports = {
	collectCoverage: true,
	coverageDirectory: 'coverage',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
