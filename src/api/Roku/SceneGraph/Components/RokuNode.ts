export default class RokuNode {
	public id: string;
	public nodeType: string;
	public x: number;
	public y: number;
	public triggerTime?: number;
   
	constructor(nodeType: string, x: number, y: number, triggerTime = 0.0) {
	  this.nodeType = nodeType;
	  this.x = x;
	  this.y = y;
	  this.triggerTime = triggerTime;
	  this.id = this.generateId();
	}
   
	private generateId(): string {
	  return Math.random().toString(16).substr(2, 8);
	}
   }
   