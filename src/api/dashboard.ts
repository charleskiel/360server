import {
	MusicVideo, request, Sql, moment, DownloadFile, User, Channel, Content, Runlog, LogEntry, Library
} from '../modules'
import { Auth } from '../auth/auth.js';
import { result, toUpper } from 'lodash';
import {inherits, log} from 'util';
import { Socket } from 'socket.io';

export class 	DashboardAPI {
	private static channels: any = {};
	private static timer: NodeJS.Timeout;

	private static ROOT_URL = "https://360tv.net/api/v2"
	private static DEV_URL = "http://192.168.1.101:8080/api/v2"
	private static URL = DashboardAPI.ROOT_URL
	public static config  =  {
		output : 0,
		mainHeader : `360 Music Television`,
		viewpostURL : `${DashboardAPI.URL}/roku/viewpost`,
		votepostURL : `${DashboardAPI.URL}/roku/votepost`,
		ratepostURL : `${DashboardAPI.URL}/roku/ratepost`,
		overlaysURL : `${DashboardAPI.URL}/roku/overlays`,
		viewerStatusURL : `${DashboardAPI.URL}/roku/viewerStatus`,
		serverStatusURL: `${DashboardAPI.URL}/roku/serverStatus`,
		nowPlayingURL : `${DashboardAPI.URL}/nowPlaying`,
		contentInfoURL : `${DashboardAPI.URL}/api/contentInfo`,
		modURL : `${DashboardAPI.URL}/roku/mod`,
		broadcastInfoURL : `${DashboardAPI.URL}/roku/broadcastInfo`,
		userInfoURL : `${DashboardAPI.URL}/roku/userInfo`,
		UrlBaseURL : `${DashboardAPI.URL}/roku/`,
		UrlGetRegResultURL : `${DashboardAPI.URL}/roku/getRegCode`,
		UrlGetRegCodeURL : `${DashboardAPI.URL}/roku/getRegResult`,
		UrlWebSiteURL : `${DashboardAPI.URL}/`,
		PositionNotificationPeriod : 10,
		NowPlayingScreenDisplayTime : 7,
		WeatherNotificationPeriod : 600,
		daysToRegister : 30,
		InterfaceUpdatePeriod : 1000,
	};

	public static defaultResponse = { defaultResponse: "OK" };

	public static call(urlParams: any): Promise<any> {
		
		return new Promise((ok, fail) => {
			const postBody = urlParams.body;


			if (urlParams.method === 'POST') {
				switch (urlParams._parsedUrl.pathname) {


					default:
						console.log(`\u001b[31m \x1b[5m \x1b[7m Sending defult response for ${urlParams._parsedUrl.pathname} "\u001b[0m to ${postBody.esn}\u001b[0m`);
						ok(DashboardAPI.defaultResponse);
						break;
				}
			}

			if (urlParams.method === 'GET') {
				// console.log(urlParams._parsedUrl.query.split("=")[1])
				switch (urlParams._parsedUrl.pathname) {

					case "/api/dashboard/viewers":
						const query = `SELECT TOP (20)
						viewlog.[playnumber],
						viewlog.[contentId],
						viewlog.[deviceId],
						viewlog.[datetime],
						viewlog.[contentType],
						COALESCE(viewlog.[regtoken], '') AS regtoken,
						viewlog.[action],
						viewlog.[complete],
						viewlog.[incomplete],
						viewlog.[position],
						viewlog.[datetimeUpdate],
						viewlog.[totalBandwidth],
						DATEDIFF(SECOND, viewlog.[datetime], GETUTCDATE()) as timeViewing,
						devices.[AppVersion],
						COALESCE(devices.[regtoken], '') AS regtoken,
						devices.[regkey],
						devices.[partner],
						devices.[DeviceName],
						devices.[DevicePCRating],
						devices.[DeviceTypeName],
						devices.[DeviceModel],
						devices.[DeviceVersion],
						devices.[DeviceDisplayType],
						devices.[DeviceDisplayMode],
						devices.[DeviceCountryCode],
						devices.[DeviceTimeZoneName],
						devices.[DeviceAudio],
						devices.[AddDate],
						devices.[DeviceTimeZone],
						devices.[LastActive],
						CAST(devices.[DeviceActive] AS INT) AS DeviceActive,
						CAST(devices.[LogActivity] AS INT) AS LogActivity,
						users.[Name],
						users.[FirstName],
						users.[LastName],
						users.[City],
						users.[State],
						users.[Zip],
						users.[Age],
						users.[Sex],
						users.[timezone],
						users.[Email],
						users.[pword],
						users.[SignupDate],
						users.[lastactive],
						CAST(users.[poweruser] AS INT) AS poweruser,
						CAST(users.[verified] AS INT) AS verified,
						CAST(users.[active] AS INT) AS active,
						CAST(users.[suspended] AS INT) AS suspended,
						CAST(users.[admin] AS INT) AS admin,
						CAST(users.[contentprovider] AS INT) AS contentprovider,
						CAST(users.[logactivity] AS INT) AS logactivity,
						users.[newslettersent],
						users.[lastlogin],
						users.[appversion],
						users.[regtoken],
						users.[emailverificationcode],
						users.[FBid],
						CAST(users.[newsletter] AS INT) AS newsletter,
						users.[daylimit],
						users.[monthlimit],
						users.[MOD],
						users.[oAuthID],
						users.[oAuthType],
						users.[avatar],
						users.[firstIssuedAt],
						users.[expiresAt],
						users.[idToken],
						users.[expiresIn]
					 FROM [360_development].[360].[viewlog]
					 LEFT JOIN [360_development].[360].[devices] ON viewlog.deviceId = devices.deviceId
					 LEFT JOIN [360_development].[360].[users] ON viewlog.regtoken = users.regtoken
					 ORDER BY viewlog.datetime DESC;
					 ;`;
						// console.log(query)
						Sql.query(query).then((data : any) => {
							ok(data.recordsets[0])
						}).catch((fail: any) => {
							fail({ error: fail, });
						});
						break;
					case "/api/dashboard/musicVideos":
						Sql.query("select * from [360_development].[360].[videos] order by artist, title, altId")
						.then((result: any) => { ok(result.recordsets[0]); })
						.catch((error: any) => { console.log(error); fail(error) })
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