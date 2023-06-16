import {
	MusicVideo, request, Sql, moment, DownloadFile, User, Channel, Content, Runlog, LogEntry, Library
} from '../modules'
import { Auth } from '../auth/auth.js';
import { result, toUpper } from 'lodash';
import { inherits, log } from 'util';
import { Socket } from 'socket.io';

export class DashboardAPI {
	private static channels: any = {};
	private static timer: NodeJS.Timeout;

	private static ROOT_URL = "https://360tv.net/api/v2"
	private static DEV_URL = "http://192.168.1.101:8080/api/v2"
	private static URL = DashboardAPI.ROOT_URL
	public static config = {
		output: 0,
		mainHeader: `360 Music Television`,
		viewpostURL: `${DashboardAPI.URL}/roku/viewpost`,
		votepostURL: `${DashboardAPI.URL}/roku/votepost`,
		ratepostURL: `${DashboardAPI.URL}/roku/ratepost`,
		overlaysURL: `${DashboardAPI.URL}/roku/overlays`,
		viewerStatusURL: `${DashboardAPI.URL}/roku/viewerStatus`,
		serverStatusURL: `${DashboardAPI.URL}/roku/serverStatus`,
		nowPlayingURL: `${DashboardAPI.URL}/nowPlaying`,
		contentInfoURL: `${DashboardAPI.URL}/api/contentInfo`,
		modURL: `${DashboardAPI.URL}/roku/mod`,
		broadcastInfoURL: `${DashboardAPI.URL}/roku/broadcastInfo`,
		userInfoURL: `${DashboardAPI.URL}/roku/userInfo`,
		UrlBaseURL: `${DashboardAPI.URL}/roku/`,
		UrlGetRegResultURL: `${DashboardAPI.URL}/roku/getRegCode`,
		UrlGetRegCodeURL: `${DashboardAPI.URL}/roku/getRegResult`,
		UrlWebSiteURL: `${DashboardAPI.URL}/`,
		PositionNotificationPeriod: 10,
		NowPlayingScreenDisplayTime: 7,
		WeatherNotificationPeriod: 600,
		daysToRegister: 30,
		InterfaceUpdatePeriod: 1000,
	};

	public static defaultResponse = { defaultResponse: "OK" };

	public static call(urlParams: any): Promise<any> {
		const postBody = urlParams.body;
		return new Promise((ok, fail) => {

			if (urlParams.method === 'POST') {
				switch (urlParams._parsedUrl.pathname) {

					case "/api/dashboard/viewers":
						const query = `SELECT viewlog.*, devices.*, users.*,
						time_to_sec(timediff(datetimeupdate, datetime)) as secondsWatching, time_to_sec(timediff(now(), datetimeupdate )) as secondsSinceUpdate FROM viewlog
					 	LEFT JOIN devices ON viewlog.deviceId = devices.deviceId
					 	LEFT JOIN users ON viewlog.regtoken = users.regtoken
						${postBody.showOnlyActive ? "where time_to_sec(timediff(now(), datetimeupdate )) < 15" : ""}
					 	ORDER BY viewlog.datetime DESC limit ${postBody.resultLimit};`;
						// console.log(query)
						Sql.query(query)
							.then((data: any) => { ok(data); })
							.catch((error: any) => {
								fail({ error: error });
							});
						break;
					default:
						console.log(`\u001b[31m \x1b[5m \x1b[7m Sending defult response for ${urlParams._parsedUrl.pathname} "\u001b[0m to ${postBody.esn}\u001b[0m`);
						ok(DashboardAPI.defaultResponse);
						break;
				}
			}

			if (urlParams.method === 'GET') {
				// console.log(urlParams._parsedUrl.query.split("=")[1])
				switch (urlParams._parsedUrl.pathname) {


					case "/api/dashboard/musicVideos":
						Sql.query("select * from videos order by artist, title, altId")
							.then((result: any) => { ok(result); })
							.catch((error: any) => { fail(error); });
						break;

					case "/api/dashboard/weatherData":
						const sql = `SELECT regtoken, dt, temp FROM 360_development.weather_data_hourly order by regtoken, dt;`;
						Sql.query(sql)
							.then((data: any) => {
								// Start with an empty object.
								const groupedData: any = {};

								// Loop over the rows of data.
								for (const row of data) {
									// If we haven't seen this regtoken before, add an entry for it.
									if (!groupedData[row.regtoken]) {
										groupedData[row.regtoken] = [];
									}

									// Add the data point to the correct regtoken.
									groupedData[row.regtoken].push({
										timestamp: new Date (row.dt),
										temperature: row.temp,
									});
								}

								// Convert the object into the array format we want.
								const finalData = Object.keys(groupedData).map(regtoken => ({
									regtoken: regtoken,
									data: groupedData[regtoken],
								}));
								console.log(JSON.stringify(finalData))
								ok(finalData);
							})
							.catch((error: any) => {
								fail({ error: error });
							});
						break;

					default:
						console.log("`\u001b[31m \x1b[5m \x1b[7m Default response =>>>>" + urlParams._parsedUrl.pathname + "\u001b[0m")
						ok(DashboardAPI.defaultResponse);
						break;
				}
			}
		})
	}

}