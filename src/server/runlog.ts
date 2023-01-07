import _ from 'lodash';
import { runInNewContext } from 'vm';
import { Content, MusicVideo, Bump, Break, Card, Song, Intro, request, Mysql } from '../modules'
import { Library } from './library';

export class Runlog {
	private static EastLog: Array<LogEntry> = []
	private static WestLog: Array<LogEntry> = []

	//public static replaceLast(content: Content) {Runlog.log[0] = content}
	//public static lastVideo(): Content {return Runlog.log[0]}

	public static load() {
		console.log("Loading Runlog");
		setInterval(this.getNowPlaying, 1000)
	}

	public static post(content: any) : string {
		//console.log(content)
		Runlog.add({
			contentid: content.contentid,
			contentaltid: content.contentaltid,
			contentType: content.contentType,
			overlay: content.overlay,
			channelName: content.channelName,
			timestamp: content.timestamp
		})
		return "OK"
	}

	public static add(content: LogEntry) {

		Runlog.EastLog.push(content)
		// switch (content.contentType) {
		// 	case 0:
		// 		Runlog.log.push(Library.getVideo(content.contentid));
		// 		break;
		// 	case 1:
		// 		Runlog.log.push(new Bump(content));
		// 		break;
		// 	case 2:
		// 		Runlog.log.push(new Break(content));
		// 		break;
		// 	case 3:
		// 		Runlog.log.push(new Song(content));
		// 		break;
		// 	case 4:
		// 		Runlog.log.push(new Card(content));
		// 		break;
		// 	case 5:
		// 		//Runlog.log.push(new Scene(content));
		// 		break;
		// 	case 6:
		// 		//Runlog.log.push(new Fill(content));
		// 		break;
		// 	case 7:
		// 		Runlog.log.push(new Intro(content));
		// 		break;
		// 	case 8:
		// 		//Runlog.log.push(new Live(content));
		// 		break;
		// 	case 9:
		// 		//Runlog.log.push(new Empty(content));
		// 		break;
		// }
	}

	//private static nowPlayingListCache : any[] = [];
	public static nowPlaying(channelName: any, length: number = 12) {
		if (channelName == "East") return Runlog.EastLog.filter((video : any) => video['channelName'] = channelName) ;
		if (channelName == "West") return Runlog.WestLog.filter((video : any) => video['channelName'] = channelName) ;
	}

	public static getNowPlaying() {
		let sql = `select videos.id, videos.altId, videos.artist, videos.title, videos.altTitle, videos.album, videos.year, videos.director, runlog.channelName, runlog.datetime from runlog left join videos on videos.id = runlog.contentid where runlog.contentType = 0 and channelName = 'East' order by datetime desc limit 12`
		let EastResults : any[] = [];
		let WestResults : any[] = [];
		Mysql.query(sql).then((results: any) => {
			results.map((entry: any) => {
				if (!EastResults[entry["channelName"]]) EastResults[entry["channelName"]] = []
				EastResults.push(entry)
			})
			Runlog.EastLog = EastResults;
		});

		sql = `select videos.id, videos.altId, videos.artist, videos.title, videos.altTitle, videos.album, videos.year, videos.director, runlog.channelName, runlog.datetime from runlog left join videos on videos.id = runlog.contentid where runlog.contentType = 0 and channelName = 'West' order by datetime desc limit 12`
		Mysql.query(sql).then((results: any) => {
			results.map((entry: any) => {
				if (!WestResults[entry["channelName"]]) WestResults[entry["channelName"]] = []
				WestResults.push(entry)
			})
			Runlog.WestLog = WestResults;
		});
	}
}

export interface LogEntry{
	contentid: number,
	contentaltid: number,
	contentType: Content.ContentType
	overlay: String,
	channelName: String,
	timestamp: Date
}