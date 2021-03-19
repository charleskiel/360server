export class Content {
	constructor(
		public contentType: Content.ContentType,
		public id: number,
		public altid: number) {
	}
}

export class MusicVideo extends Content {
	artist: string;
	title: string;
	album: string;
	year: string;
	director: string;
	altTitle: string;
	schedule: string;
	trt: number;
	titleIn: number;
	titleOut: number;
	rating: Content.Rating;
	
	constructor(data: any) {

		super(Content.ContentType.MusicVideo, data.id, data.altId);
		this.artist = data.artist;
		this.title = data.title;
		this.album = data.album;
		this.year = data.year;
		this.director = data.director;
		this.altTitle = data.altTitle;
		this.schedule = data.schedule;
		this.trt = data.trt;
		this.titleIn = data.titleIn;
		this.titleOut = data.titleOut;
		this.rating = data.rating;
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