export class Content {
	constructor(
		public contentType: Content.ContentType,
		public id: number,
		public altid: number,
		public trt : number
	)
	{}
}

export class MusicVideo extends Content {
	artist: string;
	title: string;
	album: string;
	year: string;
	director: string;
	altTitle: string;
	schedule: string;
	titleIn: number;
	titleOut: number;
	rating: Content.Rating;
	
	constructor(data: any) {

		super(Content.ContentType.MusicVideo, data.id, data.altId, data.trt);
		this.artist = data.artist;
		this.title = data.title;
		this.album = data.album;
		this.year = data.year;
		this.director = data.director;
		this.altTitle = data.altTitle;
		this.schedule = data.schedule;
		this.titleIn = data.titleIn;
		this.titleOut = data.titleOut;
		this.rating = data.rating;
	}
	toString() :string {
		return `${this.artist} - ${this.title}`
	}
}

export class Bump extends Content {
	constructor(data: any) {
		super(Content.ContentType.Bump, data.id, data.altId, data.trt);
	}
}

export class Break extends Content {
	//song: Song
	constructor(data: any) {
		console.log(data)
		super(Content.ContentType.Break, data.id, data.altId, data.trt);
		//this.song = data.song
	}
}

export class Card extends Content {
	//song: Song
	constructor(data: any) {
		super(Content.ContentType.Card, data.id, data.altId, data.trt);
		//this.song = data.song
	}
}

export class Intro extends Content {
	//song: Song
	constructor(data: any) {
		super(Content.ContentType.Intro, data.id, data.altId, data.trt);
		//this.song = data.song
	}
}

export class Song extends Content {
	constructor(data: any) {
		super(Content.ContentType.Intro, data.id, data.altId, data.trt);
	}
}


export namespace Content{
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