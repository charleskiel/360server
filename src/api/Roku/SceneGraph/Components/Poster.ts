import RokuNode from './RokuNode';

class Poster extends RokuNode {
	public uri: string;
	public width: number;
	public height: number;

  constructor(x: number, y: number, uri: string, width : number = 0, height : number = 0) {
    super("Poster", x, y);
	  this.uri = uri;
	  this.height = height;
	  this.width = width;
  }
}

export default Poster;
