import {
	MusicVideo, request, Sql, moment, DownloadFile, User, Channel, Sockets, Content, Runlog, LogEntry, Library
} from '../../modules'
import { Auth } from '../../auth/auth.js';
import { result, toUpper } from 'lodash';
import {inherits, log} from 'util';
import { Socket } from 'socket.io';

export class RokuAPI {
	private static ROOT_URL = "https://360tv.net/api/v2"
	private static DEV_URL = "http://192.168.1.101:8080/api/v2"
	private static URL = RokuAPI.ROOT_URL
	public static config  =  {
		output : 0,
		mainHeader : `360 Music Television`,
		viewpostURL : `${URL}/roku/viewpost`,
		votepostURL : `${URL}/roku/votepost`,
		ratepostURL : `${URL}/roku/ratepost`,
		overlaysURL : `${URL}/roku/overlays`,
		viewerStatusURL : `${URL}/roku/viewerStatus`,
		serverStatusURL: `${URL}/roku/serverStatus`,
		nowPlayingURL : `${URL}/nowPlaying`,
		contentInfoURL : `${URL}/api/contentInfo`,
		modURL : `${URL}/roku/mod`,
		broadcastInfoURL : `${URL}/roku/broadcastInfo`,
		userInfoURL : `${URL}/roku/userInfo`,
		UrlBaseURL : `${URL}/roku/`,
		UrlGetRegResultURL : `${URL}/roku/getRegCode`,
		UrlGetRegCodeURL : `${URL}/roku/getRegResult`,
		UrlWebSiteURL : `${URL}/`,
		PositionNotificationPeriod : 10,
		NowPlayingScreenDisplayTime : 7,
		WeatherNotificationPeriod : 600,
		daysToRegister : 30,
		InterfaceUpdatePeriod : 1000,
		fonts : [
			{
				"name": "Courier New",
				"url": "https://360tv.net/roku/theme/fonts/COURBD.TTF",
				"path": "tmp:/fonts/COURBD.TTF",
				"sizes": [10, 12, 18, 22, 32, 48, 72, 120, 180, 240, 360]
			},{
				"name": "Haettenschweiler",
				"url": "https://360tv.net/roku/theme/fonts/HATTEN.TTF",
				"path": "tmp:/fonts/HATTEN.TTF",
				"sizes": [10, 12, 18, 22, 32, 48, 72, 120, 180, 240, 360]
			}],
		images: {
			stars : [
				"https://www.360tv.net/roku/theme/0star.png",
				"https://www.360tv.net/roku/theme/1star.png",
				"https://www.360tv.net/roku/theme/2star.png",
				"https://www.360tv.net/roku/theme/3star.png" ,
				"https://www.360tv.net/roku/theme/4star.png",
				"https://www.360tv.net/roku/theme/5star.png",
			],
			averageStars: [
				
				"https://www.360tv.net/roku/theme/0star-a.png",
				"https://www.360tv.net/roku/theme/10star-a.png",
				"https://www.360tv.net/roku/theme/20star-a.png",
				"https://www.360tv.net/roku/theme/30star-a.png",
				"https://www.360tv.net/roku/theme/40star-a.png",
				"https://www.360tv.net/roku/theme/50star-a.png",
				"https://www.360tv.net/roku/theme/60star-a.png",
				"https://www.360tv.net/roku/theme/70star-a.png",
				"https://www.360tv.net/roku/theme/80star-a.png",
				"https://www.360tv.net/roku/theme/90star-a.png",
				"https://www.360tv.net/roku/theme/100star-a.png",
			]
		},
		sounds :
		{
			"hello": "https://360tv.net/roku/theme/sounds/hello.wav",
			"notice": "https://360tv.net/roku/theme/sounds/coin.wav",
			"select": "https://360tv.net/demo/theme/sounds/select.wav",
			"dead": "https://360tv.net/roku/theme/sounds/dead.wav"
		}
	};

	public static defaultResponse = { defaultResponse: "OK" };

	public static call(urlParams: any): Promise<any> {
		
		return new Promise((ok, fail) => {
			const post = urlParams.body;


			if (urlParams.method === 'POST') {
				switch (urlParams._parsedUrl.pathname) {
					case "/api/v2/roku/config":
						console.log(`\u001b[31m\x1b[5m\x1b[7mSending launch config to ${post.device.esn}\u001b[0m`);
						ok(RokuAPI.config);
						break;
					case "/api/v2/roku/userInfo":
						console.log(`Sending user info to ${post.device.esn}`);
						User.login(post).then((result: any) => {
							ok(result);
						});
						break;
					case "/api/v2/roku/serverStatus":
						console.log(`Sending status to ${post.device.esn}`);
						this.serverStatus(urlParams).then((result: any) => {
							ok(result);
						});
						break;
					case "/api/v2/roku/overlays":
					case "/api/v2/roku/votepost":
					case "/api/v2/roku/viewpost":
						console.log(`\u001b[31m ${urlParams._parsedUrl.pathname}  =>>>> to backend\u001b[0m`);
						// this.passToBackend(urlParams).then((result: any) => {
						// 	ok(result);
						// });
						RokuAPI.viewpost(post)
							.then(resp => {
								ok(resp);
							})
							.catch(err => {
								console.log(`\u001b[31m \x1b[5m \x1b[7m${post.esn} ::: ${err}\u001b[0m`);
								fail(err);
							});
						break;
					default:
						console.log(`\u001b[31m \x1b[5m \x1b[7m Sending defult response to ${post.esn}\u001b[0m`);
						fail(RokuAPI.defaultResponse);
						break;
				}
			}

			if (urlParams.method === 'GET') {
				// console.log(urlParams._parsedUrl.query.split("=")[1])
				switch (urlParams._parsedUrl.pathname) {
					default:
						console.log("`\u001b[31m \x1b[5m \x1b[7m Default response =>>>>" + urlParams._parsedUrl.pathname + "\u001b[0m")
						ok(RokuAPI.defaultResponse);
						break;
				}
			}
		})


	}
	static viewpost(post: any) {
		console.log(post.method, post.url);

		return new Promise((result: any, fail: any) => {
			const options = {
				headers: "Content-type: text/json;",
				url: `http://192.168.1.101:8080${post._parsedUrl.pathname}`,
				method: 'POST',
				body: post
			};
			request(options, function (error: any, response: any, body: any) {
				console.log(error);
				if (response && response.statusCode === 200) {
					if (body != "") {
						console.log(body);
						result(JSON.parse(body));
					} else {
						fail({
							StatusMessage: response.statusMessage,
							StatusCode: response.statusCode,
						});
					}
				}
			});

		});
	}
	

	public static passToBackend(post: any): Promise<any> {
		console.log(post.method, post.url);

		return new Promise ((result: any, fail: any)=>{
			const options = {
				headers: "Content-type: text/json;",
				url: `http://192.168.1.101:8080${post._parsedUrl.pathname}`,
				method: 'POST',
				body: post
			};
			request(options, function (error: any, response: any, body: any) {
				console.log(error);
				if (response && response.statusCode === 200) {
					if (body != "") {
						console.log(body)
						result(JSON.parse(body));
					} else {
						fail({
							StatusMessage: response.statusMessage,
							StatusCode: response.statusCode,
						});
					}
				}
			})

		});
	}
	
	public static serverStatus(post: any): Promise<any> {
		console.log(post.method, post.url);
		return new Promise((result: any, fail: any) => {
		
			Sql.query(`SELECT * FROM [360_development].[360].[channels] order by channelNumber`)
			.then((data: any) => { result(data.recordsets[0]); })
				.catch((fail: any) => {
					fail({
						error: fail,
					});
				});
		})	
	};

	
}

interface Overlay {
	x : number
	y: number
	type : string
}

interface Label extends Overlay {
	text: string
	width: number
	height : number
}
interface Poster extends Overlay {
	uri: string
}
