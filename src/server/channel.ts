import { _, Break, Bump, Card, Content, Intro, Library, Sql, Runlog, Song, Vote, request } from '../modules';
import ContentType = Content.ContentType;


export class Channel {
	public static channels = new Map<any, Channel>();

	static status() {
		return { "channels": Channel.channels };
	}

	static init() {
		Sql.query(`select * from channels order by channelNumber`).then((results: any) => {
			_.valuesIn(results).map((channel: any) => {
				Channel.channels.set(channel.channelNumber, new Channel(channel));
			});
			console.log(Channel.channels.size + " channels loaded.");
		});
	}

	static tick(msg: any) {

		switch (msg.class) {
			case "controller":
				if (msg.msgType === 'logged') {
					//console.log(msg)
					Channel.channels.get(msg.data.ch)?.log(msg.data);
				}
				break;
			case "channel":
				switch (msg.msgType) {
					case "tick":
						// console.log(`Channel.tick() : ${msg.data.ch}: `,msg)
						Channel.channels.get(msg.data.ch)?.tick(msg.data);
					case "status":
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}
	}

	static getChannelsJson(channelNumber: any): any {
		// console.log(channelNumber)
		return new Promise((result, fail) => {
			const options = {
				headers: "Content-type: text/json;",
				url: `http://192.168.1.101:8080/api/v2/channelsStatus`,
				method: 'GET'
			};

			request(options, function (error: any, response: any, body: any) {
				console.log(response, body);
				if (response && response.statusCode === 200) {
					if (body != "") {
						console.log(body);
						//module.exports.event.emit("getData", [type, {}, body.length]);
						//console.log(j.snippet.thumbnails.maxres.url, j.id + ".jpg")
						result(JSON.parse(body));
					} else {
						//Mysql.log('tda', 'getData', 'warning', `${response.statuscode}: ${response.statusMessage}`);
						fail(response.statusMessage);
					}
				}
			});
		});
	}

	static getNowPlayingJson(channelNumber: any): any {
		// console.log(channelNumber)
		let result: any[] = [];
		Channel.channels.forEach((channel: Channel, key: number) => {
			if (channelNumber === undefined || channelNumber == channel.channelNumber) {

				result.push({
					channelNumber: channel.channelNumber,
					channelName: channel.channelName,
					onAir: channel.onAir.valueOf(),
					dayOffset: channel.dayOffset,
					hourOffset: channel.hourOffset,
					offset: channel.offset,
					upTime: channel.upTime,
					playsSinceBump: channel.playsSinceBump,
					bumpTimer: channel.bumpTimer,
					bumpDue: channel.bumpDue,
					bumpVideos: channel.bumpVideos,
					bumpTime: channel.bumpTime,
					playsSinceBreak: channel.playsSinceBreak,
					breakDue: channel.breakDue,
					breakTime: channel.breakTime,
					breakTimer: channel.breakTimer,
					breakVideos: channel.breakVideos,
					breakMinLength: channel.breakMinLength,
					breakMaxLength: channel.breakMaxLength,
					playsSinceCard: channel.playsSinceCard,
					cardTimer: channel.cardTimer,
					cardTime: channel.cardTime,
					cardDue: channel.cardDue,
					cardVideos: channel.cardVideos,
					blockHour: channel.blockHour,
					blockDay: channel.blockDay,
					blockType: channel.blockType,
					streamNotificationMessage: channel.streamNotificationMessage,
					screenMode: channel.screenMode,
					pcRating: channel.pcRating,
					maxViewers: channel.maxViewers,
					runlog: channel.runlog.slice(0, 10)
				});
			}

		});
		return result;
	}

	public channelName: string;
	public channelNumber: number;
	public streamURL: string;
	public onAir = true;
	public dayOffset = 0;
	public hourOffset = 0;
	public offset = 0;
	public upTime = 0;

	public playsSinceBump = 0;
	public bumpTimer = 0;
	public bumpDue = false;
	public bumpVideos = 0;
	public bumpTime = 0;

	public playsSinceBreak = 0;
	public breakDue = false;
	public breakTime = 0;
	public breakTimer = 0;
	public breakVideos = 0;
	public breakMinLength = 0;
	public breakMaxLength = 0;

	public playsSinceCard = 0;
	public cardTimer = 0;
	public cardTime = 0;
	public cardDue = false;
	public cardVideos = 0;

	public blockHour = 0;
	public blockDay = 0;

	public blockType = "";
	public streamNotificationMessage = "";
	public screenMode = "0";
	public pcRating = 0;
	public maxViewers = 0;

	public vote = new Vote();
	public runlog: Runlog;

	constructor(data: any) {
		this.channelName = data.channelName;
		this.channelNumber = data.channelNumber;
		this.onAir = data.onAir;
		this.dayOffset = data.dayOffset;
		this.hourOffset = data.hourOffset;
		this.offset = data.offset;
		this.maxViewers = data.maxViewers;
		this.streamURL = data.streamurl;
		this.runlog = new Runlog(this.channelNumber);

	}

	tick(data: any) {
		// console.log(data)

		this.onAir = data.onAir;
		this.upTime = data.upTime;
		this.dayOffset = data.offset[0];
		this.hourOffset = data.offset[1];
		this.blockType = data.block[2];

		// this.bumpVideos = data.bump[0];
		this.playsSinceBump = data.bump[0];
		this.bumpTimer = data.bump[1];
		this.bumpDue = data.bump[2];

		// this.breakVideos = data.break[0];
		this.playsSinceBreak = data.break[0];
		this.breakTimer = data.break[1];
		this.breakDue = data.break[2];
		// this.breakTime = data.break[2];

		this.playsSinceCard = data.card[0];
		this.cardTimer = data.card[1];
		this.cardDue = data.card[2];
		this.blockHour = data.block[0];
		this.blockDay = data.block[1];
		this.blockType = data.blockType;
		this.screenMode = data.screenMode;
		this.pcRating = data.pcRating;
	}

	public log(data: any, preload: boolean = false) {
		// console.log("LOG ======>", data)
		// console.trace()
		let content: Content = new Content(
			data.content?.contentType ?? data.contentType,
			data.content?.id ?? data.id,
			data.content?.altid ?? data.altid,
			data.trt);

		switch (data.content?.contentType ?? data.contentType) {
			case 0:
				content = Library.getVideo(data.content?.id ?? data.id, data.content?.altid ?? data.altid);

				break;
			case 1:
				// console.log("LOG ======>", data)
				content = new Bump({
					id: data.content?.id ?? data.id,
					altId: data.content?.altId ?? data.altId,
					trt: data.content?.trt > 0 ? data.content.trt : data.trt
				});
				break;
			case 2:
				content = new Break({
					id: data.content?.id ?? data.id,
					altId: data.content?.altId ?? data.altId,
					trt: data.content?.trt ?? data.trt
				}); break;
			case 3:
				content = new Song(data.content ?? data);
				break;
			case 4:
				content = new Card({
					id: data.content?.id ?? data.id,
					altId: data.content?.altId ?? data.altId,
					trt: data.content?.trt ?? data.trt
				}); break;
			case 5:
				//this.push(new Scene(content));
				break;
			case 6:
				//this.push(new Fill(content));
				break;
			case 7:
				content = new Intro({
					id: data.content?.id ?? data.id,
					altId: data.content?.altId ?? data.altId,
					trt: data.content?.trt ?? data.trt
				});
				break;
			case 8:
				//this.push(new Live(content));
				break;
			case 9:
				//this.push(new Empty(content));
				break;
			default:
				break;
		}

		let entry = {
			content: content,
			overlay: data.overlay,
			channelMode: data.channelMode,
			channel: this.channelNumber,
			timestamp: data.datetime ? new Date(data.datetime) : new Date(),
			epoch: data.datetime ? new Date(data.datetime).valueOf() : new Date().valueOf()
		};
		!preload ? this.runlog.unshift(entry) : this.runlog.push(entry);
		if (entry.content.contentType != ContentType.MusicVideo) {
		}
		// console.log("Logging =======>", data.datetime ?? Date.now() ,entry)
		// console.table(this.runlog)
	}
	updateStatus(data: any) {

	}

	getNowPlaying(): Runlog {
		console.log("nowplaying ", this.channelNumber);
		return this.runlog;
	}


}

export namespace Channel {
	export enum ContentType {
		MusicVideo,
		Bump,
		Break,
		Song,
		Card,
		Scene,
		Fill,
		Intro,
		Live,
		Empty
	}
	export enum Rating {
		TVPG,
		TV14,
		TVMA,
		TVAO,
		UNRATED = -1
	}

}

