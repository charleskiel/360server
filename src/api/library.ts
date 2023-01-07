import { MusicVideo, request, Mysql, _ } from '../modules'

export class Library {
	static videos = new Map();
	static GetVideo(_id: number, _altid: number = 0) {

	}
	static load() {
		console.log("Loading Videos");
		Mysql.query(`select * from videos order by id, altId`).then((results : any) => {

			_.valuesIn(results).map((video: any) => {
			 	Library.videos.set(video.id,new MusicVideo(video));
			});
			//console.log(Library.videos)
			console.log(Library.videos.size + " music videos loaded.")
			Library.getvideo(1945)
		});
	}

	static getvideo(id: number, altid = 0) {
		console.log(Library.videos.get(id));
	}

}