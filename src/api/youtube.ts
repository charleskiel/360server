import { MusicVideo, request, Mysql, moment, DownloadFile} from '../modules'
import { Auth } from '../../auth/auth.js';

export class Youtube {
	public static videoLookup(id: any) {
		return new Promise((result, fail) => {

			const options = {
				headers: "Content-type: text/json;",
				url: `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet%2CcontentDetails%2Cstatistics%20&key=${Auth.youtube.key}`,
				method: 'GET',
			};
			request(options, function (error: any, response: any, body: any) {
				console.log(response, body)
				if (response && response.statusCode === 200) {
					if (body != "") {
						//module.exports.event.emit("getData", [type, {}, body.length]);
						let j = JSON.parse(body).items[0];
						//console.log(j.snippet.thumbnails.maxres.url, j.id + ".jpg")
						DownloadFile.from(j.snippet.thumbnails.maxres, j.id + ".jpg")
						result(j);
					} else {
						//Mysql.log('tda', 'getData', 'warning', `${response.statuscode}: ${response.statusMessage}`);
						fail(response.statusMessage);
					}
				}
			})
		})
	}
}