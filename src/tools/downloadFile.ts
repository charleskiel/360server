import {request } from '../modules';
const fs = require('fs');


export class DownloadFile {

	public static from(url: string, filename: string) {
		console.log(filename)
		//let file = fs.createWriteStream(filename + 'jpg');
		new Promise((resolve, reject) => {
			request({
				/* Here you should specify the exact link to the file you are trying to download */
				uri: url,
				headers: {
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
					'Accept-Encoding': 'gzip, deflate, br',
					'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
					'Cache-Control': 'max-age=0',
					'Connection': 'keep-alive',
					'Upgrade-Insecure-Requests': '1',
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
				},
				gzip: true
			})
			.pipe(fs.createWriteStream('./' + filename ))
			.on('finish', () => {
				console.log(`The file is finished downloading.`);
				resolve("OK");
			})
			.on('error', (error: any) => {
				reject(error);
			});
		})
		.catch(error => {
			console.log(`Something happened: ${error}`);
		});
	}
}
