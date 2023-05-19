
interface MultiStyleLabel extends LabelBase {
	drawingStyles: { [key: string]: { size: number; uri: string; color: string; }; };
}
class MultiStyleLabel implements MultiStyleLabel {
	constructor(
		public text: string = "",
		public color: string = "0xddddddff",
		public font: string = "system default",
		public horizAlign: string = "left",
		public vertAlign: string = "top",
		public width: number = 0,
		public height: number = 0,
		public numLines: number = 0,
		public maxLines: number = 0,
		public wrap: boolean = false,
		public displayPartialLines: boolean = false,
		public ellipsizeOnBoundary: boolean = false,
		public wordBreakChars: string = "",
		public ellipsisText: string = "...",
		public isTextEllipsized: boolean = false,
		public fontSize: number = 24,
		public drawingStyles: { [key: string]: { size: number; uri: string; color: string; }; } = {}
	) { }
}
