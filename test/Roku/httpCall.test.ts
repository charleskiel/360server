import { RokuAPI } from '../../src/api/Roku/roku';
import { Sql } from '../../src/service/sql'
// import any other necessary dependenciesimport fs from 'fs';
import fs from 'fs';
const testDataFolderPath = './test/Roku/testData/';

RokuAPI.init(true)
describe('RokuAPI', () => {
	const files = fs.readdirSync(testDataFolderPath);
	Sql.init(false)
	files.forEach((filename) => {
		test(`should handle ${filename}`, async () => {
			const fileContents = fs.readFileSync(testDataFolderPath + filename, 'utf-8');
			const urlParams = JSON.parse(fileContents);
			const result = await RokuAPI.call(urlParams);
			expect(result).toBeDefined();
		},1200000);
	},);
	Sql.end()
});

