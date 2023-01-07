import _ from 'lodash';
import { runInNewContext } from 'vm';
import { Content, MusicVideo, Bump, Break, Card, Song, Intro, request, Mysql } from '../modules'
import { Library } from './library';

export class Runlog {
	// private static EastLog: Array<LogEntry> = []
	// private static WestLog: Array<LogEntry> = []

	//public static replaceLast(content: Content) {Runlog.log[0] = content}
	//public static lastVideo(): Content {return Runlog.log[0]}

	public static load() {
		console.log("Loading Runlog");
		// setInterval(this.getNowPlaying, 1000)
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

		// Runlog.EastLog.push(content)
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

	public static nowPlaying(channelName: unknown, length = 10): Promise<unknown> {
		return new Promise((ok, fail) => {
			const sql = `select videos.id, videos.altId, videos.artist, videos.title, videos.altTitle, videos.album, videos.year, videos.director, runlog.channelName, runlog.datetime from runlog left join videos on videos.id = runlog.contentid where runlog.contentType = 0 and channelName = '${channelName}' order by datetime desc limit ${length}`;
			// console.log(sql)
			Mysql.query(sql)
				.then((results: any) => {
				// console.log(results[0])
				ok(results);
			})
			.catch((reason: any) => {
				fail(reason);
			});
		});

	}
}

export interface LogEntry{
	contentid: number,
	contentaltid: number,
	contentType: Content.ContentType
	overlay: string,
	channelName: string,
	timestamp: Date
}