import {
	MusicVideo, request, Mysql, moment, DownloadFile, User, Channel
} from '../modules';
import { Auth } from '../auth/auth.js';

export class Nginx {
	
	public static defaultResponse = { defaultResponse: "OK" };

	public static call(post: any) {

			post = post.body;

			if (post.method === 'POST') {
				switch (post.path) {
					case "/api/v1/roku/config":
						console.log(`\u001b[31m\x1b[5m\x1b[7mSending launch config to ${post.device.esn}\u001b[0m`);
						break;
					default:
						console.log(`\u001b[31m \x1b[5m \x1b[7m Sending defult response to ${post.esn}\u001b[0m`);
						break;
				}
			}

			if (post.method === 'GET') {
				switch (post.path) {
					case "/api/v1/roku/serverStatus":
						console.log(`Sending server status to ${post.device.esn}`);
						break;
					default:
						break;
				}
			}
	}

	public static streampost(post: any) {
		const statussql = ``
		// Mysql.query(statussql);
	}


}
