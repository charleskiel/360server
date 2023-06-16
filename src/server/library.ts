import { MusicVideo, request, Sql, _ } from '../modules'

export class Library {
	static videos = new Map();
	
	static allVideos() {
		console.log("Loading Videos");
		Sql.query(`select * from [360].[videos] order by id, altId`).then((results : any) => {
			console.table(results)
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