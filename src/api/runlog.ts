import { Content, MusicVideo, request, Mysql } from '../modules'

export class Runlog {
	private static log: [Content]

	public static add(content: Content) { Runlog.log.push(content); }
	public static replaceLast(content: Content) {Runlog.log[0] = content}
	public static lastVideo(): Content {return Runlog.log[0]}

	public static nowPlaying() {
		if (Runlog.log) {
			
			return Runlog.log.splice(0,12).map(item => {
				if (item.contentType === Content.ContentType.MusicVideo) {
					return item;	
				}
			})
		} else {
			return [];
		}
	}

}