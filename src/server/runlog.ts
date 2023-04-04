import _ from 'lodash';
import { Content,Sql } from '../modules'
import { runInNewContext } from 'vm';
import { Library } from './library';

export class Runlog extends Array<LogEntry>{

	private static EastLog: Array<LogEntry> = [];
	private static WestLog: Array<LogEntry> = []


	//public static replaceLast(content: Content) {Runlog.log[0] = content}
	//public static lastVideo(): Content {return Runlog.log[0]}
	channelNumber: number;
	constructor(channelNumber: number) {
		super()
		this.channelNumber = channelNumber;
	}
	public load() {
		console.log("Loading Runlog");
	}

	// public post(content: any) : string {
	// 	//console.log(content)
	// 	this.add({
	// 		contentid: content.contentid,
	// 		contentaltid: content.contentaltid,
	// 		contentType: content.contentType,
	// 		overlay: content.overlay,
	// 		channel: content.channel,
	// 		timestamp: content.timestamp
	// 	})
	// 	return "OK"
	// }

	
	//private static nowPlayingListCache : any[] = [];
	
	// public replaceLast(content: Content) { this[0] = content; }
	// public lastVideo(): Content { return this[0]; }

}

export interface LogEntry{
	content: Content,
	overlay: string,
	channelMode: string,
	channel: number,
	timestamp: Date,
	epoch: number
}