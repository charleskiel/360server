import { MusicVideo, request, Mysql, moment, DownloadFile, SocketCommands, Vote } from '../modules'


export class Channel {
	static channels: Channel[] = []

	static status() {
		return { "channels" : Channel.channels}
	}

	static tickHandler(msg: any) {
		switch (msg.type) {
			case "tick":
				if (!Channel.channels[msg.data.name])
					Channel.channels[msg.data.name] = new Channel(msg.data);
				else
					Channel.channels[msg.data.name].tick(msg.data)
				break;
			case "channel":
				break;
			case "contentController":
				break;
			default:
				break;
		}
		
	}
	
	public name: string;
	public onAir = true;
	public dayOffset = 0;
	public hourOffset = 0;
	public upTime = 0;

	public playsSinceBump = 0;
	public bumpTimer = 0;
	public bumpDue = false;
	public bumpVideos = 0;
	public bumpTime = 0;

	public playsSinceBreak = 0;
	public breakTimer = 0;
	public breakDue = false;
	public breakTime = 0;
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
	
	public vote = new Vote();

	constructor(data: any) {
		this.name = data.name
		this.tick(data)
	}

	tick(data: any) {
		this.onAir = data.onAir;
		this.dayOffset = data.dayOffset;
		this.hourOffset = data.hourOffset;
		this.upTime = data.upTime;

		this.bumpVideos = data.bump[0];
		this.playsSinceBump = data.bump[2];
		this.bumpTime = data.bump[1];
		this.bumpTimer = data.bump[3];
		this.bumpDue = data.bump[4];

		this.breakVideos = data.break[0];
		this.playsSinceBreak = data.break[1];
		this.breakTime = data.break[2];
		this.breakTimer = data.break[3];
		this.breakDue = data.break[4];
		this.breakMinLength = data.break[5];
		this.breakMaxLength = data.break[6];

		this.playsSinceCard = data.card[0];
		this.cardTime = data.card[1];
		this.cardTimer = data.card[2];
		this.cardDue = data.card[3];
		
		this.blockHour = data.block[0];
		this.blockDay = data.block[1];
		this.blockType = data.blockType;
		this.streamNotificationMessage = data.streamNotificationMessage;
		this.screenMode = data.screenMode;
		this.pcRating = data.pcRating
		console.log(this)
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

