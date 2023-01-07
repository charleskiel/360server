import { MusicVideo, request, Mysql, _ } from '../modules'

export class Library {
	static videos = new Map();
	static load() {
		console.log("Loading Videos");
		Mysql.query(`select * from videos order by id, altId`).then((results : any) => {
			_.valuesIn(results).map((video: any) => {
			 	Library.videos.set(video.id,new MusicVideo(video));
			});
			console.log(Library.videos.size + " music videos loaded.")
		});
	}

	static getVideo(id: number, altid = 0): MusicVideo {
		return Library.videos.get(id);
	}

	static getVideosJson(): any {
		
		let result: any[] = [];
		this.videos.forEach((video: MusicVideo, key: number) => {
			result.push({
				id: video.id,
				altid: video.altid,
				trt: video.trt,
				artist: video.artist,
				title: video.title,
				album: video.album,
				year: video.year,
				director: video.director,
				altTitle: video.altTitle,
				schedule: video.schedule,
				titleIn: video.titleIn,
				titleOut: video.titleOut,
				rating: video.rating,
			});
		});
		return result
	}
}