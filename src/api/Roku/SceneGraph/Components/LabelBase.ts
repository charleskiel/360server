import RokuNode from './RokuNode';

export default interface LabelBase extends RokuNode {
	text: string;
	color: string;
	font: string;
	horizAlign: string;
	vertAlign: string;
	width: number;
	height: number;
	numLines: number;
	maxLines: number;
	wrap: boolean;
	displayPartialLines: boolean;
	ellipsizeOnBoundary: boolean;
	wordBreakChars: string;
	ellipsisText: string;
	isTextEllipsized: boolean;
	fontSize: number;
	lineSpacing: number;
	truncateOnDelimiter: string;
	leadingEllipsis: boolean;
}
