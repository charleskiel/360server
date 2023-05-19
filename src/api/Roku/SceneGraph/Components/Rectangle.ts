interface Vector2D {
	x: number;
	y: number;
}

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

class Rectangle {
	private _color: number;
	private _opacity: number;
	private _translation: Vector2D;
	private _rotation: number;
	private _scale: Vector2D;
	private _scaleRotateCenter: Vector2D;
	private _clippingRect: Rect;
	private _inheritParentTransform: boolean;
	private _inheritParentOpacity: boolean;

	constructor(
		color: number = 0xFFFFFFFF,
		opacity: number = 1,
		translation: Vector2D = { x: 0, y: 0 },
		rotation: number = 0,
		scale: Vector2D = { x: 1, y: 1 },
		scaleRotateCenter: Vector2D = { x: 0, y: 0 },
		clippingRect: Rect = { x: 0, y: 0, width: 0, height: 0 },
		inheritParentTransform: boolean = true,
		inheritParentOpacity: boolean = true
	) {
		this._color = color;
		this._opacity = opacity;
		this._translation = translation;
		this._rotation = rotation;
		this._scale = scale;
		this._scaleRotateCenter = scaleRotateCenter;
		this._clippingRect = clippingRect;
		this._inheritParentTransform = inheritParentTransform;
		this._inheritParentOpacity = inheritParentOpacity;
	}

	get color(): number {
		return this._color;
	}

	set color(value: number) {
		this._color = value;
	}

	get opacity(): number {
		return this._opacity;
	}

	set opacity(value: number) {
		this._opacity = value;
	}

	get translation(): Vector2D {
		return this._translation;
	}

	set translation(value: Vector2D) {
		this._translation = value;
	}

	get rotation(): number {
		return this._rotation;
	}

	set rotation(value: number) {
		this._rotation = value;
	}

	get scale(): Vector2D {
		return this._scale;
	}

	set scale(value: Vector2D) {
		this._scale = value;
	}

	get scaleRotateCenter(): Vector2D {
		return this._scaleRotateCenter;
	}

	set scaleRotateCenter(value: Vector2D) {
		this._scaleRotateCenter = value;
	}

	get clippingRect(): Rect {
		return this._clippingRect;
	}

	set clippingRect(value: Rect) {
		this._clippingRect = value;
	}

	get inheritParentTransform(): boolean {
		return this._inheritParentTransform;
	}

	set inheritParentTransform(value: boolean) {
		this._inheritParentTransform = value;
	}

	get inheritParentOpacity(): boolean {
		return this._inheritParentOpacity;
	}

	set inheritParentOpacity(value: boolean) {
		this._inheritParentOpacity = value;
	}
}
