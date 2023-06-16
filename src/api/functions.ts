import { request} from '../modules'
import { Auth } from '../auth/auth.js';

export class API {
	public static youtubeVideoLookup(id: any) {
		return new Promise((result, fail) => {

			const options = {
				headers: "Content-type: text/json;",
				url: `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet%2CcontentDetails%2Cstatistics%20&key=${Auth.youtube.key}`,
				method: 'GET',
			};

			console.log(options.url)
			request(options, function (error: any, response: any, body: any) {
				if (response && response.statusCode === 200) {
					if (body != "") {
						//module.exports.event.emit("getData", [type, {}, body.length]);
						let j = JSON.parse(body).items[0];
						console.log(body)
						//DownloadFile.from(j.snippet.thumbnails.maxres, j.id + ".jpg")
						result(j);
					} else {
						//Mysql.log('tda', 'getData', 'warning', `${response.statuscode}: ${response.statusMessage}`);
						fail(response.statusMessage);
					}
				}
			})
		})
	}

	public static findRecordLabel(search: any) {
		return new Promise((result, fail) => {
			const options = {
				headers: "Content-type: text/json;",
				url: `https://itunes.apple.com/search?term=${search}}`,
				method: 'GET',
			};

			request(options, function (error: any, response: any, body: any) {
				console.log(options.url, response.statusCode);

				if (response && response.statusCode == 200) {
					if (body != "") {
						let j = JSON.parse(body);
						let albumId = ""
						console.log(j);
						for (let index = 0; index < j["results"].length; index++) {
							if (j["results"][index]["kind"] != "music-video" && (!j["results"][index]["collectionName"].includes(" - Single") || j["results"][index]["trackCount"] > 1 )) {
								albumId = j["results"][index]["collectionId"]
								index = j["results"].length
							}
						};

						const options1 = {
							headers: "Content-type: text/json;",
							url: `https://itunes.apple.com/lookup?id=${albumId}&entity=album`,
							method: 'GET',
						};

						request(options1, function (error: any, response1: any, body1: any) {
							console.log(options1.url, response1.statusCode);

							if (response1 && response1.statusCode === 200) {
								if (body1 != "") {
									let jj = JSON.parse(body1);
									j["albumSearchResults"] = jj
									//DownloadFile.from(j["results"][0]["artworkUrl100"], j["results"][0]["collectionId"] + ".jpg" )
									console.log(j);
									result(j);
								} else {
									//Mysql.log('tda', 'getData', 'warning', `${response.statuscode}: ${response.statusMessage}`);
									fail(response1.statusMessage);
								}
							}
						})


					} else {
						fail(response.statusMessage);
					}
				}
			});


		})
	}
	
}
