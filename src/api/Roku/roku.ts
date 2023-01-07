import {
	MusicVideo, request, Mysql, moment, DownloadFile, User, Channel, Sockets, Content, Runlog, LogEntry, Library
} from '../modules'
import { Auth } from '../auth/auth.js';
import { toUpper } from 'lodash';
import {inherits, log} from 'util';
import { Socket } from 'socket.io';

export class RokuAPI {
	public static config  =  {
		output : 0,
		mainHeader : '360 Music Television',
		viewpost : 'https://www.360tv.net/api/v1/roku/viewpost',
		ratepost: 'https://www.360tv.net/api/v1/roku/ratepost',
		votepost: 'https://www.360tv.net/api/v1/roku/votepost',
		overlays: 'https://www.360tv.net/api/v1/roku/overlays',
		viewerStatus : 'https://www.360tv.net/api/v1/roku/viewerStatus',
		serverStatus: 'https://www.360tv.net/api/v1/roku/serverStatus?',
		nowPlaying: 'https://www.360tv.net/api/v1/nowPlaying',
		contentInfo: 'https://www.360tv.net/api/contentInfo',
		mod: 'https://www.360tv.net/api/v1/roku/mod',
		broadcastInfo : 'https://www.360tv.net/api/v1/roku/broadcastInfo',
		userInfo : 'https://www.360tv.net/api/v1/roku/userInfo',
		UrlBase: 'https://www.360tv.net/api/v1/roku/',
		UrlGetRegResult : 'https://www.360tv.net/api/v1/roku/getRegCode',
		UrlGetRegCode : 'https://www.360tv.net/api/v1/roku/getRegResult',
		UrlWebSite : 'https://www.360tv.net/',
		PositionNotificationPeriod : 10,
		WeatherNotificationPeriod : 600,
		daystoregister : 30,
		hello: 'https://www.360tv.net/api/v1/roku/theme/hello.wav',
		notice: 'https://www.360tv.net/api/v1/roku/theme/coin.wav',
		InterfaceUpdatePeriod: 1000,
		fonts: [
			{
				"name": "Courier New",
				"url": "https://360tv.net/roku/theme/COURBD.TTF",
				"path": "tmp:/fonts/COURBD.TTF",
				"sizes": [10, 12, 18, 22, 32, 48, 72, 120, 180, 240, 360]
			},{
				"name": "Haettenschweiler",
				"url": "https://360tv.net/roku/theme/HATTEN.TTF",
				"path": "tmp:/fonts/HATTEN.TTF",
				"sizes": [10, 12, 18, 22, 32, 48, 72, 120, 180, 240, 360]
			}],
		"sounds":
		{
			"hello": "https://360tv.net/roku/theme/hello.wav",
			"notice": "https://360tv.net/roku/theme/coin.wav",
			"select": "https://360tv.net/demo/theme/select.wav",
			"dead": "https://360tv.net/roku/theme/dead.wav"
		}
	};

	public static defaultResponse = { defaultResponse: "OK" };

	public static call(urlParams: any): Promise<any> {
		
		return new Promise((ok, fail) => {
			// console.log(urlParams)
			const post = urlParams.body;

			if (urlParams.method === 'POST') {
				switch (urlParams.path) {
					case "/api/v1/roku/config":
						console.log(`\u001b[31m\x1b[5m\x1b[7mSending launch config to ${post.device.esn}\u001b[0m`);
						ok(RokuAPI.config);
						break;
					case "/api/v1/roku/userInfo":
						console.log(`Sending user info to ${post.device.esn}`);
						ok(User.login(post));
						break;
					case "/api/v1/roku/status":
						console.log(`Sending status to ${post.device.esn}`);
						ok(RokuAPI.status());
						break;
					case "/api/v1/roku/channelStatus":
						console.log(`Sending Channel status to ${post.device.esn}`);
						ok(User.login(post));
						break;
					case "/api/v1/roku/overlays":
						console.log(`Sending overlays to ${post.device.esn}`);
						// console.log(post);
						ok(RokuAPI.generateOverlays(post.overlay));
						break;
					case "/api/v1/roku/viewpost":
						console.log(`\u001b[31mSending viewpost to ${post.esn}\u001b[0m for player epoch ${post.playerEpoch}`);
						RokuAPI.viewpost(post)
							.then(resp => {
								ok(resp);
							})
							.catch(err => {
								console.log(`\u001b[31m \x1b[5m \x1b[7m${post.esn} ::: ${err}\u001b[0m`);
								fail(err);
							});
						break;
					case "/api/v1/roku/votepost":
						console.log(`\u001b[31mSending Vote post to ${post.esn}\u001b[0m for player epoch ${post.playerEpoch}`);
						if (post.action == "VOTE") {
							Sockets.castVote(post.esn, post.voteSelection)
								.then(resp => {
									console.log(resp);
									ok(resp);
								})
								.catch(err => {
									console.log(`\u001b[31m \x1b[5m \x1b[7m${post.esn} ::: ${err}\u001b[0m`);
									fail(err);
								});
						}
						else if (post.action == "GET") {

							Sockets.getVotes(post.esn)
								.then(resp => {
									console.log(resp);
									ok(resp);
								})
								.catch(err => {
									console.log(`\u001b[31m \x1b[5m \x1b[7m${post.esn} ::: ${err}\u001b[0m`);
									fail(err);
								});
						}
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
					case "/api/v1/roku/serverStatus":
						console.log(`Sending server status to ${post.device.esn}`);
						ok(Channel.status());
						break
					case "/api/v1/roku/overlays": {
						
						ok(RokuAPI.generateOverlays(urlParams._parsedUrl.query.split("=")[1]));
						break;
					}
					case "/api/v1/roku/status":
						ok(RokuAPI.status());
						break;
					default:
						console.log("Default response =>>>>" + urlParams._parsedUrl.pathname)
						ok(RokuAPI.defaultResponse);
						break;
				}
			}
		})


	}

	public static viewpost(post: any) : Promise<any> {
		// console.log(post);
		//
		// return new Promise((ok: any, fail: any) => {
		// 	const statussql = `
		// 		SELECT ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) as serverEpoch,
		// 			runlog.datetime as contentEpoch,
		// 			(CASE
		// 				WHEN runlog.contenttype = 0 THEN runlog.datetime + ROUND(videos.trt * 1000)
		// 				WHEN runlog.contenttype = 1 THEN runlog.datetime + ROUND(bumps.trt * 1000)
		// 				WHEN runlog.contenttype = 2 THEN runlog.datetime + ROUND(runlog.trt * 1000)
		// 			END) as contentEndEpoch,
		//
		// 			(CASE
		// 				WHEN runlog.contenttype = 0 THEN videos.trt
		// 				WHEN runlog.contenttype = 1 THEN bumps.trt
		// 				WHEN runlog.contenttype = 2 THEN runlog.trt
		// 			END) as contenttrt,
		//
		// 			runlog.overlay, runlog.\`mode\`, runlog.id as runlogid, runlog.contentType, videos.id, videos.alphaArtist, videos.title, videos.trt, videos.titlein, videos.titleout
		// 			from runlog
		//
		// 		left join videos on runlog.contentid = videos.id
		// 			left join channels on channelNumber = ${post["channelNumber"]}
		// 			left join bumps on bumps.ID = runlog.contentid
		//
		// 		where from_unixtime(${post["playerEpoch"]}/ 1000) <= from_unixtime((datetime / 1000) +
		// 			(CASE
		// 				WHEN runlog.contenttype = 0 THEN videos.trt
		// 				WHEN runlog.contenttype = 1 THEN bumps.trt
		// 				WHEN runlog.contenttype = 2 THEN runlog.trt
		// 			END))
		//
		// 		order by datetime desc limit 2`;
		//
		// 		console.log(statussql)
		// 	Mysql.query(statussql)
		// 		.then((results) => { ok(results); })
		// 		.catch((error) => {
		// 			console.error(error);
		// 			fail(error);
		// 		})
		// })
		return new Promise ((ok: any, fail: any)=>{
			let results: any[] = [];
			let r: any[] = [];
			let resultObject: any;
			let offset = Channel.channels.get(post.channelNumber)?.offset || 35
			const playerEpoch = post.playerEpoch; // - (offset * 1000);
			console.log("player Epoch= " + playerEpoch + ` post.playerEpoch - ${offset}` )
			Channel.channels.get(post.channelNumber)?.runlog.map((logEntry: LogEntry) => {
				let contentEndEpoch = logEntry.epoch + (logEntry.content.trt * 1000);
				let timeLeft = (contentEndEpoch - playerEpoch) / 1000;
				let timeSinceStart =   ((logEntry.epoch - (logEntry.epoch - (logEntry.content.trt * 1000))) / 1000)

				r.push({
					playerEpoch,
					now: Date.now(),
					contentId: logEntry.content.id,
					...logEntry,
					playerEpochh: playerEpoch - Date.now(),
					playerEpochTimestamp: moment.unix(playerEpoch),
					// contentEpoch: logEntry.epoch,
					TRT: logEntry.content.trt,
					contentEndEpoch: contentEndEpoch,
					timeLeft: timeLeft,
					ago: moment.unix(timeSinceStart / 1000 ).fromNow(),
					// ends: moment.unix((logEntry.epoch / 1000) + logEntry.content.trt ).fromNow(),
					overlay: logEntry.overlay,

				})
				// console.log(`[${logEntry.content.id}:${logEntry.content.contentType}] `, playerEpoch, logEntry.epoch + (logEntry.content.trt * 1000), (playerEpoch < logEntry.epoch + (logEntry.content.trt * 1000) ) )
				// console.log("logEntry.epoch       : ", logEntry.epoch)
				// // console.log("logEntry.content.trt * 1000                   : ", logEntry.content.trt * 1000) 
				// console.log("logEntry.epoch + trt : ", logEntry.epoch + (logEntry.content.trt * 1000) )
				// console.log("playerEpoch          : ", playerEpoch)
				if (playerEpoch < logEntry.epoch + (logEntry.content.trt * 1000 ) ){
					results.push({
						// ...logEntry.content,
						...logEntry,
						contentEpoch : logEntry.epoch,
						contentEndEpoch : contentEndEpoch,
						ago : moment.unix(logEntry.epoch / 1000).fromNow(),
						left : timeLeft ,
						ends : moment.unix((logEntry.epoch / 1000) + (logEntry.content.trt * 1000)).fromNow(),
						overlay : logEntry.overlay,
						overlays : [...this.generateOverlays(logEntry.overlay)]
					})
				}
			});
			console.table(r)
			console.table(results)

			resultObject = {
				serverEpoch : Date.now(),
				offset : offset,
				nowPlaying : results.splice(0,2)
			}
			// console.log(JSON.stringify(resultObject, undefined, 4));
			ok(resultObject);
			fail(null)

		});
	}
	public static votepost(post: any): Promise<any> {
		console.log(post);
		return new Promise((ok: any, fail: any) => {


			// Mysql.query(statussql)
			// 	.then((results) => {
			// 		console.log(results)
			// 		ok(results);
			// 	})
			// 	.catch((error) => {
			// 		console.error(error);
			// 		fail(error);
			// 	})
			ok(post);
		});
	}

	static status(): any {
		let result: any[] = [];
		Channel.channels.forEach((channel: Channel, key: number) => {
			result.push({
				channelNumber: channel.channelNumber,
				contentID: channel.channelName,
				url: channel.streamURL,
				onAir: channel.onAir.valueOf(),
				offset: channel.offset,
				upTime: channel.upTime,
				streamNotificationMessage: channel.streamNotificationMessage,
				maxViewers: channel.maxViewers,
				bitrate: 2300,
				nowPlaying: channel.runlog.splice(0,5)
			});
		});
		return result;
	}

	public static generateOverlays(overlayType: string) : Array<any> {
		const overlays = [];
		// console.log(overlayType.toUpperCase())
		switch (overlayType.toUpperCase()) {
			case '360': 
				overlays.push({
					type: "poster",
					x: 0, y: 0,
					uri: "https://www.360tv.net/roku/theme/overlays/360.png"
				});
				break;
		
			case 'LATE':
				overlays.push({
					type: "poster",
					x: 0, y: 0,
					uri: "https://www.360tv.net/roku/theme/overlays/LATE.png"
				});
				break;
			case 'WEEKEND':
				overlays.push({
					type: "poster",
					x: 0, y: 0,
					uri: "https://www.360tv.net/roku/theme/overlays/WEEKEND.png"
				});
				break;
		
			case 'VOTE':
				break;
		
			case 'W':
				overlays.push({
					type: "poster",
					x: 0, y: 0,
					uri: "https://www.360tv.net/roku/theme/overlays/360.png",
				});
				break;
		
			default:
				overlays.push({
					type: "poster", x: 0, y: 0,
					uri: "https://www.360tv.net/roku/theme/overlays/360.png"
				});
				break;
		}
		// console.log(overlays)
		return overlays;
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
interface Poster extends Overlay {
	uri: string
}
