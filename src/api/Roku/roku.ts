import {
	MusicVideo, request, Sql, moment, DownloadFile, User, Channel, Sockets, Content, Runlog, LogEntry, Library
} from '../../modules'
import { Auth } from '../../auth/auth.js';
import { result, toUpper } from 'lodash';
import {inherits, log} from 'util';
import { Socket } from 'socket.io';
import Poster from './SceneGraph/Components/Poster';

export class RokuAPI {
	private static channels: any = {};
	private static timer: NodeJS.Timeout;

	public static async init() {
		const channels : any  = await Sql.query('SELECT * FROM [360_development].[360].[channels]');

		channels.recordset.forEach((channel: any) => {
			RokuAPI.channels[channel.channelNumber] = channel;
		});

		// Set up timer to run query and update channel status every second
		setInterval(async () => {
			try {
				RokuAPI.updateChannelStatus();
			} catch (error) {
				console.error(error);
			}
		}, 1000);
	}
	private static ROOT_URL = "https://360tv.net/api/v2"
	private static DEV_URL = "http://192.168.1.101:8080/api/v2"
	private static URL = RokuAPI.ROOT_URL
	public static config  =  {
		output : 0,
		mainHeader : `360 Music Television`,
		viewpostURL : `${RokuAPI.URL}/roku/viewpost`,
		votepostURL : `${RokuAPI.URL}/roku/votepost`,
		ratepostURL : `${RokuAPI.URL}/roku/ratepost`,
		overlaysURL : `${RokuAPI.URL}/roku/overlays`,
		viewerStatusURL : `${RokuAPI.URL}/roku/viewerStatus`,
		serverStatusURL: `${RokuAPI.URL}/roku/serverStatus`,
		nowPlayingURL : `${RokuAPI.URL}/nowPlaying`,
		contentInfoURL : `${RokuAPI.URL}/api/contentInfo`,
		modURL : `${RokuAPI.URL}/roku/mod`,
		broadcastInfoURL : `${RokuAPI.URL}/roku/broadcastInfo`,
		userInfoURL : `${RokuAPI.URL}/roku/userInfo`,
		UrlBaseURL : `${RokuAPI.URL}/roku/`,
		UrlGetRegResultURL : `${RokuAPI.URL}/roku/getRegCode`,
		UrlGetRegCodeURL : `${RokuAPI.URL}/roku/getRegResult`,
		UrlWebSiteURL : `${RokuAPI.URL}/`,
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
			const postBody = urlParams.body;


			if (urlParams.method === 'POST') {
				switch (urlParams._parsedUrl.pathname) {
					case "/api/v2/roku/config":
						console.log(`\u001b[31m\x1b[5m\x1b[7mSending launch config to ${postBody.device.esn}\u001b[0m`);
						ok(RokuAPI.config);
						break;
					case "/api/v2/roku/userInfo":
						console.log(`Sending user info to ${postBody.device.esn}`);
						User.login(postBody).then((result: any) => {
							ok(result);
						});
						break;
					case "/api/v2/roku/overlays":

						RokuAPI.generateOverlays(postBody).then(resp => {
							// console.log(resp);
							ok(resp);
						})
						.catch(err => {
							console.log(`\u001b[31m \x1b[5m \x1b[7m${postBody.esn} ::: ${err}\u001b[0m`);
							fail(err);
						});
						break;
					case "/api/v2/roku/votepost":
					case "/api/v2/roku/viewpost":
						// console.log(`\u001b[31m ${urlParams._parsedUrl.pathname}  =>>>> to backend\u001b[0m`);
						// this.passToBackend(urlParams).then((result: any) => {
						// 	ok(result);
						// });
						RokuAPI.viewpost(postBody)
							.then(resp => {
								// console.log(resp)
								ok(resp);
							})
							.catch(err => {
								console.log(`\u001b[31m \x1b[5m \x1b[7m${postBody.esn} ::: ${err}\u001b[0m`);
								fail(err);
							});
						break;
					default:
						console.log(`\u001b[31m \x1b[5m \x1b[7m Sending defult response for ${urlParams._parsedUrl.pathname} "\u001b[0m to ${postBody.esn}\u001b[0m`);
						ok(RokuAPI.defaultResponse);
						break;
				}
			}

			if (urlParams.method === 'GET') {
				// console.log(urlParams._parsedUrl.query.split("=")[1])
				switch (urlParams._parsedUrl.pathname) {

					case "/api/v2/roku/serverStatus ":
						ok(RokuAPI.channels);
						break;
					default:
						console.log("`\u001b[31m \x1b[5m \x1b[7m Default response =>>>>" + urlParams._parsedUrl.pathname + "\u001b[0m")
						ok(RokuAPI.defaultResponse);
						break;
				}
			}
		})
	}


	static viewpost(post: any) {
		var playId = post.playId;
		if (playId == 0) {
			// Insert new record
			const query = `
				INSERT INTO [360_development].[360].[viewlog] ( contentId, deviceId, datetime, regtoken, datetimeUpdate, totalBandwidth )
				VALUES ( '${post.channelNumber}', '${post.esn}', GETDATE(), '${post.user.regtoken}', GETDATE(), ${post.bandwidth} );
				SELECT SCOPE_IDENTITY() AS playId;`;
			Sql.query(query).then((data: any) => { playId = data.recordsets[0][0].playId; })
				.catch((fail: any) => { fail({ error: fail, }); });
		} else {
				// Update existing record
			const query = ` UPDATE [360_development].[360].[viewlog] SET contentId = '${post.channelNumber}', deviceId = '${post.esn}', datetimeUpdate = GETDATE(), totalBandwidth = ${post.bandwidth} WHERE playNumber = ${playId}; `;
			// console.log(query)
			Sql.query(query).then(() => {
				// Do nothing if successful
			}).catch((fail: any) => {
				fail({ error: fail, });
			});
		}

		return new Promise((result: any, fail: any) => {
			const sql = `
				WITH cte AS (
				SELECT 
					runlog.id as runlogid, 
					runlog.contentType, 
					runlog.contentid, 
					runlog.contentaltid, 
					CAST(runlog.datetime as BIGINT) as contentEpoch,
					runlog.channel as channel,
					runlog.channelMode as channelMode,
					runlog.overlay,
					runlog.trt as runlogTrt,
					ROUND(runlog.datetime + (runlog.trt * 1000), 0) as contentEndEpoch,
					CAST(DATEDIFF_BIG(MILLISECOND, '19700101', GETUTCDATE()) AS BIGINT) as serverEpoch,
					CAST(DATEDIFF_BIG(MILLISECOND, '19700101', GETUTCDATE()) AS BIGINT) - ( 1000 * (select streamDelay from [360_development].[360].[channels] where channelNumber = 1)) as serverEpochDelay,
					videos.id, 
					videos.altId,
					videos.artist, 
					videos.title,
					videos.altTitle,
					videos.label,
					videos.year,
					videos.director,
					videos.album,
					videos.titlein, 
					videos.titleout,
					CASE 
						WHEN runlog.contenttype = 0 THEN videos.trt
						WHEN runlog.contenttype = 1 THEN bumps.trt
						WHEN runlog.contenttype = 2 THEN runlog.trt
					END as trt,
					CASE 
						WHEN runlog.contenttype = 0 THEN CONCAT(videos.Artist, ' - ', videos.Title)
						WHEN runlog.contenttype = 1 THEN CONCAT('BUMP', ' - ')
						WHEN runlog.contenttype = 2 THEN CONCAT('BREAK', ' - ')
					END as contentString,
					ROW_NUMBER() OVER (ORDER BY runlog.datetime DESC) AS RowNum
				FROM [360_development].[360].[runlog]
				LEFT JOIN [360_development].[360].[videos] ON runlog.contentid = videos.id AND runlog.contenttype = 0
				LEFT JOIN [360_development].[360].[bumps] ON bumps.ID = runlog.contentid AND runlog.contenttype = 1
				WHERE runlog.datetime <= (DATEDIFF_BIG(MILLISECOND, '19700101', GETUTCDATE())) - 30000 and runlog.channel = 1
			)
			SELECT *
			FROM cte
			WHERE RowNum IN (1, 2)
			ORDER BY RowNum;
			`;
			// console.log(sql)
			Sql.query(sql).then((data: any) => {

				const results: any = {};

				results["playId"] = playId;
				results["nowPlaying"] = data.recordsets[0];
				console.log(results)
				results["channels"] = RokuAPI.channels
				result(results);
			})
			.catch((fail: any) => {
				fail({
					error: fail,
				});
			});
		})	
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
	
	static updateChannelStatus() {
		Sql.query('SELECT * FROM [360_development].[360].[channels]')
			.then((results: any) => {
				results.recordset.forEach((channel: any) => {
					RokuAPI.channels[channel.channelNumber] = channel;
				});
			});
	}


	public static async generateOverlays(post: any): Promise<object> {
		// console.log(post);
		const overlays: any[] = [];
		var duration = 0;
		var loop = false;
		const overlayName = post["overlay"].toUpperCase()
		switch (overlayName) {
			case '360':
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/360.png"));
				break;
			case 'LATE':
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/LATE.png"));
				break;
			case 'WEEKEND':
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/WEEKEND.png"));
				break;
			case 'VOTE':
				break;
			case 'W':
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/360.E.png"));
				break;
			default:
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/360.png"));
				break;
		}
		//console.log(overlay);

		const overlay = {
			duration : duration,
			overlayName : overlayName,
			loop: loop,
			overlays : overlays
		};
		return overlay;
	}

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

interface RunlogData {
	runlogid: number;
	contentType: number;
	contentid: number | null;
	contentaltid: number | null;
	contentEpoch: bigint;
	channel: number;
	channelMode: number;
	overlay: string | null;
	runlogTrt: number | null;
	serverEpoch: bigint;
	serverEpochDelay: bigint;
	id: number | null;
	altId: number | null;
	artist: string | null;
	title: string | null;
	altTitle: string | null;
	label: string | null;
	year: string | null;
	director: string | null;
	album: string | null;
	titlein: number | null;
	titleout: number | null;
	trt: number | null;
	RowNum: number;
}

interface ChannelData {
	channelNumber: number;
	streamDelay: number;
	enabled: boolean;
}

interface ChannelsData {
	[key: number]: ChannelData;
}
