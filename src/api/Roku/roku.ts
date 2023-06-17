import { MusicVideo, request, Sql, moment, User, Channel, Content, Runlog, LogEntry, Library, WebSocketClient } from '../../modules';
import { Auth } from '../../auth/auth.js';
import { result, toUpper } from 'lodash';
import Poster from './SceneGraph/Components/Poster';
import Label from './SceneGraph/Components/Label';
import OpenWeather from '../weather';
import exp from 'constants';
import fs from 'fs';

export class RokuAPI {
	public static channels: any = {};
	private static timer: NodeJS.Timeout;
	static currentVersion: string = '0.9.1';
	static currentBuild: string = 'Jun-12-2023 9:49AM';

	public static async init(disableInterval = false) {
		const channels: any = await Sql.query('SELECT * FROM channels');

		channels.forEach((channel: any) => {
			RokuAPI.channels[channel.channelNumber] = channel;
		});

		// Set up timer to run query and update channel status every second
		if (!disableInterval) setInterval(async () => {
			try {
				RokuAPI.updateChannelStatus();
			} catch (error) {
				console.error(error);
			}
		}, 1000);
	}
	private static ROOT_URL = "https://360tv.net/api/v2";
	private static DEV_URL = "http://192.168.1.101:8080/api/v2";
	private static URL = RokuAPI.ROOT_URL;
	public static config = {
		output: 0,
		mainHeader: `360 Music Television`,
		viewpostURL: `${RokuAPI.URL}/roku/viewpost`,
		votepostURL: `${RokuAPI.URL}/roku/votepost`,
		ratepostURL: `${RokuAPI.URL}/roku/ratepost`,
		overlaysURL: `${RokuAPI.URL}/roku/overlays`,
		viewerStatusURL: `${RokuAPI.URL}/roku/viewerStatus`,
		serverStatusURL: `${RokuAPI.URL}/roku/serverStatus`,
		nowPlayingURL: `${RokuAPI.URL}/nowPlaying`,
		contentInfoURL: `${RokuAPI.URL}/api/contentInfo`,
		modURL: `${RokuAPI.URL}/roku/mod`,
		broadcastInfoURL: `${RokuAPI.URL}/roku/broadcastInfo`,
		userInfoURL: `${RokuAPI.URL}/roku/userInfo`,
		UrlBaseURL: `${RokuAPI.URL}/roku/`,
		UrlGetRegResultURL: `${RokuAPI.URL}/roku/getRegCode`,
		UrlGetRegCodeURL: `${RokuAPI.URL}/roku/getRegResult`,
		UrlWebSiteURL: `${RokuAPI.URL}/`,
		PositionNotificationPeriod: 10,
		NowPlayingScreenDisplayTime: 7,
		WeatherNotificationPeriod: 600,
		daysToRegister: 30,
		InterfaceUpdatePeriod: 1000,
		fonts: [
			{
				"name": "Courier New",
				"url": "https://360tv.net/roku/theme/fonts/COURBD.TTF",
				"path": "tmp:/fonts/COURBD.TTF",
				"sizes": [10, 12, 18, 22, 32, 48, 72, 120, 180, 240, 360]
			}, {
				"name": "Haettenschweiler",
				"url": "https://360tv.net/roku/theme/fonts/HATTEN.TTF",
				"path": "tmp:/fonts/HATTEN.TTF",
				"sizes": [10, 12, 18, 22, 32, 48, 72, 120, 180, 240, 360]
			}],
		images: {
			stars: [
				"https://www.360tv.net/roku/theme/0star.png",
				"https://www.360tv.net/roku/theme/1star.png",
				"https://www.360tv.net/roku/theme/2star.png",
				"https://www.360tv.net/roku/theme/3star.png",
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
		sounds:
		{
			"hello": "https://360tv.net/roku/theme/sounds/hello.wav",
			"notice": "https://360tv.net/roku/theme/sounds/coin.wav",
			"select": "https://360tv.net/demo/theme/sounds/select.wav",
			"dead": "https://360tv.net/roku/theme/sounds/dead.wav"
		}
	};

	public static defaultResponse = { defaultResponse: "OK" };

	public static call(urlParams: any): Promise<any> {


		const pathnamestring = "./test/Roku/testData/" + urlParams._parsedUrl.pathname.split("/")[4] + ".json"
		const u = {
			body: urlParams.body,
			headers: urlParams.headers,
			_parsedUrl: {
				pathname: urlParams._parsedUrl.pathname
			},
			method: urlParams.method,
		};
		
		// fs.writeFileSync(pathnamestring, JSON.stringify(u, undefined, 2))
		
		
		return new Promise((ok, fail) => {
			const postBody = urlParams.body;
			const clientIp : string = urlParams.headers['x-real-ip']
			// Change the color of this console background to yellow and the text to black
			// console.log(`${clientIp} ${urlParams.method} ${urlParams._parsedUrl.pathname}`);
			if (clientIp.includes("192.168.1.")){
				// console.log(`\u001b[32m${clientIp} ${urlParams.method} ${urlParams._parsedUrl.pathname}\u001b[0m`);
			}else{
				console.log(`\u001b[33m${clientIp} ${urlParams.method} ${urlParams._parsedUrl.pathname}\u001b[0m`);
			}



			WebSocketClient.Send(postBody)


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

						console.log(`\u001b[31m ${urlParams._parsedUrl.pathname}  =>>>> to backend\u001b[0m`);
						this.passToBackend(urlParams).then((result: any) => {
							ok(result);
						});
						break;
					case "/api/v2/roku/viewpost":
						RokuAPI.viewpost(postBody)
							.then(resp => {ok(resp)})
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
						console.log("`\u001b[31m \x1b[5m \x1b[7m Default response =>>>>" + urlParams._parsedUrl.pathname + "\u001b[0m");
						ok(RokuAPI.defaultResponse);
						break;
				}
			}
		});
	}


	static viewpost(post: any) {
		var playId = post.playId;
		const serverEpoch = Date.now()
		return new Promise((result: any, fail: any) => {
			// console.log(post);

			if (playId == 0) {
				const query = `INSERT INTO viewlog ( contentId, deviceId, datetime, regtoken, datetimeUpdate, totalBandwidth ) VALUES ( '${post.channelNumber}', '${post.esn}', NOW(), '${post.user.regtoken}', NOW(), ${post.bandwidth} ); SELECT LAST_INSERT_ID() AS playId;`;
				
				Sql.query(query).then((data: any) => {
					playId = data[1][0].playId;
				}).catch((error : any) => {
					fail({ error: error, });
				});
			} else {
				const query = `UPDATE viewlog SET contentId = '${post.channelNumber}', deviceId = '${post.esn}', datetimeUpdate = NOW(), totalBandwidth = ${post.bandwidth} WHERE playNumber = ${playId};`;
				Sql.query(query).then(() => {
					// Do nothing if successful
				}).catch((error : any) => {
					fail({ error: error, });
				});
			}

			const statussql = `
			SET @streamDelay := ${this.channels[post.channelNumber].streamDelay};
  
			SELECT 
			((unix_timestamp() *1000) - runlog.datetime) / 1000  as startedSecondsAgo ,
			(runlog.datetime / 1000) + runlog.trt - unix_timestamp() + @streamDelay as SecondsLeft ,
			
			(unix_timestamp() + @streamDelay) * 1000 as playerepochDelay,
			runlog.datetime as contentEpoch,
			runlog.datetime + (runlog.trt * 1000) as contentEndEpoch,
			unix_timestamp() * 1000 as serverEpoch,
			from_unixtime(unix_timestamp()) as serverDatetime,
			from_unixtime(unix_timestamp() - @streamDelay) as playerDatetimeDelay,
			from_unixtime(runlog.datetime / 1000) as contentdatetime,
			runlog.trt as runlogtrt,
			runlog.*,
			videos.*,
			(CASE
				WHEN runlog.contenttype = 0 THEN CONCAT(videos.Artist," - ",videos.Title)
				WHEN runlog.contenttype = 1 THEN CONCAT(runlog.contentId," : ",runlog.trt)
				WHEN runlog.contenttype = 2 THEN CONCAT(runlog.contentId," : ",runlog.trt)
         		END) as contentString
			from runlog 
			left join videos on runlog.contentid = videos.id
			where runlog.channel = ${post.channelNumber} having SecondsLeft > 0
			order by runlog.datetime asc
			limit 2;`;

			// console.log(statussql);
			Sql.query(statussql)
				.then((dataTable : any) => {
					const r = {
						serverEpoch: dataTable[1].length > 0 ? dataTable[1][0].serverEpoch : Date.now(),
						playerEpoch: dataTable[1].length > 0
							? dataTable[1][0].serverEpoch - (this.channels[post.channelNumber].streamDelay * 1000)
							: Date.now() - (this.channels[post.channelNumber].streamDelay * 1000),
						playId: playId,
						nowPlaying: dataTable[1],
						channels: this.channels,
						latestVersion : this.currentVersion,
						latestBuild : this.currentBuild,
					};

					// console.log(r)
					result(r);
				})
				.catch((error) => {
					console.error(error);
					fail(error);
				});
		});
	}


	public static passToBackend(post: any): Promise<any> {
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

	static updateChannelStatus() {
		Sql.query('SELECT * FROM channels')
			.then((results: any) => {
				results.forEach((channel: any) => {
					RokuAPI.channels[channel.channelNumber] = channel;
				});
			});
	}

	public static async generateOverlays(post: any): Promise<object> {
		// console.log(post);
		const overlays: any[] = [];
		var expires = 0;
		var duration = 0;
		var loop = false;
		const overlayName = post["overlay"].toUpperCase();
		let weatherData;
		let weatherInfoFont = "tmp:/fonts/COURBD.TTF";
		console.log("Gnerating overlays for video mode " + post.overlay)
		switch (overlayName) {
		
			case 'LATE':
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/LATE.png", 1280, 720));
				break;
			case 'HOT100':
			case 'WEEKEND':
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/WEEKEND.png", 1280, 720));
				break;
			case 'VOTE':
				break;
			case '360':
				// overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/360.png", 1280, 720));
				// break;
			case 'DAY':
				expires = Date.now() + (60000 * 5);

				weatherData = await OpenWeather.getData(post);
				let fontSize = 20;
				let x = 970;
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/360.T.png", 1280, 720));
				overlays.push(new Poster(x - 5, 610, `https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}.png`, 50, 50));
				overlays.push(new Label( x, 600, fontSize, `${Math.round(weatherData.current.temp)}F`, weatherInfoFont));
				break;
				
			case 'INFO':
			case 'W':
				//expires = Date.now() + 60000;
				expires = -1;
				let leftMarg = 280;
				let indent = 10;
				let y = 130;
				let weatherInfoFontSize = 22;
				let lineSpacing = 36;
				weatherData = await OpenWeather.getData(post);
				const iconSize = 50;

				overlays.push(new Label(leftMarg, y, 32, `Local weather info for ${weatherData.location.name} ${weatherData.location.state}`, "tmp:/fonts/COURBD.TTF"));
				const todayFormattedSunrise = new Date(weatherData.current.sunrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
				const todayFormattedSunset = new Date(weatherData.current.sunset * 1000).toISOString().slice(0, 19).replace('T', ' ');
				y += 40;
				[
					`${post.user.regtoken === "000000000000" ? "[DEFAULT] " : ""} [${weatherData.location.lat} : ${weatherData.location.lon}]`,
					`Sunrise: ${todayFormattedSunrise} // Sunset: ${todayFormattedSunset}`,
					`Currently: ${weatherData.current.temp}°F  //  Feels like: ${weatherData.current.feels_like}°F`,
					`Humidity: ${weatherData.current.humidity}%`].forEach((element, i) => {
						overlays.push(new Label(leftMarg, y, 12, element, weatherInfoFont));
						y += 15;
				});

				y += 20;
				// overlays.push(new Label(leftMarg + 80, y, weatherInfoFontSize, `${weatherData.current.temp}`, weatherInfoFont));
				weatherData.daily.forEach((dailyData: any) => {
					const { regtoken, dt, sunrise, sunset, moonrise, moonset, moon_phase, moon_phase_lunation, temp, feels_like, pressure, humidity, dew_point, wind_speed, wind_deg, wind_gust, weather, clouds, pop, rain, snow, uvi } = dailyData;

					const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');
					const dayOfWeekAbbreviation = moment.unix(dt).format('ddd');

					// const formattedDt = new Date(dt * 1000).toISOString().slice(0, 19).replace('T', ' ');
					const formattedSunrise = new Date(sunrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
					const formattedSunset = new Date(sunset * 1000).toISOString().slice(0, 19).replace('T', ' ');
					const formattedMoonrise = new Date(moonrise * 1000).toISOString().slice(0, 19).replace('T', ' ');
					const formattedMoonset = new Date(moonset * 1000).toISOString().slice(0, 19).replace('T', ' ');

					// Extract weather details
					const { id: weatherId, main: weatherMain, description: weatherDescription, icon: weatherIcon } = weather[0];

					overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `${dayOfWeekAbbreviation }`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `timezone ${weatherData.data.timezone}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `sunrise ${formattedSunrise}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `sunset ${formattedSunset}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `moonrise ${formattedMoonrise}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `moonset ${formattedMoonset}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `moon_phase ${moon_phase}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `temp_morn ${temp.morn}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `temp_day ${temp.day}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `temp_eve ${temp.eve}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `temp_night ${temp.night}`, weatherInfoFont));
					overlays.push(new Label(leftMarg + indent + 100, y, weatherInfoFontSize, `Low  ${temp.min}`, weatherInfoFont));
					overlays.push(new Label(leftMarg + indent + 300, y, weatherInfoFontSize, `High ${temp.max}`, weatherInfoFont));
					overlays.push(new Poster(leftMarg + indent + 450, y - 10, `https://openweathermap.org/img/wn/${weatherIcon}.png`,iconSize,iconSize));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `feels_like_morn ${feels_like.morn}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `feels_like_day ${feels_like.day}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `feels_like_eve ${feels_like.eve}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `feels_like_night ${feels_like.night}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `pressure ${pressure}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `humidity ${humidity}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `dew_point ${dew_point}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `wind_speed ${wind_speed}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `wind_deg ${wind_deg}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `wind_gust ${wind_gust}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent + 400, y, weatherInfoFontSize, `weather_id ${weatherId}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent + 500, y, weatherInfoFontSize, `weather_main ${weatherMain}`, weatherInfoFont));
					overlays.push(new Label(leftMarg + indent + 500, y, weatherInfoFontSize, `${weatherDescription}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent + 900, y, weatherInfoFontSize, `icon ${weatherIcon}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `clouds ${clouds}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `pop ${pop}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `rain ${rain || 0}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `snow ${snow || 0}`, weatherInfoFont));
					// overlays.push(new Label(leftMarg + indent, y, weatherInfoFontSize, `uvi ${uvi}`, weatherInfoFont));

					y += lineSpacing;
				});
				


				let lines = [
					"This screen is under constuction.",
					"Data: openweathermap.org",
					"%bw mb used",
					`lat ${weatherData.lat} : lon ${weatherData.lon}`
				];

				y += 20;
				lineSpacing = 14;
				lines.forEach((lineText, i) => {
					overlays.push(new Label(leftMarg + 10, y + (lineSpacing * i), 12, lineText, "tmp:/fonts/COURBD.TTF"));
				});
				break;
			default:
				overlays.push(new Poster(0, 0, "https://www.360tv.net/roku/theme/overlays/360.png"));
				break;
		}
		
		const overlay = {
			duration: duration,
			expires : expires,
			overlayName: overlayName,
			loop: loop,
			overlays: overlays
		};
		// console.log(overlay);
		return overlay;
	}

}


interface ChannelData {
	channelNumber: number;
	streamDelay: number;
	enabled: boolean;
}

interface ChannelsData {
	[key: number]: ChannelData;
}