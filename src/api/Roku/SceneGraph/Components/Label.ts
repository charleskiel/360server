import RokuNode from './RokuNode';
import LabelBase from './LabelBase';

export default class Label extends RokuNode implements LabelBase {
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
		public lineSpacing: number = 0,
		public truncateOnDelimiter: string = "",
		public leadingEllipsis: boolean = false,
		public x: number = 0,
		public y: number = 0,
		public triggerTime: number = 0.0,
	) {
		super(x, y, "Label", triggerTime);
	}
}
