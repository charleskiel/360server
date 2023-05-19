import RokuNode from './RokuNode';

class Poster extends RokuNode {
  public uri: string;

  constructor(x: number, y: number, uri: string) {
    super("Poster", x, y);
    this.uri = uri;
  }
}

export default Poster;
